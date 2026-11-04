'use client';

import React from 'react';
import { Flame, AlertTriangle, X, RefreshCw } from 'lucide-react';

interface BurnerResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmBurn: () => void;
  lang: string;
}

export default function BurnerResetModal({
  isOpen,
  onClose,
  onConfirmBurn,
  lang,
}: BurnerResetModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-rose-500/30 bg-slate-900 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-1.5">
                <span>{lang === 'bn' ? 'সেশন ডিস্ট্রাক্ট ও ওয়াইপ (Burn Session)' : 'Burn Session & Wipe Traces'}</span>
              </h3>
              <p className="text-xs text-rose-400 font-medium">
                {lang === 'bn' ? 'জিরো-ট্রেস প্রাইভেসি মোড' : 'Zero-Trace Privacy Guard'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Body */}
        <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs text-slate-300 space-y-2">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {lang === 'bn'
                ? 'আপনি কি নিশ্চিত যে বর্তমান সেশনটি ওয়াইপ করতে চান? এটি লোকাল ব্রাউজারে সংরক্ষিত সাম্প্রতিক ইনবক্সসমূহ, ক্যাশ ও কুকি মুছে সাথে সাথে একটি সম্পূর্ণ নতুন পরিচয় তৈরি করবে।'
                : 'Are you sure you want to burn this session? This will immediately wipe recent inboxes, cached tokens, and generate a brand-new clean identity.'}
            </p>
          </div>
          <p className="text-[11px] text-slate-400">
            {lang === 'bn'
              ? '💡 আপনার কোনো পিন-লক করা ইনবক্স থাকলে সেটি সার্ভারে সুরক্ষিত থাকবে।'
              : '💡 Any PIN-locked inboxes will remain safe in cloud storage.'}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            {lang === 'bn' ? 'বাতিল' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmBurn();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-rose-600/30 active:scale-95"
          >
            <Flame className="w-4 h-4" />
            <span>{lang === 'bn' ? '🔥 সেশন বার্ন করুন' : '🔥 Burn & Reborn'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

