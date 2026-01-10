import React, { useState } from 'react';
import { useAccount, useIsAuthenticated, useLogOut } from 'jazz-tools/react';
import { WorshipViewAccount } from '../../lib/jazz/schema';
import { Label } from '../ui/label';
import { Button } from '../ui/button';
import { EditUsernameDialog } from './EditUsernameDialog';

export function SettingsAccount() {
  const isAuthenticated = useIsAuthenticated();
  const logOut = useLogOut();
  const [editUsernameOpen, setEditUsernameOpen] = useState(false);
  const me = useAccount(WorshipViewAccount, {
    resolve: {
      profile: true,
    },
  }) as {
    profile:
      | {
          name: string;
        }
      | undefined;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <EditUsernameDialog
        open={editUsernameOpen}
        onOpenChange={setEditUsernameOpen}
      />
      <div className='space-y-4'>
        {/* Account Profile */}
        {me?.profile && (
          <div className='space-y-2'>
            <Label>Account</Label>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                {me.profile.name || 'User'}
              </p>
              <Button
                onClick={() => setEditUsernameOpen(true)}
                variant='outline'
                size='sm'
              >
                Edit Username
              </Button>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className='space-y-2 pt-4 border-t'>
          <Button
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to log out? You will need to enter your passphrase to log back in.',
                )
              ) {
                logOut();
              }
            }}
            variant='destructive'
            className='w-full'
          >
            Log Out
          </Button>
        </div>
      </div>
    </>
  );
}
