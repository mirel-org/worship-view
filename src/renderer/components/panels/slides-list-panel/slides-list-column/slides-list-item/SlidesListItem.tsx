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
      className={cn(
        'bg-black text-center flex items-center justify-center m-2.5 cursor-pointer py-2 transition-all',
        selected && 'ring-4 ring-red-500'
      )}
      onClick={onClick}
    >
      <div>
        {lines.map((line, index) => (
          <div
            key={`${line} ${index}`}
            className="font-montserrat text-[80%] font-bold italic uppercase text-white"
            style={{ textShadow: '0.1em 0.1em 0 hsl(200 50% 30%)' }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlidesListItem;
