import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type VerseListItemProps = {
  text: string;
  reference: number;
  selected: boolean;
  onClick: (reference: number) => void;
  enabled: boolean;
};

// eslint-disable-next-line react/display-name
const VerseListItem = ({
  text,
  reference,
  selected,
  onClick,
  enabled,
}: VerseListItemProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!selected || !ref?.current) return;
    ref.current.scrollIntoView({ block: 'center' });
  }, [selected, ref]);
  const borderColor = selected
    ? enabled
      ? 'border-l-[20px] border-l-primary'
      : 'border-l-[20px] border-l-primary/30'
    : '';
  return (
    <Card
      className={cn('m-1 cursor-pointer shadow-md', borderColor)}
      ref={ref}
      onClick={() => onClick(reference)}
    >
      <CardHeader>
        <CardTitle>{reference}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{text}</p>
      </CardContent>
    </Card>
  );
};

export default VerseListItem;
