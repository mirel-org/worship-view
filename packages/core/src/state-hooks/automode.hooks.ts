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
  autoModeOperatorOnlyAtom,
  autoModeSuggestedSlideRefAtom,
} from '../state/automode.atoms';
import { useSession } from '../session/OperatorSessionContext';
import {
  useSessionSong,
  useSessionSongText,
  useSessionSongSlideRef,
} from '../session/session.hooks';
import { setSongSlideRef } from '../session/session.actions';
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
  const session = useSession();
  const selectedSong = useSessionSong();
  const selectedSongText = useSessionSongText();
  const slideRef = useSessionSongSlideRef();
  const [apiKey] = useAtom(sonioxApiKeyAtom);
  const [deviceId] = useAtom(autoModeDeviceIdAtom);
  const [operatorOnly] = useAtom(autoModeOperatorOnlyAtom);
  const [, setSuggestedSlideRef] = useAtom(autoModeSuggestedSlideRefAtom);

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
  const operatorOnlyRef = useRef(operatorOnly);
  const sessionRef = useRef(session);

  useEffect(() => {
    slideRefLatest.current = slideRef;
  }, [slideRef]);
  useEffect(() => {
    songTextLatest.current = selectedSongText;
  }, [selectedSongText]);
  useEffect(() => {
    operatorOnlyRef.current = operatorOnly;
  }, [operatorOnly]);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

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
    setSuggestedSlideRef(null);
  }, [selectedSongText, setLastTranscription, setProgress, setWordStatuses, setSuggestedSlideRef]);

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
    const s = sessionRef.current;
    if (s) {
      if (operatorOnlyRef.current) {
        setSuggestedSlideRef(nextSlide.ref);
      } else {
        setSongSlideRef(s, nextSlide.ref.partIndex, nextSlide.ref.slideIndex);
      }
    }
    setProgress(0);
    setWordStatuses([]);
  };

  const processQueue = (allSlides: IndexedSlide[]): void => {
    const queue = queueRef.current;
    let word = queue.dequeue();
    while (word) {
      const currentSlide = allSlides[currentFlatIdxRef.current];
      if (!currentSlide) break;

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
          pending.count++;
          if (pending.count >= 2) {
            console.log(
              `[automode] ✓ confirmed slide change → ${result.slideIndex} (${pending.count} words matched)`,
            );
            currentFlatIdxRef.current = result.slideIndex;
            matchPositionRef.current = Math.max(pending.position, result.position);
            const newSlide = allSlides[result.slideIndex];
            slideRefLatest.current = newSlide.ref;
            const s = sessionRef.current;
            if (s) {
              if (operatorOnlyRef.current) {
                setSuggestedSlideRef(newSlide.ref);
              } else {
                setSongSlideRef(s, newSlide.ref.partIndex, newSlide.ref.slideIndex);
              }
            }
            pendingJumpRef.current = null;
            madeProgress = true;
          }
        } else {
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

  const enqueueDelta = (words: string[]): boolean => {
    const prev = processedInterimWordsRef.current;
    const toEnqueue: string[] = [];

    for (let i = 0; i < words.length; i++) {
      if (i >= prev.length) {
        toEnqueue.push(words[i]);
      } else if (words[i] !== prev[i]) {
        if (normalizeForAutoMode(words[i]) !== normalizeForAutoMode(prev[i])) {
          toEnqueue.push(words[i]);
        }
      }
    }

    processedInterimWordsRef.current = words.slice();

    if (toEnqueue.length > 0) {
      console.log('[automode] delta enqueue:', toEnqueue, '| prev:', prev, '| now:', words);
      queueRef.current.addRawWords(toEnqueue);
      return true;
    }
    return false;
  };

  const handleSpeechResult = useCallback(
    (text: string, isFinal: boolean) => {
      const queue = queueRef.current;
      const allSlides = slideIndexRef.current;

      if (!isFinal) {
        const words = text.trim().split(/\s+/).filter(Boolean);
        const hadNew = enqueueDelta(words);

        if (hadNew && allSlides.length > 0) {
          processQueue(allSlides);
        }

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

      const words = text.trim().split(/\s+/).filter(Boolean);
      const hadNew = enqueueDelta(words);

      processedInterimWordsRef.current = [];

      queue.addDisplayText(text);
      setLastTranscription(queue.getRawText());

      if (hadNew && allSlides.length > 0) {
        processQueue(allSlides);
      }

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
    [setLastTranscription, setProgress, setWordStatuses],
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
      setSuggestedSlideRef(null);
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
    setSuggestedSlideRef,
  ]);
};
