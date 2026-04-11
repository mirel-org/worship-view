import { useAtom } from 'jotai';
import {
  clockOverlayEnabledAtom,
  clockFormatAtom,
  clockPositionAtom,
  clockFontSizeAtom,
  ClockFormat,
  ClockPosition,
  ClockFontSize,
} from '../../state/clock.atoms';
import { Label } from '@worship-view/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@worship-view/ui';

const POSITION_LABELS: Record<ClockPosition, string> = {
  'top-left': 'Stânga sus',
  'top-right': 'Dreapta sus',
  'bottom-left': 'Stânga jos',
  'bottom-right': 'Dreapta jos',
};

export function SettingsClock() {
  const [enabled, setEnabled] = useAtom(clockOverlayEnabledAtom);
  const [format, setFormat] = useAtom(clockFormatAtom);
  const [position, setPosition] = useAtom(clockPositionAtom);
  const [fontSize, setFontSize] = useAtom(clockFontSizeAtom);

  const fontSizeOptions: ClockFontSize[] = [100, 150, 200, 250, 300, 400, 500, 600, 700, 800, 900];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Ceas</h3>
      <p className="text-sm text-muted-foreground">
        Afișează un ceas pe ecranul audienței, suprapus peste conținutul proiectat.
      </p>

      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <Label className="text-sm font-medium">Afișează ceasul</Label>
          <p className="text-xs text-muted-foreground">
            Ceasul apare într-un colț al ecranului de proiecție
          </p>
        </div>
        <button
          onClick={() => setEnabled(!enabled)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            enabled ? 'bg-primary' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clock-format">Format oră</Label>
        <Select
          value={format}
          onValueChange={(value) => setFormat(value as ClockFormat)}
        >
          <SelectTrigger id="clock-format" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">24 ore (14:30)</SelectItem>
            <SelectItem value="12h">12 ore (2:30 PM)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clock-position">Poziție pe ecran</Label>
        <Select
          value={position}
          onValueChange={(value) => setPosition(value as ClockPosition)}
        >
          <SelectTrigger id="clock-position" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(POSITION_LABELS) as ClockPosition[]).map((pos) => (
              <SelectItem key={pos} value={pos}>
                {POSITION_LABELS[pos]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clock-font-size">Dimensiune font</Label>
        <Select
          value={String(fontSize)}
          onValueChange={(value) => setFontSize(Number(value) as ClockFontSize)}
        >
          <SelectTrigger id="clock-font-size" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {fontSizeOptions.map((size) => (
              <SelectItem key={size} value={String(size)}>
                {size}%
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <p className="text-sm text-muted-foreground">
        Setările ceasului se aplică imediat și rămân salvate pentru următoarele deschideri.
      </p>
    </div>
  );
}
