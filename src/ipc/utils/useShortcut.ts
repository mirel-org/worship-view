import { useEffect } from 'react';

const useShortcut = (key: string, cb: () => void) => {
  useEffect(() => {
    const keydownListener = (keydownEvent: KeyboardEvent) => {
      if (keydownEvent.key === key) cb();
    };
    window.addEventListener('keydown', keydownListener);
    return () => window.removeEventListener('keydown', keydownListener);
  }, [key, cb]);
};

export default useShortcut;
