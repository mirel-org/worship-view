import { availableDisplaysAtom } from '@ipc/display/display.atoms';
import RadioGroup from '@renderer/components/ui/inputs/radio-group/RadioGroup';
import { useRadioGroups } from '@renderer/components/ui/inputs/radio-group/RadioGroup.hooks';
import { useAtom } from 'jotai';
import { displayScreenSelectionAtom } from '../../../ipc/settings/settings.display.atoms';

const SettingsDisplay = () => {
  const [availableDisplays] = useAtom(availableDisplaysAtom);
  const [displayScreenSelection, setDisplayScreenSelection] = useAtom(
    displayScreenSelectionAtom,
  );
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
