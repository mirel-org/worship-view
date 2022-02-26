import { currentProjectionTypeAtom } from '@ipc/projection/projection.atoms';
import { nextSongSlideAtom, selectedSongSlideAtom } from '@ipc/song/song.atoms';
import { useAtom } from 'jotai';
import React, { FC } from 'react';
import styled from 'styled-components';
import FitText from './components/FitText';

const StageScreen: FC = () => {
  const [currentProjectionType] = useAtom(currentProjectionTypeAtom);
  const [selectedSongSlide] = useAtom(selectedSongSlideAtom);
  const [nextSongSlide] = useAtom(nextSongSlideAtom);
  return (
    <Container>
      {currentProjectionType === 'song' && (
        <>
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
        </>
      )}
    </Container>
  );
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
