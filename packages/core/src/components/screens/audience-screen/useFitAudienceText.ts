import { RefObject, useEffect } from 'react';

const FIT_STEP = 0.92;
const FIT_MIN_FONT_SIZE_PX = 4;

const intersects = (a: DOMRect, b: DOMRect) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

/**
 * True when slide text leaves the screen or runs into the corner badges
 * (slide counter, song key, clock), which are marked with data-fit-avoid.
 */
function overflows(container: HTMLElement): boolean {
  const bounds = container.getBoundingClientRect();
  const avoid = Array.from(container.querySelectorAll<HTMLElement>('[data-fit-avoid]')).map((el) =>
    el.getBoundingClientRect(),
  );
  const texts = Array.from(container.querySelectorAll<HTMLElement>('*')).filter(
    (el) =>
      el.childElementCount === 0 &&
      !!el.textContent?.trim() &&
      !el.closest('button'),
  );
  return texts.some((el) => {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    const outside =
      rect.left < bounds.left - 1 ||
      rect.top < bounds.top - 1 ||
      rect.right > bounds.right + 1 ||
      rect.bottom > bounds.bottom + 1;
    if (outside) return true;
    return !el.closest('[data-fit-avoid]') && avoid.some((badge) => intersects(rect, badge));
  });
}

/**
 * Shrinks the audience text only as much as needed for it to fit on screen
 * (phones, small projectors, long verses), so screens where it already fits
 * keep the text style's sizes.
 */
export function useFitAudienceText(containerRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // The container may live in a projection window (another document)
    const view = container.ownerDocument.defaultView ?? window;
    let frame = 0;
    const fit = () => {
      container.style.fontSize = '';
      let size = parseFloat(getComputedStyle(container).fontSize);
      for (let i = 0; i < 40 && size > FIT_MIN_FONT_SIZE_PX && overflows(container); i++) {
        size *= FIT_STEP;
        container.style.fontSize = `${size}px`;
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(fit);
    };
    const observer = new view.MutationObserver(schedule);
    observer.observe(container, { childList: true, subtree: true, characterData: true });
    const resizeObserver = new view.ResizeObserver(schedule);
    resizeObserver.observe(container);
    schedule();
    // Slide transitions briefly show the old and new slide together
    const settle = setInterval(schedule, 500);
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      cancelAnimationFrame(frame);
      clearInterval(settle);
    };
  }, [containerRef]);
}

