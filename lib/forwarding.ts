import { EmailRecord, ForwardingRule } from './types';

/**
 * Dispatches an incoming email or OTP to the configured forwarding destination
 * (Discord Webhook, Slack Webhook, Custom Webhook, or Destination Email).
 */
export async function dispatchForwarding(
  email: EmailRecord,
  rule: ForwardingRule
): Promise<{ success: boolean; message: string }> {
  if (!rule.enabled || !rule.destination) {
    return { success: false, message: 'Forwarding rule is not enabled or destination missing' };
  }

  // If OTP-only mode is active and no OTP is present, do not forward
  if (rule.otpOnly && !email.otpCode) {
    return { success: true, message: 'Skipped: Rule is OTP-only and no OTP was detected' };
  }

  try {
    switch (rule.type) {
      case 'discord':
        return await sendDiscordWebhook(email, rule);
      case 'slack':
        return await sendSlackWebhook(email, rule);
      case 'webhook':
        return await sendCustomWebhook(email, rule);
      case 'email':
        return await sendEmailForward(email, rule);
      default:
        return { success: false, message: `Unsupported forwarding type: ${rule.type}` };
    }
  } catch (err: any) {
    console.error('[Forwarding] Dispatch error:', err);
    return { success: false, message: err?.message || 'Forwarding dispatch failed' };
  }
}

/**
 * Sends formatted Discord embed with OTP highlight
 */
async function sendDiscordWebhook(email: EmailRecord, rule: ForwardingRule) {
  const embed = {
    title: email.otpCode
      ? `🔑 OTP Verification Code: ${email.otpCode}`
      : `📩 New Message: ${email.subject}`,
    description: rule.otpOnly
      ? `**OTP Detected:** \`${email.otpCode}\`\n**Sender:** ${email.senderName || email.sender}`
      : (email.textBody || email.subject).substring(0, 1000),
    color: email.otpCode ? 0x6366f1 : 0x10b981, // Indigo or Emerald
    fields: [
      { name: 'To (Temp Mail)', value: `\`${email.address}\``, inline: true },
      { name: 'From', value: `${email.senderName || email.sender}`, inline: true },
    ],
    footer: { text: 'Owntemp — Disposable Email Relay' },
    timestamp: new Date(email.receivedAt).toISOString(),
  };

  if (email.verificationLinks && email.verificationLinks.length > 0) {
    embed.fields.push({
      name: 'Verification Link',
      value: `[Click to Verify](${email.verificationLinks[0]})`,
      inline: false,
    });
  }

  const res = await fetch(rule.destination, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'Owntemp Mail Alert',
      avatar_url: 'https://owntemp.live/icon.svg',
      embeds: [embed],
    }),
  });

  if (!res.ok) {
    throw new Error(`Discord webhook returned status ${res.status}`);
  }

  return { success: true, message: 'Forwarded to Discord successfully' };
}

/**
 * Sends formatted Slack webhook message
 */
async function sendSlackWebhook(email: EmailRecord, rule: ForwardingRule) {
  const text = email.otpCode
    ? `*Owntemp Alert:* OTP Code *${email.otpCode}* received for \`${email.address}\` from *${email.senderName || email.sender}*`
    : `*Owntemp Alert:* New email received for \`${email.address}\` - Subject: *${email.subject}*`;

  const res = await fetch(rule.destination, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    throw new Error(`Slack webhook returned status ${res.status}`);
  }

  return { success: true, message: 'Forwarded to Slack successfully' };
}

/**
 * Posts JSON payload to generic custom webhook URL
 */
async function sendCustomWebhook(email: EmailRecord, rule: ForwardingRule) {
  const payload = {
    event: 'email.received',
    inbox: email.address,
    otpCode: email.otpCode || null,
    subject: email.subject,
    sender: email.sender,
    senderName: email.senderName,
    textBody: rule.otpOnly ? undefined : email.textBody,
    verificationLinks: email.verificationLinks || [],
    receivedAt: email.receivedAt,
  };

  const res = await fetch(rule.destination, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'Owntemp-Forwarder/2.5.3',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Custom webhook returned status ${res.status}`);
  }

  return { success: true, message: 'Forwarded to custom webhook successfully' };
}

/**
 * Forwards email to external real email address
 */
async function sendEmailForward(email: EmailRecord, rule: ForwardingRule) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Owntemp Relay <onboarding@resend.dev>`,
        to: [rule.destination],
        subject: `[Fwd: ${email.address}] ${email.subject}`,
        text: `--- Forwarded from Owntemp (${email.address}) ---\nFrom: ${email.sender}\nOTP: ${email.otpCode || 'None'}\n\n${email.textBody}`,
      }),
    });

    if (!res.ok) {
      throw new Error(`Email forwarding via Resend failed with status ${res.status}`);
    }
  } else {
    console.log(`[Forwarding] Simulated email forward to ${rule.destination} for ${email.address}`);
  }

  return { success: true, message: `Forwarded to ${rule.destination}` };
}
