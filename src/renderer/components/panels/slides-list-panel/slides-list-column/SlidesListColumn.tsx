import SlidesListItem from './slides-list-item/SlidesListItem';

export type SlideItem = {
  lines: string[];
};
export type SlidesListColumnProps = {
  title: string;
  slides: SlideItem[];
  onSelect?: (index: number) => void;
  selectedIndex?: number;
  partIndex: number;
};

const SlidesListColumn = ({
  title,
  slides,
  onSelect,
  selectedIndex,
  partIndex,
}: SlidesListColumnProps) => {
  const handleSelection = (slideIndex: number) => {
    if (!onSelect) return;
    onSelect(slideIndex);
  };

  return (
    <div
      className="w-full h-fit min-w-0 my-6"
      data-part-index={partIndex}
      data-selected-column={selectedIndex !== -1 ? 'true' : 'false'}
    >
      <div className="mb-2">
        <span className="inline-flex items-center justify-center rounded-2xl border border-border bg-secondary px-2 py-0.5 text-[14px] font-semibold tracking-[0.5px] text-secondary-foreground">
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
