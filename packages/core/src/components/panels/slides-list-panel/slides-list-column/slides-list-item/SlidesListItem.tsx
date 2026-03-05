import { FC, ReactNode } from 'react';
import { cn } from '@worship-view/ui';

type SlidesListItemProps = {
  lines: string[];
  onClick: () => void;
  selected: boolean;
  suggested?: boolean;
  debugOverlay?: ReactNode;
};

const SlidesListItem: FC<SlidesListItemProps> = ({
  lines,
  onClick,
  selected,
  suggested,
  debugOverlay,
}) => {
  return (
    <div>
      <div
        data-testid="song-slide-item"
        data-selected={selected ? 'true' : 'false'}
        className={cn(
          'min-h-[72px] rounded-lg border border-border bg-card px-2 py-3 text-center flex items-center justify-center cursor-pointer transition-colors',
          selected && 'border-primary shadow-[inset_0_0_0_1px_hsl(var(--primary))]',
          suggested && !selected && 'border-yellow-500 shadow-[inset_0_0_0_1px_theme(colors.yellow.500)] animate-pulse',
        )}
        onClick={onClick}
      >
        <div className="space-y-1">
          {lines.map((line, index) => (
            <div
              key={`${line}-${index}`}
              className="font-montserrat text-[14px] font-bold italic uppercase text-foreground leading-tight"
            >
              {line}
            </div>
          ))}
        </div>
      </div>
      {debugOverlay}
    </div>
  );
};

export default SlidesListItem;
