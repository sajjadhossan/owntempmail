import { NextRequest, NextResponse } from 'next/server';
import { OutboundEmail } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, subject, body: textBody } = body;

    if (!from || !to || !subject || !textBody) {
      return NextResponse.json(
        {
          success: false,
          message: 'All fields (from, to, subject, body) are required',
          errorCode: 'validation_error',
          errors: [{ field: 'form', message: 'Missing required email fields' }],
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to.trim())) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid recipient email address format',
          errorCode: 'validation_error',
          errors: [{ field: 'to', message: 'Recipient email format is invalid' }],
        },
        { status: 422 }
      );
    }

    let status: 'sent' | 'simulated' = 'simulated';

    // If Resend API key is provided, deliver through Resend
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: from.trim(),
            to: [to.trim()],
            subject: subject.trim(),
            text: textBody.trim(),
          }),
        });
        if (res.ok) {
          status = 'sent';
        }
      } catch (err) {
        console.warn('[Outbound Gateway Notice]', err);
      }
    }

    const outbound: OutboundEmail = {
      id: `out_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      from: from.trim(),
      to: to.trim(),
      subject: subject.trim(),
      textBody: textBody.trim(),
      sentAt: new Date().toISOString(),
      status,
    };

    return NextResponse.json({
      success: true,
      message: status === 'sent' ? 'Email sent successfully via Live Gateway' : 'Email dispatched successfully (Simulated Outbox)',
      data: outbound,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to dispatch outbound email',
        errorCode: 'outbound_dispatch_failed',
        errors: [{ field: 'server', message: error?.message || 'Internal error' }],
      },
      { status: 500 }
    );
  }
}

