'use client';

import * as React from 'react';

const FADE_DISTANCE_PX = 160;

/**
 * Writes scroll progress (0 at the top → 1 after `FADE_DISTANCE_PX`) to the
 * `--header-fill` CSS variable on `ref`, at most once per frame, so
 * scrolling never re-renders React.
 */
export function useScrollFill(ref: React.RefObject<HTMLElement | null>): void {
  React.useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const progress = Math.min(Math.max(window.scrollY / FADE_DISTANCE_PX, 0), 1);
      ref.current?.style.setProperty('--header-fill', String(progress));
    };
    const onScroll = () => {
      frame ||= requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [ref]);
}
