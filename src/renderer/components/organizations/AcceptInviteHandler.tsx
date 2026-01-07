import { useEffect, useState } from 'react';
import { useAcceptInvite, useAccount } from 'jazz-tools/react';
import { WorshipViewAccount, Organization, OrganizationType } from '../../lib/jazz/schema';
import { setCoMapProperty, pushCoListItem } from '../../lib/jazz/helpers';
import { useActiveOrganization } from '../../hooks/useActiveOrganization';

export function AcceptInviteHandler() {
  const accountResult = useAccount(WorshipViewAccount, {
    resolve: {
      root: {
        organizations: { $each: true },
      },
    },
  });
  // useAccount returns the account directly (or null/undefined if not loaded)
  const me = accountResult as any; // Type assertion needed due to Jazz type resolution
  const { switchToOrganization } = useActiveOrganization();
  const [acceptedOrgId, setAcceptedOrgId] = useState<string | null>(null);

  const onAccept = async (organizationId: string) => {
    if (!me || !me.root) {
      console.warn('Cannot accept invite: not authenticated');
      return;
    }

    try {
      // Load the organization
      const organization = (await Organization.load(organizationId)) as OrganizationType | null;
      if (!organization) {
        console.error('Organization not found:', organizationId);
        return;
      }

      // Check if already in user's organizations list
      const existingIds = me.root.organizations
        ?.map((org: OrganizationType | null) => org?.$jazz.id)
        .filter(Boolean) || [];
      
      if (existingIds.includes(organizationId)) {
        console.log('Organization already in list, switching to it');
        switchToOrganization(organization);
        setAcceptedOrgId(organizationId);
        return;
      }

      // Ensure organizations list exists and add to it
      if (!me.root.organizations) {
        setCoMapProperty(me.root, 'organizations', []);
      }
      pushCoListItem(me.root.organizations, organization);

      // Switch to the accepted organization
      switchToOrganization(organization);

      setAcceptedOrgId(organizationId);
      console.log('Accepted invite for organization:', organizationId);
    } catch (error) {
      console.error('Failed to accept invite:', error);
    }
  };

  useAcceptInvite({
    invitedObjectSchema: Organization,
    onAccept,
  });

  // Show a message when invite is accepted
  useEffect(() => {
    if (acceptedOrgId && me && me.root) {
      const org = me.root.organizations?.find((o: OrganizationType | null) => o?.$jazz.id === acceptedOrgId);
      if (org) {
        // You could show a toast notification here
        console.log(`Successfully joined organization: ${org.name}`);
        // Reset after a delay
        setTimeout(() => setAcceptedOrgId(null), 3000);
      }
    }
  }, [acceptedOrgId, me]);

  return null; // This component doesn't render anything
}

