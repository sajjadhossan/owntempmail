'use client';

import React from 'react';
import {
  Globe,
  RefreshCw,
  Search,
  Star,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface DirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
  t: any;
  totalDatabaseCount?: number;
  handleClearBrowserCache?: () => void;
  directorySearch?: string;
  setDirectorySearch?: (val: string) => void;
  categoryCounts?: Record<string, number>;
  directoryCategory?: string;
  setDirectoryCategory?: (val: string) => void;
  setDirectoryPage?: (val: number | ((prev: number) => number)) => void;
  directoryPagination?: { totalMatches: number; totalPages: number; hasMore: boolean };
  directoryPage?: number;
  directoryLimit?: number;
  setDirectoryLimit?: (val: number) => void;
  fetchDirectoryDomains?: (query: string, cat: string, page: number, lim: number, append: boolean) => void;
  pinnedDomains?: string[];
  setPinnedDomains?: (val: string[]) => void;
  togglePinDomain?: (dom: string) => void;
  triggerHaptic?: (ms: number) => void;
  usernamePrefix?: string;
  setSelectedDomain?: (dom: string) => void;
  onSelectDomain: (domain: string) => void;
  isLoadingDirectory?: boolean;
  directoryResults?: Array<{ domain: string; category: string; length?: number; isUltraShort?: boolean }>;
  handleLoadMoreDomains?: () => void;
  isLoadingMore?: boolean;
  handleFirstDirectoryPage?: () => void;
  handlePrevDirectoryPage?: () => void;
  handleNextDirectoryPage?: () => void;
  handleLastDirectoryPage?: () => void;
}

