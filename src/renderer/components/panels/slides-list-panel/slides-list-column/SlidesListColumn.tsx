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
  }, [selectedIndex]);

  const handleSelection = (slideIndex: number) => {
    if (!onSelect) return;
    onSelect(slideIndex);
  };

  return (
    <div ref={ref} className="w-full h-fit min-w-0">
      <div className="mb-2">
        <span className="inline-flex items-center justify-center rounded-2xl bg-white px-2 py-0.5 text-[11px] font-semibold tracking-[0.5px] text-black">
          {title}
        </span>
      </div>
      <div className="space-y-2">
        {slides.map((slide, slideIndex) => (
          <SlidesListItem
            key={`slide-${slideIndex}`}
            lines={slide.lines}
            onClick={() => handleSelection(slideIndex)}
            selected={slideIndex === selectedIndex}
          />
        ))}
      </div>
    </div>
  );
};

export default SlidesListColumn;
