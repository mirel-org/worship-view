import { useState, useEffect, useMemo } from 'react';
import { useAccount, useIsAuthenticated } from 'jazz-tools/react';
import { WorshipViewAccount } from '../../lib/jazz/schema';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { InviteButton } from '../organizations/InviteButton';
import { AcceptInviteDialog } from '../organizations/AcceptInviteDialog';
import { OrganizationMembers } from '../organizations/OrganizationMembers';
import { CreateOrganizationDialog } from '../organizations/CreateOrganizationDialog';
import { RenameOrganizationDialog } from '../organizations/RenameOrganizationDialog';
import { useActiveOrganization } from '../../hooks/useActiveOrganization';
import { useDeleteAllSongs } from '../../hooks/useSongs';
import { getOrganizationGroup, removeCoListItem, getSongsArray } from '../../lib/jazz/helpers';
import { CheckCircle2, Pencil, Trash2, Bomb } from 'lucide-react';

export function SettingsOrganizations() {
  const isAuthenticated = useIsAuthenticated();
  const [acceptInviteOpen, setAcceptInviteOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
  const me = useAccount(WorshipViewAccount, {
    resolve: {
      root: {
        organizations: { $each: true },
      },
      profile: true,
    },
  }) as any; // Type assertion needed due to Jazz type resolution
  const { activeOrganization, activeOrgId, switchToOrganization, organizations, setActiveOrgId } =
    useActiveOrganization();
  const deleteAllSongsMutation = useDeleteAllSongs();

  // Set initial selected org to active org or first org
  useEffect(() => {
    if (!selectedOrgId && organizations.length > 0) {
      const initialOrg = activeOrganization || organizations[0];
      if (initialOrg) {
        setSelectedOrgId(initialOrg.$jazz.id);
      }
    }
  }, [selectedOrgId, activeOrganization, organizations]);

  const selectedOrganization = organizations.find(
    (org: any) => org?.$jazz.id === selectedOrgId
  ) || null;

  // Check if current user is admin of selected organization
  const isAdmin = useMemo(() => {
    if (!selectedOrganization || !me?.$jazz?.id) return false;
    const group = getOrganizationGroup(selectedOrganization);
    const role = group.getRoleOf?.(me.$jazz.id);
    return role === 'admin';
  }, [selectedOrganization, me?.$jazz?.id]);

  // Get song count for the selected organization
  const songCount = useMemo(() => {
    if (!selectedOrganization) return 0;
    const songs = getSongsArray(selectedOrganization);
    return songs.filter(song => song !== null).length;
  }, [selectedOrganization]);

  const handleMakeActive = () => {
    if (selectedOrganization) {
      switchToOrganization(selectedOrganization);
    }
  };

  const handleDeleteOrganization = () => {
    if (!selectedOrganization || !me) return;

    const orgName = selectedOrganization.name;
    if (!confirm(`Are you sure you want to delete "${orgName}"? This action cannot be undone and will remove all songs and data associated with this organization.`)) {
      return;
    }

    try {
      // If this is the active organization, switch to another one or clear active
      if (selectedOrganization.$jazz.id === activeOrgId) {
        const otherOrgs = organizations.filter((org: any) => org?.$jazz.id !== selectedOrgId);
        if (otherOrgs.length > 0) {
          switchToOrganization(otherOrgs[0]);
        } else {
          setActiveOrgId(null);
        }
      }

      // Remove organization from user's organizations list
      removeCoListItem(me.root.organizations, (org: any) => org?.$jazz.id === selectedOrgId);

      // Clear selection
      setSelectedOrgId(null);
    } catch (error: any) {
      console.error('Failed to delete organization:', error);
      alert(`Failed to delete organization: ${error.message || 'Unknown error'}`);
    }
  };

  const handleDeleteAllSongs = async () => {
    if (!selectedOrganization) return;

    const confirmMessage = songCount > 0
      ? `Are you sure you want to delete all ${songCount} song${songCount !== 1 ? 's' : ''} from "${selectedOrganization.name}"? This action cannot be undone and will also clear the service list.`
      : `Are you sure you want to delete all songs from "${selectedOrganization.name}"? This action cannot be undone.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await deleteAllSongsMutation.mutateAsync(selectedOrganization);
      alert(`Successfully deleted all songs from "${selectedOrganization.name}"`);
    } catch (error: any) {
      console.error('Failed to delete all songs:', error);
      alert(`Failed to delete all songs: ${error.message || 'Unknown error'}`);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AcceptInviteDialog open={acceptInviteOpen} onOpenChange={setAcceptInviteOpen} />
      <CreateOrganizationDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
      <RenameOrganizationDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        organization={selectedOrganization}
      />
      <div className="flex h-full gap-4">
        {/* Left Sidebar - Organization List */}
        <div className="w-64 border-r pr-4 flex flex-col">
          <Label className="mb-2">Organizations</Label>
          <div className="flex-1 overflow-y-auto space-y-1">
            {organizations.map((org: any) => {
              if (!org) return null;
              const isActive = org.$jazz.id === activeOrgId;
              const isSelected = org.$jazz.id === selectedOrgId;
              return (
                <button
                  key={org.$jazz.id}
                  onClick={() => setSelectedOrgId(org.$jazz.id)}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-sm transition-colors
                    ${isSelected
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{org.name}</span>
                    {isActive && (
                      <CheckCircle2 className="h-4 w-4 ml-2 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            variant="outline"
            className="w-full mt-4"
          >
            New Organization
          </Button>
        </div>

        {/* Right Side - Organization Details */}
        <div className="flex-1 overflow-y-auto space-y-4">
          {selectedOrganization ? (
            <>
              {/* Organization Header */}
              <div className="space-y-2 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{selectedOrganization.name}</h3>
                    {selectedOrganization.$jazz.id === activeOrgId && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Currently active organization
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedOrganization.$jazz.id !== activeOrgId && (
                      <Button onClick={handleMakeActive}>
                        Make Active
                      </Button>
                    )}
                    {isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRenameDialogOpen(true)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Rename
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteOrganization}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Organization Members */}
              <div className="space-y-2">
                <OrganizationMembers organization={selectedOrganization} />
              </div>

              {/* Invite Button */}
              <div className="space-y-2 pt-4 border-t">
                <Label>Invite Members</Label>
                <InviteButton organization={selectedOrganization} />
              </div>

              {/* Delete All Songs Button (Admin only) */}
              {isAdmin && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Danger Zone</Label>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAllSongs}
                    disabled={deleteAllSongsMutation.isLoading}
                    className="w-full"
                  >
                    <Bomb className="h-4 w-4 mr-2" />
                    {deleteAllSongsMutation.isLoading
                      ? 'Deleting...'
                      : `Delete All Songs${songCount > 0 ? ` (${songCount})` : ''}`}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    This will permanently delete all songs and clear the service list for this organization.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-muted-foreground">
              Select an organization to view details
            </div>
          )}

          {/* Accept Invite Button */}
          <div className="space-y-2 pt-4 border-t">
            <Label>Accept Invite</Label>
            <Button onClick={() => setAcceptInviteOpen(true)} variant="outline" className="w-full">
              Accept Invite by ID
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

