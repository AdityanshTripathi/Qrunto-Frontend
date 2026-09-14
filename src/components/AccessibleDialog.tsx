import React, { useRef } from 'react';
import { useAccessibleDialog } from '../hooks/useAccessibleDialog';

interface AccessibleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  ariaLabel: string;
  className?: string;
  children: React.ReactNode;
}

/** Preserves custom modal visuals while providing consistent dialog keyboard behavior. */
export const AccessibleDialog: React.FC<AccessibleDialogProps> = ({
  isOpen,
  onClose,
  ariaLabel,
  className,
  children,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  useAccessibleDialog(isOpen, dialogRef, onClose);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      tabIndex={-1}
      className={className}
    >
      {children}
    </div>
  );
};
