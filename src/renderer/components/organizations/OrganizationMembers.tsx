import React from 'react';
import { Account } from 'jazz-tools';
import { OrganizationType, WorshipViewAccount } from '../../lib/jazz/schema';
import { useAccount } from 'jazz-tools/react';
import { getOrganizationGroup } from '../../lib/jazz/helpers';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

interface OrganizationMembersProps {
  organization: OrganizationType | null;
  onMemberKicked?: () => void;
}

export function OrganizationMembers({
  organization,
  onMemberKicked,
}: OrganizationMembersProps) {
  const me = useAccount(WorshipViewAccount, {
    resolve: { profile: true },
  }) as any;

  // Get the organization's group directly (it's already available)
  const group = organization ? getOrganizationGroup(organization) : null;

  // Check if current user is admin
  const isAdmin = React.useMemo(() => {
    if (!group || !me?.$jazz?.id) return false;
    const role = group.getRoleOf?.(me.$jazz.id);
    return role === 'admin';
  }, [group, me?.$jazz?.id]);

  const handleKickMember = async (member: Account) => {
    if (!group || !member) return;

    const memberId = member.$jazz.id;
    const memberRole = group.getRoleOf?.(memberId);
    const memberName = member.profile?.$isLoaded ? member.profile.name : 'Utilizator necunoscut';

    // Prevent kicking admins (except yourself)
    if (memberRole === 'admin' && memberId !== me?.$jazz?.id) {
      alert('Nu puteți elimina alți administratori. Aceștia trebuie să părăsească organizația singuri.');
      return;
    }

    // Confirm action
    if (!confirm(`Sigur doriți să eliminați pe ${memberName} din această organizație?`)) {
      return;
    }

    try {
      group.removeMember(member);
      if (onMemberKicked) {
        onMemberKicked();
      }
    } catch (error: any) {
      console.error('Failed to remove member:', error);
      alert(`Eliminarea membrului a eșuat: ${error.message || 'Eroare necunoscută'}`);
    }
  };

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
      <div className='text-sm text-muted-foreground'>Se încarcă membrii...</div>
    );
  }

  const getRoleLabel = (role: string | undefined): string => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'manager':
        return 'Manager';
      case 'writer':
        return 'Editor';
      case 'reader':
        return 'Cititor';
      default:
        return 'Membru';
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
        Selectați o organizație pentru a vedea membrii
      </div>
    );
  }

  return (
    <div className='space-y-2'>
      <h3 className='text-sm font-semibold'>Membri ({members.length})</h3>
      {members.length === 0 ? (
        <div className='text-sm text-muted-foreground py-2'>
          Niciun membru găsit
        </div>
      ) : (
        <div className='space-y-2'>
          {members.map((member) => {
            const memberId = member.$jazz.id;
            const role = group?.getRoleOf?.(memberId);
            const isCurrentUser = memberId === me?.$jazz?.id;
            const memberName = member.profile?.$isLoaded
              ? member.profile.name
              : 'Utilizator necunoscut';

            const canKick = isAdmin && !isCurrentUser && role !== 'admin';

            return (
              <div
                key={memberId}
                className='flex items-center justify-between p-2 border rounded-md'
              >
                <div className='flex items-center gap-2 flex-1'>
                  <div className='w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold'>
                    {memberName.charAt(0).toUpperCase()}
                  </div>
                  <div className='flex-1'>
                    <div className='text-sm font-medium'>
                      {isCurrentUser ? `${memberName} (Tu)` : memberName}
                    </div>
                    <div className='text-xs text-muted-foreground font-mono'>
                      {memberId.slice(0, 8)}...
                    </div>
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  {role && (
                    <span
                      className={`text-xs px-2 py-1 rounded ${getRoleColor(role)}`}
                    >
                      {getRoleLabel(role)}
                    </span>
                  )}
                  {canKick && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleKickMember(member)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
