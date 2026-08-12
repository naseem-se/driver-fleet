const KEY = 'fleet_driver_local_journey';

/**
 * A lightweight local "shadow" of a journey started while offline — no
 * server ID exists yet, so the UI needs something to render from until the
 * real journey syncs. Only one at a time, matching the backend rule that a
 * driver can't have two active journeys.
 */
export function saveLocalJourney(journey) {
  localStorage.setItem(KEY, JSON.stringify(journey));
}

export function getLocalJourney() {
  const raw = localStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearLocalJourney() {
  localStorage.removeItem(KEY);
}