import { useAtom } from 'jotai';
import { FC, useCallback } from 'react';
import Frame from '../helpers/Frame';
import {
  settingsAudienceDisplaysAtom,
  settingsDisplayScreenSelectionAtom,
  settingsStageDisplaysAtom,
} from '../../../ipc/settings/settings.display.atoms';
import { AudienceScreen, areScreensEnabledAtom, StageScreen } from '@worship-view/core';

const Screens: FC = () => {
  const [audienceDisplays] = useAtom(settingsAudienceDisplaysAtom);
  const [stageDisplays] = useAtom(settingsStageDisplaysAtom);
  const [areScreensEnabled] = useAtom(areScreensEnabledAtom);
  const [, setDisplayScreenSelection] = useAtom(settingsDisplayScreenSelectionAtom);

  const handleCloseAudience = useCallback(
    (displayId: number) => {
      setDisplayScreenSelection((prev) => {
        const key = displayId.toString();
        if (!prev[key]) return prev;
        return {
          ...prev,
          [key]: prev[key].map((input) =>
            input.value === 'audience' ? { ...input, checked: false } : input,
          ),
        };
      });
    },
    [setDisplayScreenSelection],
  );

  return (
    <div>
      {areScreensEnabled && (
        <>
          {audienceDisplays.map((display) => (
            <Frame
              key={display.id}
              display={display}
              onClose={() => handleCloseAudience(display.id)}
            >
              <AudienceScreen />
            </Frame>
          ))}
          {stageDisplays.map((display) => (
            <Frame key={display.id} display={display}>
              <StageScreen />
            </Frame>
          ))}
        </>
      )}
    </div>
  );
};

export default Screens;
