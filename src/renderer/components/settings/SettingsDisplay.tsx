import { availableDisplaysAtom } from '@ipc/display/display.atoms';
import RadioGroup from '@renderer/components/ui/inputs/radio-group/RadioGroup';
import {
  InputGroupsType,
  useRadioGroups,
} from '@renderer/components/ui/inputs/radio-group/RadioGroup.hooks';
import { Display } from 'electron';
import { useAtom } from 'jotai';
import React, { FC, useEffect } from 'react';
import { displayScreenSelectionAtom } from '../../../ipc/settings/settings.display.atoms';

const defaultInput = [
  { value: 'none', checked: false, label: 'None' },
  { value: 'stage', checked: false, label: 'Stage' },
  { value: 'audience', checked: false, label: 'Audience' },
];

const getDefaultInputGroups = (displays: Display[]): InputGroupsType => {
  const defaultInputGroups: InputGroupsType = {};
  displays.forEach((display) => {
    const input = [...defaultInput];
    defaultInputGroups[display.id.toString()] = input;
  });
  return defaultInputGroups;
};

const SettingsDisplay: FC = () => {
  const [availableDisplays] = useAtom(availableDisplaysAtom);
  const [displayScreenSelection, setDisplayScreenSelection] = useAtom(
    displayScreenSelectionAtom,
  );
  useEffect(() => {
    if (Object.keys(displayScreenSelection).length === 0)
      setDisplayScreenSelection(getDefaultInputGroups(availableDisplays));
  }, [availableDisplays, setDisplayScreenSelection, displayScreenSelection]);
  const { onChange } = useRadioGroups(
    displayScreenSelection,
    setDisplayScreenSelection,
  );
  return (
    <div>
      {availableDisplays.map((display) => {
        const key = display.id.toString();
        const inputs = displayScreenSelection[key];
        if (!inputs) return null;
        return (
          <div key={key}>
            <span>{key}</span>
            <RadioGroup
              name={`display${key}`}
              onChange={(value) => onChange(key, value)}
              inputs={displayScreenSelection[key]}
            />
          </div>
        );
      })}
    </div>
  );
};

export default SettingsDisplay;
