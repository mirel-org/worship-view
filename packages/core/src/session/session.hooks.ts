import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { useSession } from './OperatorSessionContext';
import { useActiveOrganization } from '../hooks/useActiveOrganization';
import { settingsSongSlideSizeAtom } from '../state/settings.song.atoms';
import { getSongSlidesBySize } from '../utils/song.utils';
import bibleText from '@assets/bibles/VDC.json';
import type { Song, SongPart, SongSlide } from '../types/song.types';
import type { BibleReferenceType, BibleTextType } from '../types/verse.types';
import type { ProjectionType } from '../types/projection.types';
import type { PresentationResponse, PresentationSlideResponse } from '../jazz/presentation-store';
import { getPresentations } from '../jazz/presentation-store';

// --------------- Song hooks ---------------

export function useSessionSong(): Song | null {
  const session = useSession();
  const { activeOrganization } = useActiveOrganization();

  return useMemo(() => {
    if (!session?.selectedSongId || !activeOrganization?.songs) return null;
    const songs = activeOrganization.songs as unknown as any[];
    const found = songs.find((s: any) => s?.id === session.selectedSongId);
    if (!found) return null;
    return {
      id: found.id,
      name: found.name,
      parts: found.parts,
      arrangement: found.arrangement,
      key: found.key,
      fullText: found.searchText ?? '',
    } as Song;
  }, [session?.selectedSongId, activeOrganization?.songs]);
}

export function useSessionSongText(): SongPart[] | null {
  const song = useSessionSong();
  const [songSlideSize] = useAtom(settingsSongSlideSizeAtom);

  return useMemo(() => {
    if (!song) return null;
    const parts: SongPart[] = [];
    for (const key of song.arrangement) {
      const slides: SongSlide[] = [];
      const partSlides = song.parts.find((s) => s.key === key)?.slides;
      if (partSlides) slides.push(...getSongSlidesBySize(partSlides, songSlideSize));
      parts.push({ key, slides });
    }
    parts[0] && parts[0].slides.unshift({ lines: [''] });
    parts[parts.length - 1] && parts[parts.length - 1].slides.push({ lines: [''] });
    return parts;
  }, [song, songSlideSize]);
}

export function useSessionSongSlideRef(): { partIndex: number; slideIndex: number } | null {
  const session = useSession();
  return useMemo(() => {
    if (!session || session.songPartIndex == null || session.songSlideIndex == null) return null;
    return { partIndex: session.songPartIndex, slideIndex: session.songSlideIndex };
  }, [session?.songPartIndex, session?.songSlideIndex]);
}

export function useSessionSongSlide(): SongSlide | null {
  const songText = useSessionSongText();
  const ref = useSessionSongSlideRef();

  return useMemo(() => {
    if (!ref || !songText) return null;
    return songText[ref.partIndex]?.slides[ref.slideIndex] || null;
  }, [songText, ref]);
}

export function useSessionNextSongSlide(): SongSlide | null {
  const songText = useSessionSongText();
  const ref = useSessionSongSlideRef();

  return useMemo(() => {
    if (!ref || !songText) return null;
    const { partIndex, slideIndex } = ref;
    return (
      songText[partIndex]?.slides[slideIndex + 1] ||
      songText[partIndex + 1]?.slides[0] ||
      null
    );
  }, [songText, ref]);
}

export function useSessionSongKey(): string | null {
  const song = useSessionSong();
  return song?.key ?? null;
}

export function useSessionTotalSongSlides(): number {
  const songText = useSessionSongText();
  return useMemo(() => {
    if (!songText) return 0;
    const total = songText.reduce((acc, part) => acc + part.slides.length, 0);
    return Math.max(0, total - 2);
  }, [songText]);
}

export function useSessionCurrentSlideNumber(): number {
  const songText = useSessionSongText();
  const ref = useSessionSongSlideRef();

  return useMemo(() => {
    if (!ref || !songText) return 0;
    const { partIndex, slideIndex } = ref;

    let absolutePosition = 0;
    for (let i = 0; i < partIndex; i++) {
      absolutePosition += songText[i]?.slides.length || 0;
    }
    absolutePosition += slideIndex + 1;

    const isFirstSlide = partIndex === 0 && slideIndex === 0;
    const lastPartIndex = songText.length - 1;
    const lastSlideIndex = (songText[lastPartIndex]?.slides.length || 0) - 1;
    const isLastSlide = partIndex === lastPartIndex && slideIndex === lastSlideIndex;

    if (isFirstSlide || isLastSlide) return 0;
    return absolutePosition - 1;
  }, [songText, ref]);
}

// --------------- Verse hooks ---------------

export function useSessionVerseRef(): BibleReferenceType | null {
  const session = useSession();
  return useMemo(() => {
    if (!session?.verseBook || !session?.verseChapter || !session?.verseVerse)
      return null;
    return {
      book: session.verseBook,
      chapter: session.verseChapter,
      verse: session.verseVerse,
    };
  }, [session?.verseBook, session?.verseChapter, session?.verseVerse]);
}

export function useSessionVerseText(): string | null {
  const ref = useSessionVerseRef();
  return useMemo(() => {
    if (!ref) return null;
    return (bibleText as BibleTextType)[ref.book]?.[ref.chapter - 1]?.[ref.verse - 1] ?? null;
  }, [ref]);
}

export function useSessionVerseProjectionEnabled(): boolean {
  const session = useSession();
  return session?.verseProjectionEnabled ?? false;
}

// --------------- Presentation hooks ---------------

export function useSessionPresentation(): PresentationResponse | null {
  const session = useSession();
  const { activeOrganization } = useActiveOrganization();

  return useMemo(() => {
    if (!session?.selectedPresentationId || !activeOrganization) return null;
    const presentations = getPresentations(activeOrganization);
    return presentations.find((p) => p.id === session.selectedPresentationId) ?? null;
  }, [session?.selectedPresentationId, activeOrganization]);
}

export function useSessionPresentationSlideIndex(): number | null {
  const session = useSession();
  return session?.presentationSlideIndex ?? null;
}

export function useSessionPresentationSlide(): PresentationSlideResponse | null {
  const presentation = useSessionPresentation();
  const slideIndex = useSessionPresentationSlideIndex();

  return useMemo(() => {
    if (!presentation || slideIndex == null) return null;
    return presentation.slides[slideIndex] ?? null;
  }, [presentation, slideIndex]);
}

export function useSessionTotalPresentationSlides(): number {
  const presentation = useSessionPresentation();
  return presentation?.slides.length ?? 0;
}

// --------------- General hooks ---------------

export function useSessionProjectionType(): ProjectionType {
  const session = useSession();
  return (session?.projectionType as ProjectionType) ?? 'none';
}

export function useSessionScreensEnabled(): boolean {
  const session = useSession();
  return session?.screensEnabled ?? true;
}

// --------------- Video hooks ---------------

export function useSessionVideoPlaying(): boolean {
  const session = useSession();
  return session?.videoPlaying ?? true;
}

export function useSessionVideoVolume(): number {
  const session = useSession();
  return session?.videoVolume ?? 1;
}

export function useSessionVideoSeekRequest(): number | undefined {
  const session = useSession();
  return session?.videoSeekRequest ?? undefined;
}
