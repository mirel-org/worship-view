import { useEffect, useMemo } from 'react';

const useShortcuts = (keys: string[], cb: (event: KeyboardEvent) => void) => {
  // Stabilize the keys reference so the effect doesn't re-run on every render
  // when callers pass inline array literals
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const keySet = useMemo(() => new Set(keys), [keys.join(',')]);

  useEffect(() => {
    const keydownListener = (keydownEvent: KeyboardEvent) => {
      if (keySet.has(keydownEvent.key)) cb(keydownEvent);
    };
    window.addEventListener('keydown', keydownListener);
    return () => window.removeEventListener('keydown', keydownListener);
  }, [keySet, cb]);
};

export default useShortcuts;
