'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, Lock, Sparkles } from 'lucide-react';
import { InboxMetadata } from '@/lib/types';

interface InboxTtlBarProps {
  inboxMeta: InboxMetadata | null;
  onLockClick: () => void;
  lang: string;
}

export default function InboxTtlBar({ inboxMeta, onLockClick, lang }: InboxTtlBarProps) {
  const [timeLeftStr, setTimeLeftStr] = useState<string>('24h 00m');
  const [progressPercent, setProgressPercent] = useState<number>(100);

  useEffect(() => {
    if (!inboxMeta || inboxMeta.isLocked) return;

    const calculateTtl = () => {
      const createdTime = new Date(inboxMeta.createdAt || Date.now()).getTime();
      const expirationTime = createdTime + 24 * 60 * 60 * 1000; // 24 hours TTL
      const remainingMs = Math.max(0, expirationTime - Date.now());

      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remainingMs % (1000 * 60)) / 1000);

      const percent = Math.min(100, Math.max(0, (remainingMs / (24 * 60 * 60 * 1000)) * 100));
      setProgressPercent(percent);

      if (remainingMs <= 0) {
        setTimeLeftStr(lang === 'bn' ? 'মেয়াদোত্তীর্ণ (Expiring soon)' : 'Expiring soon');
      } else if (hours > 0) {
        setTimeLeftStr(`${hours}h ${minutes}m`);
      } else {
        setTimeLeftStr(`${minutes}m ${seconds}s`);
      }
    };

    calculateTtl();
    const interval = setInterval(calculateTtl, 1000);
    return () => clearInterval(interval);
  }, [inboxMeta, lang]);

  if (!inboxMeta) return null;

  if (inboxMeta.isLocked) {
    return (
      <div className="rounded-xl p-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5 shadow-sm">
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex-shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-300 flex items-center space-x-1.5">
              <span>{lang === 'bn' ? 'আজীবন সুরক্ষিত ও সংরক্ষিত (PIN Protected)' : 'Lifetime PIN Protected Vault'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'bn'
                ? 'এই ইনবক্সটি কখনোই স্বয়ংক্রিয়ভাবে মুছে যাবে না।'
                : 'This address is permanently locked and exempt from auto-cleanup.'}
            </p>
          </div>
        </div>

        <div className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800 shrink-0">
          TTL: PERMANENT ∞
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-3 bg-slate-900/60 border border-slate-800 space-y-2 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-300">
            {lang === 'bn' ? 'স্বয়ংক্রিয় মুছে যাওয়ার সময় বাকি:' : 'Auto-cleanup in:'}{' '}
            <b className="font-mono text-amber-300 font-bold">{timeLeftStr}</b>
          </span>
        </div>

        <button
          type="button"
          onClick={onLockClick}
          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold transition shadow-sm"
          title={lang === 'bn' ? 'আজীবন সুরক্ষিত রাখতে লক করুন' : 'Lock to keep forever'}
        >
          <Lock className="w-3 h-3 text-indigo-400" />
          <span>{lang === 'bn' ? 'আজীবন রাখুন' : 'Keep Forever'}</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ${
            progressPercent > 40
              ? 'bg-gradient-to-r from-indigo-500 to-cyan-400'
              : progressPercent > 15
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
              : 'bg-gradient-to-r from-rose-500 to-red-400'
          }`}
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
}

