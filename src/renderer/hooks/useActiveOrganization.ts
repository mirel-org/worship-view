import { useEffect, useMemo } from 'react';
import { useAtom } from 'jotai';
import { useAccount } from 'jazz-tools/react';
import { WorshipViewAccount, OrganizationType } from '../lib/jazz/schema';
import { activeOrgIdAtom } from '../../ipc/jazz/jazz.atoms';

/**
 * Hook to manage the active organization
 * Stores the active org ID in localStorage via Jotai atomWithStorage
 */
export function useActiveOrganization() {
  // useAccount returns the account directly (or null/undefined if not loaded)
  const me = useAccount(WorshipViewAccount, {
    resolve: {
      root: {
        organizations: { $each: true },
      },
    },
  }) as {
    root: {
      organizations: OrganizationType[];
    } | undefined;
  }; // Type assertion needed due to Jazz type resolution

  const [activeOrgId, setActiveOrgId] = useAtom(activeOrgIdAtom);
  const isOrganizationsLoading = !me || !me.root?.organizations;

  // Memoize organizations to prevent unnecessary re-renders
  const organizations = useMemo(
    () => me?.root?.organizations ?? [],
    [me?.root?.organizations]
  );

  // Find the active organization from the account (derived value)
  const activeOrganization = useMemo(() => {
    return organizations?.find(
      (org: any) => org?.$jazz.id === activeOrgId
    ) || null;
  }, [organizations, activeOrgId]);

  // Auto-select first organization if none is selected and organizations exist
  useEffect(() => {
    if (!activeOrgId && organizations && organizations.length > 0) {
      const firstOrg = organizations[0];
      if (firstOrg) {
        setActiveOrgId(firstOrg.$jazz.id);
      }
    }
  }, [organizations, activeOrgId, setActiveOrgId]);

  const switchToOrganization = (org: OrganizationType | null) => {
    setActiveOrgId(org ? org.$jazz.id : null);
  };

  return {
    activeOrganization,
    activeOrgId,
    setActiveOrgId,
    switchToOrganization,
    organizations,
    isOrganizationsLoading,
  };
}
