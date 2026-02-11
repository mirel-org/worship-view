import { useState } from 'react';
import { useAtom } from 'jotai';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { jazzApiKeyAtom } from '../../../ipc/jazz/jazz.atoms';

interface JazzApiKeyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApiKeySet: (apiKey: string) => void;
  onSkip?: () => void;
}

export function JazzApiKeyModal({ open, onOpenChange, onApiKeySet, onSkip }: JazzApiKeyModalProps) {
  const [, setApiKeyAtom] = useAtom(jazzApiKeyAtom);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('Vă rugăm să introduceți cheia API Jazz');
      return;
    }

    setError(null);
    const trimmedKey = apiKey.trim();
    setApiKeyAtom(trimmedKey);
    onApiKeySet(trimmedKey);
    setApiKey('');
  };

  const handleSkip = () => {
    // Allow user to skip - app will work without sync
    if (onSkip) {
      onSkip();
    } else {
      onOpenChange(false);
    }
  };

  // Prevent closing the modal - user must provide API key
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Prevent closing - user must save API key
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent 
        className="sm:max-w-[425px] [&>button]:hidden" 
        onInteractOutside={(e) => e.preventDefault()} 
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Cheie API Jazz Cloud</DialogTitle>
          <DialogDescription>
            Introduceți cheia API Jazz Cloud pentru a activa sincronizarea cloud.
            Puteți obține cheia API de la{' '}
            <a
              href="https://dashboard.jazz.tools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              dashboard.jazz.tools
            </a>
            . Aceasta este necesară pentru a utiliza aplicația.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="api-key">Cheie API</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Introduceți cheia API Jazz"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {onSkip && (
            <Button
              variant="outline"
              onClick={handleSkip}
            >
              Omite
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={!apiKey.trim()}
          >
            Salvează
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

