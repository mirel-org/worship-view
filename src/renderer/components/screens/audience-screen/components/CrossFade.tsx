import React, { FC, useEffect, useMemo, useState } from 'react';

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
        <div
          key={k}
          className="w-full h-full absolute transition-opacity duration-500 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{
            opacity: n === node ? opacity : 0,
            zIndex: n === node ? 1 : 0,
          }}
        >
          {n}
        </div>
      ))}
    </>
  );
};

export default CrossFade;
