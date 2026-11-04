'use client';

import React from 'react';
import { Lock } from 'lucide-react';

interface LockModalProps {
  isOpen: boolean;
  onClose: () => void;
  lockPin: string;
  setLockPin: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  description: string;
  enterPinText: string;
  cancelText: string;
  confirmText: string;
}

export default function LockModal({
  isOpen,
  onClose,
  lockPin,
  setLockPin,
  onSubmit,
  title,
  description,
  enterPinText,
  cancelText,
  confirmText,
}: LockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <div className="text-center space-y-1">
          <h3 className="font-bold text-lg text-slate-100">{title}</h3>
          <p className="text-xs text-slate-400">{description}</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1.5">
              {enterPinText}
            </label>
            <input
              type="password"
              maxLength={8}
              value={lockPin}
              onChange={(e) => setLockPin(e.target.value)}
              placeholder="e.g. 7492"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-widest text-slate-100 outline-none focus:border-indigo-500"
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
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              {confirmText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

