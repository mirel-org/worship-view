import { settingsSongSlideSizeAtom } from '../../../state/settings.song.atoms';
import { formatBibleReference } from '../../../utils/verse.utils';
import { useAtom } from 'jotai';
import { FC } from 'react';
import VerseSlide from '../audience-screen/components/VerseSlide';
import FitText from './components/FitText';
import {
  useSessionProjectionType,
  useSessionSongSlide,
  useSessionNextSongSlide,
  useSessionVerseRef,
  useSessionVerseText,
  useSessionVerseProjectionEnabled,
} from '../../../session/session.hooks';

const StageScreen: FC = () => {
  const currentProjectionType = useSessionProjectionType();
  const selectedSongSlide = useSessionSongSlide();
  const nextSongSlide = useSessionNextSongSlide();
  const selectedVerseText = useSessionVerseText();
  const selectedVerseReference = useSessionVerseRef();
  const verseProjectionEnabled = useSessionVerseProjectionEnabled();
  const [settingsSongSlideSize] = useAtom(settingsSongSlideSizeAtom);
  if (settingsSongSlideSize === 4 || settingsSongSlideSize === 8 || settingsSongSlideSize === 'full')
    return (
      <div className="grid grid-rows-[50%_50%] h-full w-full bg-black p-8 box-border"></div>
    );
  if (currentProjectionType === 'song')
    return (
      <div className="grid grid-rows-[50%_50%] h-full w-full bg-black p-8 box-border">
        <div className="grid grid-rows-[50%_50%] h-full text-white">
          {selectedSongSlide?.lines.map((line, index) => (
            <FitText key={index} text={line} />
          ))}
        </div>
        <div className="grid grid-rows-[50%_50%] h-full text-[burlywood]">
          {nextSongSlide?.lines.map((line, index) => (
            <FitText key={index} text={line} />
          ))}
        </div>
      </div>
    );
  else if (currentProjectionType === 'verse' && verseProjectionEnabled)
    return (
      <div className="flex justify-center items-center h-full w-full bg-black">
        <VerseSlide
          text={selectedVerseText ?? ''}
          reference={
            selectedVerseReference ? formatBibleReference(selectedVerseReference) : ''
          }
          isStage
        />
      </div>
    );
  return (
    <div className="grid grid-rows-[50%_50%] h-full w-full bg-black p-8 box-border"></div>
  );
};

export default StageScreen;
