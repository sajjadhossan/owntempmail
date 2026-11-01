import { NextRequest, NextResponse } from 'next/server';
import { cleanupExpiredEmails } from '@/lib/storage';

export async function GET(req: NextRequest) {
  try {
    // Optional secret authorization for Vercel Cron
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      // In local dev, allow without secret
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ success: false, message: 'Unauthorized cron invocation' }, { status: 401 });
      }
    }

    const { searchParams } = new URL(req.url);
    const hours = parseInt(searchParams.get('hours') || '24', 10);

    const result = cleanupExpiredEmails(hours);

    return NextResponse.json({
      success: true,
      message: `Automated cleanup completed. Expired unlocked emails pruned. All lifetime locked inboxes preserved permanently.`,
      meta: {
        purgedEmailsCount: result.purgedEmailsCount,
        preservedLockedEmailsCount: result.preservedLockedEmailsCount,
        preservedLockedInboxesCount: result.preservedLockedInboxesCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Cleanup job encountered an error',
        errors: [{ field: 'server', message: error?.message || 'Server error' }],
      },
      { status: 500 }
    );
  }
}
