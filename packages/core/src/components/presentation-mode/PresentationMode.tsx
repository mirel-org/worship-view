import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { useAtom } from 'jotai';
import { X } from 'lucide-react';
import AudienceScreen from '../screens/audience-screen/AudienceScreen';
import {
  externalAudienceDisplayConfiguredAtom,
  presentationModeAtom,
} from '../../state/projection.atoms';
import { commandPaletteOpenAtom } from '../../state/command.atoms';
import { areScreensEnabledAtom } from '../../state/screen.atoms';
import { shouldIgnoreNavigationShortcut } from '../../utils/shortcut.guards';

const EXIT_BUTTON_HIDE_DELAY_MS = 2000;

const isTouchDevice = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: 'landscape') => Promise<void>;
  unlock?: () => void;
};

function requestFullscreen() {
  const root = document.documentElement;
  if (document.fullscreenElement || !root.requestFullscreen) return;
  root
    .requestFullscreen()
    .then(() => {
      // Phones present in landscape; locking only works in fullscreen and is
      // not supported everywhere (e.g. iPhone), see the rotation fallback below.
      if (isTouchDevice()) {
        (screen.orientation as LockableOrientation | undefined)
          ?.lock?.('landscape')
          .catch(() => undefined);
      }
    })
    .catch(() => {
      // Fullscreen can be refused (e.g. without a user gesture); the overlay
      // still covers the whole window.
    });
}

function exitFullscreen() {
  (screen.orientation as LockableOrientation | undefined)?.unlock?.();
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => undefined);
  }
}

/**
 * LIVE toggle in the header. With a projector/TV configured as audience
 * display it turns the projection windows on and off (as before); without one
 * (laptop mirrored to a TV, or the web app) it presents on this screen.
 */
export const LiveToggle: FC = () => {
  const [areScreensEnabled, setAreScreensEnabled] = useAtom(areScreensEnabledAtom);
  const [presentationMode, setPresentationMode] = useAtom(presentationModeAtom);
  const [externalAudienceConfigured] = useAtom(externalAudienceDisplayConfiguredAtom);
  const live = externalAudienceConfigured ? areScreensEnabled : presentationMode;

  const toggle = () => {
    if (externalAudienceConfigured) {
      setAreScreensEnabled(!areScreensEnabled);
    } else if (!presentationMode) {
      requestFullscreen();
      setPresentationMode(true);
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex shrink-0 items-center gap-2 sm:gap-3"
      data-testid="enable-button"
      aria-pressed={live}
      title={
        externalAudienceConfigured
          ? 'Proiecție pe ecranul extern'
          : 'Prezintă pe acest ecran (fără ecran extern conectat)'
      }
    >
      <span
        className={
          live
            ? 'inline-flex h-6 w-11 items-center justify-end rounded-full border border-input bg-primary p-0.5 transition-colors'
            : 'inline-flex h-6 w-11 items-center justify-start rounded-full border border-input bg-input p-0.5 transition-colors'
        }
      >
        <span className="h-5 w-5 rounded-full bg-background shadow-[0_4px_13px_-3px_rgba(0,0,0,0.15),0_4px_5px_-2px_rgba(0,0,0,0.12)]" />
      </span>
      <span
        className={
          live
            ? 'rounded-2xl bg-destructive px-2 py-0.5 text-xs font-semibold text-destructive-foreground'
            : 'rounded-2xl bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground'
        }
      >
        LIVE
      </span>
    </button>
  );
};

/**
 * Keyboard control for presentation mode. Registered in the capture phase so
 * Escape ends presentation mode before the regular "clear projection" handler.
 * - F5 starts presentation mode when no projector is configured (laptop
 *   mirrored to a TV, or the web app), matching the remote's slideshow button.
 * - Escape (the same button pressed again) ends it without clearing the projection.
 */
export const usePresentationModeShortcuts = () => {
  const [presentationMode, setPresentationMode] = useAtom(presentationModeAtom);
  const [externalAudienceConfigured] = useAtom(externalAudienceDisplayConfiguredAtom);
  const [commandPaletteOpen] = useAtom(commandPaletteOpenAtom);

  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.repeat) return;
      if (event.key === 'Escape' && presentationMode) {
        event.preventDefault();
        event.stopImmediatePropagation();
        setPresentationMode(false);
        exitFullscreen();
        return;
      }
      if (event.key === 'F5' && !presentationMode && !externalAudienceConfigured) {
        if (commandPaletteOpen || shouldIgnoreNavigationShortcut(event)) return;
        requestFullscreen();
        setPresentationMode(true);
      }
    },
    [presentationMode, externalAudienceConfigured, commandPaletteOpen, setPresentationMode],
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, [onKeyDown]);
};

