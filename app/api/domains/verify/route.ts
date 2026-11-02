import { NextRequest, NextResponse } from 'next/server';
import dns from 'dns/promises';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawDomain = (body.domain || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');

    if (!rawDomain) {
      return NextResponse.json(
        {
          success: false,
          message: 'Domain name is required',
          errorCode: 'validation_error',
        },
        { status: 400 }
      );
    }

    let mxRecords: any[] = [];
    let mxValid = false;
    let spfValid = false;
    let cloudflareDetected = false;
    let errorDetail = null;

    // 1. Check MX records
    try {
      const records = await dns.resolveMx(rawDomain);
      mxRecords = records.sort((a, b) => a.priority - b.priority);
      if (mxRecords.length > 0) {
        mxValid = true;
        cloudflareDetected = mxRecords.some(
          (m) =>
            m.exchange.toLowerCase().includes('cloudflare.net') ||
            m.exchange.toLowerCase().includes('owntemp') ||
            m.exchange.toLowerCase().includes('vercel')
        );
      }
    } catch (err: any) {
      errorDetail = err?.code || 'NO_MX_RECORDS';
    }

    // 2. Check SPF / TXT records
    try {
      const txtRecords = await dns.resolveTxt(rawDomain);
      const flat = txtRecords.flat().join(' ');
      if (flat.includes('v=spf1')) {
        spfValid = true;
      }
    } catch (e) {
      // SPF missing or unconfigured
    }

    // Check Cloudflare Nameservers
    let nsRecords: string[] = [];
    try {
      nsRecords = await dns.resolveNs(rawDomain);
      if (nsRecords.some((ns) => ns.toLowerCase().includes('cloudflare.com'))) {
        cloudflareDetected = true;
      }
    } catch (e) {}

    const isConnected = mxValid;

    return NextResponse.json({
      success: true,
      message: isConnected
        ? `Domain ${rawDomain} DNS successfully verified and active!`
        : `Domain ${rawDomain} requires MX record configuration`,
      data: {
        domain: rawDomain,
        status: isConnected ? 'active' : 'pending_dns',
        mxValid,
        spfValid,
        cloudflareDetected,
        mxRecords,
        nsRecords,
        errorDetail,
        recommendedMx: [
          { priority: 10, exchange: 'isaac.mx.cloudflare.net' },
          { priority: 50, exchange: 'linda.mx.cloudflare.net' },
          { priority: 90, exchange: 'amir.mx.cloudflare.net' },
        ],
        recommendedTxt: 'v=spf1 include:_spf.mx.cloudflare.net ~all',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify domain DNS',
        errorCode: 'dns_check_failed',
        error: error?.message || 'Network lookup error',
      },
      { status: 500 }
    );
  }
}

