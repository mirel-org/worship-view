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
        'min-h-[72px] rounded-lg border border-white/[0.07] bg-[#1e1e1e] px-3 py-1.5 text-center flex items-center justify-center cursor-pointer transition-all shadow-[0_2px_8px_rgba(0,0,0,0.25)]',
        selected &&
          'border-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.9),0_2px_10px_rgba(0,0,0,0.38)]'
      )}
      onClick={onClick}
    >
      <div className="space-y-1">
        {lines.map((line, index) => (
          <div
            key={`${line}-${index}`}
            className="font-montserrat text-[13px] font-bold italic uppercase text-white leading-tight"
            style={{ textShadow: '0.06em 0.06em 1px #00000094' }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidesListItem;
