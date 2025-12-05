import { availableDisplaysAtom } from '@ipc/display/display.atoms';
import { Typography } from '@mui/material';
import RadioGroup from '@renderer/components/ui/inputs/radio-group/RadioGroup';
import { useRadioGroups } from '@renderer/components/ui/inputs/radio-group/RadioGroup.hooks';
import { useAtom } from 'jotai';
import { settingsDisplayScreenSelectionAtom } from '../../../ipc/settings/settings.display.atoms';

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
      <Typography variant='h4' sx={{ marginY: 2 }}>
        Displays
      </Typography>
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
