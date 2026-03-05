import { useAtom } from 'jotai';
import { useCallback } from 'react';
import useShortcut from '../utils/useShortcut';
import { autoModeEnabledAtom } from '../state/automode.atoms';

export const useAutoModeShortcuts = () => {
  const [enabled, setEnabled] = useAtom(autoModeEnabledAtom);

  const toggleAutoMode = useCallback(() => {
    setEnabled(!enabled);
  }, [enabled, setEnabled]);

  useShortcut('F8', toggleAutoMode);
};
