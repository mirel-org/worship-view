import { useState } from 'react';
import { useAccount, useAgent } from 'jazz-tools/react';
import { Account } from 'jazz-tools';
import {
  WorshipViewAccount,
  Organization,
  OrganizationType,
} from '../../lib/jazz/schema';
import { setCoMapProperty, pushCoListItem } from '../../lib/jazz/helpers';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { useActiveOrganization } from '../../hooks/useActiveOrganization';

interface AcceptInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AcceptInviteDialog({
  open,
  onOpenChange,
}: AcceptInviteDialogProps) {
  const [inviteId, setInviteId] = useState('');
  const [inviteSecret, setInviteSecret] = useState('');
  const [combinedInput, setCombinedInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const accountResult = useAccount(WorshipViewAccount, {
    resolve: {
      root: {
        organizations: { $each: true },
      },
    },
  });
  const me = accountResult as any; // Type assertion needed due to Jazz type resolution
  const agent = useAgent();
  const { switchToOrganization } = useActiveOrganization();

  const handlePasteCombined = () => {
    // Try to parse combined format: "orgId:secret" or just paste and split
    const parts = combinedInput.trim().split(':');
    if (parts.length === 2) {
      setInviteId(parts[0].trim());
      setInviteSecret(parts[1].trim());
    } else {
      setError('Format invalid. Format așteptat: IDOrganizație:SecretInvitație');
    }
  };

  const handleAccept = async () => {
    if (!inviteId.trim() || !inviteSecret.trim()) {
      setError('Vă rugăm să furnizați atât ID-ul organizației, cât și secretul invitației');
      return;
    }

    if (!me || !agent) {
      setError('Trebuie să fiți autentificat pentru a accepta o invitație');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the account instance to call acceptInvite
      const account = Account.getMe();
      if (!account) {
        throw new Error('Account not available');
      }

      // Accept the invite using the account's acceptInvite method
      await account.acceptInvite(
        inviteId,
        inviteSecret as `inviteSecret_z${string}`,
        Organization,
      );

      // Load the organization to add it to the user's list
      const organization = (await Organization.load(
        inviteId,
      )) as OrganizationType | null;
      if (!organization) {
        throw new Error('Organization not found');
      }

      // Check if already in user's organizations list
      const existingIds =
        me.root?.organizations
          ?.map((org: OrganizationType | null) => org?.$jazz.id)
          .filter(Boolean) || [];

      if (!existingIds.includes(inviteId)) {
        // Ensure organizations list exists and add to it
        if (!me.root?.organizations) {
          setCoMapProperty(me.root, 'organizations', []);
        }
        pushCoListItem(me.root.organizations, organization);
      }

      // Switch to the accepted organization
      switchToOrganization(organization);

      // Reset form
      setInviteId('');
      setInviteSecret('');
      setCombinedInput('');
      onOpenChange(false);
    } catch (err: any) {
      console.error('Failed to accept invite:', err);
      setError(
        err.message ||
          'Acceptarea invitației a eșuat. Verificați ID-ul și secretul.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Acceptă invitația</DialogTitle>
          <DialogDescription>
            Introduceți ID-ul organizației și secretul invitației pentru a vă
            alătura unei organizații.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Combined input for pasting */}
          <div className='space-y-2'>
            <Label>Lipește invitația (format ID:Secret)</Label>
            <div className='flex gap-2'>
              <Input
                value={combinedInput}
                onChange={(e) => setCombinedInput(e.target.value)}
                placeholder='OrganizationID:InviteSecret'
                className='font-mono text-sm flex-1'
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData('text');
                  setCombinedInput(pasted);
                  setTimeout(() => handlePasteCombined(), 0);
                }}
              />
              <Button onClick={handlePasteCombined} variant='outline' size='sm'>
                Parsează
              </Button>
            </div>
          </div>

          <div className='text-center text-sm text-muted-foreground'>SAU</div>

          {/* Separate inputs */}
          <div className='space-y-2'>
            <Label htmlFor='invite-id'>ID organizație</Label>
            <Input
              id='invite-id'
              value={inviteId}
              onChange={(e) => setInviteId(e.target.value)}
              placeholder='Introduceți ID-ul organizației'
              className='font-mono text-sm'
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='invite-secret'>Secret invitație</Label>
            <Input
              id='invite-secret'
              value={inviteSecret}
              onChange={(e) => setInviteSecret(e.target.value)}
              placeholder='Introduceți secretul invitației'
              className='font-mono text-sm'
            />
          </div>

          {error && (
            <div className='text-sm text-red-500 bg-red-50 p-2 rounded'>
              {error}
            </div>
          )}

          <div className='flex gap-2 justify-end'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Anulează
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isLoading || !inviteId.trim() || !inviteSecret.trim()}
            >
              {isLoading ? 'Se acceptă...' : 'Acceptă invitația'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
