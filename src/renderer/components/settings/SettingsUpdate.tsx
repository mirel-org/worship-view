import { useState } from 'react';
import { Button } from '../ui/button';
import { getApiClient } from '../../../ipc/index';

export const SettingsUpdate = () => {
  const [checking, setChecking] = useState(false);

  const handleCheckForUpdates = async () => {
    setChecking(true);
    try {
      await getApiClient().checkForUpdates();
    } finally {
      setTimeout(() => setChecking(false), 3000);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Actualizări</h3>
      <p className="text-sm text-muted-foreground">
        Aplicația verifică automat actualizările la fiecare 10 minute.
        Poți verifica manual apăsând butonul de mai jos.
      </p>
      <Button onClick={handleCheckForUpdates} disabled={checking}>
        {checking ? 'Se verifică...' : 'Verifică actualizări'}
      </Button>
    </div>
  );
};
