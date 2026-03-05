import { useAtom } from 'jotai';
import {
  autoModeEnabledAtom,
  autoModeStateAtom,
} from '../../state/automode.atoms';

const STATE_SHORT_LABELS: Record<string, string> = {
  disabled: 'OFF',
  listening: 'Ascultă',
  tracking: 'Auto',
  error: 'Eroare',
};

export function AutoModeStatus() {
  const [enabled] = useAtom(autoModeEnabledAtom);
  const [state] = useAtom(autoModeStateAtom);

  if (!enabled) return null;

  return (
    <div className="flex items-center gap-1.5 text-xs" title="Mod Auto">
      <div
        className={`h-1.5 w-1.5 rounded-full ${
          state === 'tracking'
            ? 'bg-green-500'
            : state === 'listening'
              ? 'bg-yellow-500 animate-pulse'
              : state === 'error'
                ? 'bg-red-500'
                : 'bg-gray-400'
        }`}
      />
      <span className="text-muted-foreground">
        {STATE_SHORT_LABELS[state] ?? state}
      </span>
    </div>
  );
}
