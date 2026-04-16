import { useState } from 'react';
import { useAtom } from 'jotai';
import { useIsAuthenticated } from 'jazz-tools/react';
import { Label, Button, Input } from '@worship-view/ui';
import { jazzApiKeyAtom, useAppDialogs } from '@worship-view/core';

export function SettingsJazzToken() {
  const dialogs = useAppDialogs();
  const isAuthenticated = useIsAuthenticated();
  const [apiKey] = useAtom(jazzApiKeyAtom);
  const [showApiKey, setShowApiKey] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resetStatus, setResetStatus] = useState<string | null>(null);

  const handleResetLocalState = async () => {
    const confirmed = await dialogs.confirm({
      title: 'Resetare locală',
      description:
        'Această acțiune va șterge complet starea locală a aplicației (inclusiv sesiunea și cache-ul Jazz) și va reîncărca pagina. Continui?',
      confirmLabel: 'Resetează și reîncarcă',
      variant: 'destructive',
    });
    if (!confirmed) {
      return;
    }

    setResetting(true);
    setResetStatus(null);

    try {
      localStorage.clear();
      window.location.reload();
    } catch (error) {
      setResetStatus(
        `Resetarea stării locale a eșuat: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      setResetting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2 pb-4 border-b">
        <Label>Cheie API Jazz Cloud</Label>
        {apiKey ? (
          <div className="flex items-center gap-2">
            <Input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              readOnly
              className="font-mono text-xs"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? 'Ascunde' : 'Arată'}
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nicio cheie API setată.
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Stare sincronizare</Label>
        <div className="flex items-center gap-2">
          <div
            className={`w-3 h-3 rounded-full ${apiKey ? 'bg-green-500' : 'bg-muted-foreground'}`}
          />
          <span>{apiKey ? 'Conectat la Jazz Cloud' : 'Sincronizare cloud dezactivată (lipsă cheie API)'}</span>
        </div>
      </div>

      <div className="space-y-2 pt-4 border-t">
        <Label>Resetare locală aplicație</Label>
        <p className="text-xs text-muted-foreground">
          Folosește această opțiune dacă ai probleme locale de sincronizare sau
          editare. Va șterge starea locală și va reîncărca pagina.
        </p>
        <Button
          variant="destructive"
          onClick={handleResetLocalState}
          disabled={resetting}
        >
          {resetting
            ? 'Se resetează starea locală...'
            : 'Resetează starea locală și reîncarcă'}
        </Button>
        {resetStatus && (
          <p className="text-xs text-muted-foreground">{resetStatus}</p>
        )}
      </div>
    </div>
  );
}
