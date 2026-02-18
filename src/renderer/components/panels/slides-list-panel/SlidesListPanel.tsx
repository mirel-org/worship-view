import {
  selectedSongSlideReferenceAtom,
  selectedSongTextAtom,
} from '@ipc/song/song.atoms';
import usePreventScroll from '@renderer/hooks/usePreventScroll';
import { useAtom } from 'jotai';
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
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-4 py-[10px]"
    >
      <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-3 content-start">
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
      </div>
    </div>
  );
};

export default SlidesListPanel;
