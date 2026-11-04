'use client';

import React from 'react';
import { Command, X, Keyboard, Sparkles } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}

export default function KeyboardShortcutsModal({
  isOpen,
  onClose,
  lang,
}: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const shortcuts = [
    {
      key: 'C',
      actionBn: 'সক্রিয় ইমেইল অ্যাড্রেস কপি করুন',
      actionEn: 'Copy active email address',
    },
    {
      key: 'R',
      actionBn: 'ইনবক্স রিফ্রেশ করুন',
      actionEn: 'Refresh inbox emails',
    },
    {
      key: 'N',
      actionBn: 'নতুন র‍্যান্ডম ঠিকানা তৈরি করুন',
      actionEn: 'Generate new random email address',
    },
    {
      key: 'L',
      actionBn: 'আজীবন লক মডাল খুলুন',
      actionEn: 'Open Lifetime Lock modal',
    },
    {
      key: 'S',
      actionBn: 'ইমেইল সিমুলেটর চালু করুন',
      actionEn: 'Open Email Simulator',
    },
    {
      key: 'D',
      actionBn: '৫০,০০০+ ডোমেইন ডিরেক্টরি খুলুন',
      actionEn: 'Open 50,000+ Domain Directory',
    },
    {
      key: 'E',
      actionBn: 'JSON ফরম্যাটে ব্যাকআপ এক্সপোর্ট করুন',
      actionEn: 'Export inbox backup as JSON',
    },
    {
      key: 'V',
      actionBn: 'CSV স্প্রেডশিট এক্সপোর্ট করুন',
      actionEn: 'Export inbox emails as CSV',
    },
    {
      key: '?',
      actionBn: 'কিবোর্ড শর্টকাট গাইড দেখান/লুকান',
      actionEn: 'Toggle Keyboard Shortcuts HUD',
    },
    {
      key: 'Esc',
      actionBn: 'খোলা প্রিভিউ বা মডাল বন্ধ করুন',
      actionEn: 'Close active preview or modal',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/95 p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
                <span>{lang === 'bn' ? 'কিবোর্ড শর্টকাট' : 'Keyboard Shortcuts'}</span>
                <span className="text-[10px] font-mono uppercase bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full">
                  HUD
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'দ্রুত ও পাওয়ার-ইউজার কাজের জন্য সরাসরি কিবোর্ড ব্যবহার করুন'
                  : 'Power-user speed controls for instant operations'}
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

        {/* Shortcuts Grid */}
        <div className="grid grid-cols-1 gap-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 border border-slate-800/80 transition"
            >
              <span className="text-sm text-slate-300">
                {lang === 'bn' ? sc.actionBn : sc.actionEn}
              </span>
              <kbd className="px-2.5 py-1 rounded-md bg-slate-800 text-indigo-300 font-mono font-bold text-xs border border-slate-700 shadow-sm min-w-[28px] text-center">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        {/* Footer tip */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center space-x-1.5 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'bn' ? 'টাইপিং মোডে শর্টকাট স্বয়ংক্রিয়ভাবে স্থগিত থাকে' : 'Shortcuts are inactive while typing in inputs'}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
}

