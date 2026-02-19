import { useDisplaySettings } from './settings.display.hooks';
import { useThemeSettings } from './settings.theme.hooks';

export const useSettings = () => {
  useDisplaySettings();
  useThemeSettings();
};
