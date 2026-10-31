import { NextRequest, NextResponse } from 'next/server';
import { lockInbox } from '@/lib/storage';

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

    if (!pin || pin.toString().trim().length < 4) {
      return NextResponse.json(
        {
          success: false,
          message: 'Lock PIN must be at least 4 digits/characters',
          errorCode: 'validation_error',
        },
        { status: 400 }
      );
    }

    const result = lockInbox(address, pin.toString().trim());

    return NextResponse.json({
      success: true,
      message: result.message,
      data: {
        address,
        isLocked: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to lock inbox',
        errorCode: 'lock_failed',
        errors: [{ field: 'server', message: error?.message || 'Server error' }],
      },
      { status: 500 }
    );
  }
}
