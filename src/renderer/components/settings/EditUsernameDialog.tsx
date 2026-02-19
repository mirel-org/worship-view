import { useState, useEffect } from 'react';
import { useAccount } from 'jazz-tools/react';
import { WorshipViewAccount } from '../../lib/jazz/schema';
import { setCoMapProperty } from '../../lib/jazz/helpers';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface EditUsernameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUsernameDialog({ open, onOpenChange }: EditUsernameDialogProps) {
  const accountResult = useAccount(WorshipViewAccount, {
    resolve: { profile: true },
  });
  const me = accountResult as any; // Type assertion needed due to Jazz type resolution

  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize username from profile when dialog opens or profile loads
  useEffect(() => {
    if (open && me?.profile) {
      setUsername(me.profile.name || '');
      setError(null);
    }
  }, [open, me?.profile]);

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Numele de utilizator nu poate fi gol');
      return;
    }

    if (!me || !me.profile) {
      setError('Profilul nu este disponibil');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update the profile name using Jazz's $jazz.set method
      setCoMapProperty(me.profile, 'name', username.trim());
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to update username:', err);
      setError(err.message || 'Actualizarea numelui de utilizator a eșuat');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Editează numele de utilizator</DialogTitle>
          <DialogDescription>
            Schimbați numele afișat. Acest nume va fi vizibil pentru ceilalți
            membri ai organizațiilor dvs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Nume de utilizator</Label>
            <Input
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              placeholder="Introduceți numele de utilizator"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Anulează
            </Button>
            <Button onClick={handleSave} disabled={isLoading || !username.trim()}>
              {isLoading ? 'Se salvează...' : 'Salvează'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
