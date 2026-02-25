const DIALOG_SELECTOR = '[role="dialog"],[role="alertdialog"]';
const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

const isElement = (target: EventTarget | null): target is Element =>
  target instanceof Element;

const isEditableElement = (el: Element | null): boolean => {
  if (!el) return false;
  if (EDITABLE_TAGS.has(el.tagName)) return true;
  if (el.getAttribute('contenteditable') === 'true') return true;
  return false;
};

export const shouldIgnoreNavigationShortcut = (event: KeyboardEvent): boolean => {
  const target = isElement(event.target) ? event.target : null;
  const isCmdkEvent = !!target?.closest('[cmdk-root]');
  const isDialogEvent = !!target?.closest(DIALOG_SELECTOR);
  const activeElement =
    typeof document !== 'undefined' && isElement(document.activeElement)
      ? document.activeElement
      : null;
  const activeInsideDialog = !!activeElement?.closest(DIALOG_SELECTOR);
  const isEditable = isEditableElement(target) || isEditableElement(activeElement);

  return isCmdkEvent || isDialogEvent || activeInsideDialog || isEditable;
};
