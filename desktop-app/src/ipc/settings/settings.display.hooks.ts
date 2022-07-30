import { availableDisplaysAtom } from '@ipc/display/display.atoms';
import { InputGroupsType } from '@renderer/components/ui/inputs/radio-group/RadioGroup.hooks';
import { Display } from 'electron';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { settingsDisplayScreenSelectionAtom } from './settings.display.atoms';

const defaultInput = [
  { value: 'none', checked: false, label: 'None' },
  { value: 'stage', checked: false, label: 'Stage' },
  { value: 'audience', checked: false, label: 'Audience' },
];

const getDefaultInputGroups = (displays: Display[]): InputGroupsType => {
  const defaultInputGroups: InputGroupsType = {};
  const savedSettingsString = localStorage.getItem('display-settings');
  const savedSettings = savedSettingsString
    ? JSON.parse(savedSettingsString)
    : {};
  displays.forEach((display) => {
    console.log(savedSettings);
    const input = savedSettings[display.id.toString()] ?? [...defaultInput];
    defaultInputGroups[display.id.toString()] = input;
  });
  return defaultInputGroups;
};

export const useDisplaySettings = () => {
  const [availableDisplays] = useAtom(availableDisplaysAtom);
  const [displayScreenSelection, setDisplayScreenSelection] = useAtom(
    settingsDisplayScreenSelectionAtom,
  );
  useEffect(() => {
    if (Object.keys(displayScreenSelection).length === 0)
      setDisplayScreenSelection(getDefaultInputGroups(availableDisplays));
  }, [availableDisplays, setDisplayScreenSelection, displayScreenSelection]);
  useEffect(() => {
    if (Object.keys(displayScreenSelection).length > 0)
      localStorage.setItem(
        'display-settings',
        JSON.stringify(displayScreenSelection),
      );
  }, [displayScreenSelection]);
};