const SWIPE_MIN_DISTANCE_PX = 40;
const TAP_MAX_DISTANCE_PX = 10;
const TAP_MAX_DURATION_MS = 500;

// Swipes and taps reuse the keyboard shortcuts (same rules per tab as the remote)
function goTo(direction: 'next' | 'previous') {
  window.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: direction === 'next' ? 'PageDown' : 'PageUp',
      bubbles: true,
      cancelable: true,
    }),
  );
}

function useViewportSize() {
  const [size, setSize] = useState(() => ({ width: window.innerWidth, height: window.innerHeight }));
  useEffect(() => {
    const onResize = () => setSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return size;
}

/** Full-window audience screen shown while presentation mode is on. */
export const PresentationModeOverlay: FC = () => {
  const [presentationMode, setPresentationMode] = useAtom(presentationModeAtom);
  const [showExit, setShowExit] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wasFullscreen = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const viewport = useViewportSize();
  const touch = isTouchDevice();
  // Phones always present in landscape: when the orientation cannot be locked
  // and the phone is held upright, the presentation is drawn rotated.
  const rotated = touch && viewport.height > viewport.width;

  const exit = useCallback(() => {
    setPresentationMode(false);
    exitFullscreen();
  }, [setPresentationMode]);

  useEffect(() => {
    if (!presentationMode) return;
    // Keys must reach the app, not a focused input or button behind the overlay
    (document.activeElement as HTMLElement | null)?.blur?.();
    wasFullscreen.current = !!document.fullscreenElement;

    // Leaving fullscreen with the browser's own controls ends presentation mode
    const onFullscreenChange = () => {
      if (document.fullscreenElement) {
        wasFullscreen.current = true;
      } else if (wasFullscreen.current) {
        setPresentationMode(false);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [presentationMode, setPresentationMode]);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  const revealExitButton = () => {
    setShowExit(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowExit(false), EXIT_BUTTON_HIDE_DELAY_MS);
  };

  const onTouchStart = (event: React.TouchEvent) => {
    const point = event.changedTouches[0];
    touchStart.current = { x: point.clientX, y: point.clientY, time: Date.now() };
  };

  const onTouchEnd = (event: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || (event.target as Element).closest('button')) return;
    const point = event.changedTouches[0];
    const dx = point.clientX - start.x;
    const dy = point.clientY - start.y;
    // Directions in the presentation's own (landscape) frame
    const contentDx = rotated ? dy : dx;
    const contentDy = rotated ? -dx : dy;
    const distance = Math.hypot(dx, dy);

    if (distance >= SWIPE_MIN_DISTANCE_PX) {
      const forward =
        Math.abs(contentDx) >= Math.abs(contentDy) ? contentDx < 0 : contentDy < 0;
      goTo(forward ? 'next' : 'previous');
      return;
    }
    if (distance <= TAP_MAX_DISTANCE_PX && Date.now() - start.time <= TAP_MAX_DURATION_MS) {
      // Tap the left / right side to go back / forward, the middle shows "exit"
      const along = rotated ? point.clientY / viewport.height : point.clientX / viewport.width;
      if (along < 0.3) goTo('previous');
      else if (along > 0.7) goTo('next');
      else revealExitButton();
    }
  };

  if (!presentationMode) return null;

  const contentStyle: React.CSSProperties = rotated
    ? {
        position: 'absolute',
        width: viewport.height,
        height: viewport.width,
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%) rotate(90deg)',
      }
    : { position: 'absolute', inset: 0 };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black"
      data-testid="presentation-mode"
      data-rotated={rotated}
      onPointerMove={(event) => event.pointerType === 'mouse' && revealExitButton()}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ cursor: showExit ? 'default' : 'none', touchAction: 'none' }}
    >
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={contentStyle}
        data-testid="presentation-content"
      >
        <AudienceScreen />
        <button
          type="button"
          onClick={exit}
          aria-label="Ieși din modul prezentare"
          className={`absolute right-4 top-4 z-[101] inline-flex items-center gap-2 rounded-full bg-black/60 px-4 py-2 text-sm text-white transition-opacity hover:bg-black/80 ${
            showExit ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <X className="h-4 w-4" />
          {touch ? 'Ieși' : 'Ieși (Esc)'}
        </button>
      </div>
    </div>
  );
};
