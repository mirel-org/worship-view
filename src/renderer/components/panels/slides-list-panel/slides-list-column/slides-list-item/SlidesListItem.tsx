import { FC } from 'react';
import { cn } from '@/lib/utils';

type SlidesListItemProps = {
  lines: string[];
  onClick: () => void;
  selected: boolean;
};

const SlidesListItem: FC<SlidesListItemProps> = ({
  lines,
  onClick,
  selected,
}) => {
  return (
    <div
      data-testid="song-slide-item"
      data-selected={selected ? 'true' : 'false'}
      className={cn(
        'min-h-[72px] rounded-lg border border-border bg-card px-3 py-1.5 text-center flex items-center justify-center cursor-pointer transition-colors',
        selected && 'border-primary shadow-[inset_0_0_0_1px_hsl(var(--primary))]'
      )}
      onClick={onClick}
    >
      <div className="space-y-1">
        {lines.map((line, index) => (
          <div
            key={`${line}-${index}`}
            className="font-montserrat text-[13px] font-bold italic uppercase text-foreground leading-tight"
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidesListItem;
