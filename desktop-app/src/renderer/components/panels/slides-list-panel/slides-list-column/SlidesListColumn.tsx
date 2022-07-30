import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import SlidesListItem from './slides-list-item/SlidesListItem';

export type SlideItem = {
  lines: string[];
};
export type SlidesListColumnProps = {
  title: string;
  slides: SlideItem[];
  onSelect?: (index: number) => void;
  selectedIndex?: number;
};

const SlidesListColumn = ({
  title,
  slides,
  onSelect,
  selectedIndex,
}: SlidesListColumnProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selectedIndex === -1 || !ref?.current) return;
    ref.current.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }, [selectedIndex, ref]);

  const handleSelection = (slideIndex: number) => {
    if (!onSelect) return;
    onSelect(slideIndex);
  };
  return (
    <Container ref={ref}>
      <Title>{title}</Title>
      {slides.map((slide, slideIndex) => (
        <SlidesListItem
          key={'slide' + slideIndex}
          lines={slide.lines}
          onClick={() => handleSelection(slideIndex)}
          selected={slideIndex === selectedIndex}
        />
      ))}
    </Container>
  );
};

export default SlidesListColumn;

const Container = styled.div`
  width: 400px;
  height: fit-content;
`;

const Title = styled.div``;
