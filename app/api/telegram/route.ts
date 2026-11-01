import { NextResponse } from 'next/server';
import { getTelegramConfig, updateTelegramConfig } from '@/lib/storage';
import { testTelegramConnection } from '@/lib/telegram';
import { ApiResponse, TelegramConfig } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getTelegramConfig();
    return NextResponse.json<ApiResponse<TelegramConfig>>({
      success: true,
      message: 'Telegram settings loaded.',
      data: config,
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: err.message || 'Failed to fetch telegram configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, enabled, botToken, chatId, notifyOnOtpOnly } = body;

    // Test action
    if (action === 'test') {
      const token = (botToken || getTelegramConfig().botToken || '').trim();
      const chat = (chatId || getTelegramConfig().chatId || '').trim();

      if (!token || !chat) {
        return NextResponse.json<ApiResponse>(
          { success: false, message: 'Bot Token and Chat ID are required to test.' },
          { status: 400 }
        );
      }

      const testResult = await testTelegramConnection(token, chat);
      return NextResponse.json<ApiResponse>(
        {
          success: testResult.success,
          message: testResult.message,
        },
        { status: testResult.success ? 200 : 400 }
      );
    }

    // Save action
    const updated = updateTelegramConfig({
      enabled: typeof enabled === 'boolean' ? enabled : false,
      botToken: typeof botToken === 'string' ? botToken.trim() : undefined,
      chatId: typeof chatId === 'string' ? chatId.trim() : undefined,
      notifyOnOtpOnly: typeof notifyOnOtpOnly === 'boolean' ? notifyOnOtpOnly : true,
    });

    return NextResponse.json<ApiResponse<TelegramConfig>>({
      success: true,
      message: 'Telegram alerts configured successfully.',
      data: updated,
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: err.message || 'Failed to update telegram configuration' },
      { status: 500 }
    );
  }
}
