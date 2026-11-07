'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  UserCheck, 
  UserX, 
  Trash2, 
  RefreshCw, 
  X, 
  Crown, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle,
  Globe,
  Plus,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import { Language } from '@/lib/translations';
import { DomainItem } from '@/lib/types';

interface AdminApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  lang: Language;
  domains?: DomainItem[];
  selectedDomain?: string;
  setSelectedDomain?: (dom: string) => void;
  handleAddDomain?: (e: React.FormEvent) => void;
  handleDeleteDomain?: (id: string) => void;
  newDomainInput?: string;
  setNewDomainInput?: (val: string) => void;
  vercelLiveUrl?: string;
}

interface NeonUser {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean | null;
  banReason: string | null;
  createdAt: string;
}

export default function AdminApprovalModal({
  isOpen,
  onClose,
  currentUser,
  lang,
  domains = [],
  selectedDomain = 'owntemp.live',
  setSelectedDomain,
  handleAddDomain,
  handleDeleteDomain,
  newDomainInput = '',
  setNewDomainInput,
  vercelLiveUrl = '',
}: AdminApprovalModalProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'domains'>('users');
  const [users, setUsers] = useState<NeonUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const fetchUsers = async () => {
    if (!currentUser?.email) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/admin/users?requester=${encodeURIComponent(currentUser.email)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data.users || []);
      } else {
        setStatusMsg({ text: data.message || (lang === 'bn' ? 'ব্যবহারকারী তালিকা লোড করা যায়নি' : 'Failed to fetch users'), type: 'error' });
      }
    } catch (e: any) {
      setStatusMsg({ text: e.message || 'Network error fetching users', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (currentUser?.email) {
        fetchUsers();
      } else {
        setIsLoading(false);
      }
    }
  }, [isOpen, currentUser?.email]);

  if (!isOpen) return null;

  const handleAction = async (action: 'approve' | 'reject' | 'delete' | 'make_admin', targetUser: NeonUser) => {
    setActionLoadingId(targetUser.id);
    setStatusMsg(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requester: currentUser.email,
          action,
          targetUserId: targetUser.id,
          targetEmail: targetUser.email,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ text: data.message, type: 'success' });
        await fetchUsers();
      } else {
        setStatusMsg({ text: data.message || 'Operation failed', type: 'error' });
      }
    } catch (e: any) {
      setStatusMsg({ text: e.message || 'Request error', type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const isPending = u.role === 'pending' || (u.banned && u.banReason?.includes('Pending'));
    const isRejected = u.role === 'rejected' || (u.banned && u.banReason?.includes('Rejected'));
    const isApproved = u.role === 'approved' || u.role === 'super_admin' || u.role === 'admin';

    if (filter === 'pending') return isPending;
    if (filter === 'rejected') return isRejected;
    if (filter === 'approved') return isApproved;
    return true;
  });

  const pendingCount = users.filter((u) => u.role === 'pending' || (u.banned && u.banReason?.includes('Pending'))).length;
  const webhookUrl = `${(vercelLiveUrl || '').replace(/\/+$/, '')}/api/inbound/webhook`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] h-full sm:h-auto min-h-[460px]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'সুপার অ্যাডমিন নিয়ন্ত্রণ ডেস্ক' : 'Super Admin Control Desk'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Neon DB Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'bn' 
                  ? 'ব্যবহারকারী অনুমোদন ও সেন্ট্রাল ডোমেইন কন্ট্রোল' 
                  : 'Manage user access and central domain fleet'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {activeTab === 'users' && (
              <button
                type="button"
                onClick={fetchUsers}
                disabled={isLoading}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
                title={lang === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh list'}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Primary Navigation Tabs */}
        <div className="px-5 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center justify-between flex-shrink-0">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'users'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ইউজার অনুমোদন' : 'User Approvals'}</span>
              {pendingCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'users' ? 'bg-black text-amber-300' : 'bg-amber-500/30 text-amber-300'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('domains')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'domains'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-800/70 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'ডোমেইন কন্ট্রোল' : 'Domain Fleet'}</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-500/30 text-indigo-300">
                {(domains || []).length}
              </span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`px-4 py-2.5 text-xs font-semibold flex items-center space-x-2 flex-shrink-0 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/15 border-b border-rose-500/30 text-rose-300'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* TAB 1: USER APPROVALS */}
        {activeTab === 'users' && (
          <>
            {/* Filter Sub-Tabs */}
            <div className="px-5 py-2.5 bg-slate-950/30 border-b border-slate-800/60 flex items-center justify-between flex-shrink-0">
              <div className="flex space-x-1.5 overflow-x-auto scrollbar-none">
                <button
                  type="button"
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    filter === 'pending'
                      ? 'bg-amber-500 text-slate-950 font-extrabold shadow-sm'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</span>
                  {pendingCount > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      filter === 'pending' ? 'bg-black text-amber-300' : 'bg-amber-500/30 text-amber-300'
                    }`}>
                      {pendingCount}
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setFilter('approved')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    filter === 'approved'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilter('rejected')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    filter === 'rejected'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'বাতিল' : 'Rejected'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    filter === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {lang === 'bn' ? 'সকল ব্যবহারকারী' : 'All Users'} ({users.length})
                </button>
              </div>
            </div>

            {/* User Table / List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 overscroll-contain">
              {!currentUser?.email ? (
                <div className="py-12 text-center space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">
                    {lang === 'bn' 
                      ? 'সুপার অ্যাডমিন ডেস্কে প্রবেশ করতে অনুগ্রহ করে প্রথমে অ্যাডমিন অ্যাকাউন্টে লগইন করুন।' 
                      : 'Please sign in with a super admin account to access user approval desk.'}
                  </p>
                </div>
              ) : isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-400 animate-spin" />
                  <p className="text-xs text-slate-400 font-mono">নিওন ডেটাবেস থেকে ইউজার লোড হচ্ছে...</p>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-800/60 flex items-center justify-center mx-auto text-slate-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">
                    {filter === 'pending'
                      ? (lang === 'bn' ? 'বর্তমানে কোনো অপেক্ষমাণ (Pending) আবেদন নেই!' : 'No pending approval requests!')
                      : (lang === 'bn' ? 'এই তালিকায় কোনো ব্যবহারকারী পাওয়া যায়নি।' : 'No users found in this filter.')}
                  </p>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const isSuper = u.role === 'super_admin' || u.email === 'hossansajjad1994@gmail.com';
                  const isPending = u.role === 'pending' || (u.banned && u.banReason?.includes('Pending'));
                  const isRejected = u.role === 'rejected' || (u.banned && u.banReason?.includes('Rejected'));
                  const isApproved = u.role === 'approved' || u.role === 'admin' || isSuper;
                  const isCurrentAction = actionLoadingId === u.id;

                  return (
                    <div
                      key={u.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                        isPending
                          ? 'bg-amber-950/20 border-amber-500/40'
                          : isRejected
                          ? 'bg-rose-950/20 border-rose-500/30'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      {/* User info */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-white">{u.name || 'Anonymous User'}</span>
                          {isSuper && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1">
                              <Crown className="w-3 h-3" />
                              <span>SUPER ADMIN</span>
                            </span>
                          )}
                          {isPending && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{lang === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}</span>
                            </span>
                          )}
                          {isApproved && !isSuper && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{lang === 'bn' ? 'অনুমোদিত' : 'Approved'}</span>
                            </span>
                          )}
                          {isRejected && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center space-x-1">
                              <XCircle className="w-3 h-3" />
                              <span>{lang === 'bn' ? 'বাতিলকৃত' : 'Rejected'}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono">
                          <span>{u.email}</span>
                          <span>•</span>
                          <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions for this user */}
                      {!isSuper && (
                        <div className="flex items-center space-x-2 self-end sm:self-center">
                          {isPending && (
                            <>
                              <button
                                type="button"
                                disabled={isCurrentAction}
                                onClick={() => handleAction('approve', u)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1 cursor-pointer"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>{lang === 'bn' ? 'অনুমোদন' : 'Approve'}</span>
                              </button>
                              <button
                                type="button"
                                disabled={isCurrentAction}
                                onClick={() => handleAction('reject', u)}
                                className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1 cursor-pointer"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>{lang === 'bn' ? 'বাতিল' : 'Reject'}</span>
                              </button>
                            </>
                          )}

                          {isApproved && (
                            <button
                              type="button"
                              disabled={isCurrentAction}
                              onClick={() => handleAction('reject', u)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-600/30 text-rose-300 border border-slate-700 hover:border-rose-500/40 text-xs font-semibold transition cursor-pointer"
                              title={lang === 'bn' ? 'প্রবেশাধিকার বন্ধ করুন' : 'Revoke Access'}
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {isRejected && (
                            <button
                              type="button"
                              disabled={isCurrentAction}
                              onClick={() => handleAction('approve', u)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1 cursor-pointer"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{lang === 'bn' ? 'পুনঃ অনুমোদন' : 'Re-Approve'}</span>
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={isCurrentAction}
                            onClick={() => {
                              if (confirm(lang === 'bn' ? `আপনি কি নিশ্চিতভাবে ${u.email} ইউজারকে ডেটাবেস থেকে মুছে ফেলতে চান?` : `Are you sure you want to delete ${u.email}?`)) {
                                handleAction('delete', u);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
                            title={lang === 'bn' ? 'ইউজার মুছে ফেলুন' : 'Delete user'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* TAB 2: DOMAIN CONTROL DESK */}
        {activeTab === 'domains' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 overscroll-contain">
            {/* Add Domain Card */}
            {handleAddDomain && setNewDomainInput && (
              <form onSubmit={handleAddDomain} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                  <Plus className="w-4 h-4 text-indigo-400" />
                  <span>{lang === 'bn' ? 'নতুন কাস্টম বা বিজনেস ডোমেইন যুক্ত করুন' : 'Add New Custom or Business Domain'}</span>
                </span>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs">@</span>
                    <input
                      type="text"
                      value={newDomainInput}
                      onChange={(e) => setNewDomainInput(e.target.value)}
                      placeholder="e.g. sajjadmail.com, company.net"
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-indigo-200 font-mono outline-none focus:border-indigo-500"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition flex items-center space-x-1 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{lang === 'bn' ? 'যুক্ত করুন' : 'Add Domain'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* Active Registered Domains */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Globe className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'bn' ? 'সক্রিয় ডোমেইনসমূহ (Active Domains):' : 'Active Registered Domains:'}</span>
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {lang === 'bn' ? 'বর্তমান সিলেক্টেড:' : 'Selected:'} <span className="text-indigo-400 font-bold">@{selectedDomain}</span>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(domains || []).map((dom) => (
                  <div
                    key={dom.id}
                    onClick={() => setSelectedDomain && setSelectedDomain(dom.domain)}
                    className={`p-3 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition ${
                      selectedDomain === dom.domain
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="truncate mr-2">
                      <div className="font-mono font-bold text-slate-200 truncate flex items-center space-x-1.5">
                        <span>@{dom.domain}</span>
                        {selectedDomain === dom.domain && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate mt-0.5">
                        {dom.businessName || (dom.isCustom ? 'Custom Enterprise' : 'System Default')}
                      </div>
                    </div>

                    {dom.isCustom && handleDeleteDomain && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(lang === 'bn' ? `আপনি কি @${dom.domain} ডোমেইনটি মুছে ফেলতে চান?` : `Delete domain @${dom.domain}?`)) {
                            handleDeleteDomain(dom.id);
                          }
                        }}
                        className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-950/30 transition"
                        title={lang === 'bn' ? 'ডোমেইন মুছুন' : 'Delete domain'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Cloudflare Inbound Webhook Endpoint */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <Layers className="w-4 h-4 text-sky-400" />
                  <span>{lang === 'bn' ? 'ইনবাউন্ড ক্লাউডফ্লেয়ার ওটিপি রিসিভার এন্ডপয়েন্ট' : 'Inbound Cloudflare OTP Webhook'}</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">200 OK Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={webhookUrl}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-indigo-300 font-mono outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(webhookUrl)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center space-x-1"
                >
                  {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedWebhook ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি' : 'Copy')}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-500">
                {lang === 'bn' 
                  ? 'এই URL টি আপনার ক্লাউডফ্লেয়ার ইমেইল ওয়ার্কারে সেট করা থাকলে যেকোনো কাস্টম ডোমেইনের ওটিপি তাৎক্ষণিকভাবে অ্যাপে চলে আসবে।' 
                  : 'Target endpoint for Cloudflare Email Worker to forward all incoming OTPs instantly.'}
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950/70 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
          >
            {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
