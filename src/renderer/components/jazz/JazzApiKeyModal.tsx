import React, { useState } from 'react';
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
      setError('Please enter your Jazz API key');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Jazz Cloud API Key</DialogTitle>
          <DialogDescription>
            Enter your Jazz Cloud API key to enable cloud sync. You can get your API key from{' '}
            <a
              href="https://dashboard.jazz.tools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              dashboard.jazz.tools
            </a>
            . You can skip this and add it later in settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Jazz API key"
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
          <Button
            variant="outline"
            onClick={handleSkip}
          >
            Skip
          </Button>
          <Button
            onClick={handleSave}
            disabled={!apiKey.trim()}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

