import React, { useState } from 'react';
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
      alert('No organization selected');
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
      alert(`Failed to create invite: ${error.message || 'Unknown error'}`);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(inviteId);
    alert('Organization ID copied to clipboard!');
  };

  const handleCopySecret = () => {
    navigator.clipboard.writeText(inviteSecret);
    alert('Invite secret copied to clipboard!');
  };

  const handleCopyBoth = () => {
    const combined = `${inviteId}:${inviteSecret}`;
    navigator.clipboard.writeText(combined);
    alert('Invite ID and secret copied to clipboard!');
  };

  if (!organization) {
    return null;
  }

  return (
    <>
      <Button onClick={handleGenerateInvite} variant="outline">
        Invite Members
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Invite to {organization.name}</DialogTitle>
            <DialogDescription>
              Share these details with others to invite them to join this organization.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Organization ID</Label>
              <div className="flex gap-2">
                <Input value={inviteId} readOnly className="font-mono text-sm flex-1" />
                <Button onClick={handleCopyId} variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Invite Secret</Label>
              <div className="flex gap-2">
                <Input value={inviteSecret} readOnly className="font-mono text-sm flex-1" />
                <Button onClick={handleCopySecret} variant="outline" size="sm">
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </Button>
              <Button onClick={handleCopyBoth}>Copy Both</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

