import { availableDisplaysAtom, mainWindowDisplayIdAtom } from '../../../ipc/display/display.atoms';
import { getApiClient } from '../../../ipc';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import { settingsDisplayScreenSelectionAtom } from '../../../ipc/settings/settings.display.atoms';
import {
  RadioValueType,
  useRadioGroups,
} from '@worship-view/ui';

const getCheckedValue = (inputs: RadioValueType[] | undefined) =>
  inputs?.find((input) => input.checked)?.value ?? 'none';

const SettingsDisplay = () => {
  const [availableDisplays] = useAtom(availableDisplaysAtom);
  const [mainWindowDisplayId, setMainWindowDisplayId] = useAtom(mainWindowDisplayIdAtom);
  const { getMainWindowDisplayId } = getApiClient();

  // Re-fetch which display the app is on every time settings opens,
  // so moving the app to a different screen is reflected immediately.
  useEffect(() => {
    getMainWindowDisplayId().then((id: number) => {
      setMainWindowDisplayId(id);
    });
  }, [getMainWindowDisplayId, setMainWindowDisplayId]);

  const externalDisplays = availableDisplays.filter(
    (display) => display.id !== mainWindowDisplayId,
  );
  const [displayScreenSelection, setDisplayScreenSelection] = useAtom(
    settingsDisplayScreenSelectionAtom,
  );
  const { onChange } = useRadioGroups(
    displayScreenSelection,
    setDisplayScreenSelection,
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Afișaje</h3>
        {externalDisplays.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nu există afișaje detectate.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {externalDisplays.map((display, index) => {
              const key = display.id.toString();
              const selectedRole = getCheckedValue(displayScreenSelection[key]);
              const isOn = selectedRole === 'audience';
              const displayName = display.label?.trim() || `Afișaj ${index + 1}`;

              return (
                <div
                  key={key}
                  className="rounded-lg border-2 border-border bg-card p-4 min-h-44 flex flex-col justify-between"
                >
                  <div className="h-full flex flex-col items-center justify-center text-center gap-2">
                    <p className="text-xs text-muted-foreground">{displayName}</p>
                  </div>

                  <div className="flex items-center justify-center mt-4">
                    <button
                      type="button"
                      onClick={() => onChange(key, isOn ? 'none' : 'audience')}
                      className={
                        isOn
                          ? 'relative inline-flex h-6 w-11 items-center rounded-full bg-primary p-0.5 justify-end border border-border transition-colors'
                          : 'relative inline-flex h-6 w-11 items-center rounded-full bg-input p-0.5 justify-start border border-border transition-colors'
                      }
                      aria-label={`Toggle ${displayName}`}
                      aria-pressed={isOn}
                    >
                      <span className="h-5 w-5 rounded-full bg-background shadow" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsDisplay;
