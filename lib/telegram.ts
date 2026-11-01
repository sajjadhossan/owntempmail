import { EmailRecord, TelegramConfig } from './types';

/**
 * Sends a real-time notification to a user's Telegram Chat/Channel
 */
export async function sendTelegramAlert(
  email: EmailRecord,
  config: TelegramConfig
): Promise<{ success: boolean; message: string }> {
  if (!config.enabled || !config.botToken || !config.chatId) {
    return { success: false, message: 'Telegram alerts are not configured or disabled.' };
  }

  if (config.notifyOnOtpOnly && !email.otpCode) {
    return { success: true, message: 'Skipped: Configured for OTP emails only.' };
  }

  const cleanToken = config.botToken.trim();
  const cleanChatId = config.chatId.trim();

  const lines = [
    `📬 *Owntemp Temp Mail Alert*`,
    `━━━━━━━━━━━━━━━━━━`,
    `🎯 *Inbox:* \`${email.address}\``,
    `👤 *From:* ${email.sender}`,
    `📋 *Subject:* ${email.subject.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')}`,
  ];

  if (email.otpCode) {
    lines.push(`\n🔑 *Verification OTP:* \`${email.otpCode}\``);
  }

  if (email.verificationLinks && email.verificationLinks.length > 0) {
    lines.push(`🔗 *Action Link:* [Click Here](${email.verificationLinks[0]})`);
  }

  lines.push(`\n⏰ *Time:* ${new Date(email.receivedAt).toLocaleTimeString()}`);
  lines.push(`🛡️ *Protected by Owntemp Lifetime Engine*`);

  const payload = {
    chat_id: cleanChatId,
    text: lines.join('\n'),
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  };

  try {
    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: 'Telegram alert delivered successfully.' };
    } else {
      return {
        success: false,
        message: `Telegram API error: ${data.description || 'Unknown error'}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Failed to contact Telegram API: ${err.message}`,
    };
  }
}

/**
 * Tests connection with Telegram Bot
 */
export async function testTelegramConnection(
  botToken: string,
  chatId: string
): Promise<{ success: boolean; message: string }> {
  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();

  if (!cleanToken || !cleanChatId) {
    return { success: false, message: 'Both Bot Token and Chat ID are required.' };
  }

  const text = 
    `🚀 *Owntemp Engine: Telegram Connected!* 🚀\n\n` +
    `✅ Your Telegram Bot notification channel is active and verified.\n` +
    `🔔 Future OTPs and incoming disposable emails will be forwarded directly here.\n\n` +
    `📅 *Timestamp:* ${new Date().toLocaleString()}\n` +
    `⚡ *System:* Owntemp v2.1.0 (50k Fleet Edition)`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${cleanToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'Markdown',
      }),
    });

    const data = await res.json();
    if (data.ok) {
      return { success: true, message: 'Test message sent! Check your Telegram app.' };
    } else {
      return {
        success: false,
        message: `Telegram error: ${data.description || 'Invalid token or chat ID'}`,
      };
    }
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err.message}`,
    };
  }
}
