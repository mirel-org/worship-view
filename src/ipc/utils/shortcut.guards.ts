const DIALOG_SELECTOR = '[role="dialog"],[role="alertdialog"]';

const isElement = (target: EventTarget | null): target is Element =>
  target instanceof Element;

export const shouldIgnoreNavigationShortcut = (event: KeyboardEvent): boolean => {
  const target = isElement(event.target) ? event.target : null;
  const isCmdkEvent = !!target?.closest('[cmdk-root]');
  const isDialogEvent = !!target?.closest(DIALOG_SELECTOR);
  const activeElement =
    typeof document !== 'undefined' && isElement(document.activeElement)
      ? document.activeElement
      : null;
  const activeInsideDialog = !!activeElement?.closest(DIALOG_SELECTOR);

  return isCmdkEvent || isDialogEvent || activeInsideDialog;
};
