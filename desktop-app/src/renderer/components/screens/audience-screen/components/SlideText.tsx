import {
  currentProjectionTypeAtom,
  verseProjectionEnabledAtom,
} from '@ipc/projection/projection.atoms';
import React, { FC } from 'react';
import styled from 'styled-components';
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
    <Container>
      {currentProjectionType === 'song' && (
        <CrossFade>
          <TextContainer>
            <SongSlide lines={selectedSongSlide?.lines ?? []} />
          </TextContainer>
        </CrossFade>
      )}
      {currentProjectionType === 'verse' && verseProjectionEnabled && (
        <CrossFade>
          <TextContainer>
            <VerseSlide
              text={selectedVerseText ?? ''}
              reference={
                selectedVerseReference
                  ? `${selectedVerseReference.book} ${selectedVerseReference.chapter}:${selectedVerseReference.verse}`
                  : ''
              }
            />
          </TextContainer>
        </CrossFade>
      )}
      {currentProjectionType === 'prayer' && (
        <TextContainer>
          <PrayerSlide prayerRequests={prayerRequests} />
        </TextContainer>
      )}
    </Container>
  );
};

export default SlideText;

const Container = styled.div`
  z-index: 10;
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: center;
`;
