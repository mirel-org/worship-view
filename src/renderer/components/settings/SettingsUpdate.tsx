import { useState } from 'react';
import { Button } from '../ui/button';
import { getApiClient } from '../../../ipc/index';
import type { UpdateCheckResult } from '@ipc/update/update.types';

export const SettingsUpdate = () => {
  const [checking, setChecking] = useState(false);
  const [lastResult, setLastResult] = useState<UpdateCheckResult | null>(null);

  const handleCheckForUpdates = async () => {
    setChecking(true);
    try {
      const result = await getApiClient().checkForUpdates();
      setLastResult(result);
      if (result.status === 'error') {
        console.error(result.message);
      }
    } finally {
      setChecking(false);
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
      {lastResult && (
        <p
          className={`text-sm ${
            lastResult.status === 'error'
              ? 'text-destructive'
              : 'text-muted-foreground'
          }`}
        >
          {lastResult.message}
        </p>
      )}
    </div>
  );
};
