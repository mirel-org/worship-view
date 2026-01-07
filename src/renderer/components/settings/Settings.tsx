import React from 'react';
import { useAtom } from 'jotai';
import SettingsDisplay from './SettingsDisplay';
import { areSettingsOpenAtom } from '../../../ipc/settings/settings.atoms';
import { Dialog, DialogContent } from '../ui/dialog';
import { SettingsSong } from './SettingsSong';
import { SettingsJazz } from './SettingsJazz';

const Settings = () => {
  const [areSettingsOpen, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  return (
    <Dialog open={areSettingsOpen} onOpenChange={setAreSettingsOpen}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <SettingsDisplay />
        <SettingsSong />
        <SettingsJazz />
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
