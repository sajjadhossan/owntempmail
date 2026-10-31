import { NextRequest, NextResponse } from 'next/server';
import { getEmailsForAddress, getInboxMetadata } from '@/lib/storage';

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

    const metadata = getInboxMetadata(address);
    const emails = getEmailsForAddress(address);

    return NextResponse.json({
      success: true,
      message: 'Inbox emails retrieved successfully',
      data: {
        inbox: metadata,
        emails,
      },
      meta: {
        total: emails.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Could not fetch inbox data',
        errorCode: 'inbox_fetch_error',
        errors: [{ field: 'server', message: error?.message || 'Server error' }],
      },
      { status: 500 }
    );
  }
}
