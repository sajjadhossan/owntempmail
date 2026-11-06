import { NextRequest, NextResponse } from 'next/server';
import {
  getMailtmDomains,
  createMailtmAccount,
  getMailtmMessages,
} from '@/lib/mailtm-service';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(`mailtm_get_${clientIp}`, 120, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: 'Rate limit exceeded. Please wait a moment.',
        errorCode: 'rate_limit_exceeded',
      },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action') || 'domains';

  try {
    if (action === 'domains') {
      const domains = await getMailtmDomains();
      return NextResponse.json({
        success: true,
        message: 'Mail.tm open-source network domains retrieved',
        data: {
          domains,
          count: domains.length,
          network: 'Mail.tm / Mail.gw Open Source Fleet',
        },
        errors: [],
      });
    }

    if (action === 'messages') {
      const token = searchParams.get('token');
      const address = searchParams.get('address');

      if (!token || !address) {
        return NextResponse.json(
          {
            success: false,
            message: 'Both token and address are required to fetch messages',
            errorCode: 'validation_error',
          },
          { status: 400 }
        );
      }

      const emails = await getMailtmMessages(token, address);
      return NextResponse.json({
        success: true,
        message: `Retrieved ${emails.length} messages from open-source gateway`,
        data: {
          address,
          totalEmails: emails.length,
          emails,
        },
        errors: [],
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: `Unknown action: ${action}`,
        errorCode: 'invalid_action',
      },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to communicate with Mail.tm gateway',
        errorCode: 'gateway_error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(`mailtm_post_${clientIp}`, 30, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: 'Rate limit exceeded. Please wait a moment.',
        errorCode: 'rate_limit_exceeded',
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const prefix = (body.prefix || `open_${Math.random().toString(36).substring(2, 8)}`).trim().toLowerCase();
    const domain = (body.domain || 'fldubai.com').trim().toLowerCase();

    const account = await createMailtmAccount(prefix, domain);

    return NextResponse.json(
      {
        success: true,
        message: 'Open-source Mail.tm account provisioned successfully',
        data: {
          address: account.address,
          token: account.token,
          id: account.id,
          network: 'Mail.tm Open Source Gateway',
          expiresIn: 'Permanent session (stored in browser)',
        },
        errors: [],
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: err?.message || 'Failed to provision open-source account',
        errorCode: 'provision_error',
      },
      { status: 500 }
    );
  }
}
