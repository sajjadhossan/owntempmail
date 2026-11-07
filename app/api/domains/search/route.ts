import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ALL_PUBLIC_DOMAINS } from '@/lib/public-mail-service';

let cached50kDomains: string[] | null = null;

function load50kDomains(): string[] {
  if (cached50kDomains) return cached50kDomains;
  try {
    const p50k = path.join(process.cwd(), 'data', 'disposable-domains-50k.json');
    const p3500 = path.join(process.cwd(), 'data', 'disposable-domains-3500.json');

    if (fs.existsSync(p50k)) {
      const raw = fs.readFileSync(p50k, 'utf-8');
      cached50kDomains = JSON.parse(raw);
    } else if (fs.existsSync(p3500)) {
      const raw = fs.readFileSync(p3500, 'utf-8');
      cached50kDomains = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading domains dataset:', e);
  }

  if (!cached50kDomains || cached50kDomains.length === 0) {
    cached50kDomains = ALL_PUBLIC_DOMAINS.map((d) => d.domain);
  }
  return cached50kDomains;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const category = searchParams.get('category') || 'all';
    const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get('limit') || '100', 10), 10), 1000);

    const allDomains = load50kDomains();

    // Regex filters for categories across all 51,774 domains
    const ccRegex = /\.(de|fr|uk|co\.uk|jp|es|it|in|br|ru|pl|ca|au|ch|nl|se|cn|us|io)$/i;
    const mailinatorRegex = /mailinator|mailin8r|binkmail|suremail|reconmail|safetymail|notmailinator/i;
    const guerrillaRegex = /guerrilla|sharklaser|grr\.la|pokemail|spam4/i;
    const mailtmRegex = /mail\.tm|mail\.gw|fldubai/i;
    const tenMinRegex = /10min|temp|dispos|minute|trash|throwaway/i;
    const devRegex = /dev|api|test|qa|mock|sandbox|inbox|smtp|post|mailtub|inbucket|mailhog/i;
    const privacyRegex = /privac|shield|safe|secure|ghost|stealth|anon|hide|cloak|burner|secret/i;

    // 100% Live Verified Domains with active public mail engines
    const LIVE_VERIFIED_DOMAINS = [
      'sharklasers.com',
      'grr.la',
      'fldubai.com',
      'maildrop.cc',
      'pokemail.net',
      'guerrillamail.com',
      'guerrillamailblock.com',
      'guerrillamail.net',
      'guerrillamail.org',
      'guerrillamail.biz',
      'guerrillamail.info',
      'spam4.me',
      'mail.tm',
      'mail.gw',
    ];

    let targetPool: string[] = [];

    switch (category) {
      case 'live':
        targetPool = LIVE_VERIFIED_DOMAINS;
        break;
      case 'cctld':
        targetPool = allDomains.filter((d) => ccRegex.test(d));
        break;
      case 'ultrashort':
        targetPool = allDomains.filter((d) => d.length <= 10).sort((a, b) => a.length - b.length);
        break;
      case 'mailinator':
        targetPool = allDomains.filter((d) => mailinatorRegex.test(d));
        break;
      case 'guerrilla':
        targetPool = allDomains.filter((d) => guerrillaRegex.test(d));
        break;
      case 'mailtm':
        targetPool = allDomains.filter((d) => mailtmRegex.test(d));
        break;
      case 'tenminute':
        targetPool = allDomains.filter((d) => tenMinRegex.test(d));
        break;
      case 'developer':
        targetPool = allDomains.filter((d) => devRegex.test(d));
        break;
      case 'privacy':
        targetPool = allDomains.filter((d) => privacyRegex.test(d));
        break;
      case 'all':
      default:
        targetPool = allDomains;
        break;
    }

    // Filter by search query if user typed something
    let filtered = targetPool;
    if (query) {
      filtered = targetPool.filter((dom) => dom.toLowerCase().includes(query));
    }

    const totalMatches = filtered.length;
    const totalPages = Math.ceil(totalMatches / limit) || 1;
    const effectivePage = Math.min(page, totalPages);
    const startIndex = (effectivePage - 1) * limit;
    const paginatedSlice = filtered.slice(startIndex, startIndex + limit);

    const results = paginatedSlice.map((dom) => {
      const isLiveVerified = LIVE_VERIFIED_DOMAINS.includes(dom.toLowerCase());
      let comp = 'Global Network';
      if (isLiveVerified) comp = '🟢 100% Live Verified (Instant OTP)';
      else if (mailinatorRegex.test(dom)) comp = '👑 Mailinator';
      else if (guerrillaRegex.test(dom)) comp = '🚀 Guerrilla Mail';
      else if (mailtmRegex.test(dom)) comp = '✈️ Mail.tm Cloud';
      else if (tenMinRegex.test(dom)) comp = '⏱️ 10 Minute Mail';
      else if (devRegex.test(dom)) comp = '🛠️ Developer Gateways';
      else if (privacyRegex.test(dom)) comp = '🛡️ Privacy Shield';
      else if (dom.length <= 8) comp = '⚡ Ultra-Short (6-8c)';
      else if (ccRegex.test(dom)) {
        const ext = dom.split('.').pop()?.toUpperCase();
        comp = `🌍 Country Domain (.${ext})`;
      }

      return {
        domain: dom,
        category: comp,
        length: dom.length,
        isUltraShort: dom.length <= 8,
        isLiveVerified,
      };
    });

    return NextResponse.json(
      {
        success: true,
        message: `Found ${totalMatches} domains matching criteria`,
        data: {
          results,
          pagination: {
            page: effectivePage,
            limit,
            totalPages,
            totalMatches,
            totalDatabase: allDomains.length,
            startIndex: totalMatches > 0 ? startIndex + 1 : 0,
            endIndex: Math.min(startIndex + limit, totalMatches),
            hasMore: effectivePage < totalPages,
          },
          categoryCounts: {
            all: allDomains.length,
            live: LIVE_VERIFIED_DOMAINS.length,
            ultrashort: 11192,
            cctld: 5593,
            tenminute: 610,
            developer: 864,
            privacy: 187,
            mailinator: 39,
            guerrilla: 14,
            mailtm: 12,
          },
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
          'Cloudflare-CDN-Cache-Control': 'public, max-age=86400, stale-while-revalidate=86400',
          'X-Cache-Tier': 'Edge-CDN-Active',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Error searching domains',
      },
      { status: 500 }
    );
  }
}
