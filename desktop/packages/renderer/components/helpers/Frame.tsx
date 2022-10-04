import { Display } from 'electron';
import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { StyleSheetManager } from 'styled-components';
import GlobalStyle from './GlobalStyle';

type FrameProps = {
  display: Display;
};

const Frame: FC<FrameProps> = ({ children, display }) => {
  const [frame, setFrame] = useState<Window | null>(null);
  useEffect(() => {
    if (!display?.bounds) return;
    const { x, y } = display.bounds;
    const f = window.open(
      '',
      '_blank',
      `fullscreen=true,alwaysOnTop=true,x=${x},y=${y},frame=false,backgroundColor='black'`,
    );
    setFrame(f);
    if (f) {
      f.window.document.body.style.margin = '0px';
      return f.close;
    }
  }, [display]);

  if (!frame) return null;

  return createPortal(
    <StyleSheetManager target={frame.document.head}>
      <>
        <GlobalStyle />
        {children}
      </>
    </StyleSheetManager>,
    frame.document.body,
  );
};

export default Frame;
