import { useAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
import {
  autoModeEnabledAtom,
  autoModeStateAtom,
  autoModeLastTranscriptionAtom,
  autoModeProgressAtom,
  autoModeWordStatusesAtom,
  sonioxApiKeyAtom,
  autoModeDeviceIdAtom,
} from '../state/automode.atoms';
import {
  selectedSongAtom,
  selectedSongTextAtom,
  selectedSongSlideReferenceAtom,
} from '../state/song.atoms';
import { SonioxSpeechEngine } from '../utils/automode.soniox-engine';
import { WordQueue } from '../utils/automode.word-queue';
import {
  buildSlideIndex,
  matchWord,
  computeWordStatuses,
  progressRatio,
  normalizeForAutoMode,
} from '../utils/automode.slide-matcher';
import type { IndexedSlide } from '../utils/automode.slide-matcher';
import type { SpeechEngine } from '../utils/automode.soniox-engine';

export const useAutoMode = () => {
  const [autoModeEnabled] = useAtom(autoModeEnabledAtom);
  const [, setAutoModeState] = useAtom(autoModeStateAtom);
  const [, setLastTranscription] = useAtom(autoModeLastTranscriptionAtom);
  const [, setProgress] = useAtom(autoModeProgressAtom);
  const [, setWordStatuses] = useAtom(autoModeWordStatusesAtom);
  const [selectedSong] = useAtom(selectedSongAtom);
  const [selectedSongText] = useAtom(selectedSongTextAtom);
  const [slideRef, setSlideRef] = useAtom(selectedSongSlideReferenceAtom);
  const [apiKey] = useAtom(sonioxApiKeyAtom);
  const [deviceId] = useAtom(autoModeDeviceIdAtom);

  const engineRef = useRef<SpeechEngine | null>(null);
  const queueRef = useRef<WordQueue>(new WordQueue());
  const slideIndexRef = useRef<IndexedSlide[]>([]);
  const matchPositionRef = useRef<number>(-1);
  const currentFlatIdxRef = useRef<number>(0);
  const processedInterimWordsRef = useRef<string[]>([]);
  const pendingJumpRef = useRef<{
    slideIndex: number;
    position: number;
    count: number;
  } | null>(null);
  const slideChangedAtRef = useRef<number>(0);

  // Refs for latest values (avoid stale closures in speech callbacks)
  const slideRefLatest = useRef(slideRef);
  const songTextLatest = useRef(selectedSongText);

  useEffect(() => {
    slideRefLatest.current = slideRef;
  }, [slideRef]);
  useEffect(() => {
    songTextLatest.current = selectedSongText;
  }, [selectedSongText]);

  // Rebuild slide index when song text changes
  useEffect(() => {
    if (selectedSongText) {
      slideIndexRef.current = buildSlideIndex(selectedSongText);
    } else {
      slideIndexRef.current = [];
    }
    matchPositionRef.current = -1;
    slideChangedAtRef.current = Date.now();
    currentFlatIdxRef.current = 0;
    processedInterimWordsRef.current = [];
    pendingJumpRef.current = null;
    queueRef.current.clear();
    setLastTranscription('');
    setProgress(0);
    setWordStatuses([]);
  }, [selectedSongText, setLastTranscription, setProgress, setWordStatuses]);

  // Sync on manual slide change — find matching IndexedSlide and reset position
  useEffect(() => {
    if (!slideRef) return;
    const allSlides = slideIndexRef.current;
    const idx = allSlides.findIndex(
      (s) =>
        s.ref.partIndex === slideRef.partIndex &&
        s.ref.slideIndex === slideRef.slideIndex,
    );
    if (idx !== -1 && idx !== currentFlatIdxRef.current) {
      currentFlatIdxRef.current = idx;
      matchPositionRef.current = -1;
      slideChangedAtRef.current = Date.now();
      pendingJumpRef.current = null;
      setProgress(0);
      setWordStatuses([]);
    }
  }, [slideRef, setProgress, setWordStatuses]);

  // Helper to advance to the next slide, resetting position state.
  const advanceToNextSlide = (allSlides: IndexedSlide[]): void => {
    const nextIdx = currentFlatIdxRef.current + 1;
    if (nextIdx >= allSlides.length) return;
    console.log(`[automode] ▶ ADVANCE slide ${currentFlatIdxRef.current} → ${nextIdx}`);
    currentFlatIdxRef.current = nextIdx;
    matchPositionRef.current = -1;
    slideChangedAtRef.current = Date.now();
    const nextSlide = allSlides[nextIdx];
    slideRefLatest.current = nextSlide.ref;
    setSlideRef(nextSlide.ref);
    setProgress(0);
    setWordStatuses([]);
  };

  // Process all queued words through the matcher, advancing slides as needed.
  // Slide changes require at least 2 words to match on the target slide before
  // jumping — this prevents false jumps from a single word variation (e.g.
  // singing "Domnul" when the slide has "Domn" but another slide has "Domnul").
  const processQueue = (allSlides: IndexedSlide[]): void => {
    const queue = queueRef.current;
    let word = queue.dequeue();
    while (word) {
      const currentSlide = allSlides[currentFlatIdxRef.current];
      if (!currentSlide) break;

      // Skip words from previous slide's last line for the first 5s after a slide transition —
      // the audience is still finishing that slide and speech may lag behind.
      if (
        matchPositionRef.current === -1 &&
        currentFlatIdxRef.current > 0 &&
        Date.now() - slideChangedAtRef.current < 5000
      ) {
        const prevSlide = allSlides[currentFlatIdxRef.current - 1];
        const lastLineWords = prevSlide.words.slice(prevSlide.advanceThresholdIdx);
        if (lastLineWords.includes(word.normalized)) {
          console.log(`[automode] skip "${word.normalized}" (prev slide last line)`);
          word = queue.dequeue();
          continue;
        }
      }

      const result = matchWord(
        word.normalized,
        currentSlide,
        matchPositionRef.current,
        allSlides,
      );

      console.log(
        `[automode] match "${word.normalized}" → ${result.type}`,
        result.type === 'progress' ? `pos=${result.position}` :
        result.type === 'change-slide' ? `slide=${result.slideIndex} pos=${result.position}` : '',
        `| slide ${currentFlatIdxRef.current} words=[${currentSlide.words.join(',')}]`,
      );

      let madeProgress = false;

      if (result.type === 'progress') {
        pendingJumpRef.current = null;
        matchPositionRef.current = result.position;
        madeProgress = true;
      } else if (result.type === 'change-slide') {
        const pending = pendingJumpRef.current;
        if (pending && pending.slideIndex === result.slideIndex) {
          // Second+ match on same target slide — confirm the jump
          pending.count++;
          if (pending.count >= 2) {
            console.log(
              `[automode] ✓ confirmed slide change → ${result.slideIndex} (${pending.count} words matched)`,
            );
            currentFlatIdxRef.current = result.slideIndex;
            matchPositionRef.current = Math.max(pending.position, result.position);
            const newSlide = allSlides[result.slideIndex];
            slideRefLatest.current = newSlide.ref;
            setSlideRef(newSlide.ref);
            pendingJumpRef.current = null;
            madeProgress = true;
          }
        } else {
          // First match on a (different) target slide — start pending
          console.log(
            `[automode] ⏳ pending slide change → ${result.slideIndex} (1 word matched)`,
          );
          pendingJumpRef.current = {
            slideIndex: result.slideIndex,
            position: result.position,
            count: 1,
          };
        }
      }
      // 'discard' — keep pending alive (noise shouldn't cancel a valid pending jump)

      // After confirmed progress: check if we reached the last line of the slide
      if (madeProgress) {
        const slide = allSlides[currentFlatIdxRef.current];
        if (
          slide &&
          slide.words.length > 0 &&
          matchPositionRef.current >= slide.advanceThresholdIdx
        ) {
          advanceToNextSlide(allSlides);
        }
      }

      word = queue.dequeue();
    }
  };

  // Compute word-level delta: enqueue words that are new or revised compared
  // to the previously seen interim words. Compares NORMALIZED forms so that
  // diacritic-only revisions (e.g. "Lauda" → "Laudă") don't re-enqueue the
  // same effective word, which would cause proximity jumps to identical slides.
  const enqueueDelta = (words: string[]): boolean => {
    const prev = processedInterimWordsRef.current;
    const toEnqueue: string[] = [];

    for (let i = 0; i < words.length; i++) {
      if (i >= prev.length) {
        toEnqueue.push(words[i]);
      } else if (words[i] !== prev[i]) {
        // Raw text changed — only enqueue if normalized form also differs
        if (normalizeForAutoMode(words[i]) !== normalizeForAutoMode(prev[i])) {
          toEnqueue.push(words[i]);
        }
      }
    }

    // Always track latest raw words so future deltas compare correctly
    processedInterimWordsRef.current = words.slice();

    if (toEnqueue.length > 0) {
      console.log('[automode] delta enqueue:', toEnqueue, '| prev:', prev, '| now:', words);
      queueRef.current.addRawWords(toEnqueue);
      return true;
    }
    return false;
  };

  // Handle speech result → queue → matcher → advance
  const handleSpeechResult = useCallback(
    (text: string, isFinal: boolean) => {
      const queue = queueRef.current;
      const allSlides = slideIndexRef.current;

      if (!isFinal) {
        // Interim: cumulative text for the current segment.
        // Enqueue only new or revised words (word-level delta).
        const words = text.trim().split(/\s+/).filter(Boolean);
        const hadNew = enqueueDelta(words);

        if (hadNew && allSlides.length > 0) {
          processQueue(allSlides);
        }

        // Update display and UI
        setLastTranscription(queue.getRawText() + ' ' + text);
        const currentSlide = allSlides[currentFlatIdxRef.current];
        if (currentSlide) {
          setProgress(
            progressRatio(matchPositionRef.current, currentSlide.words.length),
          );
          setWordStatuses(
            computeWordStatuses(currentSlide, matchPositionRef.current),
          );
        }
        return;
      }

      // Final result: enqueue any remaining delta words, then reset for next segment.
      const words = text.trim().split(/\s+/).filter(Boolean);
      const hadNew = enqueueDelta(words);

      // Reset processed words for the next segment — with the engine now
      // providing cumulative text within a segment, we need a fresh comparison
      // baseline so repeated words in the next segment enqueue correctly.
      processedInterimWordsRef.current = [];

      // Update display with finalized segment text
      queue.addDisplayText(text);
      setLastTranscription(queue.getRawText());

      if (hadNew && allSlides.length > 0) {
        processQueue(allSlides);
      }

      // Update progress and word statuses from confirmed position
      const currentSlide = allSlides[currentFlatIdxRef.current];
      if (currentSlide) {
        setProgress(
          progressRatio(matchPositionRef.current, currentSlide.words.length),
        );
        setWordStatuses(
          computeWordStatuses(currentSlide, matchPositionRef.current),
        );
      }
    },
    [setLastTranscription, setProgress, setWordStatuses, setSlideRef],
  );

  // Start/stop engine based on enabled state + song selection + apiKey + deviceId
  useEffect(() => {
    if (!autoModeEnabled || !selectedSong) {
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
      setAutoModeState(autoModeEnabled ? 'listening' : 'disabled');
      queueRef.current.clear();
      processedInterimWordsRef.current = [];
      pendingJumpRef.current = null;
      setLastTranscription('');
      setProgress(0);
      setWordStatuses([]);
      return;
    }

    if (!apiKey) {
      setAutoModeState('error');
      return;
    }

    const engine = new SonioxSpeechEngine(apiKey, deviceId);
    engineRef.current = engine;

    engine.onResult = handleSpeechResult;
    engine.onStateChange = (state) => {
      if (state === 'started') {
        setAutoModeState('tracking');
      } else if (state === 'stopped') {
        setAutoModeState('error');
      } else if (state === 'error') {
        setAutoModeState('listening');
      }
    };

    engine.start();
    setAutoModeState('listening');

    return () => {
      engine.stop();
      engineRef.current = null;
      queueRef.current.clear();
    };
  }, [
    autoModeEnabled,
    selectedSong,
    apiKey,
    deviceId,
    handleSpeechResult,
    setAutoModeState,
    setLastTranscription,
    setProgress,
    setWordStatuses,
  ]);
};
