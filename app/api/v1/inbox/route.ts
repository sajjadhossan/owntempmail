import { NextRequest, NextResponse } from 'next/server';
import { getInboxMetadata, getAllDomains } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const domains = getAllDomains().filter((d) => d.status === 'active');
    const defaultDomain = domains.length > 0 ? domains[0].domain : 'owntemp.live';

    const domain = (body.domain || defaultDomain).trim().toLowerCase();
    const prefix = (body.prefix || `dev_${Math.random().toString(36).substring(2, 8)}`).trim().toLowerCase();
    const address = `${prefix}@${domain}`;

    const metadata = getInboxMetadata(address);

    return NextResponse.json({
      success: true,
      message: 'Developer inbox generated successfully',
      data: {
        address,
        prefix,
        domain,
        createdAt: metadata.createdAt,
        feedUrl: `/api/v1/inbox/${encodeURIComponent(address)}/messages`,
        streamUrl: `/api/inbox/${encodeURIComponent(address)}/stream`,
      },
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to generate developer inbox',
      error: err?.message,
    }, { status: 500 });
  }
}
