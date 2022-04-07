import { selectedSongSlideAtom } from '@ipc/song/song.atoms';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import {
  currentProjectionTypeAtom,
  verseProjectionEnabledAtom,
} from './projection.atoms';
import { selectedVerseTextAtom } from '@ipc/verse/verse.atoms';
import { useSongControll } from '@ipc/song/song.hooks';
import { selectedTabTypeAtom } from '@ipc/tab/tab.atoms';
export const useManageProjection = () => {
  useProjectionType();
  useProjectionNavigation();
};

const useProjectionNavigation = () => {
  const { clearSong } = useSongControll();
  const [selectedTabType] = useAtom(selectedTabTypeAtom);
  const [, setVerseProjectionEnabled] = useAtom(verseProjectionEnabledAtom);

  useEffect(() => {
    clearSong();
    setVerseProjectionEnabled(false);
  }, [clearSong, selectedTabType, setVerseProjectionEnabled]);
};

const useProjectionType = () => {
  const [selectedTabType] = useAtom(selectedTabTypeAtom);
  const [selectedSongSlide] = useAtom(selectedSongSlideAtom);
  const [selectedVerseText] = useAtom(selectedVerseTextAtom);
  const [, setCurrentProjectionType] = useAtom(currentProjectionTypeAtom);

  useEffect(() => {
    if (selectedSongSlide) setCurrentProjectionType('song');
  }, [selectedSongSlide, setCurrentProjectionType]);

  useEffect(() => {
    if (selectedVerseText) setCurrentProjectionType('verse');
  }, [selectedVerseText, setCurrentProjectionType]);

  useEffect(() => {
    if (selectedTabType === 'prayer') setCurrentProjectionType('prayer');
  }, [selectedTabType, setCurrentProjectionType]);

  useEffect(() => {
    if (
      !selectedSongSlide &&
      !selectedVerseText &&
      selectedTabType !== 'prayer'
    )
      setCurrentProjectionType('none');
  }, [
    selectedSongSlide,
    selectedVerseText,
    setCurrentProjectionType,
    selectedTabType,
  ]);
};
