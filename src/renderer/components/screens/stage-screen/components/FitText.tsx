import { FC, useCallback, useMemo, useState } from 'react';

type FitTextProps = {
  text: string;
};

const FitText: FC<FitTextProps> = ({ text }) => {
  const [domNode, setDomNode] = useState<HTMLDivElement | null>(null);
  const onRefChange = useCallback((node: HTMLDivElement) => {
    setDomNode(node);
  }, []);
  const fontSize = useMemo(() => {
    return domNode?.scrollWidth
      ? Math.min(domNode.scrollWidth / text.length / 0.41, 240)
      : 0;
  }, [domNode, text]);
  return (
    <div
      ref={onRefChange}
      className="w-full h-full whitespace-nowrap overflow-hidden leading-none font-iosevka font-medium"
      style={{ fontSize, letterSpacing: '-0.1em' }}
    >
      {text}
    </div>
  );
};

export default FitText;
