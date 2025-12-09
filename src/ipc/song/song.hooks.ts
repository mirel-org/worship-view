import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import {
  selectedSongAtom,
  selectedSongSlideReferenceAtom,
  selectedSongTextAtom,
} from './song.atoms';

export const useSongControll = () => {
  const [selectedSongSlideReference, setSelectedSongSlideReference] = useAtom(
    selectedSongSlideReferenceAtom,
  );
  const [selectedSongText] = useAtom(selectedSongTextAtom);
  const [, setSelectedSong] = useAtom(selectedSongAtom);

  const gotoNextSlide = useCallback(() => {
    if (!selectedSongSlideReference || !selectedSongText) return;
    const { partIndex, slideIndex } = selectedSongSlideReference;

    if (selectedSongText[partIndex]?.slides[slideIndex + 1]) {
      setSelectedSongSlideReference({ partIndex, slideIndex: slideIndex + 1 });
      return;
    }
    if (selectedSongText[partIndex + 1]?.slides[0]) {
      setSelectedSongSlideReference({
        partIndex: partIndex + 1,
        slideIndex: 0,
      });
      return;
    }
  }, [
    selectedSongSlideReference,
    setSelectedSongSlideReference,
    selectedSongText,
  ]);

  const gotoPreviousSlide = useCallback(() => {
    if (!selectedSongSlideReference || !selectedSongText) return;
    const { partIndex, slideIndex } = selectedSongSlideReference;

    if (selectedSongText[partIndex]?.slides[slideIndex - 1]) {
      setSelectedSongSlideReference({ partIndex, slideIndex: slideIndex - 1 });
      return;
    }
    const prevSlides = selectedSongText[partIndex - 1]?.slides;
    if (prevSlides && prevSlides[prevSlides.length - 1]) {
      setSelectedSongSlideReference({
        partIndex: partIndex - 1,
        slideIndex: prevSlides.length - 1,
      });
      return;
    }
  }, [
    selectedSongSlideReference,
    setSelectedSongSlideReference,
    selectedSongText,
  ]);

  const clearSong = useCallback(() => {
    setSelectedSong(null);
    setSelectedSongSlideReference(null);
  }, [setSelectedSong, setSelectedSongSlideReference]);

  return { gotoNextSlide, gotoPreviousSlide, clearSong };
};

export const useManageSongs = () => {
  const [selectedSong] = useAtom(selectedSongAtom);
  const [, setSelectedSongSlideReference] = useAtom(
    selectedSongSlideReferenceAtom,
  );
  const prevSongNameRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (selectedSong) {
      // Only reset slide reference if it's a different song
      if (prevSongNameRef.current !== selectedSong.name) {
        setSelectedSongSlideReference({ partIndex: 0, slideIndex: 0 });
        prevSongNameRef.current = selectedSong.name;
      }
    } else {
      prevSongNameRef.current = null;
    }
  }, [selectedSong, setSelectedSongSlideReference]);
};
