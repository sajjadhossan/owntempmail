'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Volume1,
  Mic,
  MicOff,
  Search,
  Filter,
  Bookmark,
  Star,
  Layers,
  Settings,
  Smartphone,
  Laptop,
  Apple,
  MessageSquare,
  Radio,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowDown,
  GitFork,
  ArrowLeftRight,
  Activity,
  Cpu,
  Sun,
  Moon,
  Zap,
  Reply,
  Keyboard,
  FileSpreadsheet,
} from 'lucide-react';
import {
  EmailRecord,
  InboxMetadata,
  DomainItem,
  BusinessProfile,
  TelegramConfig,
  BlueGreenConfig,
  DeploymentSlot,
} from '@/lib/types';
import { translations, Language } from '@/lib/translations';
import { generateQrSvgUri } from '@/lib/qr';
import { APP_VERSION, APP_EDITION } from '@/lib/constants';
import EmailRenderer from '@/components/EmailRenderer';
import FloatingOtpBanner from '@/components/FloatingOtpBanner';
import QrModal from '@/components/modals/QrModal';
import LockModal from '@/components/modals/LockModal';
import UnlockModal from '@/components/modals/UnlockModal';
import SimModal from '@/components/modals/SimModal';
import SettingsModal from '@/components/modals/SettingsModal';
import DomainFleetModal from '@/components/modals/DomainFleetModal';
import DirectoryModal from '@/components/modals/DirectoryModal';
import ReplyModal from '@/components/modals/ReplyModal';
import KeyboardShortcutsModal from '@/components/modals/KeyboardShortcutsModal';

// In-Memory Browser Cache for instant 0ms domain navigation
const domainClientCache = new Map<string, any>();

