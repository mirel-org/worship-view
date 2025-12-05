import { Display } from 'electron';
import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { injectFontCSS } from '../../lib/fonts';

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
      
      // Inject fonts into frame window (async)
      injectFontCSS(f.document).catch(console.error);
      
      // Copy styles from main window
      document.querySelectorAll('style, link[rel="stylesheet"]').forEach((el) => {
        if (el.tagName === 'STYLE') {
          const s = f.document.createElement('style');
          s.textContent = el.textContent;
          f.document.head.appendChild(s);
        } else {
          const l = f.document.createElement('link');
          l.rel = 'stylesheet';
          l.href = (el as HTMLLinkElement).href;
          f.document.head.appendChild(l);
        }
      });
      return () => f.close();
    }
  }, [display]);

  if (!frame) return null;

  return createPortal(children, frame.document.body);
};

export default Frame;
