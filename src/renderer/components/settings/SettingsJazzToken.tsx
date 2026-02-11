import { useState } from 'react';
import { useAtom } from 'jotai';
import { useIsAuthenticated } from 'jazz-tools/react';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { jazzApiKeyAtom } from '../../../ipc/jazz/jazz.atoms';

export function SettingsJazzToken() {
  const isAuthenticated = useIsAuthenticated();
  const [apiKey, setApiKey] = useAtom(jazzApiKeyAtom);
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);

  const handleSaveApiKey = () => {
    if (!newApiKey.trim()) {
      return;
    }

    setApiKey(newApiKey.trim());
    setNewApiKey('');
    // Reload the page to reinitialize Jazz with new API key
    window.location.reload();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* API Key Management */}
      <div className="space-y-2 pb-4 border-b">
        <Label>Cheie API Jazz Cloud</Label>
        {apiKey ? (
          <div className="space-y-2">
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
            <p className="text-xs text-muted-foreground">
              Cheia API este salvată. Introduceți o cheie nouă mai jos pentru a o actualiza.
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nicio cheie API setată. Sincronizarea cloud este dezactivată.
          </p>
        )}
        <div className="space-y-2">
          <Input
            type="password"
            placeholder="Introduceți noua cheie API"
            value={newApiKey}
            onChange={(e) => setNewApiKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newApiKey.trim()) {
                handleSaveApiKey();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Obțineți cheia API de la{' '}
              <a
                href="https://dashboard.jazz.tools"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:no-underline"
              >
                dashboard.jazz.tools
              </a>
            </p>
            <Button
              onClick={handleSaveApiKey}
              disabled={!newApiKey.trim()}
              size="sm"
            >
              {apiKey ? 'Actualizează' : 'Salvează'}
            </Button>
          </div>
        </div>
      </div>

      {/* Connection Status */}
      <div className="space-y-2">
        <Label>Stare sincronizare</Label>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${apiKey ? 'bg-green-500' : 'bg-yellow-500'}`} />
          <span>{apiKey ? 'Conectat la Jazz Cloud' : 'Sincronizare cloud dezactivată (lipsă cheie API)'}</span>
        </div>
      </div>
    </div>
  );
}

