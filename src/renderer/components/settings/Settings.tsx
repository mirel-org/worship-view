import { useAtom } from 'jotai';
import SettingsDisplay from './SettingsDisplay';
import { areSettingsOpenAtom } from '../../../ipc/settings/settings.atoms';
import { Dialog, DialogContent } from '@mui/material';

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
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
