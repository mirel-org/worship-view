import { useState } from 'react';
import { OrganizationType } from '../../lib/jazz/schema';
import { getOrganizationGroup } from '../../lib/jazz/helpers';
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

interface InviteButtonProps {
  organization: OrganizationType | null;
}

export function InviteButton({ organization }: InviteButtonProps) {
  const [inviteId, setInviteId] = useState<string>('');
  const [inviteSecret, setInviteSecret] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleGenerateInvite = () => {
    if (!organization) {
      alert('Nicio organizație selectată');
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
      alert(`Crearea invitației a eșuat: ${error.message || 'Eroare necunoscută'}`);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(inviteId);
    alert('ID-ul organizației a fost copiat în clipboard!');
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(inviteSecret);
    alert('Secretul invitației a fost copiat în clipboard!');
  };

  const handleCopyBoth = () => {
    const combined = `${inviteId}:${inviteSecret}`;
    navigator.clipboard.writeText(combined);
    alert('ID-ul și secretul invitației au fost copiate în clipboard!');
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

