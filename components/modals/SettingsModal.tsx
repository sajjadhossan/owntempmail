'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Sparkles,
  Globe,
  Send,
  ArrowLeftRight,
  ShieldCheck,
  Trash2,
  Check,
  AlertCircle,
  KeyRound,
  Search,
  Activity,
  Smartphone,
  Laptop,
  Apple,
  RefreshCw,
  Volume2,
  VolumeX,
  Download,
  User,
} from 'lucide-react';
import { DomainItem, TelegramConfig, BlueGreenConfig, DeploymentSlot } from '@/lib/types';
import { APP_VERSION, APP_EDITION } from '@/lib/constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settingsTab: string;
  setSettingsTab: (tab: any) => void;
  lang: string;
  t: any;

  // Tab 1: API & Cloudflare
  vercelLiveUrl: string;
  setVercelLiveUrl: (val: string) => void;
  selectedDomain: string;
  setSelectedDomain: (val: string) => void;
  cfApiToken: string;
  setCfApiToken: (val: string) => void;
  handleFetchCloudflareZones: () => void;
  isFetchingCfZones: boolean;
  cfZonesMsg: string | null;
  cfAvailableZones: any[];
  handleAutoSetupCloudflare: (e: React.FormEvent) => void;
  isSettingUpCf: boolean;
  cfSetupResult: string | null;
  cfSetupError: string | null;
  onCopyWebhook: () => void;

  // Tab 2: Domains & Business
  businessNameInput: string;
  setBusinessNameInput: (val: string) => void;
  businessTaglineInput: string;
  setBusinessTaglineInput: (val: string) => void;
  handleSaveBusinessProfile: (e: React.FormEvent) => void;
  newDomainInput: string;
  setNewDomainInput: (val: string) => void;
  handleAddDomain: (e: React.FormEvent) => void;
  domains: DomainItem[];
  handleDeleteDomain: (id: string) => void;

  // Tab 3: Telegram
  telegramConfig: TelegramConfig;
  setTelegramConfig: (val: TelegramConfig) => void;
  handleSaveTelegram: (e: React.FormEvent) => void;
  isSavingTelegram: boolean;
  handleTestTelegram: () => void;
  isTestingTelegram: boolean;
  telegramStatusMsg: { success: boolean; message: string } | null;

  // Tab: Deployment
  blueGreenConfig: BlueGreenConfig | null;
  handleProbeHealth: () => void;
  isProbingHealth: boolean;
  handleSwitchDeploymentSlot: (slot: DeploymentSlot, reason: string) => void;
  isSwitchingSlot: boolean;
  canarySlider: number;
  setCanarySlider: (val: number) => void;
  handleApplyCanarySplit: (val: number) => void;

  // Tab 4: General
  handleCheckVersion: () => void;
  isCheckingUpdate: boolean;
  updateStatus: string | null;
  handleClearBrowserCache: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  handleExportEmails: () => void;
  emailsCount: number;
  onActivateCustomEmail?: (email: string) => void;
  onOpenAuthModal?: () => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settingsTab,
  setSettingsTab,
  lang,
  t,
  vercelLiveUrl,
  setVercelLiveUrl,
  selectedDomain,
  setSelectedDomain,
  cfApiToken,
  setCfApiToken,
  handleFetchCloudflareZones,
  isFetchingCfZones,
  cfZonesMsg,
  cfAvailableZones,
  handleAutoSetupCloudflare,
  isSettingUpCf,
  cfSetupResult,
  cfSetupError,
  onCopyWebhook,
  businessNameInput,
  setBusinessNameInput,
  businessTaglineInput,
  setBusinessTaglineInput,
  handleSaveBusinessProfile,
  newDomainInput,
  setNewDomainInput,
  handleAddDomain,
  domains,
  handleDeleteDomain,
  telegramConfig,
  setTelegramConfig,
  handleSaveTelegram,
  isSavingTelegram,
  handleTestTelegram,
  isTestingTelegram,
  telegramStatusMsg,
  blueGreenConfig,
  handleProbeHealth,
  isProbingHealth,
  handleSwitchDeploymentSlot,
  isSwitchingSlot,
  canarySlider,
  setCanarySlider,
  handleApplyCanarySplit,
  handleCheckVersion,
  isCheckingUpdate,
  updateStatus,
  handleClearBrowserCache,
  soundEnabled,
  setSoundEnabled,
  handleExportEmails,
  emailsCount,
  onActivateCustomEmail,
  onOpenAuthModal,
}: SettingsModalProps) {
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookDiagnostic, setWebhookDiagnostic] = useState<any | null>(null);
  const [diagnosticError, setDiagnosticError] = useState<string | null>(null);

  // Cloudflare & Custom Domain Email Personalization State
  const [cfCustomPrefix, setCfCustomPrefix] = useState('sajjad');
  const [cfCustomDomain, setCfCustomDomain] = useState(selectedDomain || '');
  const [cfEmailActivatedToast, setCfEmailActivatedToast] = useState<string | null>(null);

  useEffect(() => {
    if (selectedDomain && (!cfCustomDomain || cfCustomDomain === 'owntemp.live')) {
      setCfCustomDomain(selectedDomain);
    }
  }, [selectedDomain, cfCustomDomain]);

  const handleRunWebhookDiagnostic = async () => {
    setIsTestingWebhook(true);
    setWebhookDiagnostic(null);
    setDiagnosticError(null);
    try {
      const res = await fetch('/api/cloudflare/test', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setWebhookDiagnostic(data.data);
      } else {
        setDiagnosticError(data.message || 'Diagnostic failed');
      }
    } catch (err: any) {
      setDiagnosticError(err?.message || 'Network error executing diagnostic probe');
    } finally {
      setIsTestingWebhook(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-indigo-500/30 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-slate-100">{t.settingsTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Master Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 gap-1 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setSettingsTab('api')}
            className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              settingsTab === 'api'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="truncate">{t.settingsTabApi}</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsTab('domains')}
            className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              settingsTab === 'domains'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="truncate">{t.settingsTabDomains}</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsTab('telegram')}
            className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              settingsTab === 'telegram'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-sky-400" />
            <span className="truncate">{t.settingsTabTelegram}</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsTab('deployment')}
            className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              settingsTab === 'deployment'
                ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-400" />
            <span className="truncate">{t.settingsTabDeployment}</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsTab('general')}
            className={`flex-1 min-w-[70px] py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              settingsTab === 'general'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span className="truncate">{t.settingsTabGeneral}</span>
          </button>
        </div>

        {/* TAB 1: CLOUDFLARE & API INTEGRATION */}
        {settingsTab === 'api' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1.5">
              <div className="font-bold text-indigo-300 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>{lang === 'bn' ? '💡 নির্দেশিকা: টার্গেট ডোমেইন বনাম Vercel URL' : '💡 Guide: Target Domain vs Vercel URL'}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {lang === 'bn' 
                  ? '• টার্গেট ডোমেইন: আপনার Cloudflare অ্যাকাউন্টে যুক্ত থাকা নিজস্ব কাস্টম ডোমেইন (যেমন: yourdomain.com)। এখানে কখনো vercel.app লিখবেন না।' 
                  : '• Target Domain: Your custom domain registered in Cloudflare (e.g. yourdomain.com). Never enter vercel.app here.'}
              </p>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {lang === 'bn' 
                  ? '• Vercel লাইভ URL: এটি আপনার ওয়েবসাইটের ঠিকানা (যেমন: https://owntempmail.vercel.app), যেখান থেকে ইনবক্স ইমেইল রিসিভ করে।' 
                  : '• Vercel Live URL: Your live website address (e.g. https://owntempmail.vercel.app), where inbound webhooks deliver emails.'}
              </p>
            </div>

            {/* Vercel Website URL Input */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">{t.vercelUrlLabel}</label>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={vercelLiveUrl}
                  onChange={(e) => setVercelLiveUrl(e.target.value)}
                  placeholder={t.vercelUrlPlaceholder}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-indigo-200 font-mono outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={onCopyWebhook}
                  className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
                >
                  {t.copy} Webhook
                </button>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">
                {t.generatedWebhookLabel} <span className="text-slate-400">{vercelLiveUrl.replace(/\/+$/, '')}/api/inbound/webhook</span>
              </p>
            </div>

            {/* Live Webhook Health & Diagnostic Tool */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'bn' ? 'ওয়েবহুক পাইপলাইন ও ওটিপি ডায়াগনস্টিক' : 'Live Webhook & OTP Diagnostic'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleRunWebhookDiagnostic}
                  disabled={isTestingWebhook}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
                >
                  <Activity className={`w-3.5 h-3.5 ${isTestingWebhook ? 'animate-spin' : ''}`} />
                  <span>
                    {isTestingWebhook
                      ? (lang === 'bn' ? 'পরীক্ষা চলছে...' : 'Probing...')
                      : (lang === 'bn' ? '⚡ ডায়াগনস্টিক টেস্ট চালান' : '⚡ Run Diagnostic Probe')}
                  </span>
                </button>
              </div>

              {webhookDiagnostic && (
                <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/30 text-xs space-y-2 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>{lang === 'bn' ? 'ইনবাউন্ড পাইপলাইন ১০০% কার্যকর!' : 'Inbound Pipeline 100% Operational'}</span>
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">
                      Latency: <b className="text-emerald-300">{webhookDiagnostic.latencyMs}ms</b>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                      <div className="text-slate-400">OTP Extractor</div>
                      <div className="font-mono font-bold text-white flex items-center space-x-1 mt-0.5">
                        <span className="text-emerald-400">✓</span>
                        <span>Code: {webhookDiagnostic.otpEngine?.parsedCode}</span>
                      </div>
                    </div>
                    <div className="p-2 rounded bg-slate-950/70 border border-slate-800">
                      <div className="text-slate-400">Link Detector</div>
                      <div className="font-mono font-bold text-white flex items-center space-x-1 mt-0.5">
                        <span className="text-emerald-400">✓</span>
                        <span>{webhookDiagnostic.linkExtractor?.verified ? 'Verified Active' : 'Active'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono truncate">
                    Storage: <span className="text-indigo-300">{webhookDiagnostic.storage?.backend}</span>
                  </div>
                </div>
              )}

              {diagnosticError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                  <span>{diagnosticError}</span>
                </div>
              )}
            </div>

            {/* Auto Setup Cloudflare Form */}
            <form onSubmit={handleAutoSetupCloudflare} className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{lang === 'bn' ? 'অটোমেটিক ক্লাউডফ্লেয়ার API সেটআপ' : '1-Click Cloudflare Automated Setup'}</span>
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {lang === 'bn' ? '১০০% ফ্রি' : '100% Free'}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  {lang === 'bn' ? '১. টার্গেট ডোমেইন (Cloudflare-এ থাকা আসল ডোমেইনের নাম):' : '1. Target Domain (as listed in Cloudflare):'}
                </label>
                <input
                  type="text"
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value.trim().toLowerCase())}
                  placeholder="যেমন: yourdomain.com"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 font-bold outline-none focus:border-indigo-500"
                  required
                />
                {selectedDomain.toLowerCase().includes('vercel.app') && (
                  <div className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/30 flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      {lang === 'bn' 
                        ? 'সাবধান: vercel.app হলো আপনার ওয়েবসাইট লিঙ্ক, এটি ক্লাউডফ্লেয়ার ডোমেইন নয়। ক্লাউডফ্লেয়ারে থাকা আপনার নিজস্ব ডোমেইন নাম লিখুন।' 
                        : 'Warning: vercel.app is your website URL, not a Cloudflare domain. Please enter your real Cloudflare custom domain.'}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300 block">
                  {lang === 'bn' ? '২. ক্লাউডফ্লেয়ার API টোকেন (API Token):' : '2. Cloudflare API Token:'}
                </label>
                <input
                  type="password"
                  value={cfApiToken}
                  onChange={(e) => setCfApiToken(e.target.value)}
                  placeholder={t.cfTokenPlaceholder}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
                  required
                />

                <div className="pt-1.5 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleFetchCloudflareZones}
                    disabled={isFetchingCfZones || !cfApiToken.trim()}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition disabled:opacity-50"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>
                      {isFetchingCfZones 
                        ? (lang === 'bn' ? 'ডোমেইন খোঁজা হচ্ছে...' : 'Fetching domains...') 
                        : (lang === 'bn' ? '🔍 ক্লাউডফ্লেয়ারে থাকা আমার ডোমেইনগুলো খুঁজুন' : '🔍 Fetch My Domains from Cloudflare')}
                    </span>
                  </button>
                </div>

                {cfZonesMsg && (
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1.5 mt-2">
                    <p className="text-[11px] font-semibold text-slate-300">{cfZonesMsg}</p>
                    {cfAvailableZones.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {cfAvailableZones.map((z) => (
                          <button
                            key={z.id}
                            type="button"
                            onClick={() => setSelectedDomain(z.name)}
                            className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition flex items-center space-x-1 ${
                              selectedDomain === z.name
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/20'
                            }`}
                          >
                            <span>@{z.name}</span>
                            <span className="text-[9px] text-emerald-300 uppercase">({z.status})</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSettingUpCf}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-yellow-300" />
                <span>{isSettingUpCf ? t.settingUp : (lang === 'bn' ? '⚡ এখনই অটোমেটিক ক্লাউডফ্লেয়ার সেটআপ করুন' : '⚡ Auto-Configure Cloudflare Now')}</span>
              </button>

              {cfSetupResult && (
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-emerald-400">
                    <Check className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'সেটআপ সফল হয়েছে!' : 'Setup Successful!'}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-line">{cfSetupResult}</p>
                </div>
              )}

              {cfSetupError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                  <div className="font-bold flex items-center space-x-1.5 text-rose-400">
                    <AlertCircle className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'সেটআপ ব্যর্থ হয়েছে' : 'Setup Failed'}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed whitespace-pre-line">{cfSetupError}</p>
                </div>
              )}
            </form>

            {/* Cloudflare Instant Custom Email Studio */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/70 via-slate-900 to-slate-950 border border-indigo-500/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="font-bold text-xs text-indigo-300 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <span>{lang === 'bn' ? '⚡ ক্লাউডফ্লেয়ার ডোমেইনে কাস্টম ইমেইল বানান' : '⚡ Create Custom Email on Cloudflare'}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {lang === 'bn' ? 'কাস্টম প্রিফিক্স' : 'Custom Prefix'}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                {lang === 'bn'
                  ? 'আপনার Cloudflare-এ যুক্ত ডোমেইনের অধীনে নিজের পছন্দের যেকোনো ইউজারনেম টাইপ করে ১-ক্লিকে ইনবক্স তৈরি ও চালু করুন।'
                  : 'Type any username under your Cloudflare domain to instantly launch your personalized inbox.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    {lang === 'bn' ? 'পছন্দের নাম (Username):' : 'Desired Username:'}
                  </label>
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 focus-within:border-indigo-500">
                    <span className="text-slate-500 font-mono text-xs mr-1">@</span>
                    <input
                      type="text"
                      value={cfCustomPrefix}
                      onChange={(e) => setCfCustomPrefix(e.target.value)}
                      placeholder="যেমন: sajjad, admin, ceo"
                      className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-600 w-full font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    {lang === 'bn' ? 'টার্গেট ডোমেইন:' : 'Target Domain:'}
                  </label>
                  <select
                    value={cfCustomDomain}
                    onChange={(e) => {
                      setCfCustomDomain(e.target.value);
                      setSelectedDomain(e.target.value);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
                  >
                    {selectedDomain && (
                      <option value={selectedDomain}>
                        @{selectedDomain} (Current)
                      </option>
                    )}
                    {cfAvailableZones.map((z) => (
                      <option key={`cf-zone-${z.id}`} value={z.name}>
                        @{z.name} (Cloudflare Zone)
                      </option>
                    ))}
                    {domains
                      .filter((d) => d.domain !== selectedDomain && !cfAvailableZones.some((z) => z.name === d.domain))
                      .map((d) => (
                        <option key={`dom-tab1-${d.id}`} value={d.domain}>
                          @{d.domain} {d.isCustom ? '(Custom)' : ''}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Quick Suggestions */}
              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 overflow-x-auto scrollbar-none pt-0.5">
                <span className="font-semibold text-slate-400 whitespace-nowrap">{lang === 'bn' ? 'আইডিয়া:' : 'Ideas:'}</span>
                {['sajjad', 'contact', 'admin', 'support', 'otp', 'service', 'dev'].map((p) => (
                  <button
                    key={`sug-${p}`}
                    type="button"
                    onClick={() => setCfCustomPrefix(p)}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-slate-700 font-mono transition"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Live Preview & Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 border-t border-slate-800/80">
                <div className="flex items-center space-x-2 font-mono text-xs">
                  <span className="text-slate-400">{lang === 'bn' ? 'ঠিকানা প্রিভিউ:' : 'Address Preview:'}</span>
                  <span className="px-2.5 py-1 rounded-md bg-indigo-500/15 text-indigo-200 border border-indigo-500/40 font-bold truncate max-w-[220px]">
                    {cfCustomPrefix.trim() || 'user'}@{cfCustomDomain || selectedDomain || 'domain.com'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const cleanP = cfCustomPrefix.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'user';
                    const targetD = cfCustomDomain || selectedDomain;
                    if (targetD && onActivateCustomEmail) {
                      onActivateCustomEmail(`${cleanP}@${targetD}`);
                      setCfEmailActivatedToast(`${cleanP}@${targetD}`);
                      setTimeout(() => {
                        onClose();
                      }, 400);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? '🚀 এই ইমেইলটি চালু করুন' : '🚀 Launch This Email'}</span>
                </button>
              </div>

              {cfEmailActivatedToast && (
                <div className="text-[11px] text-emerald-300 font-semibold text-center pt-1 animate-pulse">
                  ✅ {lang === 'bn' ? 'কাস্টম ইমেইল সেট হয়েছে এবং ইনবক্স চালু হচ্ছে!' : 'Custom email set! Loading inbox...'}
                </div>
              )}
            </div>

            {/* Token Guide */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                <span>{t.tokenStepTitle}</span>
              </div>
              <p className="text-slate-400">{t.tokenStep1}</p>
              <p className="text-slate-400">{t.tokenStep2}</p>
              <p className="text-slate-400">{t.tokenStep3}</p>
              <p className="text-slate-400">{t.tokenStep4}</p>
            </div>
          </div>
        )}

        {/* TAB 2: DOMAINS & BUSINESS PROFILE */}
        {settingsTab === 'domains' && (
          <div className="space-y-4">
            <form onSubmit={handleSaveBusinessProfile} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="font-bold text-xs text-slate-200 flex items-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t.businessSetupTitle}</span>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">{t.businessNameLabel}</label>
                <input
                  type="text"
                  value={businessNameInput}
                  onChange={(e) => setBusinessNameInput(e.target.value)}
                  placeholder="যেমন: My Brand Workspace"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">{t.businessTaglineLabel}</label>
                <input
                  type="text"
                  value={businessTaglineInput}
                  onChange={(e) => setBusinessTaglineInput(e.target.value)}
                  placeholder="যেমন: Disposable Temp Mail"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
              >
                {t.saveBusiness}
              </button>
            </form>

            <form onSubmit={handleAddDomain} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-200 block">{t.customDomainTitle}</span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDomainInput}
                  onChange={(e) => setNewDomainInput(e.target.value)}
                  placeholder={t.domainPlaceholder}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
                >
                  {t.addDomainBtn}
                </button>
              </div>
            </form>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">সক্রিয় ডোমেইনসমূহ (Active Domains):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {domains.map((dom) => (
                  <div
                    key={dom.id}
                    onClick={() => setSelectedDomain(dom.domain)}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition ${
                      selectedDomain === dom.domain
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="font-mono font-semibold text-slate-200 truncate">@{dom.domain}</div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {dom.businessName || (dom.isCustom ? 'Custom Business' : 'Default System')}
                      </div>
                    </div>
                    {dom.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDomain(dom.id);
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded transition"
                        title="Delete domain"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Launch Custom Email on Selected Domain */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-slate-950 to-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-2.5">
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-400">{lang === 'bn' ? 'নির্বাচিত ডোমেইন:' : 'Selected Domain:'}</span>
                <span className="font-mono font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">@{selectedDomain}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const cleanP = cfCustomPrefix.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'sajjad';
                  if (selectedDomain && onActivateCustomEmail) {
                    onActivateCustomEmail(`${cleanP}@${selectedDomain}`);
                    onClose();
                  }
                }}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>{lang === 'bn' ? `এই ডোমেইনে (${selectedDomain}) কাস্টম ইনবক্স খুলুন` : `Launch Inbox on @${selectedDomain}`}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: TELEGRAM REAL-TIME ALERTS */}
        {settingsTab === 'telegram' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-sky-950/40 border border-sky-500/30 text-xs space-y-1.5">
              <div className="font-bold text-sky-300 flex items-center space-x-1.5">
                <Send className="w-4 h-4 text-sky-400" />
                <span>{t.telegramTitle}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {t.telegramDesc}
              </p>
            </div>

            <form onSubmit={handleSaveTelegram} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {lang === 'bn' ? 'টেলিগ্রাম নোটিফিকেশন সক্রিয় করুন' : 'Enable Telegram Alerts'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {lang === 'bn' ? 'প্রতিটি নতুন ইমেইল বা ওটিপি আপনার টেলিগ্রামে পাঠাবে' : 'Stream incoming emails directly to Telegram'}
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={telegramConfig.enabled}
                    onChange={(e) => setTelegramConfig({ ...telegramConfig, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
                </label>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">{t.telegramBotToken}</label>
                <input
                  type="text"
                  value={telegramConfig.botToken}
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, botToken: e.target.value })}
                  placeholder="যেমন: 7123456789:AAHk... from @BotFather"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-sky-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">{t.telegramChatId}</label>
                <input
                  type="text"
                  value={telegramConfig.chatId}
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, chatId: e.target.value })}
                  placeholder="যেমন: 123456789 বা @yourchannel"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="otpOnlyCheck"
                  checked={telegramConfig.notifyOnOtpOnly}
                  onChange={(e) => setTelegramConfig({ ...telegramConfig, notifyOnOtpOnly: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-800 text-sky-500 focus:ring-0"
                />
                <label htmlFor="otpOnlyCheck" className="text-xs text-slate-300 cursor-pointer">
                  {t.telegramOtpOnly}
                </label>
              </div>

              {telegramStatusMsg && (
                <div
                  className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                    telegramStatusMsg.success
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                  }`}
                >
                  {telegramStatusMsg.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                  <span>{telegramStatusMsg.message}</span>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleTestTelegram}
                  disabled={isTestingTelegram || !telegramConfig.botToken || !telegramConfig.chatId}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 text-xs font-semibold transition disabled:opacity-50"
                >
                  {isTestingTelegram ? (lang === 'bn' ? 'টেস্ট হচ্ছে...' : 'Testing...') : t.testTelegram}
                </button>
                <button
                  type="submit"
                  disabled={isSavingTelegram}
                  className="flex-1 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/30 transition disabled:opacity-50"
                >
                  {isSavingTelegram ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : t.saveTelegram}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB: BLUE-GREEN DEPLOYMENT */}
        {settingsTab === 'deployment' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-emerald-950/40 border border-blue-500/30 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="font-bold text-slate-100 flex items-center space-x-1.5">
                  <ArrowLeftRight className="w-4 h-4 text-emerald-400" />
                  <span>{t.deploymentTitle}</span>
                </div>
                <button
                  type="button"
                  onClick={handleProbeHealth}
                  disabled={isProbingHealth}
                  className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-700 flex items-center space-x-1 transition"
                >
                  <Activity className={`w-3.5 h-3.5 text-emerald-400 ${isProbingHealth ? 'animate-spin' : ''}`} />
                  <span>{isProbingHealth ? 'চেক হচ্ছে...' : 'লাইভ হেলথ চেক'}</span>
                </button>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {t.deploymentDesc}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Blue Slot */}
              <div
                className={`p-4 rounded-xl border space-y-3 transition ${
                  blueGreenConfig?.activeSlot === 'blue'
                    ? 'bg-blue-950/20 border-blue-500/50 shadow-lg shadow-blue-500/10'
                    : 'bg-slate-950 border-slate-800 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
                    <span className="font-bold text-sm text-blue-300">🔵 Blue Slot</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      blueGreenConfig?.activeSlot === 'blue'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {blueGreenConfig?.blue.trafficWeight || 0}% Traffic
                  </span>
                </div>

                <div className="text-xs space-y-1 font-mono text-slate-400">
                  <div><span className="text-slate-500">Version:</span> <b className="text-slate-200">{blueGreenConfig?.blue.version || 'v2.4.0-blue'}</b></div>
                  <div><span className="text-slate-500">Endpoint:</span> <span className="text-indigo-300 truncate">{blueGreenConfig?.blue.url}</span></div>
                  <div className="flex items-center space-x-3 pt-1 text-[11px]">
                    <span>Latency: <b className="text-emerald-400">{blueGreenConfig?.blue.healthMetrics.latencyMs || 12}ms</b></span>
                    <span>Uptime: <b className="text-emerald-400">{blueGreenConfig?.blue.healthMetrics.uptimePercent || 99.99}%</b></span>
                  </div>
                </div>

                {blueGreenConfig?.activeSlot !== 'blue' && (
                  <button
                    type="button"
                    onClick={() => handleSwitchDeploymentSlot('blue', 'Manual cutover/rollback to Blue')}
                    disabled={isSwitchingSlot}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {isSwitchingSlot ? 'সুইচ হচ্ছে...' : '🔵 Blue স্লটে রোলব্যাক করুন'}
                  </button>
                )}
              </div>

              {/* Green Slot */}
              <div
                className={`p-4 rounded-xl border space-y-3 transition ${
                  blueGreenConfig?.activeSlot === 'green'
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-500/10'
                    : 'bg-slate-950 border-slate-800 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-sm text-emerald-300">🟢 Green Slot</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                      blueGreenConfig?.activeSlot === 'green'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {blueGreenConfig?.green.trafficWeight || 0}% Traffic
                  </span>
                </div>

                <div className="text-xs space-y-1 font-mono text-slate-400">
                  <div><span className="text-slate-500">Version:</span> <b className="text-slate-200">{blueGreenConfig?.green.version || 'v2.4.0-green'}</b></div>
                  <div><span className="text-slate-500">Endpoint:</span> <span className="text-emerald-300 truncate">{blueGreenConfig?.green.url}</span></div>
                  <div className="flex items-center space-x-3 pt-1 text-[11px]">
                    <span>Latency: <b className="text-emerald-400">{blueGreenConfig?.green.healthMetrics.latencyMs || 14}ms</b></span>
                    <span>Uptime: <b className="text-emerald-400">{blueGreenConfig?.green.healthMetrics.uptimePercent || 100}%</b></span>
                  </div>
                </div>

                {blueGreenConfig?.activeSlot !== 'green' && (
                  <button
                    type="button"
                    onClick={() => handleSwitchDeploymentSlot('green', 'Zero-downtime release cutover to Green')}
                    disabled={isSwitchingSlot}
                    className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
                  >
                    {isSwitchingSlot ? 'সুইচ হচ্ছে...' : '🟢 Green স্লটে ট্রাফিক পরিবর্তন করুন'}
                  </button>
                )}
              </div>
            </div>

            {/* Canary Routing */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">{t.canaryLabel}</span>
                <span className="font-mono text-indigo-400 font-bold">
                  🔵 {100 - canarySlider}% Blue / 🟢 {canarySlider}% Green
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={canarySlider}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setCanarySlider(val);
                  handleApplyCanarySplit(val);
                }}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <p className="text-[11px] text-slate-500">
                {lang === 'bn' 
                  ? 'ক্যানারি মোড ব্যবহার করে নতুন রিলিজের কার্যকারিতা যাচাই করতে ট্রাফিকের নির্দিষ্ট শতাংশ (যেমন: ১০% বা ২৫%) স্ট্যান্ডবাই স্লটে পাঠানো যায়।'
                  : 'Canary split lets you safely route a small portion of live traffic (e.g. 10%) to test staging releases before full cutover.'}
              </p>
            </div>

            {/* Audit Log */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 block">{lang === 'bn' ? 'ডিপ্লয়মেন্ট সুইচ ইতিহাস (Audit Log):' : 'Cutover Audit Trail:'}</span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {blueGreenConfig?.switchHistory && blueGreenConfig.switchHistory.length > 0 ? (
                  blueGreenConfig.switchHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] flex items-center justify-between font-mono"
                    >
                      <div>
                        <span className="text-slate-300 font-bold">
                          {item.fromSlot.toUpperCase()} ➔ {item.toSlot.toUpperCase()}
                        </span>
                        <span className="text-slate-500 text-[10px] ml-2">({item.reason})</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">
                        {new Date(item.switchedAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-3 text-center">No cutover events yet</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: GENERAL & DOWNLOADS */}
        {settingsTab === 'general' && (
          <div className="space-y-4">
            {/* Account & Profile Hub */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">{lang === 'bn' ? 'অ্যাকাউন্ট ও ডিভাইস সিঙ্ক' : 'Account & Device Sync'}</div>
                  <div className="text-[11px] text-slate-400">
                    {lang === 'bn' ? 'সকল ডিভাইসে একই ইনবক্স ব্যবহার করতে লগইন বা সাইন আপ করুন।' : 'Sign in or register to sync inboxes across all your devices.'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition whitespace-nowrap cursor-pointer text-center"
              >
                {lang === 'bn' ? 'লগইন / সাইন আপ' : 'Sign In / Sign Up'}
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-200">Owntemp Engine</div>
                  <div className="text-xs text-indigo-400 font-mono">Current Version: {APP_VERSION} ({APP_EDITION})</div>
                </div>
                <button
                  type="button"
                  onClick={handleCheckVersion}
                  disabled={isCheckingUpdate}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition"
                >
                  {isCheckingUpdate ? t.checkingUpdate : t.checkUpdate}
                </button>
              </div>
              {updateStatus && (
                <div className="text-xs text-emerald-400 font-medium pt-1 border-t border-slate-900">
                  {updateStatus}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-slate-300">{t.platformsTitle}</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <a
                  href="https://github.com/sajjadhossan/owntempmail/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 flex flex-col items-center text-center space-y-1.5 group transition"
                >
                  <Smartphone className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition" />
                  <span className="text-xs font-semibold text-slate-200">Android APK</span>
                  <span className="text-[10px] text-slate-500 font-mono">v1.5.0</span>
                </a>

                <a
                  href="https://github.com/sajjadhossan/owntempmail/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500/50 flex flex-col items-center text-center space-y-1.5 group transition"
                >
                  <Laptop className="w-5 h-5 text-blue-400 group-hover:scale-110 transition" />
                  <span className="text-xs font-semibold text-slate-200">Windows PC</span>
                  <span className="text-[10px] text-slate-500 font-mono">x64 .exe</span>
                </a>

                <a
                  href="https://github.com/sajjadhossan/owntempmail/releases/latest"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/50 flex flex-col items-center text-center space-y-1.5 group transition"
                >
                  <Apple className="w-5 h-5 text-purple-400 group-hover:scale-110 transition" />
                  <span className="text-xs font-semibold text-slate-200">macOS</span>
                  <span className="text-[10px] text-slate-500 font-mono">Intel & M-Chip</span>
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  <span>{lang === 'bn' ? 'ব্রাউজার ক্যাশ ও সিডিএন স্ট্যাটাস' : 'Browser Cache & CDN Status'}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  ⚡ Active
                </span>
              </div>
              <div className="text-[11px] text-slate-400 space-y-1">
                <p>• <b>Cloudflare & Vercel Edge CDN:</b> {lang === 'bn' ? '২৪ ঘণ্টার গ্লোবাল এজ ক্যাশিং এবং ব্রোটলি কম্প্রেশন সক্রিয়।' : '24h global Edge CDN caching & Brotli compression active.'}</p>
                <p>• <b>ব্রাউজার মেমোরি ক্যাশ:</b> {lang === 'bn' ? '৫০,০০০+ ডোমেন এক ক্লিকে 0ms ইনস্ট্যান্ট স্পিডে রেন্ডার হয়।' : '50,000+ domains render with 0ms instant speed from browser cache.'}</p>
                <p>• <b>ইনবক্স ও ওটিপি:</b> {lang === 'bn' ? 'সম্পূর্ণ রিয়েল-টাইম ও লাইভ (Strict No-Cache Policy)।' : 'Strict Zero-Cache policy for real-time OTP delivery.'}</p>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleClearBrowserCache}
                  className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-sky-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-sky-400" />
                  <span>{lang === 'bn' ? 'ব্রাউজার ক্যাশ ক্লিয়ার করুন' : 'Clear Browser Cache'}</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-medium flex items-center justify-center space-x-2 transition"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>{soundEnabled ? t.soundOn : t.soundOff}</span>
              </button>

              <button
                type="button"
                onClick={handleExportEmails}
                disabled={emailsCount === 0}
                className="flex-1 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 font-medium flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'bn' ? 'সব ইমেইল ব্যাকআপ (JSON)' : 'Export All (JSON)'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
}

