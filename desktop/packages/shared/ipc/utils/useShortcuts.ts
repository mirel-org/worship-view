import { useEffect } from 'react';

const useShortcuts = (keys: string[], cb: () => void) => {
  useEffect(() => {
    const keydownListener = (keydownEvent: KeyboardEvent) => {
      if (keys.includes(keydownEvent.key)) cb();
    };
    window.addEventListener('keydown', keydownListener);
    return () => window.removeEventListener('keydown', keydownListener);
  }, [keys, cb]);
};

export default useShortcuts;
