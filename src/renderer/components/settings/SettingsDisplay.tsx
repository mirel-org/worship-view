import { availableDisplaysAtom } from '@ipc/display/display.atoms';
import RadioGroup from '@renderer/components/ui/inputs/radio-group/RadioGroup';
import { useRadioGroups } from '@renderer/components/ui/inputs/radio-group/RadioGroup.hooks';
import { useAtom } from 'jotai';
import { settingsDisplayScreenSelectionAtom } from '../../../ipc/settings/settings.display.atoms';
import { settingsSongSlideSizeAtom } from '@ipc/settings/settings.song.atoms';
import { SongSlideSize } from '@ipc/settings/settings.song.types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';

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
      {/* Display Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Displays</h3>
        {availableDisplays.map((display) => {
          const key = display.id.toString();
          const inputs = displayScreenSelection[key];
          if (!inputs) return null;
          return (
            <div key={key} className="mb-4">
              <span className="text-sm font-medium">{key}</span>
              <RadioGroup
                name={`display${key}`}
                onChange={(value) => onChange(key, value)}
                inputs={displayScreenSelection[key]}
              />
            </div>
          );
        })}
      </div>

      {/* Song Settings */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Songs</h3>
        <div className="space-y-2">
          <Label htmlFor="song-slide-size">Song slide size</Label>
          <Select
            value={String(settingsSongSlideSize)}
            onValueChange={handleSongSlideSizeChange}
          >
            <SelectTrigger id="song-slide-size" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 line</SelectItem>
              <SelectItem value="2">2 lines</SelectItem>
              <SelectItem value="4">4 lines</SelectItem>
              <SelectItem value="8">8 lines</SelectItem>
              <SelectItem value="full">Entire verse</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default SettingsDisplay;
