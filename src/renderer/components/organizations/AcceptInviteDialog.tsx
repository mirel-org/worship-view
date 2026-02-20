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

const ORGANIZATION_ID_REGEX = /^co_z[A-Za-z0-9_-]+$/;

export function AcceptInviteDialog({
  open,
  onOpenChange,
}: AcceptInviteDialogProps) {
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

  const handleAccept = async () => {
    const trimmedInput = combinedInput.trim();
    const separatorIndex = trimmedInput.indexOf(':');
    if (
      separatorIndex <= 0 ||
      separatorIndex === trimmedInput.length - 1
    ) {
      setError(
        'Format invalid. Folosiți formatul complet: IDOrganizație:SecretInvitație',
      );
      return;
    }

    const normalizedInviteId = trimmedInput.slice(0, separatorIndex).trim();
    const normalizedInviteSecret = trimmedInput.slice(separatorIndex + 1).trim();

    if (!normalizedInviteId || !normalizedInviteSecret) {
      setError('Vă rugăm să furnizați invitația completă: IDOrganizație:SecretInvitație');
      return;
    }

    if (!normalizedInviteSecret.startsWith('inviteSecret_z')) {
      setError('Secret invitație invalid. Trebuie să înceapă cu "inviteSecret_z".');
      return;
    }

    if (!me || !agent) {
      setError('Trebuie să fiți autentificat pentru a accepta o invitație');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (
        !ORGANIZATION_ID_REGEX.test(normalizedInviteId) ||
        normalizedInviteId.length < 20
      ) {
        setError(
          'ID organizație invalid. Folosiți ID-ul complet (începe cu "co_z").',
        );
        return;
      }

      const resolvedOrganization = (await Organization.load(
        normalizedInviteId,
      )) as OrganizationType | null;
      if (!resolvedOrganization) {
        setError('Organizația nu a fost găsită. Verificați ID-ul complet.');
        return;
      }

      const resolvedOrganizationId = resolvedOrganization.$jazz.id;
      if (resolvedOrganizationId !== normalizedInviteId) {
        setError(
          'ID organizație incomplet. Vă rugăm să introduceți ID-ul complet exact.',
        );
        return;
      }

      // Get the account instance to call acceptInvite
      const account = Account.getMe();
      if (!account) {
        throw new Error('Account not available');
      }

      // Accept the invite using the account's acceptInvite method
      await account.acceptInvite(
        normalizedInviteId,
        normalizedInviteSecret as `inviteSecret_z${string}`,
        Organization,
      );

      const organization = resolvedOrganization;

      // Check if already in user's organizations list
      const existingIds =
        me.root?.organizations
          ?.map((org: OrganizationType | null) => org?.$jazz.id)
          .filter(Boolean) || [];

      if (!existingIds.includes(resolvedOrganizationId)) {
        // Ensure organizations list exists and add to it
        if (!me.root?.organizations) {
          setCoMapProperty(me.root, 'organizations', []);
        }
        pushCoListItem(me.root.organizations, organization);
      }

      // Switch to the accepted organization
      switchToOrganization(organization);

      // Reset form
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
            Introduceți invitația completă în formatul
            {' '}
            <span className='font-mono'>IDOrganizație:SecretInvitație</span>
            {' '}
            pentru a vă alătura unei organizații.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='invite-combined'>Invitație</Label>
            <Input
              id='invite-combined'
              value={combinedInput}
              onChange={(e) => setCombinedInput(e.target.value)}
              placeholder='co_z...:inviteSecret_z...'
              className='font-mono text-sm'
            />
          </div>

          {error && (
            <div className='text-sm text-destructive bg-destructive/10 p-2 rounded'>
              {error}
            </div>
          )}

          <div className='flex gap-2 justify-end'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              Anulează
            </Button>
            <Button
              onClick={handleAccept}
              disabled={isLoading || !combinedInput.trim()}
            >
              {isLoading ? 'Se acceptă...' : 'Acceptă invitația'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
