import { settingsSongSlideSizeAtom } from '@ipc/settings/settings.song.atoms';
import { useAtom } from 'jotai';
import { OliInput, OliText } from 'oli-design-system';

export function SettingsSong() {
  const [settingsSongSlideSize, setSettingsSongSlideSize] = useAtom(
    settingsSongSlideSizeAtom,
  );

  return (
    <div>
      <OliText variant='h4' sx={{ marginY: 2 }} text='Songs' />
      <OliInput
        value={settingsSongSlideSize}
        onChange={(v) => setSettingsSongSlideSize(v)}
        placeholder='Song slide size'
      />
    </div>
  );
}
