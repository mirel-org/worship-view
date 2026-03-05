import { normalizeForSearch } from './command.search.utils';
import { SongPart } from '../types/song.types';

/** Tokenize filtering out short common words (≤2 chars) like "a", "n", "in", "ca", "te"
 *  that appear across many Romanian slides and cause false matches */
export function tokenizeSignificant(text: string): string[] {
  return text
    .split(/[\s\-]+/)
    .filter(Boolean)
    .filter((t) => t.length > 2);
}

/** Collapse consecutive duplicate letters: "laauda" → "lauda", "doomnul" → "domnul" */
function collapseRepeats(s: string): string {
  return s.replace(/(.)\1+/g, '$1');
}

/** Normalize for automode matching: search-normalize + collapse repeated chars.
 *  Applied to both slide words and speech words so matching is symmetric. */
export function normalizeForAutoMode(raw: string): string {
  return collapseRepeats(normalizeForSearch(raw));
}

/** Check if a slide is a boundary (empty) slide */
function isEmptySlide(lines: string[]): boolean {
  return lines.length === 0 || (lines.length === 1 && lines[0] === '');
}

export interface SlideReference {
  partIndex: number;
  slideIndex: number;
}

export interface IndexedSlide {
  ref: SlideReference;
  flatIndex: number;
  words: string[]; // significant words (normalized)
  rawWords: string[]; // all words for display
  rawToSigIndex: (number | -1)[]; // maps raw word index → significant word index (-1 if insignificant)
  advanceThresholdIdx: number; // index in words[] at which to trigger slide advance (last 2 sig words)
}

/**
 * Build a pre-tokenized slide index from song parts.
 * Skips empty boundary slides.
 */
export function buildSlideIndex(parts: SongPart[]): IndexedSlide[] {
  const slides: IndexedSlide[] = [];
  let flatIndex = 0;

  for (let pi = 0; pi < parts.length; pi++) {
    const part = parts[pi];
    for (let si = 0; si < part.slides.length; si++) {
      const slide = part.slides[si];
      if (isEmptySlide(slide.lines)) continue;

      const words: string[] = [];
      const rawWords: string[] = [];
      const rawToSigIndex: (number | -1)[] = [];

      for (const line of slide.lines) {
        const lineWords = line.split(/[\s\-]+/).filter(Boolean);

        for (const raw of lineWords) {
          const normalized = normalizeForAutoMode(raw);
          rawWords.push(raw);
          if (normalized.length > 2) {
            rawToSigIndex.push(words.length);
            words.push(normalized);
          } else {
            rawToSigIndex.push(-1);
          }
        }
      }

      // Advance when matching one of the last 2 significant words
      const advanceThresholdIdx = Math.max(0, words.length - 2);

      slides.push({
        ref: { partIndex: pi, slideIndex: si },
        flatIndex,
        words,
        rawWords,
        rawToSigIndex,
        advanceThresholdIdx,
      });
      flatIndex++;
    }
  }

  return slides;
}

/**
 * Flatten all content slides (non-empty) into an ordered list with their references.
 */
export function getContentSlides(
  parts: SongPart[],
): { ref: SlideReference; text: string }[] {
  const slides: { ref: SlideReference; text: string }[] = [];
  for (let pi = 0; pi < parts.length; pi++) {
    const part = parts[pi];
    for (let si = 0; si < part.slides.length; si++) {
      const slide = part.slides[si];
      if (!isEmptySlide(slide.lines)) {
        slides.push({
          ref: { partIndex: pi, slideIndex: si },
          text: normalizeForSearch(slide.lines.join(' ')),
        });
      }
    }
  }
  return slides;
}

export type MatchResult =
  | { type: 'progress'; position: number }
  | { type: 'change-slide'; slideIndex: number; position: number }
  | { type: 'discard' };

/**
 * Core matching: find a word on the current slide (after matchPosition) or nearby slides.
 *
 * 1. Search current slide for the word starting after matchPosition
 * 2. If not found, search all other slides ordered by proximity (forward-biased)
 * 3. If found on another slide, return change-slide result
 * 4. If not found anywhere, return discard
 */
export function matchWord(
  word: string,
  currentSlide: IndexedSlide,
  matchPosition: number,
  allSlides: IndexedSlide[],
): MatchResult {
  // 1. Try current slide — find first occurrence after matchPosition
  for (let i = matchPosition + 1; i < currentSlide.words.length; i++) {
    if (currentSlide.words[i] === word) {
      return { type: 'progress', position: i };
    }
  }

  // 2. Try nearby slides in proximity order
  const nearby = proximityOrder(currentSlide.flatIndex, allSlides.length);
  for (const idx of nearby) {
    const slide = allSlides[idx];
    for (let i = 0; i < slide.words.length; i++) {
      if (slide.words[i] === word) {
        return { type: 'change-slide', slideIndex: idx, position: i };
      }
    }
  }

  // 3. Not found anywhere
  return { type: 'discard' };
}

/**
 * Generate slide indices in proximity order from currentIdx.
 * Forward-biased: at each distance d, check current+d first, then current-d.
 * Excludes currentIdx itself.
 */
export function proximityOrder(currentIdx: number, total: number): number[] {
  const result: number[] = [];
  for (let d = 1; d < total; d++) {
    const forward = currentIdx + d;
    if (forward < total) result.push(forward);
    const backward = currentIdx - d;
    if (backward >= 0) result.push(backward);
  }
  return result;
}

export type WordStatus = 'matched' | 'significant' | 'insignificant';

/**
 * Compute per-word statuses for the debug overlay.
 * Words up to and including matchPosition are 'matched'.
 * Other significant words are 'significant'.
 * Short words are 'insignificant'.
 */
export function computeWordStatuses(
  slide: IndexedSlide,
  matchPosition: number,
): WordStatus[] {
  return slide.rawWords.map((_, ri) => {
    const sigIdx = slide.rawToSigIndex[ri];
    if (sigIdx === -1) return 'insignificant';
    if (sigIdx <= matchPosition) return 'matched';
    return 'significant';
  });
}

/**
 * Progress ratio from match position.
 * Returns 0 when no words matched, 1 when all significant words matched.
 */
export function progressRatio(
  matchPosition: number,
  totalWords: number,
): number {
  if (totalWords === 0) return 1;
  if (matchPosition < 0) return 0;
  return (matchPosition + 1) / totalWords;
}
