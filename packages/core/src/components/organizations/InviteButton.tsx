import { useState } from 'react';
import { OrganizationType } from '@worship-view/schema';
import { getOrganizationGroup } from '@worship-view/schema';
import { Button } from '@worship-view/ui';
import { Input } from '@worship-view/ui';
import { Label } from '@worship-view/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@worship-view/ui';
import { useAppDialogs } from '../dialogs/AppDialogsProvider';

interface InviteButtonProps {
  organization: OrganizationType | null;
}

export function InviteButton({ organization }: InviteButtonProps) {
  const dialogs = useAppDialogs();
  const [inviteId, setInviteId] = useState<string>('');
  const [inviteSecret, setInviteSecret] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleGenerateInvite = async () => {
    if (!organization) {
      await dialogs.alert({
        title: 'Nicio organizație selectată',
        description: 'Selectați o organizație înainte să generați o invitație.',
      });
      return;
    }

    try {
      // Get the organization's group
      const orgGroup = getOrganizationGroup(organization);
      
      // Create invite secret from the group
      const secret = orgGroup.$jazz.createInvite('writer');
      
      // Organization ID
      const orgId = organization.$jazz.id;
      
      setInviteId(orgId);
      setInviteSecret(secret);
      setDialogOpen(true);
    } catch (error: any) {
      console.error('Failed to create invite:', error);
      await dialogs.alert({
        title: 'Creare invitație eșuată',
        description: `Crearea invitației a eșuat: ${error.message || 'Eroare necunoscută'}`,
        variant: 'destructive',
      });
    }
  };

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(inviteId);
    await dialogs.alert({
      title: 'Copiat',
      description: 'ID-ul organizației a fost copiat în clipboard!',
    });
  };

  const handleCopySecret = async () => {
    await navigator.clipboard.writeText(inviteSecret);
    await dialogs.alert({
      title: 'Copiat',
      description: 'Secretul invitației a fost copiat în clipboard!',
    });
  };

  const handleCopyBoth = async () => {
    const combined = `${inviteId}:${inviteSecret}`;
    await navigator.clipboard.writeText(combined);
    await dialogs.alert({
      title: 'Copiat',
      description: 'ID-ul și secretul invitației au fost copiate în clipboard!',
    });
  };

  if (!organization) {
    return null;
  }

  return (
    <>
      <Button onClick={handleGenerateInvite} variant="outline">
        Invită membri
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invitație pentru {organization.name}</DialogTitle>
            <DialogDescription>
              Împărtășiți aceste detalii cu alții pentru a-i invita să se alăture
              acestei organizații.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>ID organizație</Label>
              <div className="flex gap-2">
                <Input value={inviteId} readOnly className="font-mono text-sm flex-1" />
                <Button onClick={handleCopyId} variant="outline" size="sm">
                  Copiază
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Secret invitație</Label>
              <div className="flex gap-2">
                <Input value={inviteSecret} readOnly className="font-mono text-sm flex-1" />
                <Button onClick={handleCopySecret} variant="outline" size="sm">
                  Copiază
                </Button>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Închide
              </Button>
              <Button onClick={handleCopyBoth}>Copiază ambele</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
