'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User, Check, AlertCircle, Sparkles, ShieldCheck, KeyRound, ArrowRight, ArrowLeft } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { translations, Language } from '@/lib/translations';

interface LoginGateProps {
  lang: Language;
  onToggleLang: () => void;
  onAuthSuccess: (user: any, rememberMe: boolean) => void;
}

export default function LoginGate({ lang, onToggleLang, onAuthSuccess }: LoginGateProps) {
  const t = translations[lang];

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg(lang === 'bn' ? 'সঠিক ইমেইল অ্যাড্রেস লিখুন।' : 'Please enter a valid email address.');
      setIsLoading(false);
      return;
    }

    if (mode === 'forgot') {
      // Forgot Password handling
      try {
        if (isSupabaseConfigured) {
          const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail);
          if (error) throw error;
          setSuccessMsg(
            lang === 'bn'
              ? 'আপনার ইমেইলে পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে! ইনবক্স চেক করুন।'
              : 'Password reset link sent to your email! Please check your inbox.'
          );
        } else {
          // Local account password reset simulation & update
          let accounts: Array<{ id: string; email: string; passwordHash: string; name?: string }> = [];
          try {
            const saved = localStorage.getItem('owntemp_auth_accounts');
            if (saved) accounts = JSON.parse(saved);
          } catch (e) {}

          const target = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
          if (!target) {
            throw new Error(
              lang === 'bn'
                ? 'এই ইমেইলে কোনো রেজিস্টার্ড অ্যাকাউন্ট পাওয়া যায়নি।'
                : 'No registered account found with this email.'
            );
          }

          // If new password provided during forgot reset
          if (password.length >= 6) {
            target.passwordHash = btoa(password);
            localStorage.setItem('owntemp_auth_accounts', JSON.stringify(accounts));
            setSuccessMsg(
              lang === 'bn'
                ? 'আপনার পাসওয়ার্ড সফলভাবে রিসেট ও পরিবর্তন করা হয়েছে! এখন লগইন করুন।'
                : 'Password has been successfully reset! You can now sign in.'
            );
            setTimeout(() => setMode('signin'), 1500);
          } else {
            setSuccessMsg(
              lang === 'bn'
                ? 'অ্যাকাউন্ট ভেরিফাইড! নিচে আপনার নতুন পাসওয়ার্ড লিখে "রিসেট করুন" চাপুন।'
                : 'Account verified! Enter your new password below and click Reset.'
            );
          }
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'Password reset request failed.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Validation for Sign In & Sign Up
    if (password.length < 6) {
      setErrorMsg(lang === 'bn' ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' : 'Password must be at least 6 characters.');
      setIsLoading(false);
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMsg(t.passwordsDoNotMatch);
      setIsLoading(false);
      return;
    }

    try {
      if (isSupabaseConfigured) {
        if (mode === 'signup') {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: { display_name: name.trim() || cleanEmail.split('@')[0] },
            },
          });
          if (error) throw error;
          if (data.user) {
            setSuccessMsg(lang === 'bn' ? 'অ্যাকাউন্ট তৈরি সফল হয়েছে! স্বাগতম।' : 'Account created successfully! Welcome.');
            setTimeout(() => {
              onAuthSuccess(data.user, rememberMe);
            }, 600);
          }
        } else {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          if (error) throw error;
          if (data.user) {
            setSuccessMsg(lang === 'bn' ? 'সফলভাবে লগইন হয়েছে!' : 'Signed in successfully!');
            setTimeout(() => {
              onAuthSuccess(data.user, rememberMe);
            }, 500);
          }
        }
      } else {
        // Resilient persistent local account database
        let accounts: Array<{ id: string; email: string; passwordHash: string; name?: string; created_at: string }> = [];
        try {
          const savedAccs = localStorage.getItem('owntemp_auth_accounts');
          if (savedAccs) accounts = JSON.parse(savedAccs);
        } catch (e) {}

        if (mode === 'signup') {
          const existing = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
          if (existing) {
            throw new Error(
              lang === 'bn'
                ? 'এই ইমেইল দিয়ে আগেই অ্যাকাউন্ট খোলা আছে। দয়া করে লগইন করুন।'
                : 'Account already exists with this email. Please sign in.'
            );
          }

          const newUser = {
            id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            email: cleanEmail,
            name: name.trim() || cleanEmail.split('@')[0],
            passwordHash: btoa(password),
            created_at: new Date().toISOString(),
          };

          accounts.push(newUser);
          try {
            localStorage.setItem('owntemp_auth_accounts', JSON.stringify(accounts));
          } catch (e) {}

          setSuccessMsg(lang === 'bn' ? 'অ্যাকাউন্ট তৈরি সফল হয়েছে!' : 'Account created successfully!');
          setTimeout(() => {
            onAuthSuccess(
              { id: newUser.id, email: newUser.email, name: newUser.name, created_at: newUser.created_at },
              rememberMe
            );
          }, 600);
        } else {
          // Sign In
          const userAcc = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
          if (!userAcc) {
            // First-time guest auto-onboarding or invalid email
            if (accounts.length === 0) {
              // Create the user's master account instantly
              const masterUser = {
                id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                email: cleanEmail,
                name: cleanEmail.split('@')[0],
                passwordHash: btoa(password),
                created_at: new Date().toISOString(),
              };
              accounts.push(masterUser);
              localStorage.setItem('owntemp_auth_accounts', JSON.stringify(accounts));
              setSuccessMsg(lang === 'bn' ? 'মাস্টার অ্যাকাউন্ট তৈরি ও লগইন সম্পন্ন!' : 'Account registered and signed in!');
              setTimeout(() => {
                onAuthSuccess(masterUser, rememberMe);
              }, 500);
              return;
            } else {
              throw new Error(
                lang === 'bn'
                  ? 'এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি। দয়া করে সাইন আপ করুন।'
                  : 'No account found with this email. Please sign up first.'
              );
            }
          }

          if (userAcc.passwordHash !== btoa(password)) {
            throw new Error(lang === 'bn' ? 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।' : 'Incorrect password. Please try again.');
          }

          setSuccessMsg(lang === 'bn' ? 'সফলভাবে লগইন হয়েছে!' : 'Signed in successfully!');
          setTimeout(() => {
            onAuthSuccess(
              { id: userAcc.id, email: userAcc.email, name: userAcc.name, created_at: userAcc.created_at },
              rememberMe
            );
          }, 500);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden select-none">
      {/* Dynamic Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-indigo-600/20 via-purple-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-gradient-to-t from-cyan-600/10 via-transparent to-transparent blur-2xl pointer-events-none -z-10" />

      {/* TOP BAR WITH BRAND & CORNER LANGUAGE TOGGLE */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between z-20">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                Owntemp
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono">
                v2.5.8
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              {lang === 'bn' ? 'সুরক্ষিত প্রাইভেট ডিসপোজেবল ইমেইল ইঞ্জিন' : 'Secure Private Temp Mail Engine'}
            </p>
          </div>
        </div>

        {/* TOP-RIGHT CORNER LANGUAGE SWITCHER (বাংলা / English) */}
        <button
          type="button"
          onClick={onToggleLang}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition shadow-md hover:border-indigo-500/40 cursor-pointer"
          title={lang === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
        >
          <span className="text-base">{lang === 'bn' ? '🇧🇩' : '🇺🇸'}</span>
          <span className="font-medium font-sans">{lang === 'bn' ? 'English' : 'বাংলা'}</span>
        </button>
      </header>

      {/* MAIN AUTH GATE CARD */}
      <div className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/40 space-y-5 animate-in fade-in zoom-in-95 duration-200">
          {/* Card Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-indigo-400 mb-1">
              {mode === 'forgot' ? (
                <KeyRound className="w-6 h-6 text-amber-400" />
              ) : mode === 'signup' ? (
                <User className="w-6 h-6 text-emerald-400" />
              ) : (
                <Lock className="w-6 h-6 text-indigo-400" />
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {mode === 'forgot'
                ? t.forgotTab
                : mode === 'signup'
                ? t.signUpTab
                : t.signInTab}
            </h2>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              {mode === 'forgot'
                ? (lang === 'bn' ? 'আপনার অ্যাকাউন্টের পাসওয়ার্ড রিসেট করতে ইমেইল লিখুন' : 'Enter your registered email to reset your access')
                : t.loginGateSubtitle}
            </p>
          </div>

          {/* Mode Switcher Tabs (Sign In / Sign Up) */}
          {mode !== 'forgot' && (
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  mode === 'signin'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{t.signInTab}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
                  mode === 'signup'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{t.signUpTab}</span>
              </button>
            </div>
          )}

          {/* Messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Name Input (Only on Sign Up) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  {lang === 'bn' ? 'আপনার নাম (ঐচ্ছিক)' : 'Full Name (Optional)'}
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition">
                  <User className="w-4 h-4 text-slate-500 mr-2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: Sajjad Hossan' : 'e.g. Sajjad Hossan'}
                    className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-600 w-full"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-300 block">
                {t.emailLabel}
              </label>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition">
                <Mail className="w-4 h-4 text-slate-500 mr-2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-600 w-full font-mono"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-300">
                  {mode === 'forgot'
                    ? (lang === 'bn' ? 'নতুন পাসওয়ার্ড দিন' : 'New Password')
                    : t.passwordLabel}
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 transition"
                  >
                    {t.forgotPasswordLink}
                  </button>
                )}
              </div>
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition">
                <Lock className="w-4 h-4 text-slate-500 mr-2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-600 w-full font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="text-slate-500 hover:text-slate-300 transition ml-2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password (Only on Sign Up) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  {t.confirmPasswordLabel}
                </label>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 focus-within:border-indigo-500 transition">
                  <Lock className="w-4 h-4 text-slate-500 mr-2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t.confirmPasswordPlaceholder}
                    className="bg-transparent border-none outline-none text-xs text-slate-200 placeholder:text-slate-600 w-full font-mono"
                    required
                  />
                </div>
              </div>
            )}

            {/* Remember Me Option */}
            {mode !== 'forgot' && (
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  <span>{t.rememberMeLabel}</span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>
                {isLoading
                  ? (lang === 'bn' ? 'যাচাই করা হচ্ছে...' : 'Verifying...')
                  : mode === 'forgot'
                  ? t.resetPasswordBtn
                  : mode === 'signup'
                  ? t.signUpBtn
                  : t.signInBtn}
              </span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="pt-2 border-t border-slate-800/80 text-center text-xs">
            {mode === 'forgot' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="inline-flex items-center space-x-1.5 text-indigo-400 hover:text-indigo-300 font-semibold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t.backToLoginBtn}</span>
              </button>
            ) : mode === 'signin' ? (
              <div className="text-slate-400">
                <span>{t.dontHaveAccount} </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition"
                >
                  {t.signUpTab}
                </button>
              </div>
            ) : (
              <div className="text-slate-400">
                <span>{t.alreadyHaveAccount} </span>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signin');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold ml-1 transition"
                >
                  {t.signInTab}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER BADGE */}
      <footer className="w-full text-center py-4 text-[11px] text-slate-500 z-10 font-mono">
        🛡️ Owntemp © 2026 — Enterprise Security & Lifetime Locked Inboxes
      </footer>
    </div>
  );
}
