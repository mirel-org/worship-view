import { useAtom } from 'jotai';
import { useCallback } from 'react';
import useShortcut from '../utils/useShortcut';
import { autoModeEnabledAtom, sonioxApiKeyAtom } from '../state/automode.atoms';

export const useAutoModeShortcuts = () => {
  const [enabled, setEnabled] = useAtom(autoModeEnabledAtom);
  const [apiKey] = useAtom(sonioxApiKeyAtom);

  const toggleAutoMode = useCallback(() => {
    if (!enabled && !apiKey) return;
    setEnabled(!enabled);
  }, [enabled, setEnabled, apiKey]);

  useShortcut('F8', toggleAutoMode);
};
