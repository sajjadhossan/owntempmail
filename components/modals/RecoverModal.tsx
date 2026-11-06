'use client';

import React, { useState } from 'react';
import { RefreshCw, Mail, Check, X, ShieldCheck, Lock, Sparkles, ArrowRight } from 'lucide-react';
import { translations } from '@/lib/translations';

interface RecoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecoverAddress: (address: string) => void;
  recentInboxes: string[];
  lockedInboxes?: string[];
  lang: 'bn' | 'en';
}

export default function RecoverModal({
  isOpen,
  onClose,
  onRecoverAddress,
  recentInboxes = [],
  lockedInboxes = [],
  lang,
}: RecoverModalProps) {
  const [inputAddress, setInputAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const t = translations[lang] || translations.bn;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputAddress.trim().toLowerCase();
    if (!clean) {
      setErrorMsg(lang === 'bn' ? 'অনুগ্রহ করে একটি ইমেইল ঠিকানা দিন।' : 'Please enter an email address.');
      return;
    }
    if (!clean.includes('@') || clean.split('@')[0].length === 0 || clean.split('@')[1].length === 0) {
      setErrorMsg(
        lang === 'bn'
          ? 'সঠিক ইমেইল ফরম্যাটে লিখুন (যেমন: name@domain.com)'
          : 'Please enter a valid email format (e.g., name@domain.com)'
      );
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(t.recoverSuccess);
    setTimeout(() => {
      onRecoverAddress(clean);
      setInputAddress('');
      setSuccessMsg(null);
      onClose();
    }, 400);
  };

  const handleSelectRecent = (addr: string) => {
    setSuccessMsg(t.recoverSuccess);
    setTimeout(() => {
      onRecoverAddress(addr);
      setSuccessMsg(null);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-md p-5 sm:p-6 space-y-4 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/20 flex-shrink-0">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div className="min-w-0 pr-6">
            <h3 className="font-bold text-base sm:text-lg text-slate-100 truncate">{t.recoverModalTitle}</h3>
            <p className="text-[11px] text-slate-400 line-clamp-2">{t.recoverModalDesc}</p>
          </div>
        </div>

        {/* Direct Address Input Form */}
        <form onSubmit={handleSubmit} className="space-y-3 pt-1">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t.recoverInputLabel}</span>
            </label>
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 focus-within:border-indigo-500 transition shadow-inner">
              <input
                type="text"
                value={inputAddress}
                onChange={(e) => {
                  setInputAddress(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                placeholder={t.recoverInputPlaceholder}
                className="bg-transparent border-none outline-none text-xs sm:text-sm text-slate-100 placeholder:text-slate-600 w-full font-mono"
                autoFocus
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-[11px] text-rose-400 font-medium bg-rose-500/10 border border-rose-500/30 rounded-lg px-2.5 py-1.5 animate-in fade-in">
              ⚠️ {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="text-[11px] text-emerald-300 font-semibold bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 text-center animate-pulse">
              ✅ {successMsg}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>{t.recoverSubmitBtn}</span>
            </button>
          </div>
        </form>

        {/* Previously Used Inboxes on This Device */}
        <div className="border-t border-slate-800/80 pt-3 space-y-2">
          <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t.recoverRecentTitle}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-mono">({recentInboxes.length})</span>
          </div>

          {recentInboxes.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic py-2 text-center bg-slate-950/50 rounded-xl border border-slate-800/60">
              {t.noRecentToRecover}
            </p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {recentInboxes.map((inbox) => {
                const isLocked = lockedInboxes.some((l) => l.toLowerCase() === inbox.toLowerCase());
                return (
                  <button
                    key={`rec-item-${inbox}`}
                    type="button"
                    onClick={() => handleSelectRecent(inbox)}
                    className="w-full p-2.5 rounded-xl bg-slate-950/80 hover:bg-indigo-600/15 border border-slate-800 hover:border-indigo-500/40 transition flex items-center justify-between text-left group cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 min-w-0 pr-2">
                      {isLocked ? (
                        <Lock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      ) : (
                        <Mail className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 flex-shrink-0" />
                      )}
                      <span className="font-mono text-xs text-slate-200 group-hover:text-indigo-200 truncate">
                        {inbox}
                      </span>
                      {isLocked && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex-shrink-0">
                          লকড
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 text-slate-400 group-hover:text-indigo-300 flex-shrink-0">
                      <span className="text-[10px] font-semibold hidden sm:inline">
                        {lang === 'bn' ? 'ওপেন' : 'Open'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
