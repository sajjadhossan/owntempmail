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
  AlertCircle
} from 'lucide-react';
import { Language } from '@/lib/translations';

interface AdminApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  lang: Language;
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
}: AdminApprovalModalProps) {
  const [users, setUsers] = useState<NeonUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    if (!currentUser?.email) return;
    setIsLoading(true);
    setStatusMsg(null);
    try {
      const res = await fetch(`/api/admin/users?requester=${encodeURIComponent(currentUser.email)}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setUsers(data.data.users || []);
      } else {
        setStatusMsg({ text: data.message || 'ব্যবহারকারী তালিকা লোড করা যায়নি', type: 'error' });
      }
    } catch (e: any) {
      setStatusMsg({ text: e.message || 'Network error fetching users', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Crown className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'সুপার অ্যাডমিন অনুমোদন ডেস্ক' : 'Super Admin Approval Desk'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Neon DB Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'bn' 
                  ? 'ব্যবহারকারীদের সাইন আপ আবেদন অনুমোদন ও প্রত্যাখ্যান করুন' 
                  : 'Approve or reject user registration requests'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={fetchUsers}
              disabled={isLoading}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition"
              title={lang === 'bn' ? 'রিফ্রেশ করুন' : 'Refresh list'}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMsg && (
          <div className={`px-4 py-2.5 text-xs font-semibold flex items-center space-x-2 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-300' 
              : 'bg-rose-500/15 border-b border-rose-500/30 text-rose-300'
          }`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="px-5 py-3 bg-slate-950/40 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex space-x-1.5 overflow-x-auto">
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {isLoading ? (
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
                            <span>{lang === 'bn' ? 'অনুমোদন (Approve)' : 'Approve'}</span>
                          </button>
                          <button
                            type="button"
                            disabled={isCurrentAction}
                            onClick={() => handleAction('reject', u)}
                            className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition shadow-sm flex items-center space-x-1 cursor-pointer"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>{lang === 'bn' ? 'বাতিল (Reject)' : 'Reject'}</span>
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
      </div>
    </div>
  );
}
