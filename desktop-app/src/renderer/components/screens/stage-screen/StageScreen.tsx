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
import { useAtom } from 'jotai';
import React, { FC } from 'react';
import styled from 'styled-components';
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
  if (settingsSongSlideSize === 4) return <Container></Container>;
  if (currentProjectionType === 'song')
    return (
      <Container>
        <Slide isNext={false}>
          {selectedSongSlide?.lines.map((line, index) => (
            <FitText key={index} text={line} />
          ))}
        </Slide>
        <Slide isNext>
          {nextSongSlide?.lines.map((line, index) => (
            <FitText key={index} text={line} />
          ))}
        </Slide>
      </Container>
    );
  else if (currentProjectionType === 'verse' && verseProjectionEnabled)
    return (
      <TextContainer>
        <VerseSlide
          text={selectedVerseText ?? ''}
          reference={
            selectedVerseReference
              ? `${selectedVerseReference.book} ${selectedVerseReference.chapter}:${selectedVerseReference.verse}`
              : ''
          }
          isStage
        />
      </TextContainer>
    );
  return <Container></Container>;
};

export default StageScreen;

const Container = styled.div`
  display: grid;
  grid-template-rows: 50% 50%;
  height: 100%;
  width: 100%;
  background-color: black;
  padding: 32px;
  box-sizing: border-box;
`;

const Slide = styled.div<{ isNext: boolean }>`
  display: grid;
  grid-template-rows: 50% 50%;
  height: 100%;
  color: ${(props) => (props.isNext ? 'burlywood' : 'white')};
`;

const TextContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  background-color: black;
`;
