import type { OperatorSessionType } from '@worship-view/schema';
import type { SongPart } from '../types/song.types';
import type { BibleReferenceType, BibleTextType } from '../types/verse.types';
import bibleText from '@assets/bibles/VDC.json';

function set(session: OperatorSessionType, key: string, value: unknown) {
  (session as any).$jazz.set(key, value);
}

// Song actions
export function selectSong(session: OperatorSessionType, songId: string) {
  set(session, 'selectedSongId', songId);
  set(session, 'songPartIndex', 0);
  set(session, 'songSlideIndex', 0);
  set(session, 'projectionType', 'song');
}

export function clearSong(session: OperatorSessionType) {
  set(session, 'selectedSongId', undefined);
  set(session, 'songPartIndex', undefined);
  set(session, 'songSlideIndex', undefined);
}

export function setSongSlideRef(
  session: OperatorSessionType,
  partIndex: number,
  slideIndex: number,
) {
  set(session, 'songPartIndex', partIndex);
  set(session, 'songSlideIndex', slideIndex);
  set(session, 'projectionType', 'song');
}

export function gotoNextSongSlide(
  session: OperatorSessionType,
  songText: SongPart[],
) {
  const partIndex = session.songPartIndex;
  const slideIndex = session.songSlideIndex;
  if (partIndex == null || slideIndex == null) return;

  if (songText[partIndex]?.slides[slideIndex + 1]) {
    set(session, 'songSlideIndex', slideIndex + 1);
    return;
  }
  if (songText[partIndex + 1]?.slides[0]) {
    set(session, 'songPartIndex', partIndex + 1);
    set(session, 'songSlideIndex', 0);
    return;
  }
}

export function gotoPrevSongSlide(
  session: OperatorSessionType,
  songText: SongPart[],
) {
  const partIndex = session.songPartIndex;
  const slideIndex = session.songSlideIndex;
  if (partIndex == null || slideIndex == null) return;

  if (songText[partIndex]?.slides[slideIndex - 1]) {
    set(session, 'songSlideIndex', slideIndex - 1);
    return;
  }
  const prevSlides = songText[partIndex - 1]?.slides;
  if (prevSlides && prevSlides[prevSlides.length - 1]) {
    set(session, 'songPartIndex', partIndex - 1);
    set(session, 'songSlideIndex', prevSlides.length - 1);
    return;
  }
}

// Verse actions
export function selectVerse(
  session: OperatorSessionType,
  ref: BibleReferenceType,
) {
  set(session, 'verseBook', ref.book);
  set(session, 'verseChapter', ref.chapter);
  set(session, 'verseVerse', ref.verse);
  set(session, 'verseProjectionEnabled', true);
  set(session, 'projectionType', 'verse');
}

export function setVerseRef(
  session: OperatorSessionType,
  ref: BibleReferenceType,
) {
  set(session, 'verseBook', ref.book);
  set(session, 'verseChapter', ref.chapter);
  set(session, 'verseVerse', ref.verse);
}

export function enableVerseProjection(session: OperatorSessionType) {
  set(session, 'verseProjectionEnabled', true);
}

export function disableVerseProjection(session: OperatorSessionType) {
  set(session, 'verseProjectionEnabled', false);
}

export function gotoNextVerse(session: OperatorSessionType) {
  const bookId = session.verseBook;
  const chapterId = session.verseChapter;
  const verseId = session.verseVerse;
  if (!bookId || !chapterId || !verseId) return;

  const bible = bibleText as BibleTextType;
  const book = bible[bookId];
  if (!book) return;
  const chapter = book[chapterId - 1];
  if (!chapter) return;

  if (chapter[verseId]) {
    set(session, 'verseVerse', verseId + 1);
  } else if (book[chapterId]) {
    set(session, 'verseChapter', chapterId + 1);
    set(session, 'verseVerse', 1);
  }
}

export function gotoPrevVerse(session: OperatorSessionType) {
  const bookId = session.verseBook;
  const chapterId = session.verseChapter;
  const verseId = session.verseVerse;
  if (!bookId || !chapterId || !verseId) return;

  const bible = bibleText as BibleTextType;
  const book = bible[bookId];
  if (!book) return;
  const chapter = book[chapterId - 1];
  if (!chapter) return;

  if (chapter[verseId - 2]) {
    set(session, 'verseVerse', verseId - 1);
  } else if (book[chapterId - 2]) {
    set(session, 'verseChapter', chapterId - 1);
    set(session, 'verseVerse', book[chapterId - 2].length);
  }
}

// Presentation actions
export function selectPresentation(
  session: OperatorSessionType,
  presentationId: string,
) {
  set(session, 'selectedPresentationId', presentationId);
  set(session, 'presentationSlideIndex', 0);
  set(session, 'projectionType', 'presentation');
}

export function clearPresentation(session: OperatorSessionType) {
  set(session, 'selectedPresentationId', undefined);
  set(session, 'presentationSlideIndex', undefined);
}

export function setPresentationSlideIndex(
  session: OperatorSessionType,
  index: number,
) {
  set(session, 'presentationSlideIndex', index);
  set(session, 'projectionType', 'presentation');
}

export function gotoNextPresentationSlide(
  session: OperatorSessionType,
  totalSlides: number,
) {
  const current = session.presentationSlideIndex;
  if (current == null || totalSlides === 0) return;
  if (current < totalSlides - 1) {
    set(session, 'presentationSlideIndex', current + 1);
  }
}

export function gotoPrevPresentationSlide(session: OperatorSessionType) {
  const current = session.presentationSlideIndex;
  if (current == null) return;
  if (current > 0) {
    set(session, 'presentationSlideIndex', current - 1);
  }
}

// General actions
export function clearScreen(session: OperatorSessionType) {
  clearSong(session);
  disableVerseProjection(session);
  clearPresentation(session);
  set(session, 'projectionType', 'none');
}

export function toggleScreens(session: OperatorSessionType) {
  set(session, 'screensEnabled', !session.screensEnabled);
}

export function setScreensEnabled(session: OperatorSessionType, enabled: boolean) {
  set(session, 'screensEnabled', enabled);
}

export function setProjectionType(
  session: OperatorSessionType,
  type: string,
) {
  set(session, 'projectionType', type);
}

// Video actions
export function setVideoPlaying(session: OperatorSessionType, playing: boolean) {
  set(session, 'videoPlaying', playing);
}

export function setVideoVolume(session: OperatorSessionType, volume: number) {
  set(session, 'videoVolume', volume);
}

export function seekVideo(session: OperatorSessionType, time: number | null) {
  set(session, 'videoSeekRequest', time ?? undefined);
}
