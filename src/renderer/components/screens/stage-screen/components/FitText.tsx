import React, { FC, useCallback, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';

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
    <Container ref={onRefChange} style={{ fontSize }}>
      {text}
    </Container>
  );
};

export default FitText;

const Container = styled.div`
  width: 100%;
  height: 100%;
  white-space: nowrap;
  overflow: hidden;
  line-height: 1;
  letter-spacing: -0.1em;
  font-family: 'Iosevka';
  font-weight: 500;
`;
