import { NextRequest, NextResponse } from 'next/server';
import { getAllDomains, addCustomDomain } from '@/lib/storage';

export async function GET() {
  const domains = getAllDomains();
  return NextResponse.json({
    success: true,
    message: 'Domains retrieved successfully',
    data: domains,
    meta: {
      total: domains.length,
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();

    if (!domain || !domain.includes('.')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Valid domain name required (e.g. mybusiness.com)',
          errorCode: 'validation_error',
        },
        { status: 400 }
      );
    }

    const created = addCustomDomain(domain);
    return NextResponse.json(
      {
        success: true,
        message: 'Custom domain added successfully. Setup Cloudflare Email Routing catch-all for this domain.',
        data: created,
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Could not add domain',
        errorCode: 'domain_add_failed',
        errors: [{ field: 'server', message: error?.message || 'Server error' }],
      },
      { status: 500 }
    );
  }
}
