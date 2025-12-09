import { useAtom } from 'jotai';
import SettingsDisplay from './SettingsDisplay';
import { areSettingsOpenAtom } from '../../../ipc/settings/settings.atoms';
import {
  Dialog,
  DialogContent,
} from '../ui/dialog';
import { SettingsSong } from './SettingsSong';
import { SettingsGoogleDrive } from './SettingsGoogleDrive';

const Settings = () => {
  const [areSettingsOpen, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  return (
    <Dialog open={areSettingsOpen} onOpenChange={setAreSettingsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <SettingsDisplay />
        <SettingsSong />
        <SettingsGoogleDrive />
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
