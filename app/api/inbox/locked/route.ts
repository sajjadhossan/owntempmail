import { NextResponse } from 'next/server';
import { getLockedInboxes } from '@/lib/storage';

export async function GET() {
  const lockedInboxes = getLockedInboxes();
  return NextResponse.json({
    success: true,
    message: 'Locked inboxes retrieved successfully',
    data: lockedInboxes,
    meta: {
      total: lockedInboxes.length,
    },
  });
}
