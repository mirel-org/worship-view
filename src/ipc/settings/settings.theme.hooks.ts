import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { settingsThemeAtom, settingsZoomLevelAtom } from './settings.theme.atoms';
import { getApiClient } from '..';

export const useThemeSettings = () => {
  const [theme] = useAtom(settingsThemeAtom);
  const [zoomLevel] = useAtom(settingsZoomLevelAtom);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [theme]);

  useEffect(() => {
    const zoom = Math.min(150, Math.max(80, Number(zoomLevel) || 100));
    const zoomFactor = zoom / 100;
    getApiClient()
      .setZoomFactor(zoomFactor)
      .catch((error) => {
        console.error('Failed to apply zoom factor:', error);
      });
  }, [zoomLevel]);
};
