'use client';
/**
 * Reusable modal dialog. Replaces the modal-scrim/modal markup that was copy
 * pasted across screens. Adds what those inline copies lacked: Escape-to-close,
 * scrim-click-close, body-scroll lock, and proper dialog a11y.
 *
 * Content goes inside — including <form>, since submit still works through it.
 */
import { useEffect, type ReactNode } from 'react';

export default function Modal({
  onClose,
  children,
  labelledBy,
}: {
  onClose: () => void;
  children: ReactNode;
  /** id of the heading inside, for aria-labelledby. */
  labelledBy?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // lock background scroll while open
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
