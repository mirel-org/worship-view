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
        'cursor-pointer rounded-lg border bg-[#1e1e1e] px-5 py-3 text-white transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
        selected
          ? 'border-2 border-white shadow-[0_2px_10px_rgba(0,0,0,0.38)]'
          : 'border-white/[0.07]'
      )}
      onClick={() => onClick(reference)}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold tracking-[0.5px] text-[#a3a3a3]">
          {reference}
        </p>
        {liveState && (
          <span
            className={cn(
              'rounded-2xl px-2 py-0.5 text-xs font-semibold',
              liveState === 'live'
                ? 'bg-[#ff666999] text-[#fafafa]'
                : 'bg-[#262626] text-[#a3a3a3]',
            )}
          >
            LIVE
          </span>
        )}
      </div>
      <p className="font-montserrat text-[13px] font-bold italic uppercase leading-[1.6] text-[#fafafa]">
        {text}
      </p>
    </div>
  );
};

export default VerseListItem;