export default function DirectoryModal({
  isOpen,
  onClose,
  lang = 'bn',
  t,
  totalDatabaseCount = 51774,
  handleClearBrowserCache,
  directorySearch = '',
  setDirectorySearch,
  categoryCounts = {},
  directoryCategory = 'all',
  setDirectoryCategory,
  setDirectoryPage,
  directoryPagination = { totalMatches: 51774, totalPages: 1726, hasMore: true },
  directoryPage = 1,
  directoryLimit = 30,
  setDirectoryLimit,
  fetchDirectoryDomains,
  pinnedDomains = [],
  setPinnedDomains,
  togglePinDomain,
  triggerHaptic = () => {},
  usernamePrefix = '',
  setSelectedDomain,
  onSelectDomain,
  isLoadingDirectory = false,
  directoryResults = [],
  handleLoadMoreDomains,
  isLoadingMore = false,
  handleFirstDirectoryPage,
  handlePrevDirectoryPage,
  handleNextDirectoryPage,
  handleLastDirectoryPage,
}: DirectoryModalProps) {
  if (!isOpen) return null;

  const safeCategoryCounts = categoryCounts || {};
  const safePagination = directoryPagination || { totalMatches: 51774, totalPages: 1726, hasMore: true };
  const safePinned = Array.isArray(pinnedDomains) ? pinnedDomains : [];
  const safeResults = Array.isArray(directoryResults) ? directoryResults : [];
  const totalMatches = typeof safePagination.totalMatches === 'number' ? safePagination.totalMatches : 51774;
  const totalPages = typeof safePagination.totalPages === 'number' ? safePagination.totalPages : 1726;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] h-full sm:h-auto min-h-[460px] flex flex-col shadow-2xl overflow-hidden">
        {/* Fixed Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 flex-shrink-0">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div className="truncate">
              <div className="flex items-center space-x-1.5 flex-wrap">
                <h3 className="font-extrabold text-sm sm:text-base text-slate-100 truncate">
                  {lang === 'bn' ? '৫০,০০০+ ডোমেন ডিরেক্টরি' : '50,000+ Domain Directory'}
                </h3>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                  {(totalDatabaseCount || 51774).toLocaleString()}+ Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                {lang === 'bn' ? 'ccTLD কান্ট্রি-কোড (.de, .fr, .uk, .jp) বা ক্যাটাগরি অনুযায়ী বেছে নিন' : 'Filter by country ccTLD or flagship category'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            {handleClearBrowserCache && (
              <button
                type="button"
                onClick={handleClearBrowserCache}
                className="text-slate-400 hover:text-indigo-300 p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs transition flex items-center space-x-1 cursor-pointer"
                title="Clear Browser Cache & Refresh"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden md:inline text-[11px] font-medium">{lang === 'bn' ? 'ক্যাশ রিফ্রেশ' : 'Clear Cache'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-100 p-1.5 sm:p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Fixed Search Bar & Swipeable Category Pills */}
        <div className="p-3 sm:p-4 bg-slate-950/80 border-b border-slate-800/80 space-y-2.5 flex-shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={directorySearch}
              onChange={(e) => setDirectorySearch && setDirectorySearch(e.target.value)}
              placeholder={lang === 'bn' ? 'ডোমেইন সার্চ করুন (যেমন: 00, de, mail, shark, box, xyz)...' : 'Search domain (e.g. 00, de, mail, shark, box, xyz)...'}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 sm:py-2 text-xs font-mono text-slate-100 placeholder:text-slate-500 outline-none focus:border-indigo-500 shadow-inner"
            />
          </div>

          {/* Horizontal Category Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs no-scrollbar select-none" style={{ WebkitOverflowScrolling: 'touch' }}>
            {[
              { id: 'all', label: lang === 'bn' ? 'সকল' : 'All', count: safeCategoryCounts.all || 51774 },
              { id: 'ultrashort', label: lang === 'bn' ? '⚡ আল্ট্রা-শর্ট' : '⚡ Ultra-Short', count: safeCategoryCounts.ultrashort || 11192 },
              { id: 'cctld', label: lang === 'bn' ? '🌍 ccTLD কান্ট্রি' : '🌍 ccTLDs', count: safeCategoryCounts.cctld || 5593 },
              { id: 'tenminute', label: lang === 'bn' ? '⏱️ ১০-মিনিট' : '⏱️ 10-Min', count: safeCategoryCounts.tenminute || 610 },
              { id: 'developer', label: lang === 'bn' ? '🛠️ ডেভেলপার' : '🛠️ Dev', count: safeCategoryCounts.developer || 864 },
              { id: 'privacy', label: lang === 'bn' ? '🛡️ প্রাইভেসি' : '🛡️ Privacy', count: safeCategoryCounts.privacy || 187 },
              { id: 'mailinator', label: '👑 Mailinator', count: safeCategoryCounts.mailinator || 39 },
              { id: 'guerrilla', label: '🚀 Guerrilla', count: safeCategoryCounts.guerrilla || 14 },
              { id: 'mailtm', label: '✈️ Mail.tm', count: safeCategoryCounts.mailtm || 12 },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (setDirectoryCategory) setDirectoryCategory(cat.id);
                  if (setDirectoryPage) setDirectoryPage(1);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition flex items-center space-x-1.5 flex-shrink-0 cursor-pointer ${
                  directoryCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{cat.label}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-950/70 font-mono font-bold text-slate-300">
                  {(cat.count || 0).toLocaleString()}
                </span>
              </button>
            ))}
          </div>

          {/* Status and Batch Count */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
            <span className="truncate">
              {lang === 'bn' ? (
                <span>মোট <b className="text-indigo-400 font-mono">{totalMatches.toLocaleString()}</b>টি ডোমেইন (পৃষ্ঠা <b className="text-emerald-400 font-mono">{directoryPage}</b>/{totalPages})</span>
              ) : (
                <span><b className="text-indigo-400 font-mono">{totalMatches.toLocaleString()}</b> domains (Page <b className="text-emerald-400 font-mono">{directoryPage}</b>/{totalPages})</span>
              )}
            </span>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <span className="text-[10px] text-slate-500">{lang === 'bn' ? 'প্রতি পেজে:' : 'Batch:'}</span>
              {[30, 60, 120].map((lim) => (
                <button
                  key={lim}
                  type="button"
                  onClick={() => {
                    if (setDirectoryLimit) setDirectoryLimit(lim);
                    if (setDirectoryPage) setDirectoryPage(1);
                    if (fetchDirectoryDomains) fetchDirectoryDomains(directorySearch, directoryCategory, 1, lim, false);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                    directoryLimit === lim
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                  }`}
                >
                  {lim}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scrollable Domains Grid List */}
        <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-3 overscroll-contain">
          {safePinned.length > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <div className="flex items-center justify-between text-[11px] font-bold text-amber-300 mb-1.5">
                <span className="flex items-center space-x-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{lang === 'bn' ? 'আপনার পিন করা ডোমেনসমূহ' : 'Pinned Favorites'} ({safePinned.length})</span>
                </span>
                {setPinnedDomains && (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(30);
                      setPinnedDomains([]);
                      try { localStorage.removeItem('owntemp_pinned_domains'); } catch (e) {}
                    }}
                    className="text-[10px] text-amber-400/80 hover:text-amber-300 underline"
                  >
                    {lang === 'bn' ? 'সব মুছুন' : 'Clear all'}
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {safePinned.map((pDom) => (
                  <button
                    key={pDom}
                    type="button"
                    onClick={() => {
                      triggerHaptic(30);
                      onSelectDomain(pDom);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 text-xs font-mono flex items-center space-x-1.5 transition active:scale-95"
                  >
                    <span>@{pDom}</span>
                    {togglePinDomain && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinDomain(pDom);
                        }}
                        className="text-amber-400 hover:text-red-400 font-bold ml-1"
                      >
                        ×
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Custom Input */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <span className="text-xs text-indigo-400 font-bold flex-shrink-0">@</span>
              <input
                type="text"
                placeholder={lang === 'bn' ? 'নিজস্ব কোনো ডোমেইন টাইপ করুন...' : 'Type any custom domain directly...'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.currentTarget.value || '').trim().replace(/^@/, '');
                    if (val) {
                      onSelectDomain(val);
                      onClose();
                    }
                  }
                }}
                className="bg-transparent border-none outline-none text-xs font-mono text-slate-100 placeholder:text-slate-500 flex-1 min-w-0"
              />
            </div>
            <span className="text-[10px] text-slate-500 font-mono hidden sm:inline flex-shrink-0">{lang === 'bn' ? 'এন্টার চাপুন' : 'Press Enter'}</span>
          </div>

          {isLoadingDirectory ? (
            <div className="py-16 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-400" />
              <span>{lang === 'bn' ? 'ডোমেইন লোড হচ্ছে...' : 'Loading domains...'}</span>
            </div>
          ) : safeResults.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              {lang === 'bn' ? 'কোনো ডোমেইন পাওয়া যায়নি। অন্য কোনো নাম দিয়ে সার্চ করুন।' : 'No domains found matching your search.'}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {safeResults.map((item) => (
                  <div
                    key={item.domain}
                    onClick={() => {
                      triggerHaptic(30);
                      onSelectDomain(item.domain);
                      onClose();
                    }}
                    className={`p-2.5 sm:p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between group active:scale-[0.99] ${
                      directoryCategory === item.domain
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 shadow-md'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-indigo-500/40 hover:bg-slate-900 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition truncate mr-1">
                        @{item.domain}
                      </span>
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        {item.isUltraShort && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex-shrink-0">
                            {item.length}c
                          </span>
                        )}
                        {togglePinDomain && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              togglePinDomain(item.domain);
                            }}
                            className="p-1 rounded-md hover:bg-slate-800 text-slate-500 hover:text-amber-400 transition"
                            title={safePinned.includes(item.domain) ? 'Unpin domain' : 'Pin domain'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 transition ${
                                safePinned.includes(item.domain)
                                  ? 'fill-amber-400 text-amber-400 scale-110'
                                  : 'text-slate-500 hover:text-amber-400'
                              }`}
                            />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium truncate mt-1">
                      {item.category}
                    </div>
                  </div>
                ))}
              </div>

              {safePagination.hasMore && handleLoadMoreDomains && (
                <div className="pt-2 pb-2 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMoreDomains}
                    disabled={isLoadingMore}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition flex items-center justify-center space-x-1.5 mx-auto disabled:opacity-50 cursor-pointer"
                  >
                    <ArrowDown className={`w-3.5 h-3.5 ${isLoadingMore ? 'animate-bounce' : ''}`} />
                    <span>
                      {isLoadingMore
                        ? (lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading more...')
                        : (lang === 'bn' ? `আরও ${directoryLimit}টি ডোমেন লোড করুন (+Load More)` : `Load More (+${directoryLimit} domains)`)}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Fixed Modal Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-400 flex-shrink-0">
          <div className="flex items-center space-x-1 sm:space-x-1.5">
            {handleFirstDirectoryPage && (
              <button
                type="button"
                onClick={handleFirstDirectoryPage}
                disabled={directoryPage <= 1}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-slate-300 flex items-center space-x-1 transition cursor-pointer"
                title="First Page"
              >
                <ChevronsLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{lang === 'bn' ? 'প্রথম' : 'First'}</span>
              </button>
            )}
            {handlePrevDirectoryPage && (
              <button
                type="button"
                onClick={handlePrevDirectoryPage}
                disabled={directoryPage <= 1}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-slate-300 flex items-center space-x-1 transition cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'পূর্ববর্তী' : 'Prev'}</span>
              </button>
            )}

            <span className="px-2.5 py-1 font-mono text-indigo-300 font-semibold bg-slate-900 rounded-lg border border-slate-800 text-[11px]">
              {directoryPage} / {totalPages}
            </span>

            {handleNextDirectoryPage && (
              <button
                type="button"
                onClick={handleNextDirectoryPage}
                disabled={directoryPage >= totalPages}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-slate-300 flex items-center space-x-1 transition cursor-pointer"
                title="Next Page"
              >
                <span>{lang === 'bn' ? 'পরবর্তী' : 'Next'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
            {handleLastDirectoryPage && (
              <button
                type="button"
                onClick={handleLastDirectoryPage}
                disabled={directoryPage >= totalPages}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 border border-slate-800 text-slate-300 flex items-center space-x-1 transition cursor-pointer"
                title="Last Page"
              >
                <span className="hidden sm:inline">{lang === 'bn' ? 'সর্বশেষ' : 'Last'}</span>
                <ChevronsRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition cursor-pointer"
          >
            {t?.close || (lang === 'bn' ? 'বন্ধ করুন' : 'Close')}
          </button>
        </div>
      </div>
    </div>
  );
}
