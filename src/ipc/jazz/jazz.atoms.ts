import { atomWithStorage } from 'jotai/utils';

export const jazzApiKeyAtom = atomWithStorage<string | null>('jazz-api-key', null);

