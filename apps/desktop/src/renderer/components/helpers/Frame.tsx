import { Display } from 'electron';
import { FC, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { injectFontCSS } from '../../lib/fonts';

type FrameProps = {
  display: Display;
  children: React.ReactNode;
  onClose?: () => void;
};

const Frame: FC<FrameProps> = ({ children, display, onClose }) => {
  const [frame, setFrame] = useState<Window | null>(null);

  const displayId = display?.id;
  const displayX = display?.bounds?.x;
  const displayY = display?.bounds?.y;

  useEffect(() => {
    if (displayX === undefined || displayY === undefined) return;
    const f = window.open(
      '',
      '_blank',
      `fullscreen=true,alwaysOnTop=true,x=${displayX},y=${displayY},frame=false,backgroundColor='black'`,
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

      // Prevent child window from stealing focus (especially on Windows).
      // Projection windows are display-only and should never hold focus.
      const refocusMain = () => window.focus();
      f.addEventListener('focus', refocusMain);
      window.focus();

      return () => {
        f.removeEventListener('focus', refocusMain);
        f.close();
      };
    }
  }, [displayId, displayX, displayY]);

  if (!frame) return null;

  const content = onClose ? (
    <div className="group relative h-full w-full">
      {children}
      <button
        onMouseDown={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-3 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
      >
        <X className="h-6 w-6" />
      </button>
    </div>
  ) : (
    children
  );

  return createPortal(content, frame.document.body);
};

export default Frame;
