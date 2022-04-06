import { useAtom } from 'jotai';
import SettingsDisplay from './SettingsDisplay';
import { areSettingsOpenAtom } from '../../../ipc/settings/settings.atoms';
import { Dialog, DialogContent } from '@mui/material';
import { SettingsSong } from './SettingsSong';

const Settings = () => {
  const [areSettingsOpen, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  return (
    <Dialog
      onClose={() => setAreSettingsOpen(false)}
      open={areSettingsOpen}
      fullWidth
    >
      <DialogContent>
        <SettingsDisplay />
        <SettingsSong />
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
