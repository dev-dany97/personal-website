'use client';

import { useEffect, useRef } from 'react';
import { SiteImage } from '@/app/components/SiteImage';

export interface CertificateProof {
  pdf: string;
  image: string;
}

interface CertificateProofDialogProps {
  name: string;
  proof: CertificateProof;
  onClose: () => void;
  labels: { close: string; openPdf: string; previewAlt: string };
}

// Shows the proof of a certificate: preview of the first page and
// a link to the PDF. The native <dialog> handles the focus trap and Esc.
export function CertificateProofDialog({ name, proof, onClose, labels }: CertificateProofDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="cert-proof-dialog"
      aria-label={name}
      onClose={onClose}
      onClick={(e) => {
        // Clicking the dimmed backdrop closes the dialog.
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="cert-proof-header">
        <h4>{name}</h4>
        <button type="button" className="cert-proof-close" onClick={onClose} aria-label={labels.close}>
          &times;
        </button>
      </div>
      <a href={proof.pdf} target="_blank" rel="noopener noreferrer" className="cert-proof-preview">
        <SiteImage
          src={proof.image}
          alt={`${labels.previewAlt}: ${name}`}
          width={1600}
          height={1600}
          sizes="(max-width: 900px) 100vw, 860px"
          className="cert-proof-image"
        />
      </a>
      <a href={proof.pdf} target="_blank" rel="noopener noreferrer" className="btn legacy-cta cert-proof-pdf">
        {labels.openPdf}
      </a>
    </dialog>
  );
}
