'use client';

import React from 'react';
import { Sparkles, Send } from 'lucide-react';

interface SimModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEmail: string;
  simSender: string;
  setSimSender: (val: string) => void;
  simSubject: string;
  setSimSubject: (val: string) => void;
  simOtp: string;
  setSimOtp: (val: string) => void;
  isSimulating: boolean;
  onSubmit: (e?: React.FormEvent, directOtp?: string) => void;
  title: string;
  senderLabel: string;
  subjectLabel: string;
  otpLabel: string;
  cancelText: string;
  sendBtnText: string;
  sendingText: string;
  lang: string;
}

export default function SimModal({
  isOpen,
  onClose,
  activeEmail,
  simSender,
  setSimSender,
  simSubject,
  setSimSubject,
  simOtp,
  setSimOtp,
  isSimulating,
  onSubmit,
  title,
  senderLabel,
  subjectLabel,
  otpLabel,
  cancelText,
  sendBtnText,
  sendingText,
  lang,
}: SimModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-slate-100">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Target Active Inbox Badge */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between shadow-inner">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
              {lang === 'bn' ? 'প্রাপক ইনবক্স (Recipient)' : 'Target Inbox'}
            </span>
            <span className="font-mono text-xs font-semibold text-indigo-300">{activeEmail}</span>
          </div>
          <button
            type="button"
            onClick={() => onSubmit(undefined, Math.floor(100000 + Math.random() * 900000).toString())}
            disabled={isSimulating}
            className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>{lang === 'bn' ? '১-ক্লিকে কোড পাঠান' : 'Instant 1-Click'}</span>
          </button>
        </div>

        <div className="border-t border-slate-800/80 pt-2">
          <span className="text-[11px] font-semibold text-slate-400 block mb-2">
            {lang === 'bn' ? 'অথবা কাস্টম তথ্য লিখুন:' : 'Or enter custom details:'}
          </span>
        </div>

        <form onSubmit={(e) => onSubmit(e)} className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">{senderLabel}</label>
            <input
              type="text"
              value={simSender}
              onChange={(e) => setSimSender(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">{subjectLabel}</label>
            <input
              type="text"
              value={simSubject}
              onChange={(e) => setSimSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">{otpLabel}</label>
            <input
              type="text"
              value={simOtp}
              onChange={(e) => setSimOtp(e.target.value)}
              placeholder="e.g. 849201"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              {cancelText}
            </button>
            <button
              type="submit"
              disabled={isSimulating}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSimulating ? sendingText : sendBtnText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

