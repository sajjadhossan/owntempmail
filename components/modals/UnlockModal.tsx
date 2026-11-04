'use client';

import React from 'react';
import { Unlock } from 'lucide-react';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockPin: string;
  setUnlockPin: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  description: string;
  cancelText: string;
  confirmText: string;
}

export default function UnlockModal({
  isOpen,
  onClose,
  unlockPin,
  setUnlockPin,
  onSubmit,
  title,
  description,
  cancelText,
  confirmText,
}: UnlockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
          <Unlock className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-bold text-lg text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400">{description}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <div>
            <input
              type="password"
              maxLength={8}
              value={unlockPin}
              onChange={(e) => setUnlockPin(e.target.value)}
              placeholder="PIN"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-widest text-slate-100 outline-none focus:border-amber-500"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

