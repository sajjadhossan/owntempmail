'use client';

import React, { useState, useEffect } from 'react';
import { Share2, X, Check, AlertCircle, Shield, Globe, Send, Sparkles } from 'lucide-react';
import { ForwardingRule } from '@/lib/types';

interface ForwardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEmail: string;
  onSaveSuccess: (msg: string) => void;
  lang: string;
}

export default function ForwardingModal({
  isOpen,
  onClose,
  activeEmail,
  onSaveSuccess,
  lang,
}: ForwardingModalProps) {
  const [type, setType] = useState<'discord' | 'slack' | 'webhook' | 'email'>('discord');
  const [destination, setDestination] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [otpOnly, setOtpOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !activeEmail) return;

    // Fetch existing rule
    fetch(`/api/inbox/forward?address=${encodeURIComponent(activeEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setType(data.data.type || 'discord');
          setDestination(data.data.destination || '');
          setEnabled(Boolean(data.data.enabled));
          setOtpOnly(Boolean(data.data.otpOnly));
        }
      })
      .catch(() => {});
  }, [isOpen, activeEmail]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enabled && !destination.trim()) {
      setErrorMsg(
        lang === 'bn'
          ? 'ফরওয়ার্ডিং সক্রিয় করতে গন্তব্য URL বা ইমেইল প্রদান করুন।'
          : 'Destination Webhook URL or Email is required when forwarding is enabled.'
      );
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/inbox/forward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inboxAddress: activeEmail,
          enabled,
          type,
          destination,
          otpOnly,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSaveSuccess(
          lang === 'bn'
            ? '✅ SimpleLogin স্টাইল ফরোয়ার্ডিং রুল সংরক্ষিত হয়েছে!'
            : '✅ SimpleLogin-style forwarding rule saved successfully!'
        );
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to save forwarding rule');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error saving rule');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100 flex items-center space-x-1.5">
                <span>{lang === 'bn' ? 'অটো-ফরোয়ার্ডিং ও ওয়েবহুক রিলে' : 'Auto-Forwarding & Webhook Relay'}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono border border-purple-800 uppercase">
                  SimpleLogin Style
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono truncate max-w-xs">{activeEmail}</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Destination Type Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              {lang === 'bn' ? 'গন্তব্য নির্বাচন করুন:' : 'Select Destination Channel:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setType('discord')}
                className={`p-2 rounded-xl border text-xs font-semibold transition flex flex-col items-center justify-center space-y-1 ${
                  type === 'discord'
                    ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Discord</span>
              </button>
              <button
                type="button"
                onClick={() => setType('slack')}
                className={`p-2 rounded-xl border text-xs font-semibold transition flex flex-col items-center justify-center space-y-1 ${
                  type === 'slack'
                    ? 'bg-amber-600/30 text-amber-200 border-amber-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Slack</span>
              </button>
              <button
                type="button"
                onClick={() => setType('webhook')}
                className={`p-2 rounded-xl border text-xs font-semibold transition flex flex-col items-center justify-center space-y-1 ${
                  type === 'webhook'
                    ? 'bg-cyan-600/30 text-cyan-200 border-cyan-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>HTTP Webhook</span>
              </button>
              <button
                type="button"
                onClick={() => setType('email')}
                className={`p-2 rounded-xl border text-xs font-semibold transition flex flex-col items-center justify-center space-y-1 ${
                  type === 'email'
                    ? 'bg-emerald-600/30 text-emerald-200 border-emerald-500 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>Email Fwd</span>
              </button>
            </div>
          </div>

          {/* Destination URL or Email Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-300 block">
              {type === 'email'
                ? (lang === 'bn' ? 'আসল জিমেইল বা ইমেইল ঠিকানা:' : 'Destination Email Address:')
                : (lang === 'bn' ? `${type.toUpperCase()} Webhook URL:` : `${type.toUpperCase()} Webhook URL:`)}
            </label>
            <input
              type={type === 'email' ? 'email' : 'url'}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={
                type === 'discord'
                  ? 'https://discord.com/api/webhooks/...'
                  : type === 'slack'
                  ? 'https://hooks.slack.com/services/...'
                  : type === 'email'
                  ? 'myrealemail@gmail.com'
                  : 'https://myserver.com/webhook'
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-200 outline-none focus:border-purple-500 transition"
            />
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-1 border-t border-slate-800/80">
            <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-600"
              />
              <span className="font-semibold">
                {lang === 'bn' ? 'রিয়েল-টাইম ফরোয়ার্ডিং সক্রিয় করুন' : 'Enable Real-Time Forwarding Relay'}
              </span>
            </label>

            <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-400">
              <input
                type="checkbox"
                checked={otpOnly}
                onChange={(e) => setOtpOnly(e.target.checked)}
                className="w-4 h-4 rounded accent-purple-600"
              />
              <span>
                {lang === 'bn'
                  ? '🔒 কেবল ওটিপি (OTP-Only) ফরোয়ার্ড করুন (প্রাইভেসি মোড)'
                  : '🔒 Forward OTP Code Only (Zero-Spam Privacy Mode)'}
              </span>
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

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
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-lg shadow-purple-600/30"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isLoading ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'সেভ করুন' : 'Save Rule')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
