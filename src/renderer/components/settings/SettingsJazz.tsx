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
        <h2 className="text-2xl font-semibold my-4">Sincronizare Jazz Cloud</h2>

      <div className="space-y-4">
        {/* API Key Management */}
        <div className="space-y-2 pb-4 border-b">
          <Label>Cheie API Jazz Cloud</Label>
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
                  {showApiKey ? 'Ascunde' : 'Arată'}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Cheia API este salvată. Introduceți o cheie nouă mai jos pentru a o actualiza.
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nicio cheie API setată. Sincronizarea cloud este dezactivată.
            </p>
          )}
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Introduceți noua cheie API"
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
                Obțineți cheia API de la{' '}
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
                {apiKey ? 'Actualizează' : 'Salvează'}
              </Button>
            </div>
          </div>
        </div>

        {/* Connection Status */}
        <div className="space-y-2">
          <Label>Stare sincronizare</Label>
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${apiKey ? 'bg-primary' : 'bg-muted-foreground'}`}
            />
            <span>{apiKey ? 'Conectat la Jazz Cloud' : 'Sincronizare cloud dezactivată (lipsă cheie API)'}</span>
          </div>
        </div>

        {/* Account Profile */}
        {me?.profile && (
          <div className="space-y-2">
            <Label>Cont</Label>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {me.profile.name || 'Utilizator'}
              </p>
              <Button
                onClick={() => setEditUsernameOpen(true)}
                variant="outline"
                size="sm"
              >
                Editează numele
              </Button>
            </div>
          </div>
        )}

        {/* Active Organization */}
        {activeOrganization && (
          <div className="space-y-2">
            <Label>Organizație activă</Label>
            <p className="text-sm text-muted-foreground">
              {activeOrganization.name}
            </p>
          </div>
        )}

        {/* Organizations Count */}
        {me?.root?.organizations && (
          <div className="space-y-2">
            <Label>Organizații</Label>
            <p className="text-sm text-muted-foreground">
              {me.root.organizations.length} organizații
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
            <Label>Invită membri</Label>
            <InviteButton organization={activeOrganization} />
          </div>
        )}

        {/* Accept Invite Button */}
        <div className="space-y-2">
          <Label>Acceptă invitația</Label>
          <Button onClick={() => setAcceptInviteOpen(true)} variant="outline" className="w-full">
            Acceptă invitația după ID
          </Button>
        </div>

        {/* Logout Button */}
        <div className="space-y-2 pt-4 border-t">
          <Button
            onClick={() => {
              if (confirm('Sigur doriți să vă deconectați? Va trebui să introduceți fraza de acces pentru a vă reconecta.')) {
                logOut();
              }
            }}
            variant="destructive"
            className="w-full"
          >
            Deconectare
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
