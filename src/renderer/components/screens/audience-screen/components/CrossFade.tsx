import React, { FC, useEffect, useRef, useState } from 'react';

type CrossFadeProps = {
  children?: React.ReactNode;
  nodeKey?: string | null;
};

type HistoryEntry = {
  nodeKey: string | null;
  key: number;
};

const CrossFade: FC<CrossFadeProps> = ({ children, nodeKey = null }) => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [opacity, setOpacity] = useState(1);
  const keyCounter = useRef(0);
  const prevNodeKeyRef = useRef<string | null | undefined>(undefined);

  // Only run when nodeKey actually changes
  useEffect(() => {
    // On first mount (undefined) or when nodeKey changes
    const isFirstMount = prevNodeKeyRef.current === undefined;
    const hasKeyChanged = prevNodeKeyRef.current !== nodeKey;

    if (!isFirstMount && !hasKeyChanged) {
      return;
    }

    prevNodeKeyRef.current = nodeKey;

    // Add new entry
    keyCounter.current += 1;
    const entryKey = keyCounter.current;

    setHistory((prev) => [...prev, { nodeKey, key: entryKey }]);

    // Skip fade animation on first mount
    if (isFirstMount) {
      setOpacity(1);
      return;
    }

    setOpacity(0);

    // Fade in after a frame
    const fadeInTimer = requestAnimationFrame(() => {
      setOpacity(1);
    });

    // Remove old entries after transition completes
    const cleanupTimer = setTimeout(() => {
      setHistory((prev) => prev.filter((entry) => entry.nodeKey === nodeKey));
    }, 500);

    return () => {
      cancelAnimationFrame(fadeInTimer);
      clearTimeout(cleanupTimer);
    };
  }, [nodeKey]);

  // Render: always use current children for the active entry
  return (
    <>
      {history.map((entry) => {
        const isActive = entry.nodeKey === nodeKey;
        return (
          <div
            key={entry.key}
            className="w-full h-full absolute transition-opacity duration-500 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{
              opacity: isActive ? opacity : 0,
              zIndex: isActive ? 1 : 0,
            }}
          >
            {isActive ? children : null}
          </div>
        );
      })}
    </>
  );
};

export default CrossFade;
