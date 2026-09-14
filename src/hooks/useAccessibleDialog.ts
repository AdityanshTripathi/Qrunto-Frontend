import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';

const focusableSelector = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(',');
const activeDialogs: HTMLElement[] = [];

/** Adds keyboard containment, Escape dismissal, and opener focus restoration to a custom dialog. */
export function useAccessibleDialog(
  isOpen: boolean,
  dialogRef: RefObject<HTMLElement | null>,
  onClose: () => void,
) {
  const openerRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    openerRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;
    if (!dialog) return;
    activeDialogs.push(dialog);

    const focusInitial = () => {
      const initial = dialog.querySelector<HTMLElement>('[data-dialog-initial-focus]')
        ?? dialog.querySelector<HTMLElement>(focusableSelector);
      (initial ?? dialog).focus();
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeDialogs.at(-1) !== dialog) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector));
      if (!focusable.length) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    focusInitial();
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      const index = activeDialogs.lastIndexOf(dialog);
      if (index >= 0) activeDialogs.splice(index, 1);
      openerRef.current?.focus();
    };
  }, [dialogRef, isOpen]);
}
