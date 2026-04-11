import { FC } from 'react';
import MediaBackground from './components/MediaBackground';
import SlideText from './components/SlideText';
import ClockOverlay from './components/ClockOverlay';

const AudienceScreen: FC = () => {
  return (
    <div className="bg-black h-full flex justify-center items-center">
      <SlideText />
      <ClockOverlay />
      <MediaBackground />
    </div>
  );
};

export default AudienceScreen;
