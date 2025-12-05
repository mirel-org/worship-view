import { useEffect, useRef } from 'react';
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
    <div ref={ref} className="w-[400px] h-fit">
      <div>{title}</div>
      {slides.map((slide, slideIndex) => (
        <SlidesListItem
          key={'slide' + slideIndex}
          lines={slide.lines}
          onClick={() => handleSelection(slideIndex)}
          selected={slideIndex === selectedIndex}
        />
      ))}
    </div>
  );
};

export default SlidesListColumn;
