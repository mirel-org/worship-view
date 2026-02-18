import { useEffect } from 'react';

const useShortcuts = (keys: string[], cb: (event: KeyboardEvent) => void) => {
  useEffect(() => {
    const keydownListener = (keydownEvent: KeyboardEvent) => {
      if (keys.includes(keydownEvent.key)) cb(keydownEvent);
    };
    window.addEventListener('keydown', keydownListener);
    return () => window.removeEventListener('keydown', keydownListener);
  }, [keys, cb]);
};

export default useShortcuts;
