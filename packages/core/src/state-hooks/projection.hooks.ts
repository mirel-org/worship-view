import { selectedSongSlideAtom } from '../state/song.atoms';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import {
  currentProjectionTypeAtom,
  verseProjectionEnabledAtom,
} from '../state/projection.atoms';
import { selectedVerseTextAtom } from '../state/verse.atoms';
import { selectedPresentationSlideAtom } from '../state/presentation.atoms';
import { useSongControll } from './song.hooks';
import { selectedTabTypeAtom } from '../state/tab.atoms';
export const useManageProjection = () => {
  useProjectionType();
};

const useProjectionType = () => {
  const [selectedTabType] = useAtom(selectedTabTypeAtom);
  const [selectedSongSlide] = useAtom(selectedSongSlideAtom);
  const [selectedVerseText] = useAtom(selectedVerseTextAtom);
  const [selectedPresentationSlide] = useAtom(selectedPresentationSlideAtom);
  const [, setCurrentProjectionType] = useAtom(currentProjectionTypeAtom);

  useEffect(() => {
    if (selectedSongSlide) setCurrentProjectionType('song');
  }, [selectedSongSlide, setCurrentProjectionType]);

  useEffect(() => {
    if (selectedVerseText) setCurrentProjectionType('verse');
  }, [selectedVerseText, setCurrentProjectionType]);

  useEffect(() => {
    if (selectedPresentationSlide) setCurrentProjectionType('presentation');
  }, [selectedPresentationSlide, setCurrentProjectionType]);

  useEffect(() => {
    if (!selectedSongSlide && !selectedVerseText && !selectedPresentationSlide)
      setCurrentProjectionType('none');
  }, [
    selectedSongSlide,
    selectedVerseText,
    selectedPresentationSlide,
    setCurrentProjectionType,
    selectedTabType,
  ]);
};
