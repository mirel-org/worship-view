import { useEffect, useRef } from 'react';

const useInputFocus = (
  focused: boolean,
  setFocused: (focused: boolean) => void,
) => {
  const ref = useRef<HTMLInputElement>(null);
  const onFocus = () => setFocused(true);
  const onBlur = () => setFocused(false);
  useEffect(() => {
    if (!ref?.current) return;
    if (focused) {
      ref.current.focus();
      ref.current.select();
    } else ref.current.blur();
  }, [focused, ref]);

  return {
    ref,
    onFocus,
    onBlur,
  };
};

export default useInputFocus;
