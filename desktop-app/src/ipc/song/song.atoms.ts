import { settingsSongSlideSizeAtom } from '@ipc/settings/settings.song.atoms';
import { SlideItem } from '@renderer/components/panels/slides-list-panel/slides-list-column/SlidesListColumn';
import { atom } from 'jotai';
import { SongType, SongPart, SongSlide } from './song.types';
import { getSongSlidesBySize } from './song.utils';

export const selectedSongAtom = atom<SongType | null>(null);
export const selectedSongTextAtom = atom<SongPart[] | null>((get) => {
  const song = get(selectedSongAtom);
  const songSlideSize = get(settingsSongSlideSizeAtom);
  if (!song) return null;
  const parts: SongPart[] = [];
  for (const key of song.arrangement) {
    const slides: SlideItem[] = [];
    const partSlides = song.content[key]?.slides;
    if (partSlides)
      slides.push(...getSongSlidesBySize(partSlides, songSlideSize));
    parts.push({
      title: key,
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

export const isEditingSongAtom = atom<boolean>(false);
