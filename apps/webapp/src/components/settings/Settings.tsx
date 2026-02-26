import { useState } from 'react';
import { useAtom } from 'jotai';
import { useIsAuthenticated } from 'jazz-tools/react';
import { areSettingsOpenAtom, SettingsAccount, SettingsOrganizations, SettingsImportSongs, SettingsAppearance } from '@worship-view/core';
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
      <DialogContent className="w-[calc(100%-2rem)] max-w-[900px] h-[85vh] md:h-[600px] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Setări</DialogTitle>
          <DialogDescription>
            Configurați setările aplicației, inclusiv preferințele de afișare,
            contul și organizațiile.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col md:flex-row">
          <div className="flex h-full w-full flex-col md:flex-row">
            <div className="md:w-48 border-b md:border-b-0 md:border-r bg-muted/30 flex-shrink-0">
              <TabsList className="flex md:flex-col md:h-full w-full rounded-none border-0 bg-transparent p-0 overflow-x-auto md:overflow-x-visible">
                <TabsTrigger
                  value="aspect"
                  className="flex-shrink-0 md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none"
                >
                  Aspect
                </TabsTrigger>
                {isAuthenticated && (
                  <>
                    <TabsTrigger
                      value="jazz-token"
                      className="flex-shrink-0 md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none"
                    >
                      Token Jazz
                    </TabsTrigger>
                    <TabsTrigger
                      value="account"
                      className="flex-shrink-0 md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none"
                    >
                      Cont
                    </TabsTrigger>
                    <TabsTrigger
                      value="organizations"
                      className="flex-shrink-0 md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none"
                    >
                      Organizații
                    </TabsTrigger>
                    <TabsTrigger
                      value="import-songs"
                      className="flex-shrink-0 md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none"
                    >
                      Importă cântece
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-6">
                <TabsContent value="aspect" className="mt-0">
                  <SettingsAppearance />
                </TabsContent>
                {isAuthenticated && (
                  <>
                    <TabsContent value="jazz-token" className="mt-0">
                      <SettingsJazzToken />
                    </TabsContent>
                    <TabsContent value="account" className="mt-0">
                      <SettingsAccount />
                    </TabsContent>
                    <TabsContent value="organizations" className="mt-0">
                      <SettingsOrganizations />
                    </TabsContent>
                    <TabsContent value="import-songs" className="mt-0">
                      <SettingsImportSongs />
                    </TabsContent>
                  </>
                )}
              </div>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
