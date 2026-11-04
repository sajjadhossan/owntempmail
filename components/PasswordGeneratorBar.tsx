'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { KeyRound, Copy, Check, RefreshCw, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

interface PasswordGeneratorBarProps {
  onCopySuccess: (msg: string) => void;
  triggerHaptic?: (ms?: number) => void;
  lang: string;
}

export default function PasswordGeneratorBar({
  onCopySuccess,
  triggerHaptic,
  lang,
}: PasswordGeneratorBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [copied, setCopied] = useState(false);

  const generatePassword = useCallback(() => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+~|}{[]:;?><,.-=';

    let pool = lower + upper;
    if (includeNumbers) pool += numbers;
    if (includeSymbols) pool += symbols;

    // Secure cryptographic random generation
    let result = '';
    const array = new Uint32Array(length);
    if (typeof window !== 'undefined' && window.crypto) {
      window.crypto.getRandomValues(array);
      for (let i = 0; i < length; i++) {
        result += pool[array[i] % pool.length];
      }
    } else {
      for (let i = 0; i < length; i++) {
        result += pool[Math.floor(Math.random() * pool.length)];
      }
    }

    setPassword(result);
  }, [length, includeSymbols, includeNumbers]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const handleCopy = () => {
    if (!password) return;
    if (triggerHaptic) triggerHaptic(40);
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopySuccess(
      lang === 'bn' ? '🔑 সুরক্ষিত পাসওয়ার্ড কপি হয়েছে!' : '🔑 Secure password copied to clipboard!'
    );
  };

  // Password strength calculation
  const getStrength = () => {
    if (length >= 16 && includeSymbols && includeNumbers) return { label: 'Ultra Strong', color: 'bg-emerald-500 text-emerald-300' };
    if (length >= 12) return { label: 'Strong', color: 'bg-indigo-500 text-indigo-300' };
    return { label: 'Moderate', color: 'bg-amber-500 text-amber-300' };
  };

  const strength = getStrength();

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden transition shadow-sm">
      {/* Toggle Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-800/40 transition"
      >
        <div className="flex items-center space-x-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
            <KeyRound className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
              <span>{lang === 'bn' ? '১-ক্লিকে স্ট্রং পাসওয়ার্ড জেনারেটর' : '1-Click Strong Password Tool'}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono border border-indigo-800 uppercase">
                Sign-up Assistant
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              {lang === 'bn'
                ? 'যেকোনো ওয়েবসাইটে সাইন-আপ করার জন্য সাথে সাথে সুরক্ষিত পাসওয়ার্ড পান'
                : 'Instantly generate matching secure passwords for new website registrations'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {/* Expandable Password Generator Body */}
      {isOpen && (
        <div className="p-3.5 pt-0 border-t border-slate-800/60 space-y-3 animate-in fade-in duration-150">
          {/* Generated Password Display Box */}
          <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 gap-2">
            <span className="font-mono text-sm md:text-base font-bold text-indigo-300 tracking-wider truncate select-all px-1">
              {password}
            </span>

            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={generatePassword}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                title={lang === 'bn' ? 'নতুন তৈরি করুন' : 'Generate New'}
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি' : 'Copy')}</span>
              </button>
            </div>
          </div>

          {/* Controls: Length & Toggles */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-400">
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span>{lang === 'bn' ? 'দৈর্ঘ্য:' : 'Length:'}</span>
              <input
                type="range"
                min="8"
                max="32"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value, 10))}
                className="w-28 accent-indigo-500"
              />
              <span className="font-mono font-bold text-slate-200">{length}</span>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                <span>0-9</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded accent-indigo-500"
                />
                <span>!@#$</span>
              </label>

              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-semibold ${strength.color}`}>
                {strength.label}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

