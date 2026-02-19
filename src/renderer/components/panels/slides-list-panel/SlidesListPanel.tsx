import {
  selectedSongSlideReferenceAtom,
  selectedSongTextAtom,
} from '@ipc/song/song.atoms';
import usePreventScroll from '@renderer/hooks/usePreventScroll';
import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
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
  const previousPartIndexRef = useRef<number | null>(null);

  useEffect(() => {
    const currentPartIndex = selectedSongSlideReference?.partIndex;
    if (currentPartIndex == null) {
      previousPartIndexRef.current = null;
      return;
    }

    if (previousPartIndexRef.current === null) {
      previousPartIndexRef.current = currentPartIndex;
      return;
    }

    if (previousPartIndexRef.current !== currentPartIndex) {
      const targetColumn = containerRef.current?.querySelector<HTMLElement>(
        `[data-part-index="${currentPartIndex}"]`,
      );
      targetColumn?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }

    previousPartIndexRef.current = currentPartIndex;
  }, [selectedSongSlideReference?.partIndex, containerRef]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-4 py-[10px]"
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3 content-start">
        {selectedSongText &&
          selectedSongText.map((part, partIndex) => (
            <SlidesListColumn
              key={partIndex}
              partIndex={partIndex}
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
      </div>
    </div>
  );
};

export default SlidesListPanel;
