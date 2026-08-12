import { openDB } from 'idb';
import { apiClient } from './apiClient';

const DB_NAME = 'fleet-driver-queue';
const DB_VERSION = 2;
const ACTIONS_STORE = 'pending_actions';
const JOURNEY_MAP_STORE = 'journey_id_map';

const MAX_TRANSIENT_ATTEMPTS = 8;   // network blips, 5xx, 429 — worth persisting on
const MAX_PERMANENT_ATTEMPTS = 1;   // 4xx validation errors — won't fix themselves, drop fast
const BASE_DELAY_MS = 5000;         // 5s
const MAX_DELAY_MS = 10 * 60 * 1000; // cap at 10 min between retries

async function getDb() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(ACTIONS_STORE)) {
        const store = db.createObjectStore(ACTIONS_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('createdAt', 'createdAt');
      }
      if (!db.objectStoreNames.contains(JOURNEY_MAP_STORE)) {
        db.createObjectStore(JOURNEY_MAP_STORE);
      }
    },
  });
}

export function createLocalJourneyId() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function enqueueAction(action) {
  const db = await getDb();
  return db.add(ACTIONS_STORE, { ...action, createdAt: Date.now(), attempts: 0, nextRetryAt: 0 });
}

export async function listPendingActions() {
  const db = await getDb();
  return db.getAllFromIndex(ACTIONS_STORE, 'createdAt');
}

async function removeAction(id) {
  const db = await getDb();
  await db.delete(ACTIONS_STORE, id);
}

async function scheduleRetry(id, attempts, delayMs) {
  const db = await getDb();
  const item = await db.get(ACTIONS_STORE, id);
  if (item) {
    item.attempts = attempts;
    item.nextRetryAt = Date.now() + delayMs;
    await db.put(ACTIONS_STORE, item);
  }
}

async function setJourneyMapping(localId, realId) {
  const db = await getDb();
  await db.put(JOURNEY_MAP_STORE, realId, localId);
}

export async function getJourneyMapping(localId) {
  const db = await getDb();
  return db.get(JOURNEY_MAP_STORE, localId);
}

function buildFormData(fields) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, value);
  });
  return form;
}

/**
 * No response object at all = network error/timeout, always transient.
 * 5xx and 429 (rate limited) = server-side/temporary, transient.
 * Any other 4xx = the request itself is invalid — retrying without
 * changing it will never succeed, so treat as permanent.
 */
function classifyError(err) {
  if (!err.response) return 'transient';
  const status = err.response.status;
  if (status >= 500 || status === 429) return 'transient';
  return 'permanent';
}

function backoffDelay(attempts) {
  const exponential = BASE_DELAY_MS * 2 ** attempts;
  const jitter = Math.random() * 1000;
  return Math.min(exponential + jitter, MAX_DELAY_MS);
}

/**
 * Walks the queue in order. For each action:
 *  - if it depends on a journey ID that hasn't resolved yet, it's left in
 *    place and the loop moves on (doesn't block independent actions behind it)
 *  - if it's not yet due for retry (still backing off), same — skip and continue
 *  - on success, removed from the queue
 *  - on transient failure, backs off exponentially and stays queued
 *  - on permanent failure, dropped after MAX_PERMANENT_ATTEMPTS since no
 *    amount of retrying fixes a bad request
 */
export async function flushQueue(onProgress) {
  const pending = await listPendingActions();
  const now = Date.now();

  let sent = 0;
  let deferred = 0; // transient failures, waiting on backoff
  let poisoned = 0; // permanent failures, dropped
  let blocked = 0;  // waiting on an unresolved dependency

  for (const action of pending) {
    if (action.nextRetryAt && action.nextRetryAt > now) {
      deferred += 1;
      continue;
    }

    let endpoint = action.endpoint;
    let fields = { ...action.fields };

    if (action.journeyRef) {
      const realId = await getJourneyMapping(action.journeyRef);
      if (!realId) {
        blocked += 1;
        continue; // its START_JOURNEY hasn't synced yet — try again next flush
      }
      endpoint = (action.endpointTemplate ?? action.endpoint).replace('{journeyId}', realId);
      if (fields.journey_id === action.journeyRef) fields.journey_id = realId;
    }

    try {
      const form = buildFormData(fields);
      const response = await apiClient.post(endpoint, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (action.type === 'START_JOURNEY' && action.producesJourneyRef) {
        await setJourneyMapping(action.producesJourneyRef, response.data.data.id);
      }

      await removeAction(action.id);
      sent += 1;
      onProgress?.({ sent, total: pending.length });
    } catch (err) {
      const kind = classifyError(err);
      const attempts = action.attempts + 1;
      const cap = kind === 'transient' ? MAX_TRANSIENT_ATTEMPTS : MAX_PERMANENT_ATTEMPTS;

      if (attempts >= cap) {
        await removeAction(action.id);
        poisoned += 1;
        continue;
      }

      await scheduleRetry(action.id, attempts, backoffDelay(attempts));
      if (kind === 'transient') deferred += 1;
      // Note: we don't `return` here anymore — one struggling action no
      // longer blocks every independent action queued after it.
    }
  }

  return { sent, deferred, poisoned, blocked, total: pending.length };
}