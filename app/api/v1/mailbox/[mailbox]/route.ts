import { NextRequest, NextResponse } from 'next/server';
import { getEmailsForAddress, deleteEmail, getInboxMetadata } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ mailbox: string }> }
) {
  try {
    const { mailbox } = await params;
    const decoded = decodeURIComponent(mailbox).trim().toLowerCase();
    const address = decoded.includes('@') ? decoded : `${decoded}@owntemp.live`;

    const emails = getEmailsForAddress(address);

    // Inbucket-compatible REST format
    const inbucketMessages = emails.map((e) => ({
      mailbox: address.split('@')[0],
      id: e.id,
      from: e.sender,
      to: [e.address],
      date: e.receivedAt,
      subject: e.subject,
      size: e.sizeBytes || 1024,
      otp: e.otpCode || null,
    }));

    return NextResponse.json(inbucketMessages);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to retrieve Inbucket mailbox' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ mailbox: string }> }
) {
  try {
    const { mailbox } = await params;
    const decoded = decodeURIComponent(mailbox).trim().toLowerCase();
    const address = decoded.includes('@') ? decoded : `${decoded}@owntemp.live`;

    const metadata = getInboxMetadata(address);
    if (metadata.isLocked) {
      return NextResponse.json(
        { error: 'Mailbox is permanently PIN-locked and cannot be cleared' },
        { status: 403 }
      );
    }

    const emails = getEmailsForAddress(address);
    let deletedCount = 0;
    for (const email of emails) {
      if (!email.isLocked) {
        deleteEmail(email.id);
        deletedCount++;
      }
    }

    return NextResponse.json({
      message: `Mailbox cleared: deleted ${deletedCount} messages`,
      deletedCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to clear Inbucket mailbox' },
      { status: 500 }
    );
  }
}
