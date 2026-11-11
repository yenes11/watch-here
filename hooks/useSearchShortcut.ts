'use client';

import * as React from 'react';

const TEXT_ENTRY_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

const isTypingTarget = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement &&
  (target.isContentEditable || TEXT_ENTRY_TAGS.has(target.tagName));

/** ⌘K / Ctrl+K anywhere, or "/" while not typing, calls `onTrigger`. */
export function useSearchShortcut(onTrigger: () => void): void {
  const onShortcut = React.useEffectEvent(onTrigger);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isCommandK =
        event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey);
      const isSlash = event.key === '/' && !isTypingTarget(event.target);

      if (isCommandK || isSlash) {
        event.preventDefault();
        onShortcut();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);
}
