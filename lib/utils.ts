import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for safe tailwind class merging
export function cn(...inputs: (string | undefined | null | false | any)[]) {
  return twMerge(clsx(inputs));
}
