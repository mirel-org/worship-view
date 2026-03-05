import { useAtom } from 'jotai';
import {
  autoModeProgressAtom,
  autoModeWordStatusesAtom,
} from '../../state/automode.atoms';

type SlideDebugOverlayProps = {
  lines: string[];
};

export function SlideDebugOverlay({ lines }: SlideDebugOverlayProps) {
  const [progress] = useAtom(autoModeProgressAtom);
  const [wordStatuses] = useAtom(autoModeWordStatusesAtom);

  // Split all lines into words to align with wordStatuses
  const allWords = lines.flatMap((line) =>
    line.split(/[\s\-]+/).filter(Boolean),
  );

  return (
    <div className="mt-1.5 space-y-1.5 rounded-md bg-black/40 px-2 py-1.5">
      {/* Word highlighting */}
      <div className="flex flex-wrap gap-x-1.5 gap-y-0.5 text-xs font-mono">
        {allWords.map((word, i) => {
          const status = wordStatuses[i];
          const color =
            status === 'matched'
              ? 'text-green-400 font-semibold'
              : status === 'insignificant'
                ? 'text-gray-500'
                : 'text-gray-300';
          return (
            <span key={`${word}-${i}`} className={color}>
              {word}
            </span>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="relative h-1.5 w-full rounded-full bg-gray-700">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all duration-300"
          style={{ width: `${Math.min(progress * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
