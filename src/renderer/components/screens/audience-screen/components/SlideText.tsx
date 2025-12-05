import {
  currentProjectionTypeAtom,
  verseProjectionEnabledAtom,
} from '@ipc/projection/projection.atoms';
import { FC } from 'react';
import CrossFade from './CrossFade';
import SongSlide from './SongSlide';
import VerseSlide from './VerseSlide';
import { useAtom } from 'jotai';
import { selectedSongSlideAtom } from '@ipc/song/song.atoms';
import {
  selectedVerseReferenceAtom,
  selectedVerseTextAtom,
} from '@ipc/verse/verse.atoms';
import { PrayerSlide } from './PrayerSlide';
import { prayerRequestsAtom } from '@ipc/prayer/prayer.atoms';

const SlideText: FC = () => {
  const [currentProjectionType] = useAtom(currentProjectionTypeAtom);
  const [selectedSongSlide] = useAtom(selectedSongSlideAtom);
  const [selectedVerseReference] = useAtom(selectedVerseReferenceAtom);
  const [selectedVerseText] = useAtom(selectedVerseTextAtom);
  const [verseProjectionEnabled] = useAtom(verseProjectionEnabledAtom);
  const [prayerRequests] = useAtom(prayerRequestsAtom);
  return (
    <div className="z-10">
      {currentProjectionType === 'song' && (
        <CrossFade>
          <div className="w-full flex justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <SongSlide lines={selectedSongSlide?.lines ?? []} />
          </div>
        </CrossFade>
      )}
      {currentProjectionType === 'verse' && verseProjectionEnabled && (
        <CrossFade>
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
    </div>
  );
};

export default SlideText;
