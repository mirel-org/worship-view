import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type VerseListItemProps = {
  text: string;
  reference: number;
  selected: boolean;
  liveState: 'live' | 'selected' | null;
  onClick: (reference: number) => void;
};

const VerseListItem = ({
  text,
  reference,
  selected,
  liveState,
  onClick,
}: VerseListItemProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selected || !ref?.current) return;
    ref.current.scrollIntoView({ block: 'center' });
  }, [selected]);

  return (
    <div
      ref={ref}
      data-testid="verse-card"
      data-selected={selected ? 'true' : 'false'}
      className={cn(
        'cursor-pointer rounded-lg border bg-card px-5 py-3 text-foreground transition-colors',
        selected ? 'border-2 border-primary' : 'border-border'
      )}
      onClick={() => onClick(reference)}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-[0.5px] text-muted-foreground">
          {reference}
        </p>
        <span
          aria-hidden={liveState === null}
          className={cn(
            'rounded-2xl px-2 py-0.5 text-[12px] font-semibold',
            liveState === 'live' &&
              'bg-destructive text-destructive-foreground visible',
            liveState === 'selected' &&
              'bg-muted text-muted-foreground visible',
            liveState === null && 'invisible',
          )}
        >
          LIVE
        </span>
      </div>
      <p className="font-montserrat text-[15px] font-bold italic leading-[1.6] text-center text-foreground">
        {text}
      </p>
    </div>
  );
};

export default VerseListItem;
