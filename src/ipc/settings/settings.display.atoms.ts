import { availableDisplaysAtom } from '@ipc/display/display.atoms';
import { InputGroupsType } from '@renderer/components/ui/inputs/radio-group/RadioGroup.hooks';
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
    if (inputGroup.find((input) => input.value === type)?.checked)
      returnedDisplays.push(display);
  }
  return returnedDisplays;
};

export const displayScreenSelectionAtom = atom<InputGroupsType>({});
export const audienceDisplaysAtom = atom<Display[]>((get) =>
  inputGroupToDisplaysList(
    get(displayScreenSelectionAtom),
    get(availableDisplaysAtom),
    'audience',
  ),
);
export const stageDisplaysAtom = atom<Display[]>((get) =>
  inputGroupToDisplaysList(
    get(displayScreenSelectionAtom),
    get(availableDisplaysAtom),
    'stage',
  ),
);
