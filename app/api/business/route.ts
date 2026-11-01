import { NextRequest, NextResponse } from 'next/server';
import { getBusinessProfile, updateBusinessProfile } from '@/lib/storage';

export async function GET() {
  const profile = getBusinessProfile();
  return NextResponse.json({
    success: true,
    data: profile,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { businessName, tagline, primaryDomain } = await req.json();

    if (!businessName || businessName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Business name cannot be empty' },
        { status: 400 }
      );
    }

    const updated = updateBusinessProfile(businessName, tagline, primaryDomain);
    return NextResponse.json({
      success: true,
      message: 'Business profile updated successfully',
      data: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to update business profile', errors: [{ field: 'server', message: error.message }] },
      { status: 500 }
    );
  }
}
