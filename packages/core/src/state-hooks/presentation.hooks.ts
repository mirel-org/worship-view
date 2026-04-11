import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import { useSession, useSessionMode } from '../session/OperatorSessionContext';
import {
  useSessionPresentation,
  useSessionPresentationSlideIndex,
  useSessionTotalPresentationSlides,
} from '../session/session.hooks';
import {
  gotoNextPresentationSlide,
  gotoPrevPresentationSlide,
  setPresentationSlideIndex,
  setVideoPlaying,
  seekVideo,
} from '../session/session.actions';
import {
  videoCurrentTimeAtom,
  videoDurationAtom,
} from '../state/presentation.atoms';

export const usePresentationControl = () => {
  const session = useSession();
  const totalSlides = useSessionTotalPresentationSlides();
  const slideIndex = useSessionPresentationSlideIndex();

  const gotoNextSlide = useCallback(() => {
    if (!session || slideIndex === null || totalSlides === 0) return;
    gotoNextPresentationSlide(session, totalSlides);
  }, [session, slideIndex, totalSlides]);

  const gotoPreviousSlide = useCallback(() => {
    if (!session || slideIndex === null || totalSlides === 0) return;
    gotoPrevPresentationSlide(session);
  }, [session, slideIndex, totalSlides]);

  return { gotoNextSlide, gotoPreviousSlide };
};

export const useManagePresentations = () => {
  const session = useSession();
  const mode = useSessionMode();
  const selectedPresentation = useSessionPresentation();
  const slideIndex = useSessionPresentationSlideIndex();
  const [, setCurrentTime] = useAtom(videoCurrentTimeAtom);
  const [, setDuration] = useAtom(videoDurationAtom);
  const prevPresentationIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Only the desktop (session owner) should auto-manage slide index
    if (!session || mode !== 'desktop') return;
    if (selectedPresentation) {
      if (prevPresentationIdRef.current !== selectedPresentation.id) {
        setPresentationSlideIndex(session, 0);
        prevPresentationIdRef.current = selectedPresentation.id;
      }
    } else {
      prevPresentationIdRef.current = null;
    }
  }, [session, mode, selectedPresentation]);

  // Reset video state when slide changes (desktop only)
  useEffect(() => {
    if (!session || mode !== 'desktop') return;
    setVideoPlaying(session, true);
    seekVideo(session, null);
    setCurrentTime(0);
    setDuration(0);
  }, [session, mode, slideIndex, setCurrentTime, setDuration]);
};
