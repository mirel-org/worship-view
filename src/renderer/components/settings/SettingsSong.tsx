import { settingsSongSlideSizeAtom } from '@ipc/settings/settings.song.atoms';
import { SongSlideSize } from '@ipc/settings/settings.song.types';
import { useAtom } from 'jotai';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Label } from '../ui/label';

export function SettingsSong() {
  const [settingsSongSlideSize, setSettingsSongSlideSize] = useAtom(
    settingsSongSlideSizeAtom,
  );

  const handleChange = (value: string) => {
    const parsed = value === 'full' ? 'full' : Number(value);
    setSettingsSongSlideSize(parsed as SongSlideSize);
  };
  return (
    <div>
      <h2 className="text-2xl font-semibold my-4">Cântece</h2>
      <div className="space-y-2">
        <Label htmlFor="song-slide-size">Dimensiune slide cântec</Label>
        <Select
          value={String(settingsSongSlideSize)}
          onValueChange={handleChange}
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
  );
}
