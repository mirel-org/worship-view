import {
  selectedSongSlideReferenceAtom,
  selectedSongTextAtom,
} from '@ipc/song/song.atoms';
import usePreventScroll from '@renderer/hooks/usePreventScroll';
import { useAtom } from 'jotai';
import React from 'react';
import styled from 'styled-components';
import SlidesListColumn from './slides-list-column/SlidesListColumn';

const SlidesListPanel = () => {
  const [selectedSongSlideReference, setSelectedSongSlideReference] = useAtom(
    selectedSongSlideReferenceAtom,
  );
  const [selectedSongText] = useAtom(selectedSongTextAtom);

  const handleOnSlideClick = (partIndex: number, slideIndex: number) => {
    setSelectedSongSlideReference({ partIndex, slideIndex });
  };
  const { ref: containerRef } = usePreventScroll<HTMLDivElement>();

  return (
    <SlidesContainer ref={containerRef}>
      {selectedSongText &&
        selectedSongText.map((part, partIndex) => (
          <SlidesListColumn
            key={partIndex}
            slides={part.slides}
            title={part.key}
            selectedIndex={
              partIndex === selectedSongSlideReference?.partIndex
                ? selectedSongSlideReference.slideIndex
                : -1
            }
            onSelect={(slideIndex) => handleOnSlideClick(partIndex, slideIndex)}
          />
        ))}
    </SlidesContainer>
  );
};

export default SlidesListPanel;

const SlidesContainer = styled.div`
  height: 100%;
  display: flex;
  flex-wrap: wrap;
  overflow-y: auto;
`;
