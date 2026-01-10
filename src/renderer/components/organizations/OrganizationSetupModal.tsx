import React, { useState, useEffect } from 'react';
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
        'Are you sure you want to log out? You will need to enter your passphrase to log back in.',
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
            <DialogTitle>Organization Required</DialogTitle>
            <DialogDescription>
              You need to be part of an organization to use this application.
              You can either create a new organization or accept an invite to
              join an existing one.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='flex flex-col gap-3'>
              <Button onClick={handleCreateClick} className='w-full' size='lg'>
                Create New Organization
              </Button>
              <Button
                onClick={handleAcceptClick}
                variant='outline'
                className='w-full'
                size='lg'
              >
                Accept Invite
              </Button>
            </div>
            <div className='pt-4 border-t'>
              <Button
                onClick={handleLogOut}
                variant='ghost'
                className='w-full'
                size='sm'
              >
                Log Out
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
