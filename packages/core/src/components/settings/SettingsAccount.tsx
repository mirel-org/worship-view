import { useState } from 'react';
import { useAccount, useIsAuthenticated, useLogOut } from 'jazz-tools/react';
import { WorshipViewAccount } from '@worship-view/schema';
import { Label } from '@worship-view/ui';
import { Button } from '@worship-view/ui';
import { EditUsernameDialog } from './EditUsernameDialog';
import { useAppDialogs } from '../dialogs/AppDialogsProvider';

export function SettingsAccount() {
  const dialogs = useAppDialogs();
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
            <Label>Cont</Label>
            <div className='flex items-center justify-between'>
              <p className='text-sm text-muted-foreground'>
                {me.profile.name || 'Utilizator'}
              </p>
              <Button
                onClick={() => setEditUsernameOpen(true)}
                variant='outline'
                size='sm'
              >
                Editează numele
              </Button>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <div className='space-y-2 pt-4 border-t'>
          <Button
            onClick={async () => {
              const confirmed = await dialogs.confirm({
                title: 'Deconectare',
                description:
                  'Sigur doriți să vă deconectați? Va trebui să introduceți fraza de acces pentru a vă reconecta.',
                confirmLabel: 'Deconectează-mă',
                variant: 'destructive',
              });
              if (confirmed) {
                logOut();
              }
            }}
            variant='destructive'
            className='w-full'
          >
            Deconectare
          </Button>
        </div>
      </div>
    </>
  );
}
