import { useDisplaySettings } from './settings.display.hooks';
import { useDesktopThemeSettings } from './settings.theme.hooks';

export const useDesktopSettings = () => {
  useDisplaySettings();
  useDesktopThemeSettings();
};
