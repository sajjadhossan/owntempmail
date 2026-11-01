import { NextRequest, NextResponse } from 'next/server';
import { getAllDomains, addCustomDomain, deleteCustomDomain } from '@/lib/storage';

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
