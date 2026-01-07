import React from 'react';
import { Account } from 'jazz-tools';
import { OrganizationType, WorshipViewAccount } from '../../lib/jazz/schema';
import { useAccount } from 'jazz-tools/react';
import { getOrganizationGroup } from '../../lib/jazz/helpers';

interface OrganizationMembersProps {
  organization: OrganizationType | null;
}

export function OrganizationMembers({
  organization,
}: OrganizationMembersProps) {
  const me = useAccount(WorshipViewAccount, {
    resolve: { profile: true },
  }) as any;

  // Get the organization's group directly (it's already available)
  const group = organization ? getOrganizationGroup(organization) : null;

  // Extract members from the group
  const members = React.useMemo(() => {
    if (!group) {
      return [];
    }

    try {
      // Check if members exists and is an array
      if (!group.members || !Array.isArray(group.members)) {
        return [];
      }

      // Get members from the group - members is an array with account references
      // Each member object has an account property that may be a reference or loaded account
      return group.members
        .map((m: any) => {
          // Each member has an account property
          if (m && m.account) {
            // If account is already loaded, return it
            if (m.account.$isLoaded !== false && m.account.$jazz) {
              return m.account;
            }
            // If it's a reference, we'd need to load it, but for now skip it
            // to avoid the getDescriptor error
          }
          return null;
        })
        .filter(Boolean) as Account[];
    } catch (error) {
      console.error('Failed to get group members:', error);
      return [];
    }
  }, [group]);

  if (!group) {
    return (
      <div className='text-sm text-muted-foreground'>Loading members...</div>
    );
  }

  const getRoleLabel = (role: string | undefined): string => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'manager':
        return 'Manager';
      case 'writer':
        return 'Writer';
      case 'reader':
        return 'Reader';
      default:
        return 'Member';
    }
  };

  const getRoleColor = (role: string | undefined): string => {
    switch (role) {
      case 'admin':
        return 'text-red-600 bg-red-50';
      case 'manager':
        return 'text-blue-600 bg-blue-50';
      case 'writer':
        return 'text-green-600 bg-green-50';
      case 'reader':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (!organization) {
    return (
      <div className='text-sm text-muted-foreground'>
        Select an organization to view members
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <h3 className='text-sm font-semibold'>Members ({members.length})</h3>
      {members.length === 0 ? (
        <div className='text-sm text-muted-foreground py-2'>
          No members found
        </div>
      ) : (
        <div className='space-y-2'>
          {members.map((member) => {
            const memberId = member.$jazz.id;
            const role = group?.getRoleOf?.(memberId);
            const isCurrentUser = memberId === me?.$jazz?.id;
            const memberName = member.profile?.$isLoaded
              ? member.profile.name
              : 'Unknown User';

            return (
              <div
                key={memberId}
                className='flex items-center justify-between p-2 border rounded-md'
              >
                <div className='flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold'>
                    {memberName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className='text-sm font-medium'>
                      {isCurrentUser ? `${memberName} (You)` : memberName}
                    </div>
                    <div className='text-xs text-muted-foreground font-mono'>
                      {memberId.slice(0, 8)}...
                    </div>
                  </div>
                </div>
                {role && (
                  <span
                    className={`text-xs px-2 py-1 rounded ${getRoleColor(role)}`}
                  >
                    {getRoleLabel(role)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
