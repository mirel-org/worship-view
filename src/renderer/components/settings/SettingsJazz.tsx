import { useState } from 'react';
import { useAtom } from 'jotai';
import { useAccount, useIsAuthenticated, useLogOut } from 'jazz-tools/react';
import { WorshipViewAccount } from '../../lib/jazz/schema';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { InviteButton } from '../organizations/InviteButton';
import { AcceptInviteDialog } from '../organizations/AcceptInviteDialog';
import { OrganizationMembers } from '../organizations/OrganizationMembers';
import { EditUsernameDialog } from './EditUsernameDialog';
import { useActiveOrganization } from '../../hooks/useActiveOrganization';
import { jazzApiKeyAtom } from '../../../ipc/jazz/jazz.atoms';

export function SettingsJazz() {
  const isAuthenticated = useIsAuthenticated();
  const logOut = useLogOut();
  const [apiKey, setApiKey] = useAtom(jazzApiKeyAtom);
  const [acceptInviteOpen, setAcceptInviteOpen] = useState(false);
  const [editUsernameOpen, setEditUsernameOpen] = useState(false);
  const [newApiKey, setNewApiKey] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState(false);
  const me = useAccount(WorshipViewAccount, {
    resolve: {
      profile: true,
      root: {
        organizations: { $each: true },
      },
    },
  }) as any; // Type assertion needed due to Jazz type resolution
  const { activeOrganization } = useActiveOrganization();

  const handleSaveApiKey = () => {
    if (!newApiKey.trim()) {
      return;
    }

    setApiKey(newApiKey.trim());
    setNewApiKey('');
    // Reload the page to reinitialize Jazz with new API key
    window.location.reload();
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <AcceptInviteDialog open={acceptInviteOpen} onOpenChange={setAcceptInviteOpen} />
      <EditUsernameDialog open={editUsernameOpen} onOpenChange={setEditUsernameOpen} />
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold my-4">Jazz Cloud Sync</h2>

      <div className="space-y-4">
        {/* API Key Management */}
        <div className="space-y-2 pb-4 border-b">
          <Label>Jazz Cloud API Key</Label>
          {apiKey ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? 'Hide' : 'Show'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                API key is saved. Enter a new key below to update it.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No API key set. Cloud sync is disabled.
            </p>
          )}
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter new API key"
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newApiKey.trim()) {
                  handleSaveApiKey();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Get your API key from{' '}
                <a
                  href="https://dashboard.jazz.tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline hover:no-underline"
                >
                  dashboard.jazz.tools
                </a>
              </p>
              <Button
                onClick={handleSaveApiKey}
                disabled={!newApiKey.trim()}
                size="sm"
              >
                {apiKey ? 'Update' : 'Save'}
              </Button>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-2">
          <Label>Sync Status</Label>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${apiKey ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span>{apiKey ? 'Connected to Jazz Cloud' : 'Cloud sync disabled (no API key)'}</span>
          </div>
        </div>

        {/* Account Profile */}
        {me?.profile && (
          <div className="space-y-2">
            <Label>Account</Label>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {me.profile.name || 'User'}
              </p>
              <Button
                onClick={() => setEditUsernameOpen(true)}
                variant="outline"
                size="sm"
              >
                Edit Username
              </Button>
            </div>
          </div>
        )}

        {/* Active Organization */}
        {activeOrganization && (
          <div className="space-y-2">
            <Label>Active Organization</Label>
            <p className="text-sm text-muted-foreground">
              {activeOrganization.name}
            </p>
          </div>
        )}

        {/* Organizations Count */}
        {me?.root?.organizations && (
          <div className="space-y-2">
            <Label>Organizations</Label>
            <p className="text-sm text-muted-foreground">
              {me.root.organizations.length} organization
              {me.root.organizations.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Organization Members */}
        {activeOrganization && (
          <div className="space-y-2 pt-4 border-t">
            <OrganizationMembers organization={activeOrganization} />
          </div>
        )}

        {/* Invite Button */}
        {activeOrganization && (
          <div className="space-y-2">
            <Label>Invite Members</Label>
            <InviteButton organization={activeOrganization} />
          </div>
        )}

        {/* Accept Invite Button */}
        <div className="space-y-2">
          <Label>Accept Invite</Label>
          <Button onClick={() => setAcceptInviteOpen(true)} variant="outline" className="w-full">
            Accept Invite by ID
          </Button>
        </div>

        {/* Logout Button */}
        <div className="space-y-2 pt-4 border-t">
          <Button
            onClick={() => {
              if (confirm('Are you sure you want to log out? You will need to enter your passphrase to log back in.')) {
                logOut();
              }
            }}
            variant="destructive"
            className="w-full"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}



