import { OliCard, OliText } from 'oli-design-system';
import { useEffect, useRef } from 'react';

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
  const color = selected
    ? enabled
      ? '#1976d2 solid 20px'
      : '#e3f2fd solid 20px'
    : '';
  return (
    <OliCard
      sx={{ margin: 1, borderLeft: color, cursor: 'pointer' }}
      elevation={2}
      ref={ref}
      onClick={() => onClick(reference)}
    >
      <OliText text={reference} />
      <OliText text={text} />
    </OliCard>
  );
};

export default VerseListItem;
