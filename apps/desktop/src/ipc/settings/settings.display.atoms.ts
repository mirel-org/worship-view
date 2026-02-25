import { availableDisplaysAtom } from '../display/display.atoms';
import { InputGroupsType, RadioValueType } from '@worship-view/ui';
import { Display } from 'electron';
import { atom } from 'jotai';

const inputGroupToDisplaysList = (
  inputGroups: InputGroupsType,
  displays: Display[],
  type: string,
) => {
  const returnedDisplays: Display[] = [];
  for (const key in inputGroups) {
    const inputGroup = inputGroups[key];
    const display = displays.find((display) => display.id.toString() === key);
    if (!display) continue;
    if (inputGroup.find((input: RadioValueType) => input.value === type)?.checked)
      returnedDisplays.push(display);
  }
  return returnedDisplays;
};

export const settingsDisplayScreenSelectionAtom = atom<InputGroupsType>({});
export const settingsAudienceDisplaysAtom = atom<Display[]>((get) =>
  inputGroupToDisplaysList(
    get(settingsDisplayScreenSelectionAtom),
    get(availableDisplaysAtom),
    'audience',
  ),
);
export const settingsStageDisplaysAtom = atom<Display[]>((get) =>
  inputGroupToDisplaysList(
    get(settingsDisplayScreenSelectionAtom),
    get(availableDisplaysAtom),
    'stage',
  ),
);
