import { useState } from 'react';
import { useAtom } from 'jotai';
import { useIsAuthenticated } from 'jazz-tools/react';
import SettingsDisplay from './SettingsDisplay';
import {
  areSettingsOpenAtom,
  SettingsAccount,
  SettingsOrganizations,
  SettingsImportSongs,
  SettingsAppearance,
  SettingsAutoMode,
  SettingsSongs,
  SettingsTextStyles,
  SettingsClock,
} from '@worship-view/core';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@worship-view/ui';
import { SettingsJazzToken } from './SettingsJazzToken';
import { SettingsBackup } from './SettingsBackup';
import { SettingsUpdate } from './SettingsUpdate';

const Settings = () => {
  const [areSettingsOpen, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  const [activeTab, setActiveTab] = useState('display');
  const isAuthenticated = useIsAuthenticated();

  return (
    <Dialog open={areSettingsOpen} onOpenChange={setAreSettingsOpen}>
      <DialogContent className='w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col'>
        <DialogHeader className='sr-only'>
          <DialogTitle>Setări</DialogTitle>
          <DialogDescription>
            Configurați setările aplicației, inclusiv preferințele de afișare,
            contul și organizațiile.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='flex-1 min-h-0 overflow-hidden'
        >
          <div className='flex h-full'>
            <div className='w-48 border-r bg-muted/30 flex-shrink-0'>
              <TabsList className='flex flex-col h-full w-full rounded-none border-0 bg-transparent p-0'>
                <TabsTrigger
                  value='display'
                  className='w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                >
                  Afișare
                </TabsTrigger>
                <TabsTrigger
                  value='aspect'
                  className='w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                >
                  Aspect
                </TabsTrigger>
                <TabsTrigger
                  value='automode'
                  className='w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                >
                  Mod Auto
                </TabsTrigger>
                <TabsTrigger
                  value='clock'
                  className='w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                >
                  Ceas
                </TabsTrigger>
                {isAuthenticated && (
                  <>
                    <TabsTrigger
                      value='text-styles'
                      className='w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Stiluri text
                    </TabsTrigger>
                    <TabsTrigger
                      value='jazz-token'
                      className='w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Token Jazz
                    </TabsTrigger>
                    <TabsTrigger
                      value='account'
                      className='w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Cont
                    </TabsTrigger>
                    <TabsTrigger
                      value='organizations'
                      className='w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Organizații
                    </TabsTrigger>
                    <TabsTrigger
                      value='songs'
                      className='w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Cântece
                    </TabsTrigger>
                    <TabsTrigger
                      value='import-songs'
                      className='w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Importă cântece
                    </TabsTrigger>
                    <TabsTrigger
                      value='backup'
                      className='w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Backup
                    </TabsTrigger>
                  </>
                )}
                <TabsTrigger
                  value='updates'
                  className='w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                >
                  Actualizări
                </TabsTrigger>
              </TabsList>
            </div>
            <div className='flex-1 min-h-0 flex flex-col p-6'>
              <TabsContent
                value='display'
                className='mt-0 flex-1 min-h-0 overflow-y-auto'
              >
                <SettingsDisplay />
              </TabsContent>
              <TabsContent
                value='aspect'
                className='mt-0 flex-1 min-h-0 overflow-y-auto'
              >
                <SettingsAppearance />
              </TabsContent>
              <TabsContent
                value='automode'
                className='mt-0 flex-1 min-h-0 overflow-y-auto'
              >
                <SettingsAutoMode />
              </TabsContent>
              <TabsContent
                value='clock'
                className='mt-0 flex-1 min-h-0 overflow-y-auto'
              >
                <SettingsClock />
              </TabsContent>
              {isAuthenticated && (
                <>
                  <TabsContent
                    value='text-styles'
                    className='mt-0 flex-1 min-h-0 overflow-hidden'
                  >
                    <SettingsTextStyles />
                  </TabsContent>
                  <TabsContent
                    value='jazz-token'
                    className='mt-0 flex-1 min-h-0 overflow-y-auto'
                  >
                    <SettingsJazzToken />
                  </TabsContent>
                  <TabsContent
                    value='account'
                    className='mt-0 flex-1 min-h-0 overflow-y-auto'
                  >
                    <SettingsAccount />
                  </TabsContent>
                  <TabsContent
                    value='organizations'
                    className='mt-0 flex-1 min-h-0 overflow-y-auto'
                  >
                    <SettingsOrganizations />
                  </TabsContent>
                  <TabsContent
                    value='songs'
                    className='mt-0 flex-1 min-h-0 overflow-hidden'
                  >
                    <SettingsSongs />
                  </TabsContent>
                  <TabsContent
                    value='import-songs'
                    className='mt-0 flex-1 min-h-0 overflow-y-auto'
                  >
                    <SettingsImportSongs />
                  </TabsContent>
                  <TabsContent
                    value='backup'
                    className='mt-0 flex-1 min-h-0 overflow-y-auto'
                  >
                    <SettingsBackup />
                  </TabsContent>
                </>
              )}
              <TabsContent
                value='updates'
                className='mt-0 flex-1 min-h-0 overflow-y-auto'
              >
                <SettingsUpdate />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
