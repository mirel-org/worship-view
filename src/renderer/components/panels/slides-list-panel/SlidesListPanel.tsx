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
    <div ref={containerRef} className="h-full flex flex-wrap overflow-y-auto">
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
  );
};

export default SlidesListPanel;
