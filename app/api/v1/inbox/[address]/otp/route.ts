import { NextRequest, NextResponse } from 'next/server';
import { getEmailsForAddress, getInboxMetadata } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    const normalized = decodeURIComponent(address).trim().toLowerCase();

    // Check if inbox metadata exists
    const metadata = getInboxMetadata(normalized);
    const emails = getEmailsForAddress(normalized);

    // Look for timeout query param (optional long-polling up to 15s)
    const { searchParams } = new URL(req.url);
    const timeoutSec = Math.min(Math.max(parseInt(searchParams.get('timeout') || '0', 10), 0), 15);
    const sinceTime = searchParams.get('since') ? new Date(searchParams.get('since')!).getTime() : 0;

    let targetEmail = emails.find((e) => {
      const isOtp = Boolean(e.otpCode && e.otpCode.trim().length > 0);
      const isAfterSince = sinceTime > 0 ? new Date(e.receivedAt).getTime() >= sinceTime : true;
      return isOtp && isAfterSince;
    });

    // If timeout > 0 and no OTP found yet, poll up to timeoutSec
    if (!targetEmail && timeoutSec > 0) {
      const pollStart = Date.now();
      const maxMs = timeoutSec * 1000;

      while (Date.now() - pollStart < maxMs) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const freshEmails = getEmailsForAddress(normalized);
        targetEmail = freshEmails.find((e) => {
          const isOtp = Boolean(e.otpCode && e.otpCode.trim().length > 0);
          const isAfterSince = sinceTime > 0 ? new Date(e.receivedAt).getTime() >= sinceTime : true;
          return isOtp && isAfterSince;
        });
        if (targetEmail) break;
      }
    }

    if (!targetEmail || !targetEmail.otpCode) {
      return NextResponse.json(
        {
          success: false,
          message: `No OTP code found for ${normalized}`,
          errorCode: 'otp_not_found',
          data: {
            address: normalized,
            isLocked: metadata.isLocked,
            totalEmails: emails.length,
            otp: null,
          },
          errors: [{ field: 'otp', message: 'No OTP detected in received emails' }],
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `OTP retrieved successfully for ${normalized}`,
      data: {
        address: normalized,
        otp: targetEmail.otpCode,
        subject: targetEmail.subject,
        sender: targetEmail.sender,
        senderName: targetEmail.senderName,
        receivedAt: targetEmail.receivedAt,
        verificationLinks: targetEmail.verificationLinks || [],
        emailId: targetEmail.id,
        isLocked: targetEmail.isLocked,
      },
      meta: {
        totalEmails: emails.length,
      },
      errors: [],
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve OTP',
        errorCode: 'internal_server_error',
        errors: [{ field: 'server', message: err?.message || 'Server error' }],
      },
      { status: 500 }
    );
  }
}

