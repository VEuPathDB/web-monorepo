import { useEffect, useState } from 'react';

function isEditable(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.tagName === 'SELECT')
  );
}

/**
 * True while `key` (a single letter, either case) is held down.
 *
 * Built so that it can't get stuck "on" - e.g. after a cat walks across
 * the keyboard, or the user alt-tabs away with the key down (the key-up
 * then goes to another window): it resets when the window loses focus or
 * the tab is hidden. Ignored while typing in a form field and when
 * Ctrl/⌘/Alt is held, so it never hijacks shortcuts or text entry.
 */
export function useHoldKey(key: string): boolean {
  const [held, setHeld] = useState(false);
  useEffect(() => {
    const matches = (event: KeyboardEvent) =>
      event.key.toLowerCase() === key.toLowerCase();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !matches(event) ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        isEditable(event.target)
      )
        return;
      setHeld(true);
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (matches(event)) setHeld(false);
    };
    const release = () => setHeld(false);
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') release();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', release);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', release);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [key]);
  return held;
}
