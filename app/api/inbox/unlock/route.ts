import { NextRequest, NextResponse } from 'next/server';
import { unlockInbox } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const { address, pin } = await req.json();

    if (!address || !address.includes('@')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Valid email address is required',
          errorCode: 'validation_error',
        },
        { status: 400 }
      );
    }

    if (!pin) {
      return NextResponse.json(
        {
          success: false,
          message: 'PIN is required to unlock this inbox',
          errorCode: 'validation_error',
        },
        { status: 400 }
      );
    }

    const result = unlockInbox(address, pin.toString().trim());

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: result.message,
          errorCode: 'auth_invalid_credentials',
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        address,
        isLocked: false,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to unlock inbox',
        errorCode: 'unlock_failed',
        errors: [{ field: 'server', message: error?.message || 'Server error' }],
      },
      { status: 500 }
    );
  }
}
