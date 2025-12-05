import { settingsSongSlideSizeAtom } from '@ipc/settings/settings.song.atoms';
import { SongSlideSize } from '@ipc/settings/settings.song.types';
import { MenuItem, TextField, Typography } from '@mui/material';
import { useAtom } from 'jotai';
import { ChangeEventHandler } from 'react';

export function SettingsSong() {
  const [settingsSongSlideSize, setSettingsSongSlideSize] = useAtom(
    settingsSongSlideSizeAtom,
  );

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setSettingsSongSlideSize(event.target.value as unknown as SongSlideSize);
  };
  return (
    <div>
      <Typography variant='h4' sx={{ marginY: 2 }}>
        Songs
      </Typography>
      <TextField
        value={settingsSongSlideSize}
        onChange={handleChange}
        fullWidth
        select
        label='Song slide size'
      >
        <MenuItem value={1}>1</MenuItem>
        <MenuItem value={2}>2</MenuItem>
        <MenuItem value={4}>4</MenuItem>
      </TextField>
    </div>
  );
}
