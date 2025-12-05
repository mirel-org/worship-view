import { Display } from 'electron';
import React, { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

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
      // Inject Tailwind CSS into the frame
      const link = f.document.createElement('link');
      link.rel = 'stylesheet';
      link.href = './index.css';
      f.document.head.appendChild(link);
      return f.close;
    }
  }, [display]);

  if (!frame) return null;

  return createPortal(children, frame.document.body);
};

export default Frame;
