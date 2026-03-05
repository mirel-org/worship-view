import {
  selectedSongSlideReferenceAtom,
  selectedSongTextAtom,
  selectedSongKeyAtom,
} from '../../../state/song.atoms';
import { autoModeEnabledAtom } from '../../../state/automode.atoms';
import usePreventScroll from '../../../hooks/usePreventScroll';
import { useAtom } from 'jotai';
import { useEffect, useRef } from 'react';
import SlidesListColumn from './slides-list-column/SlidesListColumn';
import { SlideDebugOverlay } from '../../automode/SlideDebugOverlay';

const SlidesListPanel = () => {
  const [selectedSongSlideReference, setSelectedSongSlideReference] = useAtom(
    selectedSongSlideReferenceAtom,
  );
  const [selectedSongText] = useAtom(selectedSongTextAtom);
  const [selectedSongKey] = useAtom(selectedSongKeyAtom);
  const [autoModeEnabled] = useAtom(autoModeEnabledAtom);

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
      {selectedSongKey && (
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-sm font-semibold text-primary">
            Tonalitate: {selectedSongKey}
          </span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(400px,1fr))] gap-3 content-start">
        {selectedSongText &&
          selectedSongText.map((part, partIndex) => {
            const isSelectedPart =
              partIndex === selectedSongSlideReference?.partIndex;
            const selectedSlideIdx = isSelectedPart
              ? selectedSongSlideReference!.slideIndex
              : -1;
            const selectedLines =
              isSelectedPart && autoModeEnabled
                ? part.slides[selectedSlideIdx]?.lines
                : undefined;

            return (
              <SlidesListColumn
                key={partIndex}
                partIndex={partIndex}
                slides={part.slides}
                title={part.key}
                selectedIndex={selectedSlideIdx}
                onSelect={(slideIndex) =>
                  handleOnSlideClick(partIndex, slideIndex)
                }
                debugOverlayForIndex={
                  selectedLines ? selectedSlideIdx : undefined
                }
                debugOverlay={
                  selectedLines ? (
                    <SlideDebugOverlay lines={selectedLines} />
                  ) : undefined
                }
              />
            );
          })}
      </div>
    </div>
  );
};

export default SlidesListPanel;
