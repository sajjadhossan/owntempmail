import { NextRequest, NextResponse } from 'next/server';
import { saveUserSyncState, getUserSyncState } from '@/lib/storage';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { success: false, message: 'userId parameter is required' },
      { status: 400 }
    );
  }

  const state = getUserSyncState(userId);
  return NextResponse.json({
    success: true,
    message: state ? 'Synced user state retrieved' : 'No state found for user',
    data: state || null,
    errors: [],
  });
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(`sync_inbox_${clientIp}`, 60, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, message: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const {
      userId,
      email,
      activeEmail,
      recentInboxes,
      pinnedDomains,
      theme,
      lang,
      soundEnabled,
      voiceEnabled,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'userId is required' },
        { status: 400 }
      );
    }

    const savedState = saveUserSyncState({
      userId,
      email: email || '',
      activeEmail: activeEmail || 'demo-user@owntemp.live',
      recentInboxes: Array.isArray(recentInboxes) ? recentInboxes : [],
      pinnedDomains: Array.isArray(pinnedDomains) ? pinnedDomains : [],
      theme: theme || 'dark',
      lang: lang || 'bn',
      soundEnabled: Boolean(soundEnabled),
      voiceEnabled: Boolean(voiceEnabled),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: 'User workspace state synchronized across devices',
      data: savedState,
      errors: [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to sync user state' },
      { status: 500 }
    );
  }
}
