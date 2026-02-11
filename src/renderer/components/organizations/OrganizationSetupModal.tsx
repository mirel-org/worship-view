import { useState, useEffect } from 'react';
import { useAccount, useLogOut } from 'jazz-tools/react';
import { WorshipViewAccount } from '../../lib/jazz/schema';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { AcceptInviteDialog } from './AcceptInviteDialog';

interface OrganizationSetupModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function OrganizationSetupModal({
  open,
  onOpenChange,
}: OrganizationSetupModalProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const logOut = useLogOut();

  // Check if user has organizations
  const me = useAccount(WorshipViewAccount, {
    resolve: {
      root: {
        organizations: { $each: true },
      },
    },
  }) as any;

  const organizations = me?.root?.organizations || [];
  const hasOrganizations = organizations.length > 0;

  // Close modal when user gets an organization
  useEffect(() => {
    if (hasOrganizations && open) {
      onOpenChange?.(false);
    }
  }, [hasOrganizations, open, onOpenChange]);

  // Prevent closing the modal - user must join or create an organization
  const handleOpenChange = (newOpen: boolean) => {
    // Don't allow closing - user must join or create an organization
    if (!newOpen) {
      return;
    }
    onOpenChange?.(newOpen);
  };

  const handleCreateClick = () => {
    setShowCreateDialog(true);
  };

  const handleAcceptClick = () => {
    setShowAcceptDialog(true);
  };

  const handleLogOut = () => {
    if (
      confirm(
        'Sigur doriți să vă deconectați? Va trebui să introduceți fraza de acces pentru a vă reconecta.',
      )
    ) {
      logOut();
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          className='sm:max-w-[500px] [&>button]:hidden'
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Organizație necesară</DialogTitle>
            <DialogDescription>
              Trebuie să faceți parte dintr-o organizație pentru a utiliza
              această aplicație. Puteți crea o organizație nouă sau accepta o
              invitație pentru a vă alătura uneia existente.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='flex flex-col gap-3'>
              <Button onClick={handleCreateClick} className='w-full' size='lg'>
                Creează organizație nouă
              </Button>
              <Button
                onClick={handleAcceptClick}
                variant='outline'
                className='w-full'
                size='lg'
              >
                Acceptă invitația
              </Button>
            </div>
            <div className='pt-4 border-t'>
              <Button
                onClick={handleLogOut}
                variant='ghost'
                className='w-full'
                size='sm'
              >
                Deconectare
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateOrganizationDialog
        open={showCreateDialog}
        onOpenChange={(isOpen) => {
          setShowCreateDialog(isOpen);
        }}
      />

      <AcceptInviteDialog
        open={showAcceptDialog}
        onOpenChange={(isOpen) => {
          setShowAcceptDialog(isOpen);
        }}
      />
    </>
  );
}
