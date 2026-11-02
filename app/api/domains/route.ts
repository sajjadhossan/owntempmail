import { NextRequest, NextResponse } from 'next/server';
import { getAllDomains, addCustomDomain, deleteCustomDomain } from '@/lib/storage';
import { ALL_PUBLIC_DOMAINS } from '@/lib/public-mail-service';

export async function GET() {
  const customAndDefaultDomains = getAllDomains();
  const merged = [...customAndDefaultDomains];

  for (const item of ALL_PUBLIC_DOMAINS) {
    if (!merged.some((d) => d.domain.toLowerCase() === item.domain.toLowerCase())) {
      merged.push({
        id: `pub-${item.domain}`,
        domain: item.domain,
        businessName: item.name,
        isDefault: true,
        isCustom: false,
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return NextResponse.json(
    {
      success: true,
      message: 'All public and custom domains retrieved successfully',
      data: merged,
      meta: {
        total: merged.length,
        publicCount: ALL_PUBLIC_DOMAINS.length,
      },
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    }
  );
}

export async function POST(req: NextRequest) {
  try {
    const { domain, businessName } = await req.json();

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

    const created = addCustomDomain(domain, businessName);
    return NextResponse.json(
      {
        success: true,
        message: 'Custom business domain registered successfully. Ready for Cloudflare Email Routing.',
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

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, message: 'Domain ID required' }, { status: 400 });
    }
    const deleted = deleteCustomDomain(id);
    if (!deleted) {
      return NextResponse.json({ success: false, message: 'Cannot delete default system domain' }, { status: 400 });
    }
    return NextResponse.json({ success: true, message: 'Custom domain removed successfully' });
  } catch (e: any) {
    return NextResponse.json({ success: false, message: e.message }, { status: 500 });
  }
}
