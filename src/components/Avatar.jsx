import clsx from 'clsx';

const palette = ['bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700', 'bg-teal-100 text-teal-700'];

export function Avatar({ name, size = 'md' }) {
  const initials = (name ?? '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const color = palette[(name?.charCodeAt(0) ?? 0) % palette.length];
  const sizeClass = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-16 w-16 text-lg' }[size];

  return (
    <div className={clsx('flex shrink-0 items-center justify-center rounded-full font-medium', sizeClass, color)}>
      {initials}
    </div>
  );
}