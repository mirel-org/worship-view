import { useEffect, useRef } from 'react';

const usePreventScroll = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!ref?.current) return;
    const cb = (e: KeyboardEvent) => {
      if (
        ['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(
          e.key,
        ) > -1
      ) {
        e.preventDefault();
      }
    };
    const current = ref.current;
    current.addEventListener('keydown', cb);

    return () => current.removeEventListener('keydown', cb);
  }, [ref]);
  return { ref };
};

export default usePreventScroll;
