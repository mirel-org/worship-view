import { useAtom } from 'jotai';
import SettingsDisplay from './SettingsDisplay';
import { areSettingsOpenAtom } from '@ipc/settings/settings.atoms';
import { SettingsSong } from './SettingsSong';
import { SettingsImport } from './SettingsImport';
import { OliModal } from 'oli-design-system';

const Settings = () => {
  const [areSettingsOpen, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  return (
    <OliModal onClose={() => setAreSettingsOpen(false)} open={areSettingsOpen}>
      <SettingsDisplay />
      <SettingsSong />
      <SettingsImport />
    </OliModal>
  );
};

export default Settings;
