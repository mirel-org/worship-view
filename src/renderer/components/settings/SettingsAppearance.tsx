import {
  settingsThemeAtom,
  settingsZoomLevelAtom,
  AppZoomLevel,
} from '@ipc/settings/settings.theme.atoms';
import { useAtom } from 'jotai';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function SettingsAppearance() {
  const [theme, setTheme] = useAtom(settingsThemeAtom);
  const [zoomLevel, setZoomLevel] = useAtom(settingsZoomLevelAtom);

  const zoomOptions: AppZoomLevel[] = [80, 90, 100, 110, 125, 150];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Aspect</h3>
      <div className="space-y-2">
        <Label htmlFor="theme-mode">Temă</Label>
        <Select value={theme} onValueChange={(value) => setTheme(value as 'dark' | 'light')}>
          <SelectTrigger id="theme-mode" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dark">Dark</SelectItem>
            <SelectItem value="light">Light</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="zoom-level">Zoom interfață</Label>
        <Select
          value={String(zoomLevel)}
          onValueChange={(value) => setZoomLevel(Number(value) as AppZoomLevel)}
        >
          <SelectTrigger id="zoom-level" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {zoomOptions.map((option) => (
              <SelectItem key={option} value={String(option)}>
                {option}%
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p className="text-sm text-muted-foreground">
        Tema și zoom-ul se aplică imediat și rămân salvate pentru următoarele deschideri.
      </p>
    </div>
  );
}
