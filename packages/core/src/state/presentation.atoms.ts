import { atom } from 'jotai';
import type { PresentationResponse, PresentationSlideResponse } from '../jazz/presentation-store';

export const selectedPresentationAtom = atom<PresentationResponse | null>(null);
export const selectedPresentationSlideIndexAtom = atom<number | null>(null);
export const presentationInputFocusAtom = atom<boolean>(false);

export const selectedPresentationSlideAtom = atom<PresentationSlideResponse | null>((get) => {
  const presentation = get(selectedPresentationAtom);
  const slideIndex = get(selectedPresentationSlideIndexAtom);
  if (!presentation || slideIndex === null) return null;
  return presentation.slides[slideIndex] ?? null;
});

export const totalPresentationSlidesAtom = atom<number>((get) => {
  const presentation = get(selectedPresentationAtom);
  return presentation?.slides.length ?? 0;
});

// Video control - command atoms (operator → audience)
export const videoPlayingAtom = atom<boolean>(true);
export const videoVolumeAtom = atom<number>(1);
export const videoSeekRequestAtom = atom<number | null>(null);

// Video control - state feedback atoms (audience → operator)
export const videoCurrentTimeAtom = atom<number>(0);
export const videoDurationAtom = atom<number>(0);
