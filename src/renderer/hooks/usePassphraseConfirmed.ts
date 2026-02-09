import { useAtom } from 'jotai';
import { useAccount } from 'jazz-tools/react';
import { WorshipViewAccount } from '../lib/jazz/schema';
import { passphraseConfirmedByAccountAtom } from '../../ipc/jazz/jazz.atoms';

/**
 * Hook to get/set passphrase confirmation state for the current account
 * Returns the confirmation state for the currently logged-in account
 */
export function usePassphraseConfirmed() {
  const me = useAccount(WorshipViewAccount) as any;
  const accountId = me?.$jazz?.id;
  const [confirmedByAccount, setConfirmedByAccount] = useAtom(
    passphraseConfirmedByAccountAtom
  );

  const isConfirmed = accountId ? confirmedByAccount[accountId] ?? false : false;

  const setConfirmed = (confirmed: boolean) => {
    if (!accountId) return;
    setConfirmedByAccount((prev) => ({
      ...prev,
      [accountId]: confirmed,
    }));
  };

  return [isConfirmed, setConfirmed] as const;
}
