'use client';

import React, { useState } from 'react';
import { Send, Reply, X, Check, AlertCircle } from 'lucide-react';

interface ReplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromAddress: string;
  toAddress: string;
  defaultSubject: string;
  onSentSuccess: (message: string) => void;
  lang: string;
}

export default function ReplyModal({
  isOpen,
  onClose,
  fromAddress,
  toAddress,
  defaultSubject,
  onSentSuccess,
  lang,
}: ReplyModalProps) {
  const [recipient, setRecipient] = useState(toAddress);
  const [subject, setSubject] = useState(defaultSubject.startsWith('Re:') ? defaultSubject : `Re: ${defaultSubject}`);
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg(lang === 'bn' ? 'দয়া করে মেসেজ লিখুন' : 'Please type your message');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/inbox/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: fromAddress,
          to: recipient,
          subject,
          body: message,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSentSuccess(
          lang === 'bn'
            ? `ইমেইলটি ${recipient}-এ সফলভাবে পাঠানো হয়েছে!`
            : `Email successfully dispatched to ${recipient}!`
        );
        onClose();
      } else {
        setErrorMsg(data.message || 'Failed to dispatch email');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Network error while dispatching email');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-150">
      <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Reply className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-base text-slate-100">
              {lang === 'bn' ? 'ডিসপোজেবল রিপ্লাই পাঠান' : 'Send Disposable Reply'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* From Address */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              {lang === 'bn' ? 'প্রেরক (আপনার বর্তমান টেম্প মেইল):' : 'From (Your Disposable Mail):'}
            </label>
            <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs font-mono text-indigo-300 select-all">
              {fromAddress}
            </div>
          </div>

          {/* To Address */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              {lang === 'bn' ? 'প্রাপক ইমেইল:' : 'To Recipient:'}
            </label>
            <input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Subject */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              {lang === 'bn' ? 'বিষয় (Subject):' : 'Subject:'}
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Message Body */}
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              {lang === 'bn' ? 'আপনার বার্তা (Message):' : 'Message Body:'}
            </label>
            <textarea
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={lang === 'bn' ? 'এখানে আপনার মেসেজ লিখুন...' : 'Write your response here...'}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 outline-none focus:border-indigo-500 resize-none font-sans"
              required
            />
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              {lang === 'bn' ? 'বাতিল' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isSending
                  ? (lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...')
                  : (lang === 'bn' ? 'রিপ্লাই পাঠান' : 'Send Reply')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

