import { atomWithStorage } from 'jotai/utils';

export const jazzApiKeyAtom = atomWithStorage<string | null>('jazz-api-key', null);

// Tracks whether each account has confirmed saving their passphrase during signup
// Maps account ID -> boolean
export const passphraseConfirmedByAccountAtom = atomWithStorage<Record<string, boolean>>(
  'worship-view-passphrase-confirmed-by-account',
  {}
);

// Tracks the currently active organization ID
export const activeOrgIdAtom = atomWithStorage<string | null>('worship-view-active-org-id', null);

