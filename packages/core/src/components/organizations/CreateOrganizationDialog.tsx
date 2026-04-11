import { useState } from 'react';
import { useAccount } from 'jazz-tools/react';
import { WorshipViewAccount, Organization } from '@worship-view/schema';
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
import { useActiveOrganization } from '../../hooks/useActiveOrganization';
import { createTextStyle, DEFAULT_TEXT_STYLE_TEMPLATE } from '../../jazz/text-style-store';

interface CreateOrganizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrganizationDialog({
  open,
  onOpenChange,
}: CreateOrganizationDialogProps) {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  // useAccount returns the account directly (or null/undefined if not loaded)
  const me = useAccount(WorshipViewAccount, {
    resolve: {
      root: {
        organizations: { $each: true },
      },
    },
  }) as any; // Type assertion needed due to Jazz type resolution
  const { switchToOrganization } = useActiveOrganization();

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Vă rugăm să introduceți numele organizației');
      return;
    }

    if (!me) {
      alert('Trebuie să fiți autentificat pentru a crea o organizație');
      return;
    }

    try {
      setIsCreating(true);

      if (!me.root.organizations) {
        throw new Error('Account root not loaded');
      }

      // Create the organization inline in the list
      // With onInlineCreate: 'newGroup' permission, Jazz will automatically create a group
      // and add the active account (creator) as admin - no manual group management needed
      const newOrg = Organization.create(
        {
          name: name.trim(),
          songs: [],
          serviceList: [],
          media: [],
          textStyles: [],
          presentations: [],
          sessions: [],
        },
      );

      // Add to user's organizations list
      (me.root.organizations.$jazz as any).push(newOrg);

      // Seed the default text style so slides have styling from the start
      createTextStyle(newOrg, DEFAULT_TEXT_STYLE_TEMPLATE);

      // Switch to the new organization
      switchToOrganization(newOrg);

      setName('');
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to create organization:', error);
      alert(`Crearea organizației a eșuat: ${error.message || 'Eroare necunoscută'}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Creează organizație</DialogTitle>
          <DialogDescription>
            Creează o organizație nouă pentru a gestiona cântecele și listele de
            serviciu.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Numele organizației</Label>
            <Input
              id="org-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Introduceți numele organizației"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Anulează
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !name.trim()}>
              {isCreating ? 'Se creează...' : 'Creează'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

