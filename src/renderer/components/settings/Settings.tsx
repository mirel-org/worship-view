import { useState } from 'react';
import { useAtom } from 'jotai';
import { useIsAuthenticated } from 'jazz-tools/react';
import SettingsDisplay from './SettingsDisplay';
import { areSettingsOpenAtom } from '../../../ipc/settings/settings.atoms';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
import { SettingsJazzToken } from './SettingsJazzToken';
import { SettingsAccount } from './SettingsAccount';
import { SettingsOrganizations } from './SettingsOrganizations';
import { SettingsImportSongs } from './SettingsImportSongs';
import { SettingsUpdate } from './SettingsUpdate';
import { SettingsAppearance } from './SettingsAppearance';

const Settings = () => {
  const [areSettingsOpen, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  const [activeTab, setActiveTab] = useState('display');
  const isAuthenticated = useIsAuthenticated();

  return (
    <Dialog open={areSettingsOpen} onOpenChange={setAreSettingsOpen}>
      <DialogContent className="w-[900px] max-w-[900px] h-[600px] max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="sr-only">
          <DialogTitle>Setări</DialogTitle>
          <DialogDescription>
            Configurați setările aplicației, inclusiv preferințele de afișare,
            contul și organizațiile.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full">
          <div className="flex h-full w-full">
            <div className="w-48 border-r bg-muted/30">
              <TabsList className="flex flex-col h-full w-full rounded-none border-0 bg-transparent p-0">
                <TabsTrigger
                  value="display"
                  className="w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none"
                >
                  Afișare
                </TabsTrigger>
                <TabsTrigger
                  value="aspect"
                  className="w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none"
                >
                  Aspect
                </TabsTrigger>
                {isAuthenticated && (
                  <>
                    <TabsTrigger
                      value="jazz-token"
                      className="w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none"
                    >
                      Token Jazz
                    </TabsTrigger>
                    <TabsTrigger
                      value="account"
                      className="w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none"
                    >
                      Cont
                    </TabsTrigger>
                    <TabsTrigger
                      value="organizations"
                      className="w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none"
                    >
                      Organizații
                    </TabsTrigger>
                    <TabsTrigger
                      value="import-songs"
                      className="w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none"
                    >
                      Importă cântece
                    </TabsTrigger>
                  </>
                )}
                <TabsTrigger
                  value="updates"
                  className="w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none"
                >
                  Actualizări
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <TabsContent value="display" className="mt-0">
                  <SettingsDisplay />
                </TabsContent>
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
                <TabsContent value="updates" className="mt-0">
                  <SettingsUpdate />
                </TabsContent>
              </div>
            </div>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default Settings;
