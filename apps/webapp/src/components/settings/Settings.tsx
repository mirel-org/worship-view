import { useState } from 'react';
import { useAtom } from 'jotai';
import { useIsAuthenticated } from 'jazz-tools/react';
import {
  areSettingsOpenAtom,
  SettingsAccount,
  SettingsOrganizations,
  SettingsImportSongs,
  SettingsAppearance,
  SettingsSongs,
  SettingsTextStyles,
  SettingsFonts,
  SettingsRemote,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@worship-view/ui';
import { SettingsJazzToken } from './SettingsJazzToken';

const Settings = () => {
  const [areSettingsOpen, setAreSettingsOpen] = useAtom(areSettingsOpenAtom);
  const [activeTab, setActiveTab] = useState('aspect');
  const isAuthenticated = useIsAuthenticated();
  const sections = [
    { value: 'aspect', label: 'Aspect' },
    { value: 'remote', label: 'Telecomandă' },
    ...(isAuthenticated
      ? [
          { value: 'text-styles', label: 'Stiluri text' },
          { value: 'fonts', label: 'Fonturi' },
          { value: 'jazz-token', label: 'Token Jazz' },
          { value: 'account', label: 'Cont' },
          { value: 'organizations', label: 'Organizații' },
          { value: 'songs', label: 'Cântece' },
          { value: 'import-songs', label: 'Importă cântece' },
        ]
      : []),
  ];

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
          <div className='flex h-full w-full flex-col md:flex-row'>
            <div className='md:w-48 border-b md:border-b-0 md:border-r bg-muted/30 flex-shrink-0'>
              {/* Phones: a section picker (the tab row was clipped and ran under the close button) */}
              <div className='p-3 pr-12 md:hidden'>
                <Select value={activeTab} onValueChange={setActiveTab}>
                  <SelectTrigger aria-label='Secțiune setări' data-testid='settings-section-select'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((section) => (
                      <SelectItem key={section.value} value={section.value}>
                        {section.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <TabsList className='hidden md:flex md:flex-col md:justify-start md:h-full w-full rounded-none border-0 bg-transparent p-0'>
                {sections.map((section) => (
                  <TabsTrigger
                    key={section.value}
                    value={section.value}
                    className='md:w-full justify-start rounded-none border-b px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow-none'
                  >
                    {section.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
            <div className='flex-1 min-h-0 flex flex-col p-6'>
              <TabsContent
                value='aspect'
                className='mt-0 flex-1 min-h-0 overflow-y-auto'
              >
                <SettingsAppearance />
              </TabsContent>
              <TabsContent
                value='remote'
                className='mt-0 flex-1 min-h-0 overflow-y-auto'
              >
                <SettingsRemote />
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
                    value='fonts'
                    className='mt-0 flex-1 min-h-0 overflow-y-auto'
                  >
                    <SettingsFonts />
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
