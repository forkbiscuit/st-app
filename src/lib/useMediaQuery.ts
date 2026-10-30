import { useSyncExternalStore } from 'react';

/** Wide windows get the desktop layouts in layout.css. Keep the two in step. */
export const WIDE = '(min-width: 960px)';

/** Live result of a CSS media query. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
