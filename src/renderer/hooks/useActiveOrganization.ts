import { useState, useEffect } from 'react';
import { useAccount } from 'jazz-tools/react';
import { WorshipViewAccount, OrganizationType } from '../lib/jazz/schema';

const ACTIVE_ORG_ID_KEY = 'worship-view-active-org-id';

/**
 * Hook to manage the active organization
 * Stores the active org ID in localStorage and provides methods to switch organizations
 */
export function useActiveOrganization() {
  // useAccount returns the account directly (or null/undefined if not loaded)
  const me = useAccount(WorshipViewAccount, {
    resolve: {
      root: {
        organizations: { $each: true },
      },
    },
  }) as any; // Type assertion needed due to Jazz type resolution

  const [activeOrgId, setActiveOrgIdState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACTIVE_ORG_ID_KEY);
    }
    return null;
  });

  // Update localStorage when activeOrgId changes
  useEffect(() => {
    if (activeOrgId && typeof window !== 'undefined') {
      localStorage.setItem(ACTIVE_ORG_ID_KEY, activeOrgId);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem(ACTIVE_ORG_ID_KEY);
    }
  }, [activeOrgId]);

  // Find the active organization from the account
  const activeOrganization = me?.root?.organizations?.find(
    (org: any) => org?.$jazz.id === activeOrgId
  ) || null;

  // Auto-select first organization if none is selected and organizations exist
  useEffect(() => {
    if (!activeOrgId && me?.root?.organizations && me.root.organizations.length > 0) {
      const firstOrg = me.root.organizations[0];
      if (firstOrg) {
        setActiveOrgIdState(firstOrg.$jazz.id);
      }
    }
  }, [me?.root?.organizations, activeOrgId]);

  const setActiveOrgId = (orgId: string | null) => {
    setActiveOrgIdState(orgId);
  };

  const switchToOrganization = (org: OrganizationType | null) => {
    if (org) {
      setActiveOrgId(org.$jazz.id);
    } else {
      setActiveOrgId(null);
    }
  };

  return {
    activeOrganization,
    activeOrgId,
    setActiveOrgId,
    switchToOrganization,
    organizations: me?.root?.organizations || [],
  };
}


