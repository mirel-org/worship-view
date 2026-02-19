import { availableDisplaysAtom } from '@ipc/display/display.atoms';
import { settingsSongSlideSizeAtom } from '@ipc/settings/settings.song.atoms';
import { SongSlideSize } from '@ipc/settings/settings.song.types';
import { useAtom } from 'jotai';
import { settingsDisplayScreenSelectionAtom } from '../../../ipc/settings/settings.display.atoms';
import { RadioValueType } from '../ui/inputs/radio-group/RadioGroup';
import { useRadioGroups } from '../ui/inputs/radio-group/RadioGroup.hooks';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';

const getCheckedValue = (inputs: RadioValueType[] | undefined) =>
  inputs?.find((input) => input.checked)?.value ?? 'none';

const SettingsDisplay = () => {
  const [availableDisplays] = useAtom(availableDisplaysAtom);
  const [displayScreenSelection, setDisplayScreenSelection] = useAtom(
    settingsDisplayScreenSelectionAtom,
  );
  const [settingsSongSlideSize, setSettingsSongSlideSize] = useAtom(
    settingsSongSlideSizeAtom,
  );
  const { onChange } = useRadioGroups(
    displayScreenSelection,
    setDisplayScreenSelection,
  );

  const handleSongSlideSizeChange = (value: string) => {
    const parsed = value === 'full' ? 'full' : Number(value);
    setSettingsSongSlideSize(parsed as SongSlideSize);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Afișaje</h3>
        {availableDisplays.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nu există afișaje detectate.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableDisplays.map((display, index) => {
              const key = display.id.toString();
              const selectedRole = getCheckedValue(displayScreenSelection[key]);
              const isOn = selectedRole === 'audience';
              const displayName = display.label?.trim() || `Afișaj ${index + 1}`;

              return (
                <div
                  key={key}
                  className="rounded-lg border-2 border-border bg-card p-4 min-h-44 flex flex-col justify-between"
                >
                  <div className="h-full flex flex-col items-center justify-center text-center gap-2">
                    <p className="text-xs text-muted-foreground">{displayName}</p>
                  </div>

                  <div className="flex items-center justify-center mt-4">
                    <button
                      type="button"
                      onClick={() => onChange(key, isOn ? 'none' : 'audience')}
                      className={
                        isOn
                          ? 'relative inline-flex h-6 w-11 items-center rounded-full bg-primary p-0.5 justify-end border border-border transition-colors'
                          : 'relative inline-flex h-6 w-11 items-center rounded-full bg-input p-0.5 justify-start border border-border transition-colors'
                      }
                      aria-label={`Toggle ${displayName}`}
                      aria-pressed={isOn}
                    >
                      <span className="h-5 w-5 rounded-full bg-background shadow" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Cântece</h3>
        <div className="space-y-2">
          <Label htmlFor="song-slide-size">Dimensiune slide cântec</Label>
          <Select
            value={String(settingsSongSlideSize)}
            onValueChange={handleSongSlideSizeChange}
          >
            <SelectTrigger id="song-slide-size" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 linie</SelectItem>
              <SelectItem value="2">2 linii</SelectItem>
              <SelectItem value="4">4 linii</SelectItem>
              <SelectItem value="8">8 linii</SelectItem>
              <SelectItem value="full">Strofa întreagă</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SettingsDisplay;
