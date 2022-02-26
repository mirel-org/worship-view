import { useAtom } from 'jotai';
import React, { FC } from 'react';
import Modal from 'react-modal';
import SettingsDisplay from './SettingsDisplay';
import { areSettingsOpenAtom } from '../../../ipc/settings/settings.atoms';

const Settings: FC = () => {
  const [areSettingsOpen, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  return (
    <div>
      <Modal
        shouldCloseOnOverlayClick
        shouldCloseOnEsc
        onRequestClose={() => setAreSettingsOpen(false)}
        isOpen={areSettingsOpen}
        contentLabel='Example Modal'
      >
        <SettingsDisplay />
      </Modal>
    </div>
  );
};

export default Settings;
