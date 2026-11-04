import { NextRequest, NextResponse } from 'next/server';
import { getInboxMetadata, getAllDomains, getLockedInboxes } from '@/lib/storage';
import { APP_VERSION } from '@/lib/constants';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(`v1_get_${clientIp}`, 120, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Rate limit exceeded. Please wait ${rate.resetInSec} seconds before retrying.`,
        errorCode: 'rate_limit_exceeded',
        errors: [{ field: 'rate_limit', message: 'Too many requests' }],
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rate.resetInSec),
          'X-RateLimit-Limit': '120',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const domains = getAllDomains().filter((d) => d.status === 'active');
    const lockedInboxes = getLockedInboxes();

    return NextResponse.json({
      success: true,
      message: 'Owntemp Developer API v1 is active and ready',
      data: {
        version: APP_VERSION,
        endpoints: {
          createInbox: { method: 'POST', path: '/api/v1/inbox', desc: 'Generate new temp email inbox' },
          getMessages: { method: 'GET', path: '/api/v1/inbox/{address}/messages', desc: 'List received messages' },
          getOtp: { method: 'GET', path: '/api/v1/inbox/{address}/otp?timeout=10', desc: 'Instant OTP poll for CI/CD test automation' },
          streamEvents: { method: 'GET', path: '/api/inbox/{address}/stream', desc: '0ms Realtime Server-Sent Events feed' },
          inboundWebhook: { method: 'POST', path: '/api/inbound/webhook', desc: 'Cloudflare / Mailgun inbound parser' },
        },
        availableDomains: domains.map((d) => d.domain),
        stats: {
          activeDomainsCount: domains.length,
          lockedInboxesCount: lockedInboxes.length,
        },
      },
      errors: [],
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve API overview',
        errorCode: 'internal_server_error',
        errors: [{ field: 'server', message: err?.message || 'Server error' }],
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(`v1_create_${clientIp}`, 60, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Rate limit exceeded. Please wait ${rate.resetInSec} seconds before retrying.`,
        errorCode: 'rate_limit_exceeded',
        errors: [{ field: 'rate_limit', message: 'Too many requests' }],
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rate.resetInSec),
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const domains = getAllDomains().filter((d) => d.status === 'active');
    const defaultDomain = domains.length > 0 ? domains[0].domain : 'owntemp.live';

    const domain = (body.domain || defaultDomain).trim().toLowerCase();
    const prefix = (body.prefix || `dev_${Math.random().toString(36).substring(2, 8)}`).trim().toLowerCase();
    const address = `${prefix}@${domain}`;

    const metadata = getInboxMetadata(address);

    return NextResponse.json(
      {
        success: true,
        message: 'Developer inbox generated successfully',
        data: {
          address,
          prefix,
          domain,
          createdAt: metadata.createdAt,
          feedUrl: `/api/v1/inbox/${encodeURIComponent(address)}/messages`,
          otpUrl: `/api/v1/inbox/${encodeURIComponent(address)}/otp`,
          streamUrl: `/api/inbox/${encodeURIComponent(address)}/stream`,
        },
        errors: [],
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': '60',
          'X-RateLimit-Remaining': String(rate.remaining),
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to generate developer inbox',
        errorCode: 'internal_server_error',
        errors: [{ field: 'server', message: err?.message || 'Server error' }],
      },
      { status: 500 }
    );
  }
}
