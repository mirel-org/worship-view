import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { settingsThemeAtom } from '../state/settings.theme.atoms';

export const useThemeSettings = () => {
  const [theme] = useAtom(settingsThemeAtom);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [theme]);
};
