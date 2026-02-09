import { useState, useEffect, type ReactNode } from 'react';
import {
  JazzTestProvider,
  createJazzTestAccount,
} from 'jazz-tools/react/testing';
import { Account } from 'jazz-tools';
import { WorshipViewAccount, Organization } from './schema';
import { pushCoListItem } from './helpers';
import { useAtom } from 'jotai';
import { songInputFocusAtom } from '@ipc/song/song.atoms';
import { verseInputFocusAtom } from '@ipc/verse/verse.atoms';

/**
 * Check if the app is running in test mode.
 * Test mode is detected via localStorage flag set by Playwright fixture.
 */
export function isTestMode(): boolean {
  try {
    return localStorage.getItem('jazz-test-mode') === 'true';
  } catch {
    return false;
  }
}

/**
 * Read a test flag from localStorage.
 * Flags are set by Playwright before reload to control which onboarding gates fail.
 */
function getTestFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true';
  } catch {
    return false;
  }
}

/**
 * Test wrapper that provides a mocked Jazz context for e2e tests.
 * Creates a test account with a pre-populated organization so the
 * real Application component can render without network or auth.
 *
 * Behavior can be controlled via localStorage flags (set before reload):
 * - `test-skip-api-key` — don't set `jazz-api-key` → API key gate fails
 * - `test-skip-auth` — pass `isAuthenticated={false}` → Auth gate fails
 * - `test-skip-passphrase-confirm` — don't set passphrase confirmed → Passphrase gate fails
 * - `test-skip-organization` — don't create organization → Organization gate fails
 */
export function TestAppWrapper({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  useEffect(() => {
    async function setup() {
      const skipApiKey = getTestFlag('test-skip-api-key');
      const skipAuth = getTestFlag('test-skip-auth');
      const skipPassphraseConfirm = getTestFlag('test-skip-passphrase-confirm');
      const skipOrganization = getTestFlag('test-skip-organization');

      // Only set the API key if not skipped
      if (!skipApiKey) {
        localStorage.setItem('jazz-api-key', JSON.stringify('test-api-key'));
      }

      // Track auth state for the provider
      if (skipAuth) {
        setIsAuthenticated(false);
      }

      const testAccount = await createJazzTestAccount({
        AccountSchema: WorshipViewAccount,
        isCurrentActiveAccount: true,
        creationProps: { name: 'Test User' },
      });

      // Mark passphrase as confirmed unless skipped
      if (!skipPassphraseConfirm) {
        const accountId = (testAccount as any).$jazz?.id ?? (testAccount as any).id;
        if (accountId) {
          localStorage.setItem(
            'worship-view-passphrase-confirmed-by-account',
            JSON.stringify({ [accountId]: true }),
          );
        }
      }

      // Create a test organization unless skipped
      if (!skipOrganization) {
        const org = Organization.create({
          name: 'Test Organization',
          songs: [],
          serviceList: [],
        });
        pushCoListItem(testAccount.root.organizations, org);
        // Pre-set the active org ID so useActiveOrganization resolves immediately
        // without waiting for the auto-select useEffect to fire.
        localStorage.setItem(
          'worship-view-active-org-id',
          JSON.stringify((org as any).$jazz.id),
        );
      }

      setAccount(testAccount);
    }
    setup();
  }, []);

  if (!account) {
    return (
      <div id="test-loading" className="h-full flex items-center justify-center">
        Loading test environment...
      </div>
    );
  }

  return (
    <JazzTestProvider account={account} isAuthenticated={isAuthenticated}>
      <TestInputFocusFix />
      {children}
    </JazzTestProvider>
  );
}

/**
 * In the real app, SongsListPanel and BibleSearchPanel manage the input focus atoms.
 * Since those panels are not rendered, the atoms stay at their default (true),
 * which blocks keyboard shortcuts. This component sets them to false in test mode.
 */
function TestInputFocusFix() {
  const [, setSongInputFocus] = useAtom(songInputFocusAtom);
  const [, setVerseInputFocus] = useAtom(verseInputFocusAtom);

  useEffect(() => {
    setSongInputFocus(false);
    setVerseInputFocus(false);
  }, [setSongInputFocus, setVerseInputFocus]);

  return null;
}
