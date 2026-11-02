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

    const metadata = getInboxMetadata(normalized);
    const emails = getEmailsForAddress(normalized);

    // Extract quick latest OTP if present
    const latestWithOtp = emails.find((e) => !!e.otpCode);

    return NextResponse.json({
      success: true,
      message: `Retrieved ${emails.length} messages for ${normalized}`,
      data: {
        address: normalized,
        totalEmails: emails.length,
        isLocked: metadata.isLocked,
        latestOtp: latestWithOtp ? latestWithOtp.otpCode : null,
        emails: emails.map((e) => ({
          id: e.id,
          sender: e.sender,
          senderName: e.senderName,
          subject: e.subject,
          textBody: e.textBody,
          htmlBody: e.htmlBody,
          otpCode: e.otpCode,
          verificationLinks: e.verificationLinks,
          attachmentsCount: e.attachments?.length || 0,
          receivedAt: e.receivedAt,
        })),
      },
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: 'Failed to retrieve messages',
      error: err?.message,
    }, { status: 500 });
  }
}
