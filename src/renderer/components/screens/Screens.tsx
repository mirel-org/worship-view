import { useAtom } from 'jotai';
import React, { FC } from 'react';
import Frame from '../helpers/Frame';
import {
  audienceDisplaysAtom,
  stageDisplaysAtom,
} from '../../../ipc/settings/settings.display.atoms';
import AudienceScreen from './audience-screen/AudienceScreen';
import { areScreensEnabledAtom } from '../../../ipc/screen/screen.atoms';
import StageScreen from './stage-screen/StageScreen';

const Screens: FC = () => {
  const [audienceDisplays] = useAtom(audienceDisplaysAtom);
  const [stageDisplays] = useAtom(stageDisplaysAtom);
  const [areScreensEnabled] = useAtom(areScreensEnabledAtom);
  return (
    <div>
      {areScreensEnabled && (
        <>
          {audienceDisplays.map((display) => (
            <Frame key={display.id} display={display}>
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
