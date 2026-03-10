import {
  currentProjectionTypeAtom,
  verseProjectionEnabledAtom,
} from '../../../../state/projection.atoms';
import { FC, useMemo } from 'react';
import CrossFade from './CrossFade';
import SongSlide from './SongSlide';
import VerseSlide from './VerseSlide';
import PresentationSlideView from './PresentationSlideView';
import { useAtom } from 'jotai';
import {
  selectedSongSlideReferenceAtom,
  currentSongSlideNumberAtom,
  selectedSongSlideAtom,
  selectedSongKeyAtom,
  totalSongSlidesAtom,
} from '../../../../state/song.atoms';
import {
  selectedVerseReferenceAtom,
  selectedVerseTextAtom,
} from '../../../../state/verse.atoms';
import {
  selectedPresentationSlideAtom,
  selectedPresentationSlideIndexAtom,
  totalPresentationSlidesAtom,
} from '../../../../state/presentation.atoms';
import { formatBibleReference } from '../../../../utils/verse.utils';
import { PrayerSlide } from './PrayerSlide';
import { prayerRequestsAtom } from '../../../../state/prayer.atoms';
import { useActiveTextStyle } from '../../../../hooks/useTextStyle';
import { buildTextShadowStyle } from '../../../../jazz/text-style-store';

function getVerticalPositionClasses(align: 'top' | 'center' | 'bottom'): string {
  switch (align) {
    case 'top':
      return 'absolute top-0 left-1/2 -translate-x-1/2 pt-16';
    case 'bottom':
      return 'absolute bottom-0 left-1/2 -translate-x-1/2 pb-16';
    default:
      return 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
  }
}

const SlideText: FC = () => {
  const [currentProjectionType] = useAtom(currentProjectionTypeAtom);
  const [selectedSongSlide] = useAtom(selectedSongSlideAtom);
  const [selectedSongSlideReference] = useAtom(selectedSongSlideReferenceAtom);
  const [currentSongSlideNumber] = useAtom(currentSongSlideNumberAtom);
  const [totalSongSlides] = useAtom(totalSongSlidesAtom);
  const [selectedVerseReference] = useAtom(selectedVerseReferenceAtom);
  const [selectedVerseText] = useAtom(selectedVerseTextAtom);
  const [verseProjectionEnabled] = useAtom(verseProjectionEnabledAtom);
  const [prayerRequests] = useAtom(prayerRequestsAtom);
  const [selectedSongKey] = useAtom(selectedSongKeyAtom);
  const activeStyle = useActiveTextStyle();
  const [selectedPresentationSlide] = useAtom(selectedPresentationSlideAtom);
  const [selectedPresentationSlideIndex] = useAtom(selectedPresentationSlideIndexAtom);
  const [totalPresentationSlides] = useAtom(totalPresentationSlidesAtom);

  const songContentKey = selectedSongSlide?.lines?.join('\n') ?? '';
  const songNodeKey = selectedSongSlideReference
    ? `song-${selectedSongSlideReference.partIndex}-${selectedSongSlideReference.slideIndex}-${songContentKey}`
    : 'song-none';
  const songLinesSnapshot = useMemo(
    () => [...(selectedSongSlide?.lines ?? [])],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- songNodeKey is an intentional stabiliser
    [songNodeKey],
  );

  const verseNodeKey = selectedVerseReference
    ? `verse-${selectedVerseReference.book}-${selectedVerseReference.chapter}-${selectedVerseReference.verse}`
    : 'verse-none';
  const verseTextSnapshot = useMemo(
    () => selectedVerseText ?? '',
    // eslint-disable-next-line react-hooks/exhaustive-deps -- verseNodeKey is an intentional stabiliser
    [verseNodeKey],
  );
  const verseReferenceSnapshot = useMemo(
    () =>
      selectedVerseReference
        ? formatBibleReference(selectedVerseReference)
        : '',
    // eslint-disable-next-line react-hooks/exhaustive-deps -- verseNodeKey is an intentional stabiliser
    [verseNodeKey],
  );

  return (
    <div className='z-10 relative w-full h-full'>
      {currentProjectionType === 'song' && (
        <CrossFade nodeKey={songNodeKey}>
          <div className={`w-full flex justify-center ${getVerticalPositionClasses(activeStyle.verticalAlign)}`}>
            <SongSlide lines={songLinesSnapshot} textStyle={activeStyle} />
          </div>
        </CrossFade>
      )}
      {currentProjectionType === 'verse' && verseProjectionEnabled && (
        <CrossFade nodeKey={verseNodeKey}>
          <div className={`w-full flex justify-center ${getVerticalPositionClasses(activeStyle.verticalAlign)}`}>
            <VerseSlide
              text={verseTextSnapshot}
              reference={verseReferenceSnapshot}
              textStyle={activeStyle}
            />
          </div>
        </CrossFade>
      )}
      {currentProjectionType === 'prayer' && (
        <div className={`w-full flex justify-center ${getVerticalPositionClasses(activeStyle.verticalAlign)}`}>
          <PrayerSlide
            prayerRequests={prayerRequests}
            textStyle={activeStyle}
          />
        </div>
      )}
      {currentProjectionType === 'song' && selectedSongKey && (
        <div
          className='absolute bottom-10 left-10 pb-4 pl-4 font-montserrat text-[300%] font-bold text-white z-20'
          style={{ textShadow: '0.06em 0.06em 1px #00000094' }}
        >
          {selectedSongKey}
        </div>
      )}
      {currentProjectionType === 'song' &&
        currentSongSlideNumber !== undefined &&
        totalSongSlides !== undefined &&
        currentSongSlideNumber > 0 &&
        totalSongSlides > 0 && (
          <div
            className='absolute bottom-10 right-10 pb-4 pr-4 text-[300%] font-bold z-20'
            style={{
              fontFamily: activeStyle.fontFamily,
              color: activeStyle.fontColor,
              textShadow: buildTextShadowStyle(activeStyle),
            }}
          >
            {currentSongSlideNumber}/{totalSongSlides}
          </div>
        )}
      {currentProjectionType === 'presentation' && selectedPresentationSlide && (
        <div className="w-full h-full absolute inset-0">
          <PresentationSlideView
            fileStreamId={selectedPresentationSlide.fileStreamId}
            slideType={selectedPresentationSlide.slideType}
          />
        </div>
      )}
      {currentProjectionType === 'presentation' &&
        selectedPresentationSlideIndex !== null &&
        totalPresentationSlides > 0 && (
          <div
            className="absolute bottom-10 right-10 pb-4 pr-4 font-montserrat text-[300%] font-bold text-white z-20"
            style={{ textShadow: '0.06em 0.06em 1px #00000094' }}
          >
            {selectedPresentationSlideIndex + 1}/{totalPresentationSlides}
          </div>
        )}
    </div>
  );
};

export default SlideText;
