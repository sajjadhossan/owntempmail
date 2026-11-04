'use client';

import React, { useState } from 'react';
import { Sparkles, Copy, Check, Volume2, ExternalLink, X, ShieldAlert } from 'lucide-react';

interface FloatingOtpBannerProps {
  otpCode: string;
  senderName?: string;
  verificationLink?: string;
  onCopy: (code: string) => void;
  onAnnounce?: (code: string) => void;
  onDismiss: () => void;
  lang: string;
}

export default function FloatingOtpBanner({
  otpCode,
  senderName = 'Verification Service',
  verificationLink,
  onCopy,
  onAnnounce,
  onDismiss,
  lang,
}: FloatingOtpBannerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(otpCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-16 sm:bottom-6 right-3 sm:right-6 z-50 max-w-sm w-[calc(100vw-24px)] animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 backdrop-blur-xl border-2 border-indigo-500/80 rounded-2xl p-3.5 shadow-2xl shadow-indigo-500/20 text-slate-100 flex flex-col space-y-2.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{lang === 'bn' ? 'তাৎক্ষণিক ওটিপি কোড (Instant OTP)' : 'Instant OTP Detected'}</span>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sender & Code Row */}
        <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
          <div className="truncate mr-2">
            <span className="text-[10px] text-slate-400 block truncate font-medium">{senderName}</span>
            <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-emerald-400 select-all">
              {otpCode}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {onAnnounce && (
              <button
                type="button"
                onClick={() => onAnnounce(otpCode)}
                className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 transition"
                title="Voice Announce OTP"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center space-x-1.5 transition ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি' : 'Copy')}</span>
            </button>
          </div>
        </div>

        {/* Optional Verification Link */}
        {verificationLink && (
          <a
            href={verificationLink}
            target="_blank"
            rel="noreferrer"
            className="w-full py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'অ্যাকাউন্ট ভেরিফাই লিঙ্ক খুলুন' : 'Open Verification Link'}</span>
          </a>
        )}
      </div>
    </div>
  );
}

