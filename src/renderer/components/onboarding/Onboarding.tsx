import React from 'react';
import { useAtom } from 'jotai';
import { useIsAuthenticated, usePassphraseAuth } from 'jazz-tools/react';
import { wordlist } from '../../lib/jazz/wordlist';
import { jazzApiKeyAtom } from '../../../ipc/jazz/jazz.atoms';
import { useActiveOrganization } from '../../hooks/useActiveOrganization';
import { usePassphraseConfirmed } from '../../hooks/usePassphraseConfirmed';
import { AuthModal } from '../auth/AuthModal';
import { OrganizationSetupModal } from '../organizations/OrganizationSetupModal';

interface OnboardingProps {
  children: React.ReactNode;
}

/**
 * Onboarding component that handles the complete onboarding flow:
 * 1. Jazz API key setup
 * 2. Authentication (login/signup)
 * 3. Passphrase confirmation (for new signups)
 * 4. Organization setup (create or join)
 */
export function Onboarding({ children }: OnboardingProps) {
  const [apiKey] = useAtom(jazzApiKeyAtom);
  const [passphraseConfirmed] = usePassphraseConfirmed();
  const isAuthenticated = useIsAuthenticated();
  const { organizations } = useActiveOrganization();

  // Check authentication state and passphrase confirmation
  const auth = usePassphraseAuth({ wordlist });
  const authState = auth.state as 'anonymous' | 'signingUp' | 'signedIn';

  // Check if user needs to see passphrase confirmation
  // User needs confirmation if:
  // - They are signed in AND
  // - auth.passphrase exists (they just signed up) AND
  // - They haven't confirmed saving it yet
  const needsPassphraseConfirmation =
    isAuthenticated &&
    authState === 'signedIn' &&
    !!auth.passphrase &&
    !passphraseConfirmed;

  // User has completed auth (including passphrase confirmation) if:
  // - They are signed in AND
  // - They don't need passphrase confirmation (either logged in or already confirmed)
  const hasCompletedAuth =
    authState === 'signedIn' && !needsPassphraseConfirmation;

  // Derived modal states - no need for useState + useEffect
  const authModalOpen = !isAuthenticated || needsPassphraseConfirmation;
  const organizationSetupModalOpen =
    isAuthenticated &&
    hasCompletedAuth &&
    organizations &&
    organizations.length === 0;

  // Step 1: Check if Jazz API key is set
  if (!apiKey) {
    return (
      <div className='h-full flex items-center justify-center p-4 box-border bg-background text-foreground font-sans antialiased'>
        <div className='text-center space-y-4 max-w-md'>
          <h1 className='text-2xl font-semibold'>Configurare necesară</h1>
          <p className='text-muted-foreground'>
            Vă rugăm să configurați cheia API Jazz Cloud în setări pentru a
            utiliza această aplicație.
          </p>
        </div>
      </div>
    );
  }

  // Step 2: Check if user is authenticated and has confirmed passphrase
  if (!isAuthenticated || needsPassphraseConfirmation) {
    return (
      <>
        <AuthModal open={authModalOpen} />
        <div className='h-full flex items-center justify-center p-4 box-border bg-background text-foreground font-sans antialiased'>
          <div className='text-center space-y-4 max-w-md'>
            <h1 className='text-2xl font-semibold'>Configurare necesară</h1>
            {!isAuthenticated && (
              <p className='text-muted-foreground'>
                Vă rugăm să vă autentificați pentru a utiliza această aplicație.
                Dialogul de autentificare ar trebui să se deschidă automat.
              </p>
            )}
            {needsPassphraseConfirmation && (
              <p className='text-muted-foreground'>
                Vă rugăm să confirmați că v-ați salvat fraza de acces în
                siguranță.
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  // Step 3: Check if user has an organization
  if (organizations && organizations.length === 0) {
    return (
      <>
        <OrganizationSetupModal open={organizationSetupModalOpen ?? false} />
        <div className='h-full flex items-center justify-center p-4 box-border bg-background text-foreground font-sans antialiased'>
          <div className='text-center space-y-4 max-w-md'>
            <h1 className='text-2xl font-semibold'>Organizație necesară</h1>
            <p className='text-muted-foreground'>
              Trebuie să faceți parte dintr-o organizație pentru a utiliza
              această aplicație. Dialogul de configurare ar trebui să se
              deschidă automat.
            </p>
          </div>
        </div>
      </>
    );
  }

  // All onboarding steps completed - render the app
  return <>{children}</>;
}
