import { useState } from 'react';
import { usePassphraseAuth } from 'jazz-tools/react';
import { wordlist } from '../../lib/jazz/wordlist';
import { usePassphraseConfirmed } from '../../hooks/usePassphraseConfirmed';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

interface AuthModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [loginPassphrase, setLoginPassphrase] = useState('');
  const [passphraseConfirmed, setPassphraseConfirmed] =
    usePassphraseConfirmed();

  const auth = usePassphraseAuth({
    wordlist: wordlist,
  });

  // Check if user is signed in
  // auth.state can be 'anonymous' | 'signingUp' | 'signedIn' (type may not reflect all states)
  const authState = auth.state as 'anonymous' | 'signingUp' | 'signedIn';

  // Keep modal open if we need to show the passphrase (even if already signed in)
  // This happens when signup completes but user hasn't confirmed they saved the passphrase
  const showingPassphrase =
    (authState === 'signingUp' || authState === 'signedIn') &&
    auth.passphrase &&
    !passphraseConfirmed;

  // Only hide modal if user is signed in AND we're not showing the passphrase
  if (authState === 'signedIn' && !showingPassphrase) {
    return null; // User is signed in and has confirmed passphrase, don't show modal
  }

  const handleSignUp = async () => {
    try {
      await auth.signUp();
      // Don't set hasStoredPassphrase yet - user needs to see and copy the passphrase first
      // Don't close modal immediately - user needs to copy passphrase
    } catch (error: any) {
      console.error('Sign up failed:', error);
      alert(`Înregistrarea a eșuat: ${error.message || 'Eroare necunoscută'}`);
    }
  };

  const handleLogIn = async () => {
    if (!loginPassphrase.trim()) {
      alert('Vă rugăm să introduceți fraza de acces');
      return;
    }

    try {
      await auth.logIn(loginPassphrase);
      setLoginPassphrase('');
      onOpenChange?.(false);
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(`Autentificarea a eșuat: ${error.message || 'Frază de acces invalidă'}`);
    }
  };

  const handleConfirmStored = () => {
    // Mark passphrase as confirmed using Jotai atom (persisted to localStorage)
    setPassphraseConfirmed(true);
    onOpenChange?.(false);
  };

  // Prevent closing the modal - user must authenticate
  const handleOpenChange = (newOpen: boolean) => {
    // Don't allow closing - user must complete authentication
    if (!newOpen) {
      return;
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className='sm:max-w-[500px] [&>button]:hidden'
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Autentificare</DialogTitle>
          <DialogDescription>
            {showingPassphrase && passphraseConfirmed
              ? 'Vă rugăm să salvați fraza de acces în siguranță. Veți avea nevoie de ea pentru a vă autentifica.'
              : showingPassphrase
                ? 'Salvați-vă fraza de acces în siguranță! Veți avea nevoie de ea pentru a vă autentifica.'
                : 'Autentificați-vă cu fraza de acces'}
          </DialogDescription>
        </DialogHeader>

        {showingPassphrase && auth.passphrase ? (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Fraza dvs. de acces</Label>
              <p className='text-sm text-muted-foreground'>
                Salvați această frază de acces în siguranță! Veți avea nevoie de
                ea pentru a vă autentifica. Dacă o pierdeți, nu vă puteți
                recupera contul.
              </p>
              <textarea
                readOnly
                value={auth.passphrase}
                rows={5}
                className='w-full p-2 border rounded-md font-mono text-sm bg-muted'
                onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              />
              <div className='flex gap-2'>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(auth.passphrase);
                    alert('Fraza de acces a fost copiată în clipboard!');
                  }}
                  variant='outline'
                  className='flex-1'
                >
                  Copiază fraza de acces
                </Button>
              </div>
            </div>

            <Button onClick={handleConfirmStored} className='w-full'>
              Mi-am salvat fraza de acces
            </Button>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='passphrase'>Introduceți fraza de acces</Label>
              <textarea
                id='passphrase'
                value={loginPassphrase}
                onChange={(e) => setLoginPassphrase(e.target.value)}
                placeholder='Introduceți fraza de acces'
                rows={5}
                className='w-full p-2 border rounded-md font-mono text-sm'
              />
            </div>
            <div className='flex gap-2'>
              <Button onClick={handleLogIn} className='flex-1'>
                Autentificare
              </Button>
              <Button
                onClick={handleSignUp}
                variant='outline'
                className='flex-1'
              >
                Înregistrare
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
