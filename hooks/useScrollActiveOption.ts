import * as React from 'react';

/**
 * Keeps the keyboard-highlighted option (marked with `data-index`) visible
 * inside a scrollable list.
 */
export function useScrollActiveOption(
  listRef: React.RefObject<HTMLElement | null>,
  activeIndex: number,
  enabled = true
): void {
  React.useEffect(() => {
    if (!enabled) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [listRef, activeIndex, enabled]);
}
