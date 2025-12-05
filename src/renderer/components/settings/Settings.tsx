import { useAtom } from 'jotai';
import SettingsDisplay from './SettingsDisplay';
import { areSettingsOpenAtom } from '../../../ipc/settings/settings.atoms';
import {
  Dialog,
  DialogContent,
} from '../ui/dialog';
import { SettingsSong } from './SettingsSong';

const Settings = () => {
  const [areSettingsOpen, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  return (
    <Dialog open={areSettingsOpen} onOpenChange={setAreSettingsOpen}>
      <DialogContent className="max-w-2xl">
        <SettingsDisplay />
        <SettingsSong />
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
