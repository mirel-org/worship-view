import { useState } from 'react';
import { useAtom } from 'jotai';
import { useIsAuthenticated } from 'jazz-tools/react';
import {
  areSettingsOpenAtom,
  SettingsAccount,
  SettingsOrganizations,
  SettingsImportSongs,
  SettingsAppearance,
  SettingsTextStyles,
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

const Settings = () => {
  const [areSettingsOpen, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  const [activeTab, setActiveTab] = useState('aspect');
  const isAuthenticated = useIsAuthenticated();

  return (
    <Dialog open={areSettingsOpen} onOpenChange={setAreSettingsOpen}>
      <DialogContent className='w-[90vw] max-w-[90vw] h-[90vh] max-h-[90vh] p-0 overflow-hidden'>
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
          className='flex h-full flex-col md:flex-row'
        >
          <div className='flex h-full w-full flex-col md:flex-row'>
            <div className='md:w-48 border-b md:border-b-0 md:border-r bg-muted/30 flex-shrink-0'>
              <TabsList className='flex md:flex-col md:h-full w-full rounded-none border-0 bg-transparent p-0 overflow-x-auto md:overflow-x-visible'>
                <TabsTrigger
                  value='aspect'
                  className='flex-shrink-0 md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                >
                  Aspect
                </TabsTrigger>
                {isAuthenticated && (
                  <>
                    <TabsTrigger
                      value='text-styles'
                      className='flex-shrink-0 md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Stiluri text
                    </TabsTrigger>
                    <TabsTrigger
                      value='jazz-token'
                      className='flex-shrink-0 md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Token Jazz
                    </TabsTrigger>
                    <TabsTrigger
                      value='account'
                      className='flex-shrink-0 md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Cont
                    </TabsTrigger>
                    <TabsTrigger
                      value='organizations'
                      className='flex-shrink-0 md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Organizații
                    </TabsTrigger>
                    <TabsTrigger
                      value='songs'
                      className='flex-shrink-0 md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Cântece
                    </TabsTrigger>
                    <TabsTrigger
                      value='import-songs'
                      className='flex-shrink-0 md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                    >
                      Importă cântece
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>
            <div className='flex-1 min-h-0 flex flex-col p-6'>
              <TabsContent
                value='aspect'
                className='mt-0 flex-1 min-h-0 overflow-y-auto'
              >
                <SettingsAppearance />
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
                    value='import-songs'
                    className='mt-0 flex-1 min-h-0 overflow-y-auto'
                  >
                    <SettingsImportSongs />
                  </TabsContent>
                </>
              )}
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
