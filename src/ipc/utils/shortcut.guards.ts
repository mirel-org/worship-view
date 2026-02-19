const OPEN_DIALOG_SELECTOR =
  '[role="dialog"][data-state="open"],[role="alertdialog"][data-state="open"]';

const isElement = (target: EventTarget | null): target is Element =>
  target instanceof Element;

export const shouldIgnoreNavigationShortcut = (event: KeyboardEvent): boolean => {
  const target = isElement(event.target) ? event.target : null;
  const isCmdkEvent = !!target?.closest('[cmdk-root]');
  const isDialogEvent = !!target?.closest('[role="dialog"],[role="alertdialog"]');
  const hasOpenDialog =
    typeof document !== 'undefined' &&
    !!document.querySelector(OPEN_DIALOG_SELECTOR);

  return isCmdkEvent || isDialogEvent || hasOpenDialog;
};