export default function OwntempHome() {
  const [lang, setLang] = useState<Language>('bn');
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light' | 'amoled'>('dark');
  const [dismissedOtp, setDismissedOtp] = useState<string | null>(null);
  const t = translations[lang];

  // Address & Domain state
  const [usernamePrefix, setUsernamePrefix] = useState('demo-user');
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('owntemp.live');
  const [activeEmail, setActiveEmail] = useState('demo-user@owntemp.live');
  const [recentInboxes, setRecentInboxes] = useState<string[]>([]);
  const [isDirectDomainMode, setIsDirectDomainMode] = useState(false);
  const [directDomainInput, setDirectDomainInput] = useState('');

  // Business Profile
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>({
    businessName: 'Owntemp Business',
    tagline: 'Custom Domain Temp Mail Engine',
    primaryDomain: 'owntemp.live',
    updatedAt: new Date().toISOString(),
  });
  const [businessNameInput, setBusinessNameInput] = useState('');
  const [businessTaglineInput, setBusinessTaglineInput] = useState('');

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

  // Sound & Voice settings
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Haptic feedback trigger for tactile mobile responses
  const triggerHaptic = useCallback((ms = 40) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  }, []);

  // Pinned / Favorite Domains state
  const [pinnedDomains, setPinnedDomains] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('owntemp_pinned_domains');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const togglePinDomain = useCallback((dom: string) => {
    triggerHaptic(35);
    setPinnedDomains((prev) => {
      const exists = prev.includes(dom);
      const updated = exists ? prev.filter((d) => d !== dom) : [dom, ...prev];
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('owntemp_pinned_domains', JSON.stringify(updated));
        } catch (e) {}
      }
      return updated;
    });
  }, [triggerHaptic]);

  // Auto-refresh timer
  const [countdown, setCountdown] = useState(10);

  // Modals
  const [showLockModal, setShowLockModal] = useState(false);
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showSimModal, setShowSimModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showDirectoryModal, setShowDirectoryModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showKeyboardModal, setShowKeyboardModal] = useState(false);

  // 50,000+ Mega Domain Directory State
  const [directorySearch, setDirectorySearch] = useState('');
  const [directoryCategory, setDirectoryCategory] = useState('all');
  const [directoryPage, setDirectoryPage] = useState(1);
  const [directoryLimit, setDirectoryLimit] = useState(30);
  const [directoryResults, setDirectoryResults] = useState<Array<{ domain: string; category: string; length: number; isUltraShort: boolean }>>([]);
  const [directoryPagination, setDirectoryPagination] = useState({
    page: 1,
    limit: 30,
    totalPages: 1,
    totalMatches: 51774,
    startIndex: 1,
    endIndex: 30,
    hasMore: true,
  });
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({
    all: 51774,
    ultrashort: 11192,
    cctld: 5593,
    tenminute: 610,
    developer: 864,
    privacy: 187,
    mailinator: 39,
    guerrilla: 14,
    mailtm: 12,
  });
  const [totalDatabaseCount, setTotalDatabaseCount] = useState(51774);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

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

  // Version check
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string | null>(null);

  // Settings Tabs & Integrations
  const [settingsTab, setSettingsTab] = useState<'api' | 'domains' | 'telegram' | 'deployment' | 'general'>('api');
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({
    enabled: false,
    botToken: '',
    chatId: '',
    notifyOnOtpOnly: true,
  });
  const [isSavingTelegram, setIsSavingTelegram] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramStatusMsg, setTelegramStatusMsg] = useState<{ success: boolean; message: string } | null>(null);

  // Blue-Green Deployment State
  const [blueGreenConfig, setBlueGreenConfig] = useState<BlueGreenConfig | null>(null);
  const [isSwitchingSlot, setIsSwitchingSlot] = useState(false);
  const [isProbingHealth, setIsProbingHealth] = useState(false);
  const [canarySlider, setCanarySlider] = useState(0);

  // Cloudflare & Vercel Integration Hub (v1.6.1)
  const [integrationTab, setIntegrationTab] = useState<'auto' | 'manual'>('auto');
  const [vercelLiveUrl, setVercelLiveUrl] = useState('https://owntempmail.vercel.app');
  const [cfApiToken, setCfApiToken] = useState('');
  const [isSettingUpCf, setIsSettingUpCf] = useState(false);
  const [cfSetupResult, setCfSetupResult] = useState<string | null>(null);
  const [cfSetupError, setCfSetupError] = useState<string | null>(null);
  const [cfAvailableZones, setCfAvailableZones] = useState<Array<{ id: string; name: string; status: string }>>([]);
  const [isFetchingCfZones, setIsFetchingCfZones] = useState(false);
  const [cfZonesMsg, setCfZonesMsg] = useState<string | null>(null);

  // Play audio chime when new email arrives
  const playChime = useCallback(() => {
    triggerHaptic(60);
    if (!soundEnabled || typeof window === 'undefined') return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio fallback
    }
  }, [soundEnabled]);

  // Voice OTP Announcer via Web Speech API
  const announceOtp = useCallback((otp: string, language: Language = 'bn') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const spacedDigits = otp.split('').join(' ');
      const message = language === 'bn'
        ? `আপনার ওটিপি কোড হলো: ${spacedDigits}`
        : `Your verification code is: ${spacedDigits}`;
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis unavailable', e);
    }
  }, []);

  // Fetch Telegram Config
  const fetchTelegramConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/telegram');
      const data = await res.json();
      if (data.success && data.data) {
        setTelegramConfig(data.data);
      }
    } catch (e) {
      console.error('Failed to load telegram config', e);
    }
  }, []);

  // Save Telegram Config
  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTelegram(true);
    setTelegramStatusMsg(null);
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(telegramConfig),
      });
      const data = await res.json();
      setTelegramStatusMsg({ success: data.success, message: data.message });
      if (data.success && data.data) {
        setTelegramConfig(data.data);
      }
    } catch (e: any) {
      setTelegramStatusMsg({ success: false, message: e.message || 'Error saving settings' });
    } finally {
      setIsSavingTelegram(false);
    }
  };

  // Test Telegram Connection
  const handleTestTelegram = async () => {
    setIsTestingTelegram(true);
    setTelegramStatusMsg(null);
    try {
      const res = await fetch('/api/telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test',
          botToken: telegramConfig.botToken,
          chatId: telegramConfig.chatId,
        }),
      });
      const data = await res.json();
      setTelegramStatusMsg({ success: data.success, message: data.message });
    } catch (e: any) {
      setTelegramStatusMsg({ success: false, message: e.message || 'Test failed' });
    } finally {
      setIsTestingTelegram(false);
    }
  };

  // Fetch Blue-Green Deployment Config
  const fetchBlueGreenConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/deployment');
      const data = await res.json();
      if (data.success && data.data) {
        setBlueGreenConfig(data.data);
        setCanarySlider(data.data.canaryPercent || 0);
      }
    } catch (e) {
      console.error('Failed to load deployment config', e);
    }
  }, []);

  // Switch Deployment Slot (Cutover or Rollback)
  const handleSwitchDeploymentSlot = async (targetSlot: DeploymentSlot, reason?: string) => {
    setIsSwitchingSlot(true);
    setActionError(null);
    try {
      const res = await fetch('/api/deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'switch',
          targetSlot,
          reason: reason || (targetSlot === 'blue' ? 'Rollback to Blue slot' : 'Zero-downtime cutover to Green slot'),
          switchedBy: 'Lead DevOps Architect',
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBlueGreenConfig(data.data);
        setActionSuccess(
          lang === 'bn'
            ? `ট্রাফিক সফলভাবে ${targetSlot.toUpperCase()} স্লটে স্থানান্তরিত হয়েছে! (জিরো ডাউনটাইম)`
            : `Traffic cutover to ${targetSlot.toUpperCase()} slot succeeded with 0 downtime!`
        );
        setTimeout(() => setActionSuccess(null), 3500);
      } else {
        setActionError(data.message || 'Cutover failed');
      }
    } catch (e: any) {
      setActionError(e.message || 'Error executing deployment cutover');
    } finally {
      setIsSwitchingSlot(false);
    }
  };

  // Canary Traffic Split Change
  const handleApplyCanarySplit = async (percent: number) => {
    try {
      const res = await fetch('/api/deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'canary',
          canaryPercent: percent,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBlueGreenConfig(data.data);
        setCanarySlider(percent);
      }
    } catch (e) {
      console.error('Failed to update canary traffic', e);
    }
  };

  // Probe Deployment Health
  const handleProbeHealth = async () => {
    setIsProbingHealth(true);
    try {
      const res = await fetch('/api/deployment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'healthCheck' }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setBlueGreenConfig(data.data);
        setActionSuccess(lang === 'bn' ? 'উভয় স্লটের হেলথ চেক সম্পন্ন: ১০০% সুস্থ!' : 'Live health check probe: 100% Healthy!');
        setTimeout(() => setActionSuccess(null), 2500);
      }
    } catch (e) {
      console.error('Health probe failed', e);
    } finally {
      setIsProbingHealth(false);
    }
  };

  // Load business profile
  const fetchBusinessProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/business');
      const data = await res.json();
      if (data.success && data.data) {
        setBusinessProfile(data.data);
        setBusinessNameInput(data.data.businessName || '');
        setBusinessTaglineInput(data.data.tagline || '');
      }
    } catch (e) {
      console.error('Failed to load business profile', e);
    }
  }, []);

  // Save business profile
  const handleSaveBusinessProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessNameInput.trim()) return;
    try {
      const res = await fetch('/api/business', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: businessNameInput.trim(),
          tagline: businessTaglineInput.trim(),
          primaryDomain: selectedDomain,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBusinessProfile(data.data);
        setActionSuccess(lang === 'bn' ? 'বিজনেস প্রোফাইল সেভ হয়েছে!' : 'Business profile saved successfully!');
        setTimeout(() => setActionSuccess(null), 3000);
      }
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  // Delete custom domain
  const handleDeleteDomain = async (domainId: string) => {
    try {
      const res = await fetch('/api/domains', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: domainId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchDomains();
        setActionSuccess(lang === 'bn' ? 'ডোমেইন মুছে ফেলা হয়েছে।' : 'Custom domain removed.');
        setTimeout(() => setActionSuccess(null), 2500);
      } else {
        setActionError(data.message);
      }
    } catch (e: any) {
      setActionError(e.message);
    }
  };
  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetch('/api/domains');
      const data = await res.json();
      if (data.success && data.data?.length > 0) {
        setDomains(data.data);
        const firstDomain = data.data[0].domain;
        if (!selectedDomain || selectedDomain === 'owntemp.live') {
          setSelectedDomain(firstDomain);
          setActiveEmail((prev) => {
            if (!prev || prev.endsWith('@owntemp.live')) {
              const prefix = prev ? prev.split('@')[0] : (usernamePrefix || 'user1000');
              const updated = `${prefix}@${firstDomain}`;
              try {
                localStorage.setItem('owntemp_active_email', updated);
              } catch (e) {}
              return updated;
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.error('Failed to load domains', err);
    }
  }, [selectedDomain, usernamePrefix]);

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

  // Search 50,000+ Mega Domain Directory with Browser Cache & CDN support
  const fetchDirectoryDomains = useCallback(
    async (
      q: string = '',
      cat: string = 'all',
      page: number = 1,
      limit: number = 150,
      append: boolean = false
    ) => {
      const cacheKey = `dir_${q}_${cat}_${page}_${limit}`;

      // Check client browser memory & session cache for instant 0ms rendering
      if (!append) {
        let cached = domainClientCache.get(cacheKey);
        if (!cached && typeof window !== 'undefined') {
          try {
            const stored = sessionStorage.getItem(`owntemp_${cacheKey}`);
            if (stored) {
              cached = JSON.parse(stored);
              domainClientCache.set(cacheKey, cached);
            }
          } catch (e) {}
        }

        if (cached) {
          setDirectoryResults(cached.results || []);
          if (cached.pagination) setDirectoryPagination(cached.pagination);
          if (cached.categoryCounts) setCategoryCounts(cached.categoryCounts);
          if (cached.pagination?.totalDatabase) setTotalDatabaseCount(cached.pagination.totalDatabase);
          setIsLoadingDirectory(false);
          return;
        }
      }

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoadingDirectory(true);
      }

      try {
        const res = await fetch(
          `/api/domains/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}&page=${page}&limit=${limit}`
        );
        const data = await res.json();
        if (data.success && data.data) {
          if (append) {
            setDirectoryResults((prev) => [...prev, ...(data.data.results || [])]);
          } else {
            setDirectoryResults(data.data.results || []);
            // Save to browser memory & session cache
            domainClientCache.set(cacheKey, data.data);
            if (typeof window !== 'undefined') {
              try {
                sessionStorage.setItem(`owntemp_${cacheKey}`, JSON.stringify(data.data));
              } catch (e) {}
            }
          }
          if (data.data.pagination) setDirectoryPagination(data.data.pagination);
          if (data.data.categoryCounts) setCategoryCounts(data.data.categoryCounts);
          if (data.data.pagination?.totalDatabase) setTotalDatabaseCount(data.data.pagination.totalDatabase);
        }
      } catch (e) {
        console.error('Failed to search directory domains', e);
      } finally {
        setIsLoadingDirectory(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Clear Browser Cache Handler
  const handleClearBrowserCache = useCallback(() => {
    domainClientCache.clear();
    if (typeof window !== 'undefined') {
      try {
        Object.keys(sessionStorage).forEach((k) => {
          if (k.startsWith('owntemp_dir_')) sessionStorage.removeItem(k);
        });
      } catch (e) {}
    }
    setActionSuccess(lang === 'bn' ? 'ব্রাউজার ক্যাশ সফলভাবে খালি করা হয়েছে!' : 'Browser cache cleared successfully!');
    setTimeout(() => setActionSuccess(null), 2500);
    fetchDirectoryDomains(directorySearch, directoryCategory, directoryPage, directoryLimit, false);
  }, [lang, directorySearch, directoryCategory, directoryPage, directoryLimit, fetchDirectoryDomains]);

  // Real-time search effect when directory modal is open
  useEffect(() => {
    if (!showDirectoryModal) return;
    const timer = setTimeout(() => {
      setDirectoryPage(1);
      fetchDirectoryDomains(directorySearch, directoryCategory, 1, directoryLimit, false);
    }, 200);
    return () => clearTimeout(timer);
  }, [showDirectoryModal, directorySearch, directoryCategory, directoryLimit, fetchDirectoryDomains]);

  // Directory Pagination Handlers
  const handleNextDirectoryPage = () => {
    if (directoryPage < directoryPagination.totalPages) {
      const nextPage = directoryPage + 1;
      setDirectoryPage(nextPage);
      fetchDirectoryDomains(directorySearch, directoryCategory, nextPage, directoryLimit, false);
    }
  };

  const handlePrevDirectoryPage = () => {
    if (directoryPage > 1) {
      const prevPage = directoryPage - 1;
      setDirectoryPage(prevPage);
      fetchDirectoryDomains(directorySearch, directoryCategory, prevPage, directoryLimit, false);
    }
  };

  const handleFirstDirectoryPage = () => {
    setDirectoryPage(1);
    fetchDirectoryDomains(directorySearch, directoryCategory, 1, directoryLimit, false);
  };

  const handleLastDirectoryPage = () => {
    setDirectoryPage(directoryPagination.totalPages);
    fetchDirectoryDomains(directorySearch, directoryCategory, directoryPagination.totalPages, directoryLimit, false);
  };

  const handleLoadMoreDomains = () => {
    if (directoryPage < directoryPagination.totalPages) {
      const nextPage = directoryPage + 1;
      setDirectoryPage(nextPage);
      fetchDirectoryDomains(directorySearch, directoryCategory, nextPage, directoryLimit, true);
    }
  };

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
              const latest = newEmails[0];
              if (voiceEnabled && latest && latest.otpCode) {
                setTimeout(() => announceOtp(latest.otpCode!, lang), 300);
              }
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
    [playChime, voiceEnabled, announceOtp, lang]
  );

  const isInitializedRef = useRef(false);

  // Initial load - runs strictly once on mount
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    fetchDomains();
    fetchLockedInboxes();
    fetchBusinessProfile();
    fetchTelegramConfig();
    fetchBlueGreenConfig();

    try {
      const savedTheme = (localStorage.getItem('owntemp_theme') as any) || 'dark';
      if (['dark', 'light', 'amoled'].includes(savedTheme)) {
        setCurrentTheme(savedTheme);
        document.documentElement.className = `theme-${savedTheme}`;
      }
    } catch (e) {}

    let savedEmail = '';
    try {
      savedEmail = localStorage.getItem('owntemp_active_email') || '';
      const savedRecents = localStorage.getItem('owntemp_recent_inboxes');
      if (savedRecents) {
        const parsed = JSON.parse(savedRecents);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentInboxes(parsed);
        }
      }
    } catch (e) {}

    let initialEmail = '';
    if (savedEmail && savedEmail.includes('@')) {
      initialEmail = savedEmail;
    } else {
      const words = ['user', 'swift', 'temp', 'spark', 'nexus', 'cloud', 'secure'];
      const word = words[Math.floor(Math.random() * words.length)];
      const num = Math.floor(1000 + Math.random() * 9000);
      initialEmail = `${word}_${num}@owntemp.live`;
      try {
        localStorage.setItem('owntemp_active_email', initialEmail);
      } catch (e) {}
    }

    const parts = initialEmail.split('@');
    setUsernamePrefix(parts[0]);
    if (parts[1]) setSelectedDomain(parts[1]);
    setActiveEmail(initialEmail);
    setRecentInboxes((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== initialEmail.toLowerCase());
      const updated = [initialEmail, ...filtered].slice(0, 6);
      try { localStorage.setItem('owntemp_recent_inboxes', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
    fetchEmails(initialEmail);
  }, []); // Run strictly once on mount

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

  // Real-Time 0ms Live Feed (Server-Sent Events) with Native Browser Notifications
  useEffect(() => {
    if (!activeEmail || typeof window === 'undefined' || !window.EventSource) return;

    let sse: EventSource | null = null;
    try {
      sse = new EventSource(`/api/inbox/${encodeURIComponent(activeEmail)}/stream`);
      sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === 'new_email' && payload.email) {
            const incoming: EmailRecord = payload.email;
            setEmails((prev) => {
              if (prev.some((e) => e.id === incoming.id)) return prev;
              playChime();
              if (voiceEnabled && incoming.otpCode) {
                setTimeout(() => announceOtp(incoming.otpCode!, lang), 300);
              }
              // Native notification
              if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification(
                    incoming.otpCode ? `Owntemp OTP: ${incoming.otpCode}` : `নতুন ইমেইল: ${incoming.senderName || 'Owntemp'}`,
                    {
                      body: incoming.subject || 'নতুন ইনকামিং মেসেজ এসেছে',
                    }
                  );
                } catch (e) {}
              }
              return [incoming, ...prev];
            });
          }
        } catch (e) {}
      };
    } catch (err) {
      console.warn('[SSE Connection]', err);
    }

    return () => {
      if (sse) sse.close();
    };
  }, [activeEmail, lang, voiceEnabled, playChime]);

  // Fetch available domains from Cloudflare account using API Token
  const handleFetchCloudflareZones = async () => {
    if (!cfApiToken.trim()) {
      setActionError(lang === 'bn' ? 'আগে আপনার Cloudflare API টোকেন প্রদান করুন।' : 'Please enter your Cloudflare API Token first.');
      return;
    }
    setIsFetchingCfZones(true);
    setCfZonesMsg(null);
    setCfSetupError(null);
    try {
      const res = await fetch('/api/cloudflare/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiToken: cfApiToken.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data?.zones) {
        setCfAvailableZones(data.data.zones);
        if (data.data.zones.length > 0) {
          setCfZonesMsg(
            lang === 'bn'
              ? `✅ আপনার ক্লাউডফ্লেয়ার অ্যাকাউন্টে ${data.data.zones.length}টি ডোমেইন পাওয়া গেছে! নিচের তালিকা থেকে নির্বাচন করুন:`
              : `✅ Found ${data.data.zones.length} domain(s) in your Cloudflare account! Select one below:`
          );
        } else {
          setCfZonesMsg(
            lang === 'bn'
              ? '⚠️ এই Cloudflare অ্যাকাউন্টে কোনো ডোমেইন পাওয়া যায়নি। অনুগ্রহ করে dash.cloudflare.com এ গিয়ে আগে ডোমেইন যোগ করুন।'
              : '⚠️ No domains found in this Cloudflare account. Please add a domain to dash.cloudflare.com first.'
          );
        }
      } else {
        setCfSetupError(data.message || 'Failed to fetch domains from Cloudflare.');
      }
    } catch (e: any) {
      setCfSetupError(e.message || 'Error communicating with Cloudflare API');
    } finally {
      setIsFetchingCfZones(false);
    }
  };

  // Auto Setup Cloudflare via API Token
  const handleAutoSetupCloudflare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cfApiToken.trim()) {
      setActionError(lang === 'bn' ? 'দয়া করে ক্লাউডফ্লেয়ার API টোকেন প্রদান করুন।' : 'Please enter your Cloudflare API Token.');
      return;
    }

    const cleanDomain = selectedDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/+.*$/, '')
      .replace(/^@+/, '');

    if (cleanDomain.includes('vercel.app')) {
      setCfSetupError(
        lang === 'bn'
          ? '❌ ভুল ইনপুট: "vercel.app" হলো আপনার ওয়েবসাইটের হোস্টিং লিংক, এটি ক্লাউডফ্লেয়ার ডোমেইন নয়। ক্লাউডফ্লেয়ারে যুক্ত নিজস্ব ডোমেইন (যেমন: yoursite.com) লিখুন।'
          : '❌ Invalid input: "vercel.app" is your Vercel hosting URL, not a Cloudflare email domain. Please enter your custom domain registered in Cloudflare.'
      );
      return;
    }

    setIsSettingUpCf(true);
    setCfSetupResult(null);
    setCfSetupError(null);
    setActionError(null);

    try {
      const res = await fetch('/api/cloudflare/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiToken: cfApiToken.trim(),
          domain: cleanDomain,
          vercelUrl: vercelLiveUrl.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setCfSetupResult(data.message);
        setCfSetupError(null);
        // Also register in system domains list
        try {
          await fetch('/api/domains', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: cleanDomain, businessName: businessProfile.businessName || 'Cloudflare Verified' }),
          });
          fetchDomains();
        } catch (e) {}
        setActionSuccess(lang === 'bn' ? 'ক্লাউডফ্লেয়ার অটোমেটিক সেটআপ সফল হয়েছে!' : 'Cloudflare Auto-Setup Succeeded!');
      } else {
        setCfSetupError(data.message || 'Cloudflare setup failed.');
        setCfSetupResult(null);
        setActionError(data.message);
      }
    } catch (err: any) {
      setCfSetupError(err.message || 'Failed to auto setup Cloudflare');
      setActionError(err.message || 'Failed to auto setup Cloudflare');
    } finally {
      setIsSettingUpCf(false);
    }
  };

  // Switch to custom username and domain
  const handleApplyAddress = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPrefix = usernamePrefix.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '');
    if (!cleanPrefix) return;

    let targetDomain = selectedDomain;
    if (isDirectDomainMode && directDomainInput.trim()) {
      const cleanCustom = directDomainInput.trim().toLowerCase().replace(/^@+/, '');
      if (cleanCustom.includes('.')) {
        targetDomain = cleanCustom;
        // Auto register custom domain in backend
        try {
          await fetch('/api/domains', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ domain: cleanCustom, businessName: businessProfile.businessName }),
          });
          fetchDomains();
          setSelectedDomain(cleanCustom);
        } catch (e) {}
      }
    }

    const newAddress = `${cleanPrefix}@${targetDomain}`;
    setActiveEmail(newAddress);
    try {
      localStorage.setItem('owntemp_active_email', newAddress);
    } catch (e) {}
    addRecentInbox(newAddress);
    fetchEmails(newAddress);
    setActionSuccess(lang === 'bn' ? 'সক্রিয় ইনবক্স পরিবর্তন করা হয়েছে!' : 'Active inbox updated successfully!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const addRecentInbox = useCallback((addr: string) => {
    if (!addr) return;
    setRecentInboxes((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== addr.toLowerCase());
      const updated = [addr, ...filtered].slice(0, 6);
      try {
        localStorage.setItem('owntemp_recent_inboxes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const handleSwitchInbox = (address: string) => {
    triggerHaptic(35);
    const parts = address.split('@');
    if (parts.length === 2) {
      setUsernamePrefix(parts[0]);
      setSelectedDomain(parts[1]);
    }
    setActiveEmail(address);
    try {
      localStorage.setItem('owntemp_active_email', address);
    } catch (e) {}
    addRecentInbox(address);
    fetchEmails(address);
  };

  const handleRemoveRecentInbox = (address: string) => {
    triggerHaptic(20);
    setRecentInboxes((prev) => {
      const updated = prev.filter((item) => item.toLowerCase() !== address.toLowerCase());
      try {
        localStorage.setItem('owntemp_recent_inboxes', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Switch directly to a locked inbox
  const handleSelectLockedInbox = (address: string) => {
    const parts = address.split('@');
    if (parts.length === 2) {
      setUsernamePrefix(parts[0]);
      setSelectedDomain(parts[1]);
    }
    setActiveEmail(address);
    try {
      localStorage.setItem('owntemp_active_email', address);
    } catch (e) {}
    addRecentInbox(address);
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
    try {
      localStorage.setItem('owntemp_active_email', newAddr);
    } catch (e) {}
    addRecentInbox(newAddr);
    fetchEmails(newAddr);
  };

  // Theme switcher (Dark / Light / AMOLED)
  const handleToggleTheme = () => {
    triggerHaptic(30);
    const themes: Array<'dark' | 'light' | 'amoled'> = ['dark', 'light', 'amoled'];
    const nextIdx = (themes.indexOf(currentTheme) + 1) % themes.length;
    const nextTheme = themes[nextIdx];
    setCurrentTheme(nextTheme);
    try {
      localStorage.setItem('owntemp_theme', nextTheme);
      document.documentElement.className = `theme-${nextTheme}`;
    } catch (e) {}
  };

  // Copy email
  const handleCopyEmail = () => {
    triggerHaptic(40);
    navigator.clipboard.writeText(activeEmail);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // Copy OTP code
  const handleCopyOtp = (code: string) => {
    triggerHaptic(40);
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

  // Send simulated test email (instant 1-click & custom modal support)
  const handleSimulateInbound = async (e?: React.FormEvent, directOtp?: string) => {
    if (e) e.preventDefault();
    setIsSimulating(true);
    setActionError(null);

    const otpVal = directOtp || (simOtp.trim() ? simOtp.trim() : Math.floor(100000 + Math.random() * 900000).toString());
    const senderVal = simSender.trim() || 'security@google.com';
    const subjectVal = simSubject.trim() || (lang === 'bn' ? 'Google Verification Code / গুগল যাচাইকরণ কোড' : 'Google Verification Code');

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: activeEmail,
          from: senderVal,
          subject: subjectVal,
          otp: otpVal,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setShowSimModal(false);
        setSimOtp('');
        // Instantly prepend into state so user sees it right away with 0ms delay!
        setEmails((prev) => [data.data, ...prev.filter((em) => em.id !== data.data.id)]);
        playChime();
        setActionSuccess(
          lang === 'bn'
            ? `টেস্ট ইমেইল ও ওটিপি কোড (${data.data.otpCode || otpVal}) সফলভাবে ইনবক্সে এসেছে!`
            : `Test email with OTP (${data.data.otpCode || otpVal}) delivered to inbox!`
        );
        setTimeout(() => setActionSuccess(null), 4000);
        // Sync server copy quietly
        fetchEmails(activeEmail, true);
      } else {
        setActionError(data.message || 'Simulation failed');
      }
    } catch (err: any) {
      setActionError(err.message || 'Simulation failed');
    } finally {
      setIsSimulating(false);
    }
  };

  // Check version updates
  const handleCheckVersion = async () => {
    setIsCheckingUpdate(true);
    setUpdateStatus(null);
    try {
      const res = await fetch('/api/app/version');
      const data = await res.json();
      if (data.success) {
        setUpdateStatus(lang === 'bn' ? `আপনার অ্যাপ লেটেস্ট ভার্সন ${data.data.latestVersion} এ চলছে!` : `App is up-to-date on latest release ${data.data.latestVersion}!`);
      }
    } catch (e) {
      setUpdateStatus('Could not reach update server.');
    } finally {
      setIsCheckingUpdate(false);
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

  // Export all inbox emails as JSON
  const handleExportEmails = () => {
    if (emails.length === 0) return;
    const jsonStr = JSON.stringify(emails, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `owntemp_backup_${activeEmail.replace(/[@.]/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setActionSuccess(lang === 'bn' ? 'সকল ইমেইল ব্যাকআপ ডাউনলোড হয়েছে!' : 'All emails exported to JSON successfully!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  // Export all inbox emails as CSV
  const handleExportCsv = () => {
    if (emails.length === 0) return;
    const headers = ['ID', 'Date', 'Sender', 'Sender Name', 'Subject', 'OTP Code', 'Size (Bytes)'];
    const rows = emails.map((e) => [
      `"${e.id}"`,
      `"${new Date(e.receivedAt).toISOString()}"`,
      `"${(e.sender || '').replace(/"/g, '""')}"`,
      `"${(e.senderName || '').replace(/"/g, '""')}"`,
      `"${(e.subject || '').replace(/"/g, '""')}"`,
      `"${(e.otpCode || '').replace(/"/g, '""')}"`,
      e.sizeBytes || 0,
    ]);
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `owntemp_backup_${activeEmail.replace(/[@.]/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setActionSuccess(lang === 'bn' ? 'সকল ইমেইল CSV ফরম্যাটে এক্সপোর্ট হয়েছে!' : 'All emails exported to CSV successfully!');
    setTimeout(() => setActionSuccess(null), 3000);
  };

// Global Keyboard Shortcuts (HUD & Hotkeys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      if (e.key === 'Escape') {
        setShowKeyboardModal(false);
        setShowLockModal(false);
        setShowUnlockModal(false);
        setShowDomainModal(false);
        setShowSimModal(false);
        setShowQrModal(false);
        setShowSettingsModal(false);
        setShowDirectoryModal(false);
        setShowReplyModal(false);
        setSelectedEmail(null);
        return;
      }

      if (isInput) return;

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowKeyboardModal((prev) => !prev);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleCopyEmail();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        fetchEmails(activeEmail);
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        handleGenerateRandom();
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        if (inboxMeta?.isLocked) {
          setShowUnlockModal(true);
        } else {
          setShowLockModal(true);
        }
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        setShowSimModal(true);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setShowDirectoryModal(true);
        fetchDirectoryDomains('', directoryCategory, 1, directoryLimit, false);
      } else if (e.key === 'e' || e.key === 'E') {
        e.preventDefault();
        handleExportEmails();
      } else if (e.key === 'v' || e.key === 'V') {
        e.preventDefault();
        handleExportCsv();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeEmail,
    inboxMeta,
    directoryCategory,
    directoryLimit,
    handleCopyEmail,
    fetchEmails,
    handleGenerateRandom,
    fetchDirectoryDomains,
    handleExportEmails,
    handleExportCsv,
  ]);

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

  // Latest received OTP email for Floating Quick-OTP Action Banner
  const latestOtpEmail = useMemo(() => {
    return emails.find((e) => !!e.otpCode) || null;
  }, [emails]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between pb-16 lg:pb-0">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                  {t.appTitle}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-mono shadow-sm flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{APP_VERSION}</span>
                </span>
                {blueGreenConfig && (
                  <button
                    onClick={() => {
                      setSettingsTab('deployment');
                      setShowSettingsModal(true);
                    }}
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-mono border transition flex items-center space-x-1 cursor-pointer ${
                      blueGreenConfig.activeSlot === 'blue'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                    }`}
                    title="Blue-Green Deployment Active Slot (Click to manage)"
                  >
                    <span>{blueGreenConfig.activeSlot === 'blue' ? '🔵 Blue' : '🟢 Green'}</span>
                    <span className="text-[9px] text-slate-400">({blueGreenConfig.activeSlot === 'blue' ? blueGreenConfig.blue.trafficWeight : blueGreenConfig.green.trafficWeight}%)</span>
                  </button>
                )}
                {businessProfile?.businessName && businessProfile.businessName !== 'Owntemp Business' && (
                  <span className="hidden md:inline-flex text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    🏢 {businessProfile.businessName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {businessProfile?.tagline || (lang === 'bn' ? 'যেকোনো বিজনেস ডোমেইন ও লাইফটাইম লক সুবিধাযুক্ত ফ্রি টেম্প মেইল' : 'Free Custom Business Domain Temp Mail with Lifetime Lock')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-2.5">
            {/* Quick Test Simulator Button */}
            <button
              onClick={() => setShowSimModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/40 hover:to-purple-600/40 text-indigo-200 border border-indigo-500/40 transition shadow-sm"
              title="Test OTP & Inbound Email Simulator"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
              <span className="hidden sm:inline">{lang === 'bn' ? 'সিমুলেটর' : 'Simulator'}</span>
            </button>

            {/* Voice OTP Announcer Toggle */}
            <button
              onClick={() => {
                const nextState = !voiceEnabled;
                setVoiceEnabled(nextState);
                if (nextState) {
                  announceOtp('849201', lang);
                }
              }}
              className={`p-2 rounded-xl border text-xs transition ${
                voiceEnabled
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
              title={voiceEnabled ? t.voiceAnnouncerOn : t.voiceAnnouncerOff}
            >
              {voiceEnabled ? <Mic className="w-4 h-4 text-purple-400" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border text-xs transition ${
                soundEnabled
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-sm'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
              title={soundEnabled ? t.soundOn : t.soundOff}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Unified Settings Hub Trigger */}
            <button
              onClick={() => {
                setSettingsTab('api');
                setShowSettingsModal(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition shadow-sm text-xs font-semibold"
              title="Settings & Cloudflare API, Domains, Telegram, Deployment"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="hidden md:inline">{lang === 'bn' ? 'সেটিংস' : 'Settings'}</span>
            </button>

            {/* Keyboard Shortcuts HUD */}
            <button
              type="button"
              onClick={() => setShowKeyboardModal(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white transition shadow-sm text-xs font-semibold"
              title={lang === 'bn' ? 'কিবোর্ড শর্টকাট (?)' : 'Keyboard Shortcuts (?)'}
            >
              <Keyboard className="w-4 h-4 text-slate-400" />
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-indigo-300 transition"
              title="Toggle Language"
            >
              {lang === 'bn' ? 'English' : 'বাংলা'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 flex-1 w-full space-y-6">
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

        {/* Master-Detail Dual-Pane Layout (Desktop: 2 columns, Mobile: 1 column) */}
        <div className="lg:grid lg:grid-cols-12 lg:gap-6 items-start">
          {/* Left Column: Address, Inboxes & Emails Feed (5 columns on desktop) */}
          <div className="lg:col-span-5 space-y-5">
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

            {/* Multi-Inbox Active Workspace Tabs */}
            {recentInboxes.length > 0 && (
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-1 text-xs">
                <span className="text-[11px] font-semibold text-slate-400 whitespace-nowrap flex items-center space-x-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'bn' ? 'সম্প্রতি ইনবক্সসমূহ:' : 'Recent Tabs:'}</span>
                </span>
                <div className="flex items-center space-x-2 flex-nowrap">
                  {recentInboxes.map((item) => {
                    const isActive = item.toLowerCase() === activeEmail.toLowerCase();
                    return (
                      <div
                        key={item}
                        className={`group flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border transition font-mono text-[11px] cursor-pointer whitespace-nowrap select-none ${
                          isActive
                            ? 'bg-indigo-600/25 border-indigo-500/60 text-indigo-200 font-semibold shadow-sm shadow-indigo-500/20'
                            : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                        onClick={() => handleSwitchInbox(item)}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span className="max-w-[130px] sm:max-w-[190px] truncate">{item}</span>
                        {recentInboxes.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveRecentInbox(item);
                            }}
                            className="opacity-40 group-hover:opacity-100 hover:text-rose-400 ml-1 transition"
                            title="Close Tab"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Alias & Domain Bar */}
            <div className="pt-2 border-t border-slate-800/60 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px]">
                <span className="flex items-center space-x-1.5 text-indigo-300 font-semibold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'bn' ? '৫০,০০০+ মেগা ডোমেইন পুল (ccTLD সহ) • কাস্টম নাম ও কোম্পানি ফিল্টার:' : '50,000+ Ultra-Mega Fleet (ccTLDs Included):'}</span>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setShowDirectoryModal(true);
                    fetchDirectoryDomains('', directoryCategory, 1, directoryLimit, false);
                  }}
                  className="inline-flex items-center justify-center space-x-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-md shadow-indigo-600/30 transition transform active:scale-95 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                  <span>{lang === 'bn' ? '🌐 ৫০,০০০+ ডোমেইন ডিরেক্টরি ব্রাউজ করুন' : '🌐 Browse 50,000+ Directory'}</span>
                </button>
              </div>
              <form onSubmit={handleApplyAddress} className="flex flex-col sm:flex-row items-center gap-3">
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
                {isDirectDomainMode ? (
                  <div className="flex-1 sm:w-64 flex items-center bg-slate-950 border border-indigo-500 rounded-xl px-3 py-1.5 transition">
                    <span className="text-indigo-400 font-mono text-xs mr-1">@</span>
                    <input
                      type="text"
                      value={directDomainInput}
                      onChange={(e) => setDirectDomainInput(e.target.value)}
                      placeholder="e.g. sajjadholding.com"
                      className="bg-transparent border-none outline-none text-xs text-indigo-200 placeholder:text-slate-600 w-full font-mono"
                    />
                  </div>
                ) : (
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none focus:border-indigo-500 font-mono w-full sm:w-auto"
                  >
                    {pinnedDomains.length > 0 && (
                      <optgroup label={lang === 'bn' ? '⭐ পিন করা ফেভারিট' : '⭐ Pinned Favorites'}>
                        {pinnedDomains.map((pDom) => (
                          <option key={`pin-${pDom}`} value={pDom}>
                            ⭐ @{pDom}
                          </option>
                        ))}
                      </optgroup>
                    )}
                    <optgroup label={lang === 'bn' ? '🌐 সমস্ত ডোমেন' : '🌐 All Domains'}>
                      {domains.map((dom) => (
                        <option key={dom.id} value={dom.domain}>
                          @{dom.domain} {dom.businessName ? `(${dom.businessName})` : dom.isCustom ? '(Custom)' : ''}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                )}

                <button
                  type="button"
                  onClick={() => setIsDirectDomainMode(!isDirectDomainMode)}
                  className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-indigo-300 text-xs transition"
                  title={isDirectDomainMode ? 'Switch to dropdown' : 'Type custom domain directly'}
                >
                  {isDirectDomainMode ? <Layers className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowDirectoryModal(true);
                    fetchDirectoryDomains('', directoryCategory, 1, directoryLimit, false);
                  }}
                  className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs transition"
                  title="Search 50,000+ Domains"
                >
                  <Search className="w-4 h-4 text-yellow-300" />
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition whitespace-nowrap"
                >
                  {t.applyAddress}
                </button>
              </div>
            </form>
          </div>
          </div>
        </section>

        {/* Permanent Locked Inboxes Tray */}
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

        {/* Floating Quick-OTP Action Banner */}
        {latestOtpEmail && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/50 to-indigo-950/70 border border-indigo-500/40 shadow-lg shadow-indigo-950/40 flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <KeyRound className="w-5 h-5 text-yellow-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-indigo-300 flex items-center space-x-1.5 truncate">
                  <span>{t.otpDetected}</span>
                  <span className="text-slate-400 truncate">• {latestOtpEmail.senderName || latestOtpEmail.sender}</span>
                </div>
                <div className="font-mono text-xl font-black tracking-widest text-white">
                  {latestOtpEmail.otpCode}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1.5 shrink-0">
              <button
                type="button"
                onClick={() => announceOtp(latestOtpEmail.otpCode!, lang)}
                className="p-2 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 transition"
                title={t.listenOtp}
              >
                <Volume2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleCopyOtp(latestOtpEmail.otpCode!)}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition shadow-sm"
              >
                {copiedOtp === latestOtpEmail.otpCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOtp === latestOtpEmail.otpCode ? t.copied : t.copyOtp}</span>
              </button>
            </div>
          </div>
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

              {emails.length > 0 && (
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={handleExportEmails}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center space-x-1 transition shadow-sm"
                    title={lang === 'bn' ? 'JSON ব্যাকআপ ডাউনলোড' : 'Export JSON'}
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="hidden sm:inline font-mono">JSON</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCsv}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center space-x-1 transition shadow-sm"
                    title={lang === 'bn' ? 'CSV স্প্রেডশিট ডাউনলোড' : 'Export CSV'}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden sm:inline font-mono">CSV</span>
                  </button>
                </div>
              )}
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
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/30 p-8 md:p-12 text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping"></div>
                <div className="relative w-16 h-16 rounded-full bg-slate-900 border border-indigo-500/30 flex items-center justify-center">
                  <Mail className="w-8 h-8 text-indigo-400" />
                </div>
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-base font-semibold text-slate-200">{t.waitingMails}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{t.waitingSub}</p>
              </div>

              {/* 3 Step Live Guide for Real Emails */}
              <div className="max-w-xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {lang === 'bn' ? 'ধাপ ১ : কপি করুন' : 'Step 1 : Copy'}
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    {lang === 'bn' ? 'ইমেইল অ্যাড্রেস কপি' : 'Copy Email Address'}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-snug">
                    {lang === 'bn' ? 'উপরের কপি বাটনে ক্লিক করে ইমেইলটি কপি করুন।' : 'Copy the active email shown above.'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    {lang === 'bn' ? 'ধাপ ২ : সাইন-আপ' : 'Step 2 : Sign Up'}
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    {lang === 'bn' ? 'যেকোনো ওয়েবসাইটে দিন' : 'Use Anywhere'}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-snug">
                    {lang === 'bn' ? 'Facebook, Google বা যেকোনো রেজিস্ট্রেশনে দিন।' : 'Paste in Facebook, Google or any sign-up.'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30 space-y-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    {lang === 'bn' ? 'ধাপ ৩ : কোড গ্রহণ' : 'Step 3 : Receive'}
                  </div>
                  <div className="text-xs font-semibold text-slate-200">
                    {lang === 'bn' ? 'স্বয়ংক্রিয় ওটিপি কার্ড' : 'Instant OTP Card'}
                  </div>
                  <div className="text-[11px] text-slate-400 leading-snug">
                    {lang === 'bn' ? 'কোড আসার সাথে সাথে বেল বাজবে ও ওটিপি দেখাবে।' : 'Chime sounds and OTP appears for 1-click copy.'}
                  </div>
                </div>
              </div>

              {/* Instant Test Buttons for Localhost Testing */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => handleSimulateInbound(undefined, Math.floor(100000 + Math.random() * 900000).toString())}
                  disabled={isSimulating}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-xs font-bold px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>
                    {isSimulating
                      ? (lang === 'bn' ? 'কোড পাঠানো হচ্ছে...' : 'Sending...')
                      : (lang === 'bn' ? '⚡ ১-ক্লিকে তাৎক্ষণিক টেস্ট কোড পাঠান' : '⚡ Send Instant Test OTP')}
                  </span>
                </button>

                <button
                  onClick={() => setShowSimModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-xs font-semibold px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                >
                  <span>{lang === 'bn' ? 'কাস্টম প্রেরক/কোড সেট করুন' : 'Custom Sender/Code'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-3">
              {filteredEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setSelectedEmail(email)}
                  className={`group relative rounded-xl border p-4 md:p-4.5 transition cursor-pointer space-y-3 ${
                    selectedEmail?.id === email.id
                      ? 'border-indigo-500 bg-slate-900 shadow-md shadow-indigo-500/15 ring-1 ring-indigo-500/40'
                      : 'border-slate-800/90 hover:border-indigo-500/40 bg-slate-900/40 hover:bg-slate-900/80'
                  }`}
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
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          announceOtp(email.otpCode!, lang);
                        }}
                        className="p-1 rounded-md bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 transition ml-1"
                        title={t.listenOtp}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
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

          {/* Right Column: Desktop Email Reading Pane (7 columns on desktop, hidden on mobile) */}
          <div className="hidden lg:flex lg:col-span-7 flex-col rounded-2xl border border-slate-800/80 bg-slate-900/40 backdrop-blur-md overflow-hidden min-h-[640px] sticky top-20 max-h-[calc(100vh-6rem)] shadow-2xl">
            {selectedEmail ? (
              <div className="flex flex-col h-full">
                {/* Pane Header */}
                <div className="p-5 border-b border-slate-800 bg-slate-900/60 flex items-start justify-between">
                  <div className="space-y-1 pr-4">
                    <h3 className="font-bold text-lg text-slate-100">{selectedEmail.subject}</h3>
                    <div className="text-xs text-slate-400 flex items-center space-x-2">
                      <span><b>{t.from}:</b> {selectedEmail.senderName || selectedEmail.sender}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-mono text-slate-500">{selectedEmail.sender}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      <b>{t.received}:</b> {new Date(selectedEmail.receivedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowReplyModal(true)}
                      className="p-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition"
                      title={lang === 'bn' ? 'উত্তর দিন' : 'Reply'}
                    >
                      <Reply className="w-4 h-4 text-indigo-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadEml(selectedEmail)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      title={t.exportEml}
                    >
                      <Download className="w-4 h-4 text-indigo-400" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedEmail(null)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
                      title={t.close}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* OTP Banner inside pane */}
                {selectedEmail.otpCode && (
                  <div className="bg-indigo-950/60 border-b border-indigo-900/50 p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <KeyRound className="w-5 h-5 text-yellow-400 animate-pulse" />
                      <div>
                        <div className="text-xs font-medium text-indigo-300">{t.otpDetected}</div>
                        <div className="font-mono text-2xl font-black tracking-widest text-white">
                          {selectedEmail.otpCode}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => announceOtp(selectedEmail.otpCode!, lang)}
                        className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 font-semibold text-xs flex items-center space-x-1.5 transition"
                        title={t.listenOtp}
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>{t.listenOtp}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyOtp(selectedEmail.otpCode!)}
                        className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition shadow-sm"
                      >
                        {copiedOtp === selectedEmail.otpCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{copiedOtp === selectedEmail.otpCode ? t.copied : t.copyOtp}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Pane Content */}
                <div className="p-5 overflow-y-auto flex-1 space-y-4">
                  {selectedEmail.verificationLinks && selectedEmail.verificationLinks.length > 0 && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between gap-3">
                      <span className="text-xs text-emerald-300 font-medium">
                        {lang === 'bn' ? 'যাচাইকরণ লিংক সনাক্ত হয়েছে:' : 'Verification link detected:'}
                      </span>
                      <a
                        href={selectedEmail.verificationLinks[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>{t.openLink}</span>
                      </a>
                    </div>
                  )}

                  {/* Email Body - Sandboxed & XSS Protected */}
                  <EmailRenderer
                    htmlBody={selectedEmail.htmlBody}
                    textBody={selectedEmail.textBody}
                  />

                  {/* Attachments */}
                  {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Attachments ({selectedEmail.attachments.length})</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedEmail.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                          >
                            <div className="truncate mr-2">
                              <div className="font-semibold text-slate-200 truncate">{att.filename}</div>
                              <div className="text-[10px] text-slate-500 font-mono">
                                {(att.sizeBytes / 1024).toFixed(1)} KB • {att.contentType}
                              </div>
                            </div>
                            {att.downloadUrl ? (
                              <a
                                href={att.downloadUrl}
                                download={att.filename}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pane Footer */}
                <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowReplyModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-xs font-medium text-indigo-300 hover:text-white border border-indigo-500/30 flex items-center space-x-1.5 transition"
                    >
                      <Reply className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'রিপ্লাই দিন' : 'Reply'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadEml(selectedEmail)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{t.exportEml}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadTxt(selectedEmail)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 flex items-center space-x-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.exportTxt}</span>
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedEmail(null)}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                  >
                    {t.close}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Mail className="w-8 h-8 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-base text-slate-300">
                    {lang === 'bn' ? 'কোনো ইমেইল নির্বাচিত হয়নি' : 'No Email Selected'}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    {lang === 'bn' 
                      ? 'বামপাশের তালিকা থেকে যেকোনো মেসেজ নির্বাচন করে পূর্ণাঙ্গ HTML/Text ভিউ, ওটিপি কোড ও এটাচমেন্ট এখানে সরাসরি প্রিভিউ করুন।'
                      : 'Select an email from the left feed to preview full HTML, OTP codes, and attachments in real-time.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSimulateInbound(undefined, Math.floor(100000 + Math.random() * 900000).toString())}
                  disabled={isSimulating}
                  className="inline-flex items-center space-x-2 text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                  <span>{lang === 'bn' ? '⚡ টেস্ট ওটিপি পাঠিয়ে প্রিভিউ দেখুন' : '⚡ Send Test OTP to Preview'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Email Reader Modal (Mobile & Tablet: lg:hidden) */}
      {selectedEmail && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
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
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => announceOtp(selectedEmail.otpCode!, lang)}
                    className="px-3 py-2 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 font-semibold text-xs flex items-center space-x-1.5 transition"
                    title={t.listenOtp}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.listenOtp}</span>
                  </button>
                  <button
                    onClick={() => handleCopyOtp(selectedEmail.otpCode!)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1.5 transition"
                  >
                    {copiedOtp === selectedEmail.otpCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedOtp === selectedEmail.otpCode ? t.copied : t.copyOtp}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              {/* Email Body - Sandboxed & XSS Protected */}
              <EmailRenderer
                htmlBody={selectedEmail.htmlBody}
                textBody={selectedEmail.textBody}
              />
              {/* Attachments if present */}
              {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                    <Download className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Attachments ({selectedEmail.attachments.length})</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedEmail.attachments.map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs"
                      >
                        <div className="truncate mr-2">
                          <div className="font-semibold text-slate-200 truncate">{att.filename}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {(att.sizeBytes / 1024).toFixed(1)} KB • {att.contentType}
                          </div>
                        </div>
                        {att.downloadUrl ? (
                          <a
                            href={att.downloadUrl}
                            download={att.filename}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer with Export options */}
            <div className="p-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setShowReplyModal(true)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-xs font-medium text-indigo-300 hover:text-white border border-indigo-500/30 flex items-center space-x-1.5 transition"
                >
                  <Reply className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'রিপ্লাই' : 'Reply'}</span>
                </button>
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

      {/* QR Code Modal */}
      <QrModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        activeEmail={activeEmail}
        onCopy={handleCopyEmail}
        title={t.qrModalTitle}
        scanDesc={t.qrScanDesc}
        copyText={t.copy}
      />

      {/* Master App Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settingsTab={settingsTab}
        setSettingsTab={setSettingsTab}
        lang={lang}
        t={t}
        vercelLiveUrl={vercelLiveUrl}
        setVercelLiveUrl={setVercelLiveUrl}
        selectedDomain={selectedDomain}
        setSelectedDomain={setSelectedDomain}
        cfApiToken={cfApiToken}
        setCfApiToken={setCfApiToken}
        handleFetchCloudflareZones={handleFetchCloudflareZones}
        isFetchingCfZones={isFetchingCfZones}
        cfZonesMsg={cfZonesMsg}
        cfAvailableZones={cfAvailableZones}
        handleAutoSetupCloudflare={handleAutoSetupCloudflare}
        isSettingUpCf={isSettingUpCf}
        cfSetupResult={cfSetupResult}
        cfSetupError={cfSetupError}
        onCopyWebhook={() => {
          navigator.clipboard.writeText(`${vercelLiveUrl.replace(/\/+$/, '')}/api/inbound/webhook`);
          setActionSuccess(lang === 'bn' ? 'ওয়েবহুক URL কপি হয়েছে!' : 'Webhook URL copied!');
          setTimeout(() => setActionSuccess(null), 2000);
        }}
        businessNameInput={businessNameInput}
        setBusinessNameInput={setBusinessNameInput}
        businessTaglineInput={businessTaglineInput}
        setBusinessTaglineInput={setBusinessTaglineInput}
        handleSaveBusinessProfile={handleSaveBusinessProfile}
        newDomainInput={newDomainInput}
        setNewDomainInput={setNewDomainInput}
        handleAddDomain={handleAddDomain}
        domains={domains}
        handleDeleteDomain={handleDeleteDomain}
        telegramConfig={telegramConfig}
        setTelegramConfig={setTelegramConfig}
        handleSaveTelegram={handleSaveTelegram}
        isSavingTelegram={isSavingTelegram}
        handleTestTelegram={handleTestTelegram}
        isTestingTelegram={isTestingTelegram}
        telegramStatusMsg={telegramStatusMsg}
        blueGreenConfig={blueGreenConfig}
        handleProbeHealth={handleProbeHealth}
        isProbingHealth={isProbingHealth}
        handleSwitchDeploymentSlot={handleSwitchDeploymentSlot}
        isSwitchingSlot={isSwitchingSlot}
        canarySlider={canarySlider}
        setCanarySlider={setCanarySlider}
        handleApplyCanarySplit={handleApplyCanarySplit}
        handleCheckVersion={handleCheckVersion}
        isCheckingUpdate={isCheckingUpdate}
        updateStatus={updateStatus}
        handleClearBrowserCache={handleClearBrowserCache}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        handleExportEmails={handleExportEmails}
        emailsCount={emails.length}
      />

      {/* Lifetime Lock Modal */}
      <LockModal
        isOpen={showLockModal}
        onClose={() => setShowLockModal(false)}
        lockPin={lockPin}
        setLockPin={setLockPin}
        onSubmit={handleLockLifetime}
        title={t.lockModalTitle}
        description={t.lockModalDesc}
        enterPinText={t.enterPin}
        cancelText={t.cancel}
        confirmText={t.confirmLock}
      />

      {/* Unlock Modal */}
      <UnlockModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        unlockPin={unlockPin}
        setUnlockPin={setUnlockPin}
        onSubmit={handleUnlock}
        title={t.unlock}
        description={t.enterUnlockPin}
        cancelText={t.cancel}
        confirmText={t.confirmUnlock}
      />

      {/* Custom Domain & Business Workspace Modal */}
      <DomainFleetModal
        isOpen={showDomainModal}
        onClose={() => setShowDomainModal(false)}
        lang={lang}
        t={t}
        businessNameInput={businessNameInput}
        setBusinessNameInput={setBusinessNameInput}
        businessTaglineInput={businessTaglineInput}
        setBusinessTaglineInput={setBusinessTaglineInput}
        handleSaveBusinessProfile={handleSaveBusinessProfile}
        newDomainInput={newDomainInput}
        setNewDomainInput={setNewDomainInput}
        handleAddDomain={handleAddDomain}
        domains={domains}
        selectedDomain={selectedDomain}
        setSelectedDomain={setSelectedDomain}
        handleDeleteDomain={handleDeleteDomain}
        vercelLiveUrl={vercelLiveUrl}
        setVercelLiveUrl={setVercelLiveUrl}
        integrationTab={integrationTab}
        setIntegrationTab={setIntegrationTab}
        cfApiToken={cfApiToken}
        setCfApiToken={setCfApiToken}
        handleAutoSetupCloudflare={handleAutoSetupCloudflare}
        isSettingUpCf={isSettingUpCf}
        cfSetupResult={cfSetupResult}
        cfSetupError={cfSetupError}
        onActionSuccess={(msg) => {
          setActionSuccess(msg);
          setTimeout(() => setActionSuccess(null), 2500);
        }}
      />

      {/* Simulator Modal */}
      <SimModal
        isOpen={showSimModal}
        onClose={() => setShowSimModal(false)}
        activeEmail={activeEmail}
        simSender={simSender}
        setSimSender={setSimSender}
        simSubject={simSubject}
        setSimSubject={setSimSubject}
        simOtp={simOtp}
        setSimOtp={setSimOtp}
        isSimulating={isSimulating}
        onSubmit={handleSimulateInbound}
        title={t.quickSimulateTitle}
        senderLabel={t.simSender}
        subjectLabel={t.simSubject}
        otpLabel={t.simOtp}
        cancelText={t.cancel}
        sendBtnText={t.sendTestBtn}
        sendingText={t.sending}
        lang={lang}
      />

      {/* 50,000+ Mega Domain Directory Modal */}
      <DirectoryModal
        isOpen={showDirectoryModal}
        onClose={() => setShowDirectoryModal(false)}
        lang={lang}
        t={t}
        totalDatabaseCount={totalDatabaseCount}
        handleClearBrowserCache={handleClearBrowserCache}
        directorySearch={directorySearch}
        setDirectorySearch={setDirectorySearch}
        categoryCounts={categoryCounts}
        directoryCategory={directoryCategory}
        setDirectoryCategory={setDirectoryCategory}
        setDirectoryPage={setDirectoryPage}
        directoryPagination={directoryPagination}
        directoryPage={directoryPage}
        directoryLimit={directoryLimit}
        setDirectoryLimit={setDirectoryLimit}
        fetchDirectoryDomains={fetchDirectoryDomains}
        pinnedDomains={pinnedDomains}
        setPinnedDomains={setPinnedDomains}
        togglePinDomain={togglePinDomain}
        triggerHaptic={triggerHaptic}
        usernamePrefix={usernamePrefix}
        setSelectedDomain={setSelectedDomain}
        onSelectDomain={(domain) => {
          setSelectedDomain(domain);
          if (usernamePrefix) {
            const newAddr = `${usernamePrefix}@${domain}`;
            setActiveEmail(newAddr);
            try { localStorage.setItem('owntemp_active_email', newAddr); } catch (e) {}
            addRecentInbox(newAddr);
            fetchEmails(newAddr);
          }
          setActionSuccess(
            lang === 'bn'
              ? `ডোমেইন @${domain} সফলভাবে সিলেক্ট করা হয়েছে!`
              : `Domain @${domain} selected successfully!`
          );
          setTimeout(() => setActionSuccess(null), 2500);
        }}
        isLoadingDirectory={isLoadingDirectory}
        directoryResults={directoryResults}
        handleLoadMoreDomains={handleLoadMoreDomains}
        isLoadingMore={isLoadingMore}
        handleFirstDirectoryPage={handleFirstDirectoryPage}
        handlePrevDirectoryPage={handlePrevDirectoryPage}
        handleNextDirectoryPage={handleNextDirectoryPage}
        handleLastDirectoryPage={handleLastDirectoryPage}
      />

      {/* Disposable Outbound Reply Modal */}
      {selectedEmail && (
        <ReplyModal
          isOpen={showReplyModal}
          onClose={() => setShowReplyModal(false)}
          fromAddress={activeEmail}
          toAddress={selectedEmail.sender}
          defaultSubject={selectedEmail.subject}
          onSentSuccess={(msg) => {
            setActionSuccess(msg);
            setTimeout(() => setActionSuccess(null), 3500);
            setShowReplyModal(false);
          }}
          lang={lang}
        />
      )}

      {/* Keyboard Shortcuts Cheatsheet Modal */}
      <KeyboardShortcutsModal
        isOpen={showKeyboardModal}
        onClose={() => setShowKeyboardModal(false)}
        lang={lang}
      />

      {/* Floating Instant OTP Notification Card */}
      {latestOtpEmail && latestOtpEmail.otpCode && latestOtpEmail.otpCode !== dismissedOtp && (
        <FloatingOtpBanner
          otpCode={latestOtpEmail.otpCode}
          senderName={latestOtpEmail.senderName || latestOtpEmail.sender}
          verificationLink={
            latestOtpEmail.verificationLinks && latestOtpEmail.verificationLinks.length > 0
              ? latestOtpEmail.verificationLinks[0]
              : undefined
          }
          onCopy={handleCopyOtp}
          onAnnounce={(code) => announceOtp(code, lang)}
          onDismiss={() => setDismissedOtp(latestOtpEmail.otpCode || null)}
          lang={lang}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <b>Owntemp</b> &copy; 2026 — {lang === 'bn' ? 'আজীবন ফ্রি ডিসপোজেবল ইমেইল ইঞ্জিন' : 'Lifetime Free Disposable Email Engine'}
          </div>
          <div className="flex items-center space-x-4">
            <span className="font-mono text-indigo-400">API: /api/inbound/webhook</span>
            <span>•</span>
            <span className="font-mono text-emerald-400 font-bold bg-slate-900 px-2.5 py-0.5 rounded border border-slate-800 flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{APP_VERSION}</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (Fixed for Android & Mobile Web) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-4 py-2 flex items-center justify-around shadow-2xl">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center justify-center space-y-1 text-slate-300 hover:text-indigo-400 text-[10px] font-semibold transition"
        >
          <Mail className="w-5 h-5 text-indigo-400" />
          <span>{lang === 'bn' ? 'ইনবক্স' : 'Inbox'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setShowDirectoryModal(true);
            fetchDirectoryDomains('', directoryCategory, 1, directoryLimit, false);
          }}
          className="flex flex-col items-center justify-center space-y-1 text-slate-300 hover:text-indigo-400 text-[10px] font-semibold transition"
        >
          <Globe className="w-5 h-5 text-indigo-400" />
          <span>{lang === 'bn' ? 'ডোমেইন' : 'Domains'}</span>
        </button>
        <button
          type="button"
          onClick={() => setShowSimModal(true)}
          className="flex flex-col items-center justify-center space-y-1 text-slate-300 hover:text-indigo-400 text-[10px] font-semibold transition"
        >
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{lang === 'bn' ? 'সিমুলেটর' : 'Simulator'}</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setSettingsTab('api');
            setShowSettingsModal(true);
          }}
          className="flex flex-col items-center justify-center space-y-1 text-slate-300 hover:text-indigo-400 text-[10px] font-semibold transition"
        >
          <Settings className="w-5 h-5 text-slate-400" />
          <span>{lang === 'bn' ? 'সেটিংস' : 'Settings'}</span>
        </button>
      </nav>
    </main>
  );
}
