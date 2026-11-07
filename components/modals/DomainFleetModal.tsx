'use client';

import React from 'react';
import {
  Globe,
  Sparkles,
  Trash2,
  Check,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { DomainItem } from '@/lib/types';

interface DomainFleetModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  t: any;
  businessNameInput: string;
  setBusinessNameInput: (val: string) => void;
  businessTaglineInput: string;
  setBusinessTaglineInput: (val: string) => void;
  handleSaveBusinessProfile: (e: React.FormEvent) => void;
  newDomainInput: string;
  setNewDomainInput: (val: string) => void;
  handleAddDomain: (e: React.FormEvent) => void;
  domains: DomainItem[];
  selectedDomain: string;
  setSelectedDomain: (dom: string) => void;
  handleDeleteDomain: (id: string) => void;
  vercelLiveUrl: string;
  setVercelLiveUrl: (val: string) => void;
  integrationTab: 'auto' | 'manual';
  setIntegrationTab: (tab: 'auto' | 'manual') => void;
  cfApiToken: string;
  setCfApiToken: (val: string) => void;
  handleAutoSetupCloudflare: (e: React.FormEvent) => void;
  isSettingUpCf: boolean;
  cfSetupResult: string | null;
  cfSetupError: string | null;
  onActionSuccess: (msg: string) => void;
}

