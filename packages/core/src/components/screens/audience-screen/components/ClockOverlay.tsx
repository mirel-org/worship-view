import { FC, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import {
  clockOverlayEnabledAtom,
  clockFormatAtom,
  clockPositionAtom,
  clockFontSizeAtom,
  clockColorModeAtom,
  clockCustomColorAtom,
  ClockPosition,
} from '../../../../state/clock.atoms';
import {
  currentProjectionTypeAtom,
  projectionBlankedAtom,
  verseProjectionEnabledAtom,
} from '../../../../state/projection.atoms';
import { selectedSongSlideAtom } from '../../../../state/song.atoms';
import { useActiveTextStyle } from '../../../../hooks/useTextStyle';
import { buildTextShadowStyle } from '../../../../jazz/text-style-store';

function formatTime(date: Date, format: '12h' | '24h'): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const mm = String(minutes).padStart(2, '0');

  if (format === '24h') {
    return `${String(hours).padStart(2, '0')}:${mm}`;
  }

  const h12 = hours % 12 || 12;
  const ampm = hours < 12 ? 'AM' : 'PM';
  return `${h12}:${mm} ${ampm}`;
}

function getPositionClasses(position: ClockPosition): string {
  switch (position) {
    case 'top-left':
      return 'top-10 left-10 pt-4 pl-4';
    case 'top-center':
      return 'top-10 left-1/2 -translate-x-1/2 pt-4';
    case 'top-right':
      return 'top-10 right-10 pt-4 pr-4';
    case 'center':
      return 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';
    case 'bottom-center':
      return 'bottom-10 left-1/2 -translate-x-1/2 pb-4';
    case 'bottom-right':
      return 'bottom-10 right-10 pb-4 pr-4';
    case 'bottom-left':
    default:
      return 'bottom-10 left-10 pb-4 pl-4';
  }
}

const ClockOverlay: FC = () => {
  const [enabled] = useAtom(clockOverlayEnabledAtom);
  const [format] = useAtom(clockFormatAtom);
  const [position] = useAtom(clockPositionAtom);
  const [fontSize] = useAtom(clockFontSizeAtom);
  const [colorMode] = useAtom(clockColorModeAtom);
  const [customColor] = useAtom(clockCustomColorAtom);
  const [currentProjectionType] = useAtom(currentProjectionTypeAtom);
  const [verseProjectionEnabled] = useAtom(verseProjectionEnabledAtom);
  const [selectedSongSlide] = useAtom(selectedSongSlideAtom);
  const [blanked] = useAtom(projectionBlankedAtom);
  const activeStyle = useActiveTextStyle();
  const [now, setNow] = useState(() => new Date());
  // Blank boundary slides and the blank screen leave the screen empty, so the
  // clock stays visible
  const shouldHideForProjectedText =
    !blanked &&
    ((currentProjectionType === 'song' &&
      !!selectedSongSlide?.lines.some((line) => line.trim() !== '')) ||
      (currentProjectionType === 'verse' && verseProjectionEnabled));

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [enabled]);

  // The vw/vh caps are only a first guess: the clock's width depends on the
  // digits shown, the font and the letter spacing, so after every render it is
  // measured and shrunk until it fits inside the screen.
  const clockRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = clockRef.current;
    const container = el?.offsetParent;
    if (!el || !container) return;
    const bounds = container.getBoundingClientRect();
    const fits = () => {
      const rect = el.getBoundingClientRect();
      return (
        rect.left >= bounds.left - 1 &&
        rect.top >= bounds.top - 1 &&
        rect.right <= bounds.right + 1 &&
        rect.bottom <= bounds.bottom + 1
      );
    };
    let size = parseFloat(getComputedStyle(el).fontSize);
    for (let i = 0; i < 40 && size > 4 && !fits(); i++) {
      size *= 0.95;
      el.style.fontSize = `${size}px`;
    }
  });

  // Window resizes (e.g. a projector window going fullscreen) need a re-fit
  const [, setResizeCount] = useState(0);
  useEffect(() => {
    const view = clockRef.current?.ownerDocument.defaultView;
    if (!view) return;
    const onResize = () => setResizeCount((count) => count + 1);
    view.addEventListener('resize', onResize);
    return () => view.removeEventListener('resize', onResize);
  }, [enabled, shouldHideForProjectedText]);

  if (!enabled || shouldHideForProjectedText) return null;

  return (
    <div
      className={`absolute z-20 whitespace-nowrap ${getPositionClasses(position)}`}
      ref={clockRef}
      data-testid="clock-overlay"
      data-fit-avoid
      style={{
        fontFamily: activeStyle.fontFamily,
        // Large sizes are capped for smaller projectors ("12:30 PM" is roughly
        // twice as wide as "14:30"); the layout effect above makes sure it fits
        fontSize: `min(${fontSize}%, ${format === '12h' ? 20 : 36}vw, 55vh)`,
        fontWeight: activeStyle.fontWeight,
        fontStyle: activeStyle.italic ? 'italic' : 'normal',
        color: colorMode === 'custom' ? customColor : activeStyle.fontColor,
        letterSpacing: `${activeStyle.letterSpacing}em`,
        textShadow: buildTextShadowStyle(activeStyle),
      }}
    >
      {formatTime(now, format)}
    </div>
  );
};

export default ClockOverlay;
