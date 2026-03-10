import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import {
  selectedPresentationAtom,
  selectedPresentationSlideIndexAtom,
  totalPresentationSlidesAtom,
  videoPlayingAtom,
  videoSeekRequestAtom,
  videoCurrentTimeAtom,
  videoDurationAtom,
} from '../state/presentation.atoms';

export const usePresentationControl = () => {
  const [slideIndex, setSlideIndex] = useAtom(selectedPresentationSlideIndexAtom);
  const [totalSlides] = useAtom(totalPresentationSlidesAtom);

  const gotoNextSlide = useCallback(() => {
    if (slideIndex === null || totalSlides === 0) return;
    if (slideIndex < totalSlides - 1) {
      setSlideIndex(slideIndex + 1);
    }
  }, [slideIndex, totalSlides, setSlideIndex]);

  const gotoPreviousSlide = useCallback(() => {
    if (slideIndex === null || totalSlides === 0) return;
    if (slideIndex > 0) {
      setSlideIndex(slideIndex - 1);
    }
  }, [slideIndex, totalSlides, setSlideIndex]);

  return { gotoNextSlide, gotoPreviousSlide };
};

export const useManagePresentations = () => {
  const [selectedPresentation] = useAtom(selectedPresentationAtom);
  const [slideIndex, setSlideIndex] = useAtom(selectedPresentationSlideIndexAtom);
  const [, setVideoPlaying] = useAtom(videoPlayingAtom);
  const [, setSeekRequest] = useAtom(videoSeekRequestAtom);
  const [, setCurrentTime] = useAtom(videoCurrentTimeAtom);
  const [, setDuration] = useAtom(videoDurationAtom);
  const prevPresentationIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (selectedPresentation) {
      if (prevPresentationIdRef.current !== selectedPresentation.id) {
        setSlideIndex(0);
        prevPresentationIdRef.current = selectedPresentation.id;
      }
    } else {
      prevPresentationIdRef.current = null;
    }
  }, [selectedPresentation, setSlideIndex]);

  // Reset video state when slide changes
  useEffect(() => {
    setVideoPlaying(true);
    setSeekRequest(null);
    setCurrentTime(0);
    setDuration(0);
  }, [slideIndex, setVideoPlaying, setSeekRequest, setCurrentTime, setDuration]);
};
