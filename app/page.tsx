'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Mail,
  Lock,
  Unlock,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Globe,
  Send,
  ShieldCheck,
  KeyRound,
  ExternalLink,
  Trash2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Eye,
  QrCode,
  Download,
  Volume2,
  VolumeX,
  Search,
  Filter,
  Bookmark,
  Layers,
} from 'lucide-react';
import { EmailRecord, InboxMetadata, DomainItem } from '@/lib/types';
import { translations, Language } from '@/lib/translations';
import { generateQrSvgUri } from '@/lib/qr';

export default function OwntempHome() {
  const [lang, setLang] = useState<Language>('bn');
  const t = translations[lang];

  // Address & Domain state
  const [usernamePrefix, setUsernamePrefix] = useState('demo-user');
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('owntemp.live');
  const [activeEmail, setActiveEmail] = useState('demo-user@owntemp.live');

  // Inbox & Emails
  const [inboxMeta, setInboxMeta] = useState<InboxMetadata | null>(null);
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [lockedInboxes, setLockedInboxes] = useState<InboxMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailRecord | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'otp'>('all');

  // Sound settings
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Auto-refresh timer
  const [countdown, setCountdown] = useState(10);

  // Modals
  const [showLockModal, setShowLockModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  // Form states
  const [lockPin, setLockPin] = useState('');
  const [unlockPin, setUnlockPin] = useState('');
  const [newDomainInput, setNewDomainInput] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Simulator Form
  const [simSender, setSimSender] = useState('security@google.com');
  const [simSubject, setSimSubject] = useState('Google Verification Code / গুগল যাচাইকরণ কোড');
  const [simOtp, setSimOtp] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);

  // Play audio chime when new email arrives
  const playChime = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15); // E6
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // AudioContext policy fallback
    }
  }, [soundEnabled]);

  // Load available domains
  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetch('/api/domains');
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setDomains(data.data);
        if (!selectedDomain) {
          setSelectedDomain(data.data[0].domain);
        }
      }
    } catch (err) {
      console.error('Failed to load domains', err);
    }
  }, [selectedDomain]);

  // Load locked inboxes list
  const fetchLockedInboxes = useCallback(async () => {
    try {
      const res = await fetch('/api/inbox/locked');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setLockedInboxes(data.data);
      }
    } catch (err) {
      console.error('Failed to load locked inboxes', err);
    }
  }, []);

  // Fetch emails for current inbox
  const fetchEmails = useCallback(
    async (targetAddress: string, silent = false) => {
      if (!silent) setIsLoading(true);
      setActionError(null);
      try {
        const res = await fetch(`/api/inbox/${encodeURIComponent(targetAddress)}`);
        const data = await res.json();
        if (data.success) {
          const newEmails: EmailRecord[] = data.data.emails || [];
          setEmails((prev) => {
            if (prev.length > 0 && newEmails.length > prev.length) {
              playChime();
            }
            return newEmails;
          });
          setInboxMeta(data.data.inbox || null);
        }
      } catch (err: any) {
        console.error('Failed to fetch emails', err);
      } finally {
        if (!silent) setIsLoading(false);
      }
    },
    [playChime]
  );

  // Initial load
  useEffect(() => {
    fetchDomains();
    fetchLockedInboxes();

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const initialPrefix = `user_${randomSuffix}`;
    setUsernamePrefix(initialPrefix);
    const full = `${initialPrefix}@owntemp.live`;
    setActiveEmail(full);
    fetchEmails(full);
  }, [fetchDomains, fetchEmails, fetchLockedInboxes]);

  // Countdown auto-refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchEmails(activeEmail, true);
          return 10;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeEmail, fetchEmails]);

  // Switch to custom username and domain
  const handleApplyAddress = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPrefix = usernamePrefix.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (!cleanPrefix) return;
    const newAddress = `${cleanPrefix}@${selectedDomain}`;
    setActiveEmail(newAddress);
    fetchEmails(newAddress);
    setActionSuccess(lang === 'bn' ? 'সক্রিয় ইনবক্স পরিবর্তন করা হয়েছে!' : 'Active inbox updated successfully!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Switch directly to a locked inbox
  const handleSelectLockedInbox = (address: string) => {
    const parts = address.split('@');
    if (parts.length === 2) {
      setUsernamePrefix(parts[0]);
      setSelectedDomain(parts[1]);
    }
    setActiveEmail(address);
    fetchEmails(address);
    setActionSuccess(lang === 'bn' ? `লক করা ইনবক্স (${address}) সক্রিয় করা হয়েছে!` : `Switched to locked inbox: ${address}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Generate random alias
  const handleGenerateRandom = () => {
    const words = ['alpha', 'swift', 'temp', 'spark', 'cloud', 'nexus', 'pro', 'inbox', 'secure'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(10000 + Math.random() * 90000);
    const randomUser = `${word}${num}`;
    setUsernamePrefix(randomUser);
    const newAddr = `${randomUser}@${selectedDomain}`;
    setActiveEmail(newAddr);
    fetchEmails(newAddr);
  };

  // Copy email
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(activeEmail);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Copy OTP code
  const handleCopyOtp = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedOtp(code);
    setTimeout(() => setCopiedOtp(null), 2000);
  };

  // Handle Lock Lifetime
  const handleLockLifetime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockPin || lockPin.length < 4) {
      setActionError(lang === 'bn' ? 'পিন অবশ্যই অন্তত ৪ ডিজিটের হতে হবে।' : 'PIN must be at least 4 digits.');
      return;
    }

    try {
      const res = await fetch('/api/inbox/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeEmail, pin: lockPin }),
      });
      const data = await res.json();
      if (data.success) {
        setShowLockModal(false);
        setLockPin('');
        setActionSuccess(lang === 'bn' ? 'ইনবক্সটি আজীবনের জন্য লক করা হয়েছে!' : 'Inbox permanently locked for lifetime!');
        fetchEmails(activeEmail);
        fetchLockedInboxes();
      } else {
        setActionError(data.message || 'Failed to lock');
      }
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Handle Unlock
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockPin) return;

    try {
      const res = await fetch('/api/inbox/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeEmail, pin: unlockPin }),
      });
      const data = await res.json();
      if (data.success) {
        setShowUnlockModal(false);
        setUnlockPin('');
        setActionSuccess(lang === 'bn' ? 'ইনবক্স সফলভাবে আনলক হয়েছে।' : 'Inbox unlocked successfully.');
        fetchEmails(activeEmail);
        fetchLockedInboxes();
      } else {
        setActionError(data.message || 'Unlock failed');
      }
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Add custom domain
  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomainInput.trim()) return;

    try {
      const res = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomainInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNewDomainInput('');
        fetchDomains();
        setSelectedDomain(data.data.domain);
        setActionSuccess(lang === 'bn' ? 'কাস্টম ডোমেইন যুক্ত হয়েছে!' : 'Custom domain added successfully!');
        setTimeout(() => setShowDomainModal(false), 1200);
      } else {
        setActionError(data.message);
      }
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Send simulated test email
  const handleSimulateInbound = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setActionError(null);

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: activeEmail,
          from: simSender,
          subject: simSubject,
          otp: simOtp.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowSimModal(false);
        setSimOtp('');
        setActionSuccess(t.successSim);
        fetchEmails(activeEmail);
      } else {
        setActionError(data.message);
      }
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Download Email as Text
  const handleDownloadTxt = (email: EmailRecord) => {
    const content = `From: ${email.senderName || ''} <${email.sender}>\nTo: ${email.address}\nDate: ${email.receivedAt}\nSubject: ${email.subject}\nOTP: ${email.otpCode || 'None'}\n\n${email.textBody}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email_${email.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download Email as EML
  const handleDownloadEml = (email: EmailRecord) => {
    const eml = [
      `From: "${email.senderName || email.sender}" <${email.sender}>`,
      `To: <${email.address}>`,
      `Subject: ${email.subject}`,
      `Date: ${new Date(email.receivedAt).toUTCString()}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/html; charset=utf-8`,
      ``,
      email.htmlBody || `<pre>${email.textBody}</pre>`,
    ].join('\r\n');

    const blob = new Blob([eml], { type: 'message/rfc822;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `email_${email.id}.eml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filtered emails
  const filteredEmails = useMemo(() => {
    return emails.filter((item) => {
      if (filterMode === 'otp' && !item.otpCode) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.subject.toLowerCase().includes(q) ||
        item.sender.toLowerCase().includes(q) ||
        (item.senderName && item.senderName.toLowerCase().includes(q)) ||
        (item.otpCode && item.otpCode.includes(q)) ||
        item.textBody.toLowerCase().includes(q)
      );
    });
  }, [emails, filterMode, searchQuery]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  {t.appTitle}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v1.1.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {lang === 'bn' ? 'কাস্টম ডোমেইন ও লাইফটাইম লক সুবিধাযুক্ত ফ্রি টেম্প মেইল' : 'Free Custom Domain Temp Mail with Lifetime Lock'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border text-xs transition ${
                soundEnabled
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
              title={soundEnabled ? t.soundOn : t.soundOff}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Custom Domain Button */}
            <button
              onClick={() => setShowDomainModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'ডোমেইন' : 'Domains'}</span>
            </button>

            {/* Simulator Trigger */}
            <button
              onClick={() => setShowSimModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
              <span>{lang === 'bn' ? 'টেস্ট সিমুলেটর' : 'Simulator'}</span>
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 transition"
              title="Toggle Language"
            >
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        {/* Alerts */}
        {actionSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center space-x-3 transition">
            <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>{actionSuccess}</span>
          </div>
        )}
        {actionError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-3 transition">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Hero Section: Active Address & Control Panel */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80 p-6 md:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-indigo-400 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  <span>{t.yourEmail}</span>
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  {inboxMeta?.isLocked
                    ? (lang === 'bn' ? '🔒 এই ইনবক্সটি আজীবনের জন্য সুরক্ষিত ও লক করা আছে।' : '🔒 This inbox is locked permanently for lifetime protection.')
                    : (lang === 'bn' ? 'যেকোনো ওয়েবসাইট, অ্যাপ বা রেজিস্ট্রেশনে এই ঠিকানা ব্যবহার করুন।' : 'Ready to receive instant emails, OTPs, and verification links.')}
                </p>
              </div>

              {/* Status Badge */}
              <div className="flex items-center space-x-2">
                {inboxMeta?.isLocked ? (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>{t.lockedForever}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{lang === 'bn' ? 'সক্রিয় ডিসপোজেবল' : 'Active Disposable'}</span>
                  </span>
                )}

                {/* QR Code Trigger */}
                <button
                  onClick={() => setShowQrModal(true)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition"
                  title="Show QR Code"
                >
                  <QrCode className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Email Address Display Box */}
            <div className="flex flex-col md:flex-row items-stretch gap-3">
              <div className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between shadow-inner">
                <span className="font-mono text-lg md:text-xl font-bold tracking-wide text-indigo-200 truncate select-all">
                  {activeEmail}
                </span>
                <button
                  onClick={handleCopyEmail}
                  className={`ml-3 px-4 py-2 rounded-lg font-semibold text-xs flex items-center space-x-2 transition ${
                    copiedText
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                  }`}
                >
                  {copiedText ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{t.copied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>{t.copy}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchEmails(activeEmail)}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 font-medium text-xs flex items-center justify-center space-x-2 transition"
                  title="Manual Refresh"
                >
                  <RefreshCw className={`w-4 h-4 text-slate-300 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
                  <span className="hidden sm:inline">{t.refresh}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({countdown}s)</span>
                </button>

                {inboxMeta?.isLocked ? (
                  <button
                    onClick={() => setShowUnlockModal(true)}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/30 text-amber-300 font-medium text-xs flex items-center justify-center space-x-2 transition"
                  >
                    <Unlock className="w-4 h-4 text-amber-400" />
                    <span>{t.unlock}</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setShowLockModal(true)}
                    className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-medium text-xs flex items-center justify-center space-x-2 transition"
                    title="Lock forever with a PIN"
                  >
                    <Lock className="w-4 h-4 text-indigo-400" />
                    <span>{t.lockLifetime}</span>
                  </button>
                )}

                <button
                  onClick={handleGenerateRandom}
                  className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium text-xs flex items-center justify-center space-x-2 transition"
                  title="Random Address"
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span className="hidden sm:inline">{t.random}</span>
                </button>
              </div>
            </div>

            {/* Custom Alias & Domain Bar */}
            <form onSubmit={handleApplyAddress} className="pt-3 border-t border-slate-800/60 flex flex-col sm:flex-row items-center gap-3">
              <div className="w-full sm:w-auto flex-1 flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 focus-within:border-indigo-500 transition">
                <span className="text-slate-500 font-mono text-sm mr-1">@</span>
                <input
                  type="text"
                  value={usernamePrefix}
                  onChange={(e) => setUsernamePrefix(e.target.value)}
                  placeholder={t.enterPrefix}
                  className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 w-full font-mono"
                />
              </div>

              <div className="w-full sm:w-auto flex items-center space-x-2">
                <select
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-indigo-500 font-mono w-full sm:w-auto"
                >
                  {domains.map((dom) => (
                    <option key={dom.id} value={dom.domain}>
                      @{dom.domain} {dom.isCustom ? '(Custom)' : ''}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition whitespace-nowrap"
                >
                  {t.applyAddress}
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Permanent Locked Inboxes Quick Switcher Tray (New in v1.1.0) */}
        {lockedInboxes.length > 0 && (
          <section className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.savedInboxes}</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                  {lockedInboxes.length}
                </span>
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {lockedInboxes.map((meta) => {
                const isActive = meta.address.toLowerCase() === activeEmail.toLowerCase();
                return (
                  <button
                    key={meta.address}
                    onClick={() => handleSelectLockedInbox(meta.address)}
                    className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition border ${
                      isActive
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>{meta.address}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-sans">
                      {meta.totalEmails}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Inbound Emails Feed */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-200">
                {lang === 'bn' ? 'ইনবক্স মেসেজ' : 'Inbox Messages'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                {filteredEmails.length}
              </span>
            </div>

            {/* Filter Pills & Auto Refresh countdown */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    filterMode === 'all'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.filterAll}
                </button>
                <button
                  onClick={() => setFilterMode('otp')}
                  className={`px-2.5 py-1 rounded-md transition ${
                    filterMode === 'otp'
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {t.filterOtpOnly}
                </button>
              </div>

              <span className="text-xs text-slate-500 hidden sm:inline">
                {t.autoRefreshIn} <b className="text-indigo-400 font-mono">{countdown}</b>{t.seconds}
              </span>
            </div>
          </div>

          {/* Search Bar */}
          {emails.length > 0 && (
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
              />
            </div>
          )}

          {/* Messages List or Empty State */}
          {filteredEmails.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-12 text-center space-y-4">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
                <div className="relative w-16 h-16 rounded-full bg-slate-900 border border-indigo-500/30 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-indigo-400" />
                </div>
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-semibold text-slate-200">{t.waitingMails}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.waitingSub}</p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setShowSimModal(true)}
                  className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'একটি টেস্ট ইমেইল পাঠিয়ে পরীক্ষা করুন' : 'Simulate Test Inbound Email'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className="group relative rounded-xl border border-slate-800 hover:border-indigo-500/50 bg-slate-900/40 hover:bg-slate-900/90 p-4 md:p-5 transition cursor-pointer space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
                        {(email.senderName || email.sender).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-200 group-hover:text-indigo-300 transition">
                          {email.senderName || email.sender}
                        </div>
                        <div className="text-xs text-slate-400 font-mono truncate max-w-xs">
                          {email.sender}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 font-mono">
                      {new Date(email.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="font-medium text-slate-100 text-sm">
                    {email.subject}
                  </div>

                  {/* Detected OTP Highlight Chip */}
                  {email.otpCode && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyOtp(email.otpCode!);
                      }}
                      className="inline-flex items-center space-x-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/40 hover:border-indigo-400 transition"
                      title="Click to copy OTP code"
                    >
                      <KeyRound className="w-4 h-4 text-yellow-400 animate-pulse" />
                      <span className="text-xs text-indigo-300 font-medium">
                        {t.otpDetected}:
                      </span>
                      <span className="font-mono text-base font-extrabold tracking-widest text-white px-2 py-0.5 rounded bg-slate-950/80 border border-indigo-500/30">
                        {email.otpCode}
                      </span>
                      <span className="text-[11px] font-semibold text-indigo-400 flex items-center space-x-1">
                        {copiedOtp === email.otpCode ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">{t.copied}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>{t.copyOtp}</span>
                          </>
                        )}
                      </span>
                    </div>
                  )}

                  {/* Verification Links */}
                  {email.verificationLinks && email.verificationLinks.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-2">
                      {email.verificationLinks.slice(0, 1).map((link, idx) => (
                        <a
                          key={idx}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>{t.openLink}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Email Reader Modal */}
      {selectedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-start justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-100">{selectedEmail.subject}</h3>
                <p className="text-xs text-slate-400 mt-1">
                  <b>{t.from}:</b> {selectedEmail.senderName} ({selectedEmail.sender})
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  <b>{t.received}:</b> {new Date(selectedEmail.receivedAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedEmail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            {/* OTP Banner inside reader if available */}
            {selectedEmail.otpCode && (
              <div className="bg-indigo-950/60 border-b border-indigo-900/50 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <KeyRound className="w-5 h-5 text-yellow-400" />
                  <div>
                    <div className="text-xs font-medium text-indigo-300">{t.otpDetected}</div>
                    <div className="font-mono text-2xl font-bold tracking-widest text-white">
                      {selectedEmail.otpCode}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleCopyOtp(selectedEmail.otpCode!)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition"
                >
                  {copiedOtp === selectedEmail.otpCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedOtp === selectedEmail.otpCode ? t.copied : t.copyOtp}</span>
                </button>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {selectedEmail.htmlBody ? (
                <div
                  className="prose prose-invert max-w-none text-sm bg-slate-950 p-4 rounded-xl border border-slate-800"
                  dangerouslySetInnerHTML={{ __html: selectedEmail.htmlBody }}
                />
              ) : (
                <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap bg-slate-950 p-4 rounded-xl border border-slate-800">
                  {selectedEmail.textBody}
                </pre>
              )}
            </div>

            {/* Modal Footer with Export options */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadEml(selectedEmail)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t.exportEml}</span>
                </button>
                <button
                  onClick={() => handleDownloadTxt(selectedEmail)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.exportTxt}</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedEmail(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-semibold text-slate-200 transition"
              >
                {t.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal (New in v1.1.0) */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl text-center">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100">{t.qrModalTitle}</h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">{t.qrScanDesc}</p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex justify-center">
              <img
                src={generateQrSvgUri(`mailto:${activeEmail}`)}
                alt="Email QR Code"
                className="w-48 h-48 rounded-lg"
              />
            </div>

            <div className="font-mono text-xs text-indigo-300 bg-slate-950 px-3 py-2 rounded-lg truncate border border-slate-800">
              {activeEmail}
            </div>

            <button
              onClick={() => {
                handleCopyEmail();
                setShowQrModal(false);
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              {t.copy}
            </button>
          </div>
        </div>
      )}

      {/* Lifetime Lock Modal */}
      {showLockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-slate-100">{t.lockModalTitle}</h3>
              <p className="text-xs text-slate-400">{t.lockModalDesc}</p>
            </div>

            <form onSubmit={handleLockLifetime} className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  {t.enterPin}
                </label>
                <input
                  type="password"
                  maxLength={8}
                  value={lockPin}
                  onChange={(e) => setLockPin(e.target.value)}
                  placeholder="e.g. 7492"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-widest text-slate-100 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowLockModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
                >
                  {t.confirmLock}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Unlock Modal */}
      {showUnlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              <Unlock className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-lg text-slate-100">{t.unlock}</h3>
              <p className="text-xs text-slate-400">{t.enterUnlockPin}</p>
            </div>

            <form onSubmit={handleUnlock} className="space-y-4 pt-2">
              <div>
                <input
                  type="password"
                  maxLength={8}
                  value={unlockPin}
                  onChange={(e) => setUnlockPin(e.target.value)}
                  placeholder="PIN"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-center text-lg font-mono tracking-widest text-slate-100 outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUnlockModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold transition"
                >
                  {t.confirmUnlock}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Domain Modal */}
      {showDomainModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Globe className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-slate-100">{t.customDomainTitle}</h3>
              </div>
              <button onClick={() => setShowDomainModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">{t.customDomainDesc}</p>

            <form onSubmit={handleAddDomain} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  placeholder={t.domainPlaceholder}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 outline-none focus:border-indigo-500 font-mono"
                  required
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                >
                  {t.addDomainBtn}
                </button>
              </div>
            </form>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-indigo-300">{t.dnsGuideTitle}</div>
              <p className="text-slate-400">{t.dnsGuideStep1}</p>
              <p className="text-slate-400">{t.dnsGuideStep2}</p>
              <p className="text-slate-400">{t.dnsGuideStep3}</p>
            </div>

            <div className="space-y-1.5 pt-2">
              <div className="text-xs font-semibold text-slate-400">
                {lang === 'bn' ? 'বর্তমান ডোমেইনসমূহ:' : 'Current Domains:'}
              </div>
              <div className="flex flex-wrap gap-2">
                {domains.map((dom) => (
                  <span
                    key={dom.id}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-800 border border-slate-700 text-slate-300"
                  >
                    @{dom.domain} {dom.isCustom ? '⭐' : ''}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simulator Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-base text-slate-100">{t.quickSimulateTitle}</h3>
              </div>
              <button onClick={() => setShowSimModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? `বর্তমান সক্রিয় ইনবক্স (${activeEmail}) এর জন্য টেস্ট ইমেইল প্রেরণ করুন এবং ওটিপি এক্সট্রাকশন দেখুন।`
                : `Send a simulated live email to active inbox (${activeEmail}) to test instant OTP extraction.`}
            </p>

            <form onSubmit={handleSimulateInbound} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">{t.simSender}</label>
                <input
                  type="text"
                  value={simSender}
                  onChange={(e) => setSimSender(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">{t.simSubject}</label>
                <input
                  type="text"
                  value={simSubject}
                  onChange={(e) => setSimSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">{t.simOtp}</label>
                <input
                  type="text"
                  value={simOtp}
                  onChange={(e) => setSimOtp(e.target.value)}
                  placeholder="যেমন: 849201 (ফাঁকা রাখলে স্বয়ংক্রিয় জেনারেট হবে)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSimulating ? t.sending : t.sendTestBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <b>Owntemp</b> &copy; 2026 — {lang === 'bn' ? 'আজীবন ফ্রি ডিসপোজেবল ইমেইল ইঞ্জিন' : 'Lifetime Free Disposable Email Engine'}
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-indigo-400">API: /api/inbound/webhook</span>
            <span>•</span>
            <span className="font-mono text-slate-400">Version 1.1.0</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
