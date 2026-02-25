import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { useThemeSettings, settingsZoomLevelAtom } from '@worship-view/core';
import { getApiClient } from '../index';

export const useDesktopThemeSettings = () => {
  // Use the shared CSS-only theme settings
  useThemeSettings();

  // Add desktop-specific zoom
  const [zoomLevel] = useAtom(settingsZoomLevelAtom);

  useEffect(() => {
    const zoom = Math.min(150, Math.max(80, Number(zoomLevel) || 100));
    const zoomFactor = zoom / 100;
    getApiClient()
      .setZoomFactor(zoomFactor)
      .catch((error: unknown) => {
        console.error('Failed to apply zoom factor:', error);
      });
  }, [zoomLevel]);
};
