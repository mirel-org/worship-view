import { availableDisplaysAtom } from '@ipc/display/display.atoms';
import RadioGroup from '@renderer/components/ui/inputs/radio-group/RadioGroup';
import { useRadioGroups } from '@renderer/components/ui/inputs/radio-group/RadioGroup.hooks';
import { useAtom } from 'jotai';
import { settingsDisplayScreenSelectionAtom } from '@ipc/settings/settings.display.atoms';
import { OliText } from 'oli-design-system';

const SettingsDisplay = () => {
  const [availableDisplays] = useAtom(availableDisplaysAtom);
  const [displayScreenSelection, setDisplayScreenSelection] = useAtom(
    settingsDisplayScreenSelectionAtom,
  );
  const { onChange } = useRadioGroups(
    displayScreenSelection,
    setDisplayScreenSelection,
  );

  return (
    <div>
      <OliText variant='h4' text='Displays' />
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