export default function DomainFleetModal({
  isOpen,
  onClose,
  lang,
  t,
  businessNameInput,
  setBusinessNameInput,
  businessTaglineInput,
  setBusinessTaglineInput,
  handleSaveBusinessProfile,
  newDomainInput,
  setNewDomainInput,
  handleAddDomain,
  domains,
  selectedDomain,
  setSelectedDomain,
  handleDeleteDomain,
  vercelLiveUrl,
  setVercelLiveUrl,
  integrationTab,
  setIntegrationTab,
  cfApiToken,
  setCfApiToken,
  handleAutoSetupCloudflare,
  isSettingUpCf,
  cfSetupResult,
  cfSetupError,
  onActionSuccess,
}: DomainFleetModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[92vh] h-full sm:h-auto min-h-[460px] flex flex-col shadow-2xl overflow-hidden">
        {/* Fixed Header */}
        <div className="flex-shrink-0 px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base text-slate-100">{t.businessSetupTitle}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 overscroll-contain">

        {/* Business Profile Card */}
        <form onSubmit={handleSaveBusinessProfile} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="text-xs font-bold text-indigo-300">🏢 {t.businessSetupTitle}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.businessNameLabel}</label>
              <input
                type="text"
                value={businessNameInput}
                onChange={(e) => setBusinessNameInput(e.target.value)}
                placeholder={t.businessNamePlaceholder}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">{t.businessTaglineLabel}</label>
              <input
                type="text"
                value={businessTaglineInput}
                onChange={(e) => setBusinessTaglineInput(e.target.value)}
                placeholder="e.g. Official Secure Mail Service"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
            >
              {t.saveBusiness}
            </button>
          </div>
        </form>

        {/* Add New Business Domain */}
        <form onSubmit={handleAddDomain} className="space-y-3">
          <div className="text-xs font-bold text-slate-300">➕ {t.addNewBusinessDomain}</div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDomainInput}
              onChange={(e) => setNewDomainInput(e.target.value)}
              placeholder={t.directDomainPlaceholder}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-indigo-500 font-mono"
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

        {/* Connected Business Domains List */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400">
            {lang === 'bn' ? 'যুক্ত থাকা বিজনেস ডোমেইনসমূহ (ক্লিক করে নির্বাচন করুন):' : 'Registered Business Domains (click to select):'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(domains || []).map((dom) => (
              <div
                key={dom.id}
                onClick={() => {
                  setSelectedDomain(dom.domain);
                  onActionSuccess(lang === 'bn' ? `ডোমেইন @${dom.domain} নির্বাচিত হয়েছে!` : `Selected domain @${dom.domain}`);
                }}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                  selectedDomain === dom.domain
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-200 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
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

        {/* DUAL INTEGRATION HUB: Cloudflare & Vercel */}
        <div className="border-t border-slate-800 pt-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{t.integrationHubTitle}</span>
            </span>
            <span className="text-xs font-mono text-indigo-400">Target: @{selectedDomain}</span>
          </div>

          {/* Vercel Website URL Input */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
            <label className="text-[11px] font-semibold text-slate-300 block">{t.vercelUrlLabel}</label>
            <div className="flex items-center space-x-2">
              <input
                type="url"
                value={vercelLiveUrl}
                onChange={(e) => setVercelLiveUrl(e.target.value)}
                placeholder={t.vercelUrlPlaceholder}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-indigo-200 font-mono outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${(vercelLiveUrl || '').replace(/\/+$/, '')}/api/inbound/webhook`);
                  onActionSuccess(lang === 'bn' ? 'ওয়েবহুক URL কপি হয়েছে!' : 'Webhook URL copied!');
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition"
              >
                {t.copy} Webhook
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">
              {t.generatedWebhookLabel} <span className="text-slate-400">{(vercelLiveUrl || '').replace(/\/+$/, '')}/api/inbound/webhook</span>
            </p>
          </div>

          {/* Method Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              type="button"
              onClick={() => setIntegrationTab('auto')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                integrationTab === 'auto'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t.tabAuto}</span>
            </button>
            <button
              type="button"
              onClick={() => setIntegrationTab('manual')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                integrationTab === 'manual'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t.tabManual}</span>
            </button>
          </div>

          {/* METHOD 1: 1-Click Auto Setup */}
          {integrationTab === 'auto' && (
            <div className="space-y-4">
              <form onSubmit={handleAutoSetupCloudflare} className="bg-slate-950 p-4 rounded-xl border border-indigo-500/30 space-y-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">
                    {lang === 'bn' ? 'টার্গেট ডোমেইন (ক্লাউডফ্লেয়ারে থাকা আপনার ডোমেইনের নাম)' : 'Target Domain (as listed in Cloudflare)'}
                  </label>
                  <input
                    type="text"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value.trim().toLowerCase())}
                    placeholder="যেমন: yourdomain.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-indigo-300 font-bold outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">{t.cfTokenLabel}</label>
                  <input
                    type="password"
                    value={cfApiToken}
                    onChange={(e) => setCfApiToken(e.target.value)}
                    placeholder={t.cfTokenPlaceholder}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSettingUpCf}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isSettingUpCf ? t.settingUp : t.btnAutoSetup}</span>
                </button>

                {cfSetupResult && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-1">
                    <div className="font-bold flex items-center space-x-1.5 text-emerald-400">
                      <Check className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'সেটআপ সফল হয়েছে!' : 'Setup Successful!'}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{cfSetupResult}</p>
                  </div>
                )}

                {cfSetupError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1">
                    <div className="font-bold flex items-center space-x-1.5 text-rose-400">
                      <AlertCircle className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'সেটআপ ব্যর্থ হয়েছে' : 'Setup Failed'}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{cfSetupError}</p>
                  </div>
                )}
              </form>

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

          {/* METHOD 2: Manual Setup */}
          {integrationTab === 'manual' && (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-indigo-300 flex items-center space-x-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span>{t.manualStepTitle}</span>
                </div>
                <p className="text-slate-400">{t.manualStep1}</p>
                <p className="text-slate-400">{t.manualStep2}</p>
                <p className="text-slate-400">{t.manualStep3}</p>
                <p className="text-slate-400">{t.manualStep4}</p>
              </div>

              {/* DNS Table */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">
                    {t.dnsRecordsFor} <span className="font-mono text-indigo-300">@{selectedDomain}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      const dnsText = `MX @ route1.mx.cloudflare.net (Priority 1)\nMX @ route2.mx.cloudflare.net (Priority 2)\nMX @ route3.mx.cloudflare.net (Priority 3)\nTXT @ v=spf1 include:_spf.mx.cloudflare.net ~all`;
                      navigator.clipboard.writeText(dnsText);
                      onActionSuccess(lang === 'bn' ? 'DNS কনফিগ কপি হয়েছে!' : 'DNS Config copied!');
                    }}
                    className="px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-indigo-300 text-[11px] font-medium border border-slate-700 transition"
                  >
                    {t.copyDnsConfig}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-500">
                        <th className="pb-1.5">Type</th>
                        <th className="pb-1.5">Name</th>
                        <th className="pb-1.5">Value / Server</th>
                        <th className="pb-1.5">Priority</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900 text-slate-300">
                      <tr>
                        <td className="py-1 text-emerald-400 font-bold">MX</td>
                        <td className="py-1">@</td>
                        <td className="py-1 text-indigo-200">route1.mx.cloudflare.net</td>
                        <td className="py-1">1</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-emerald-400 font-bold">MX</td>
                        <td className="py-1">@</td>
                        <td className="py-1 text-indigo-200">route2.mx.cloudflare.net</td>
                        <td className="py-1">2</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-emerald-400 font-bold">MX</td>
                        <td className="py-1">@</td>
                        <td className="py-1 text-indigo-200">route3.mx.cloudflare.net</td>
                        <td className="py-1">3</td>
                      </tr>
                      <tr>
                        <td className="py-1 text-amber-400 font-bold">TXT</td>
                        <td className="py-1">@</td>
                        <td className="py-1 text-slate-400">v=spf1 include:_spf.mx.cloudflare.net ~all</td>
                        <td className="py-1">-</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Copy Worker Button */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Cloudflare Email Worker Script</div>
                  <div className="text-[10px] text-slate-500 font-mono">cloudflare-worker/email-worker.js</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const workerCode = `import PostalMime from 'postal-mime';\nexport default {\n  async email(message, env, ctx) {\n    const rawEmail = await new Response(message.raw).arrayBuffer();\n    const parsed = await new PostalMime().parse(rawEmail);\n    await fetch('${(vercelLiveUrl || '').replace(/\/+$/, '')}/api/inbound/webhook', {\n      method: 'POST',\n      headers: { 'Content-Type': 'application/json' },\n      body: JSON.stringify({\n        to: message.to,\n        from: message.from,\n        senderName: parsed.from?.name || message.from,\n        subject: parsed.subject || '(No Subject)',\n        text: parsed.text || '',\n        html: parsed.html || parsed.text || '',\n      })\n    });\n  }\n};`;
                    navigator.clipboard.writeText(workerCode);
                    onActionSuccess(lang === 'bn' ? 'Worker স্ক্রিপ্ট কপি হয়েছে!' : 'Worker script copied!');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition"
                >
                  {t.copyWorkerCode}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer */}
        <div className="flex-shrink-0 px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end">
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

