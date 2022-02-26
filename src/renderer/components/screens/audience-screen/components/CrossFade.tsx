import React, { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';

const CrossFade: FC = ({ children }) => {
  const node = useMemo(() => {
    const cs = React.Children.map(children, (x) => x);
    if (cs) return cs[0];
    else return null;
  }, [children]);
  const [nodesHistory, setNodesHistory] = useState<
    { node: any; key: number }[]
  >([]);
  const [opacity, setOpacity] = useState(0);

  const lastNode = useMemo(
    () => nodesHistory[nodesHistory.length - 1]?.node,
    [nodesHistory],
  );

  useEffect(() => {
    if (!React.isValidElement(node)) return;
    setNodesHistory((nodes) => [...nodes, { node, key: Math.random() }]);
    setOpacity(0);
    if (lastNode) {
      setTimeout(() => {
        setNodesHistory((nodes) => nodes.filter((n) => n.node !== lastNode));
      }, 500);
    }
  }, [node, setNodesHistory]);

  useEffect(() => {
    setTimeout(() => {
      setOpacity(1);
    });
  }, [nodesHistory]);

  return (
    <>
      {nodesHistory.map(({ node: n, key: k }) => (
        <Container
          key={k}
          style={{
            opacity: n === node ? opacity : 0,
            zIndex: n === node ? 1 : 0,
          }}
        >
          {n}
        </Container>
      ))}
    </>
  );
};

export default CrossFade;

const Container = styled.div`
  position: absolute;
  transition: opacity 0.5s;
  left: 0;
  right: 0;
  top: 50%;
  transform: translate(0, -50%);
`;
