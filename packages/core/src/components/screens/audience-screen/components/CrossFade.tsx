import React, { FC, useEffect, useRef, useState } from 'react';

type CrossFadeProps = {
  children?: React.ReactNode;
  nodeKey?: string | null;
};

type TransitionPhase = 'idle' | 'prepare' | 'animate';

const TRANSITION_DURATION_MS = 250;
const TRANSITION_EASING = 'linear';

const CrossFade: FC<CrossFadeProps> = ({ children, nodeKey = null }) => {
  const [enteringContent, setEnteringContent] = useState<React.ReactNode>(
    children
  );
  const [leavingContent, setLeavingContent] = useState<React.ReactNode | null>(
    null
  );
  const [phase, setPhase] = useState<TransitionPhase>('idle');

  const prevNodeKeyRef = useRef<string | null | undefined>(undefined);
  const enteringContentRef = useRef<React.ReactNode>(children);
  const firstRafRef = useRef<number | null>(null);
  const secondRafRef = useRef<number | null>(null);
  const cleanupTimerRef = useRef<number | null>(null);

  const clearTransitionHandles = () => {
    if (firstRafRef.current !== null) {
      cancelAnimationFrame(firstRafRef.current);
      firstRafRef.current = null;
    }
    if (secondRafRef.current !== null) {
      cancelAnimationFrame(secondRafRef.current);
      secondRafRef.current = null;
    }
    if (cleanupTimerRef.current !== null) {
      window.clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }
  };

  useEffect(() => {
    enteringContentRef.current = enteringContent;
  }, [enteringContent]);

  useEffect(() => {
    return () => {
      clearTransitionHandles();
    };
  }, []);

  useEffect(() => {
    const isFirstMount = prevNodeKeyRef.current === undefined;
    const hasKeyChanged = prevNodeKeyRef.current !== nodeKey;

    prevNodeKeyRef.current = nodeKey;

    if (isFirstMount) {
      clearTransitionHandles();
      setEnteringContent(children);
      setLeavingContent(null);
      setPhase('idle');
      enteringContentRef.current = children;
      return;
    }

    if (!hasKeyChanged) {
      setEnteringContent(children);
      enteringContentRef.current = children;
      return;
    }

    clearTransitionHandles();

    const outgoingContent = enteringContentRef.current;
    setLeavingContent(outgoingContent ?? null);
    setEnteringContent(children);
    enteringContentRef.current = children;
    setPhase('prepare');

    // Double rAF guarantees the "prepare" frame is painted before animating.
    firstRafRef.current = requestAnimationFrame(() => {
      secondRafRef.current = requestAnimationFrame(() => {
        setPhase('animate');
      });
    });

    cleanupTimerRef.current = window.setTimeout(() => {
      setLeavingContent(null);
      setPhase('idle');
    }, TRANSITION_DURATION_MS);
  }, [nodeKey, children]);

  const fadeTransitionStyle = {
    transition: `opacity ${TRANSITION_DURATION_MS}ms ${TRANSITION_EASING}`,
  } as const;
  const noTransitionStyle = { transition: 'none' } as const;
  const layerTransitionStyle =
    phase === 'animate' ? fadeTransitionStyle : noTransitionStyle;

  const isAnimating = leavingContent !== null;
  const leavingOpacity = phase === 'animate' ? 0 : 1;
  const enteringOpacity = isAnimating ? (phase === 'animate' ? 1 : 0) : 1;

  return (
    <div data-testid="crossfade" className="w-full h-full">
      {leavingContent !== null && (
        <div
          data-testid="crossfade-leaving"
          className="w-full h-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            ...layerTransitionStyle,
            opacity: leavingOpacity,
            zIndex: 0,
          }}
        >
          {leavingContent}
        </div>
      )}
      <div
        data-testid="crossfade-entering"
        className="w-full h-full absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          ...layerTransitionStyle,
          opacity: enteringOpacity,
          zIndex: 1,
        }}
      >
        {enteringContent}
      </div>
    </div>
  );
};

export default CrossFade;
