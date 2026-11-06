import { NextRequest, NextResponse } from 'next/server';
import { saveForwardingRule, getForwardingRule } from '@/lib/storage';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json(
      { success: false, message: 'Address parameter is required' },
      { status: 400 }
    );
  }

  const rule = getForwardingRule(address);
  return NextResponse.json({
    success: true,
    message: rule ? 'Forwarding rule retrieved' : 'No forwarding rule configured',
    data: rule || {
      inboxAddress: address,
      enabled: false,
      type: 'discord',
      destination: '',
      otpOnly: false,
      createdAt: new Date().toISOString(),
    },
    errors: [],
  });
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(`forward_post_${clientIp}`, 30, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, message: 'Rate limit exceeded. Please wait a moment.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const address = body.inboxAddress || body.address;

    if (!address || !address.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid inbox address is required' },
        { status: 400 }
      );
    }

    const type = body.type || 'discord';
    const destination = (body.destination || '').trim();
    const enabled = Boolean(body.enabled);
    const otpOnly = Boolean(body.otpOnly);

    if (enabled && !destination) {
      return NextResponse.json(
        { success: false, message: 'Destination Webhook URL or Email is required when enabled' },
        { status: 400 }
      );
    }

    const rule = saveForwardingRule({
      inboxAddress: address,
      enabled,
      type,
      destination,
      otpOnly,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'SimpleLogin-style forwarding rule saved successfully',
      data: rule,
      errors: [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to save forwarding rule' },
      { status: 500 }
    );
  }
}
