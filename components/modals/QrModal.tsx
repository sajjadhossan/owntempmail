'use client';

import React from 'react';
import { generateQrSvgUri } from '@/lib/qr';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEmail: string;
  onCopy: () => void;
  title: string;
  scanDesc: string;
  copyText: string;
}

export default function QrModal({
  isOpen,
  onClose,
  activeEmail,
  onCopy,
  title,
  scanDesc,
  copyText,
}: QrModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-slate-100">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-400">{scanDesc}</p>

        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-center shadow-inner">
          <img
            src={generateQrSvgUri(`mailto:${activeEmail}`)}
            alt="Email QR Code"
            className="w-48 h-48 rounded-lg"
          />
        </div>

        <div className="font-mono text-xs text-indigo-300 bg-slate-950 px-3 py-2 rounded-lg truncate border border-slate-800 select-all">
          {activeEmail}
        </div>

        <button
          type="button"
          onClick={() => {
            onCopy();
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
        >
          {copyText}
        </button>
      </div>
    </div>
  );
}

