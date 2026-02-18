import {
  currentProjectionTypeAtom,
  verseProjectionEnabledAtom,
} from '@ipc/projection/projection.atoms';
import { settingsSongSlideSizeAtom } from '@ipc/settings/settings.song.atoms';
import { nextSongSlideAtom, selectedSongSlideAtom } from '@ipc/song/song.atoms';
import {
  selectedVerseReferenceAtom,
  selectedVerseTextAtom,
} from '@ipc/verse/verse.atoms';
import { formatBibleReference } from '@ipc/verse/verse.utils';
import { useAtom } from 'jotai';
import { FC } from 'react';
import VerseSlide from '../audience-screen/components/VerseSlide';
import FitText from './components/FitText';

const StageScreen: FC = () => {
  const [currentProjectionType] = useAtom(currentProjectionTypeAtom);
  const [selectedSongSlide] = useAtom(selectedSongSlideAtom);
  const [nextSongSlide] = useAtom(nextSongSlideAtom);
  const [selectedVerseText] = useAtom(selectedVerseTextAtom);
  const [selectedVerseReference] = useAtom(selectedVerseReferenceAtom);
  const [verseProjectionEnabled] = useAtom(verseProjectionEnabledAtom);
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
