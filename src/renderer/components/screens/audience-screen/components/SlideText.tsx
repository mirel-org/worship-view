import {
  currentProjectionTypeAtom,
  verseProjectionEnabledAtom,
} from '@ipc/projection/projection.atoms';
import { FC } from 'react';
import CrossFade from './CrossFade';
import SongSlide from './SongSlide';
import VerseSlide from './VerseSlide';
import { useAtom } from 'jotai';
import {
  currentSongSlideNumberAtom,
  selectedSongSlideAtom,
  totalSongSlidesAtom,
} from '@ipc/song/song.atoms';
import {
  selectedVerseReferenceAtom,
  selectedVerseTextAtom,
} from '@ipc/verse/verse.atoms';
import { PrayerSlide } from './PrayerSlide';
import { prayerRequestsAtom } from '@ipc/prayer/prayer.atoms';

const SlideText: FC = () => {
  const [currentProjectionType] = useAtom(currentProjectionTypeAtom);
  const [selectedSongSlide] = useAtom(selectedSongSlideAtom);
  const [currentSongSlideNumber] = useAtom(currentSongSlideNumberAtom);
  const [totalSongSlides] = useAtom(totalSongSlidesAtom);
  const [selectedVerseReference] = useAtom(selectedVerseReferenceAtom);
  const [selectedVerseText] = useAtom(selectedVerseTextAtom);
  const [verseProjectionEnabled] = useAtom(verseProjectionEnabledAtom);
  const [prayerRequests] = useAtom(prayerRequestsAtom);
  return (
    <div className="z-10 relative w-full h-full">
      {currentProjectionType === 'song' && (
        <CrossFade nodeKey={`song-${currentSongSlideNumber}`}>
          <div className="w-full flex justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <SongSlide lines={selectedSongSlide?.lines ?? []} />
          </div>
        </CrossFade>
      )}
      {currentProjectionType === 'verse' && verseProjectionEnabled && (
        <CrossFade
          nodeKey={
            selectedVerseReference
              ? `verse-${selectedVerseReference.book}-${selectedVerseReference.chapter}-${selectedVerseReference.verse}`
              : null
          }
        >
          <div className="w-full flex justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <VerseSlide
              text={selectedVerseText ?? ''}
              reference={
                selectedVerseReference
                  ? `${selectedVerseReference.book} ${selectedVerseReference.chapter}:${selectedVerseReference.verse}`
                  : ''
              }
            />
          </div>
        </CrossFade>
      )}
      {currentProjectionType === 'prayer' && (
        <div className="w-full flex justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <PrayerSlide prayerRequests={prayerRequests} />
        </div>
      )}
      {currentProjectionType === 'song' &&
        currentSongSlideNumber !== undefined &&
        totalSongSlides !== undefined &&
        currentSongSlideNumber > 0 &&
        totalSongSlides > 0 && (
          <div
            className="absolute bottom-10 right-10 pb-4 pr-4 font-montserrat text-[300%] font-bold text-white z-20"
            style={{ textShadow: '0.06em 0.06em 1px #00000094' }}
          >
            {currentSongSlideNumber}/{totalSongSlides}
          </div>
        )}
    </div>
  );
};

export default SlideText;
