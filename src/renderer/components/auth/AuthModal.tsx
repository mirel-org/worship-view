import React, { useState } from 'react';
import { usePassphraseAuth } from 'jazz-tools/react';
import { wordlist } from '../../lib/jazz/wordlist';
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
  onOpenChange: (open: boolean) => void;
}

export function AuthModal({ open, onOpenChange }: AuthModalProps) {
  const [loginPassphrase, setLoginPassphrase] = useState('');
  const [hasStoredPassphrase, setHasStoredPassphrase] = useState(false);

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
    !hasStoredPassphrase;

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
      alert(`Failed to sign up: ${error.message || 'Unknown error'}`);
    }
  };

  const handleLogIn = async () => {
    if (!loginPassphrase.trim()) {
      alert('Please enter your passphrase');
      return;
    }

    try {
      await auth.logIn(loginPassphrase);
      setLoginPassphrase('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Login failed:', error);
      alert(`Failed to log in: ${error.message || 'Invalid passphrase'}`);
    }
  };

  const handleConfirmStored = () => {
    setHasStoredPassphrase(false);
    onOpenChange(false);
  };

  // Prevent closing the modal when showing the passphrase (user must confirm they saved it)
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && showingPassphrase) {
      // Don't allow closing when showing passphrase - user must confirm they saved it
      return;
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Authentication</DialogTitle>
          <DialogDescription>
            {showingPassphrase && hasStoredPassphrase
              ? 'Please save your passphrase securely. You will need it to log in.'
              : showingPassphrase
                ? 'Save your passphrase securely! You will need it to log in.'
                : 'Log in with your passphrase'}
          </DialogDescription>
        </DialogHeader>

        {showingPassphrase && auth.passphrase ? (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label>Your Passphrase</Label>
              <p className='text-sm text-muted-foreground'>
                Save this passphrase securely! You will need it to log in. If
                you lose it, you cannot recover your account.
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
                    alert('Passphrase copied to clipboard!');
                  }}
                  variant='outline'
                  className='flex-1'
                >
                  Copy Passphrase
                </Button>
              </div>
            </div>

            {hasStoredPassphrase ? (
              <div className='space-y-2'>
                <p className='text-sm text-muted-foreground'>
                  Have you saved your passphrase securely?
                </p>
                <Button onClick={handleConfirmStored} className='w-full'>
                  Yes, I've saved it
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setHasStoredPassphrase(true)}
                className='w-full'
              >
                I have stored my passphrase
              </Button>
            )}
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='passphrase'>Enter your passphrase</Label>
              <textarea
                id='passphrase'
                value={loginPassphrase}
                onChange={(e) => setLoginPassphrase(e.target.value)}
                placeholder='Enter your passphrase'
                rows={5}
                className='w-full p-2 border rounded-md font-mono text-sm'
              />
            </div>
            <div className='flex gap-2'>
              <Button onClick={handleLogIn} className='flex-1'>
                Log In
              </Button>
              <Button
                onClick={handleSignUp}
                variant='outline'
                className='flex-1'
              >
                Sign Up
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
