import { settingsSongSlideSizeAtom } from '@ipc/settings/settings.song.atoms';
import { SlideItem } from '@renderer/components/panels/slides-list-panel/slides-list-column/SlidesListColumn';
import { atom } from 'jotai';
import { Song, SongPart, SongSlide } from './song.types';
import { getSongSlidesBySize } from './song.utils';

export const selectedSongAtom = atom<Song | null>(null);
export const selectedSongTextAtom = atom<SongPart[] | null>((get) => {
  const song = get(selectedSongAtom);
  const songSlideSize = get(settingsSongSlideSizeAtom);
  if (!song) return null;
  const parts: SongPart[] = [];
  for (const key of song.arrangement) {
    const slides: SlideItem[] = [];
    const partSlides = song.parts.find((s) => s.key === key)?.slides;
    if (partSlides)
      slides.push(...getSongSlidesBySize(partSlides, songSlideSize));
    parts.push({
      key,
      slides,
    });
  }
  parts[0] && parts[0].slides.unshift({ lines: [''] });
  parts[parts.length - 1] &&
    parts[parts.length - 1].slides.push({ lines: [''] });
  return parts;
});
// we asume a valid value
export const selectedSongSlideReferenceAtom = atom<{
  partIndex: number;
  slideIndex: number;
} | null>(null);
export const selectedSongSlideAtom = atom<SongSlide | null>((get) => {
  const selectedSongText = get(selectedSongTextAtom);
  const selectedSongSlideReference = get(selectedSongSlideReferenceAtom);
  if (!selectedSongSlideReference || !selectedSongText) return null;

  const { partIndex, slideIndex } = selectedSongSlideReference;
  return selectedSongText[partIndex]?.slides[slideIndex] || null;
});
export const nextSongSlideAtom = atom<SongSlide | null>((get) => {
  const selectedSongText = get(selectedSongTextAtom);
  const selectedSongSlideReference = get(selectedSongSlideReferenceAtom);
  if (!selectedSongSlideReference || !selectedSongText) return null;

  const { partIndex, slideIndex } = selectedSongSlideReference;
  return (
    selectedSongText[partIndex]?.slides[slideIndex + 1] ||
    selectedSongText[partIndex + 1]?.slides[0] ||
    null
  );
});

export const songInputValueAtom = atom<string>('');
export const songInputFocusAtom = atom<boolean>(true);

// Calculate total number of slides across all parts (excluding first and last empty slides)
export const totalSongSlidesAtom = atom<number>((get) => {
  const selectedSongText = get(selectedSongTextAtom);
  if (!selectedSongText) return 0;
  const total = selectedSongText.reduce((total, part) => total + part.slides.length, 0);
  // Subtract 2 to exclude the first and last empty slides
  return Math.max(0, total - 2);
});

// Calculate current slide number (1-indexed, excluding first and last empty slides)
export const currentSongSlideNumberAtom = atom<number>((get) => {
  const selectedSongText = get(selectedSongTextAtom);
  const selectedSongSlideReference = get(selectedSongSlideReferenceAtom);
  if (!selectedSongSlideReference || !selectedSongText) return 0;

  const { partIndex, slideIndex } = selectedSongSlideReference;
  
  // Calculate absolute slide position
  let absolutePosition = 0;
  for (let i = 0; i < partIndex; i++) {
    absolutePosition += selectedSongText[i]?.slides.length || 0;
  }
  absolutePosition += slideIndex + 1; // 1-indexed
  
  // Check if we're on the first slide (partIndex 0, slideIndex 0)
  const isFirstSlide = partIndex === 0 && slideIndex === 0;
  
  // Check if we're on the last slide
  const lastPartIndex = selectedSongText.length - 1;
  const lastSlideIndex = (selectedSongText[lastPartIndex]?.slides.length || 0) - 1;
  const isLastSlide = partIndex === lastPartIndex && slideIndex === lastSlideIndex;
  
  // If we're on the first or last slide, return 0 (will hide counter)
  if (isFirstSlide || isLastSlide) return 0;
  
  // Subtract 1 to account for skipping the first empty slide
  return absolutePosition - 1;
});
