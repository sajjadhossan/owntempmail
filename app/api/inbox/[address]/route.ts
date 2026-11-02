import { NextRequest, NextResponse } from 'next/server';
import { getEmailsForAddress, getInboxMetadata } from '@/lib/storage';
import { syncPublicInbox } from '@/lib/public-mail-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const resolvedParams = await params;
    const address = decodeURIComponent(resolvedParams.address);

    if (!address || !address.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid email address provided',
          errorCode: 'validation_error',
        },
        { status: 400 }
      );
    }

    // Sync public gateway if address domain belongs to active public pool
    try {
      await syncPublicInbox(address);
    } catch (e) {
      // Sync failure should not block returning local emails
    }

    const metadata = getInboxMetadata(address);
    const emails = getEmailsForAddress(address);

    return NextResponse.json(
      {
        success: true,
        message: 'Inbox emails retrieved successfully',
        data: {
          inbox: metadata,
          emails,
        },
        meta: {
          total: emails.length,
        },
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
          'Surrogate-Control': 'no-store',
          'CDN-Cache-Control': 'no-store',
          'Cloudflare-CDN-Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Could not fetch inbox data',
        errorCode: 'inbox_fetch_error',
        errors: [{ field: 'server', message: error?.message || 'Server error' }],
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  }
}
