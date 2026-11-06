import { EmailRecord } from './types';
import { extractOtpCode, extractVerificationLinks } from './otp-extractor';

const MAILTM_BASE_URL = 'https://api.mail.tm';

export interface MailtmDomain {
  id: string;
  domain: string;
  isActive: boolean;
  isPrivate: boolean;
  createdAt: string;
}

export interface MailtmAccount {
  id: string;
  address: string;
  token: string;
}

/**
 * Fetch available active public domains from the Mail.tm open source network.
 */
export async function getMailtmDomains(): Promise<string[]> {
  try {
    const res = await fetch(`${MAILTM_BASE_URL}/domains`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Mail.tm domains: ${res.status}`);
    }

    const data = await res.json();
    const members = data['hydra:member'] || [];
    return members.filter((d: any) => d.isActive).map((d: any) => d.domain);
  } catch (err) {
    console.warn('[MailtmService] Error fetching domains:', err);
    return ['fldubai.com']; // Fallback known live domain
  }
}

/**
 * Create a disposable account and acquire JWT authentication token.
 */
export async function createMailtmAccount(
  prefix: string,
  domain: string
): Promise<MailtmAccount> {
  const address = `${prefix.trim().toLowerCase()}@${domain.trim().toLowerCase()}`;
  const password = `Owntemp_${Math.random().toString(36).substring(2, 10)}!`;

  // 1. Create Account
  const createRes = await fetch(`${MAILTM_BASE_URL}/accounts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ address, password }),
  });

  if (!createRes.ok && createRes.status !== 422) {
    // 422 means already exists, we will try to login
    const errText = await createRes.text();
    throw new Error(`Failed to create Mail.tm account: ${errText}`);
  }

  // 2. Acquire JWT Token
  const tokenRes = await fetch(`${MAILTM_BASE_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ address, password }),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    throw new Error(`Failed to acquire Mail.tm token: ${errText}`);
  }

  const tokenData = await tokenRes.json();

  return {
    id: tokenData.id || `mtm_${Date.now()}`,
    address,
    token: tokenData.token,
  };
}

/**
 * Retrieve messages for a Mail.tm account and convert to standard Owntemp EmailRecord.
 */
export async function getMailtmMessages(
  token: string,
  accountAddress: string
): Promise<EmailRecord[]> {
  const res = await fetch(`${MAILTM_BASE_URL}/messages`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Mail.tm messages: ${res.status}`);
  }

  const data = await res.json();
  const rawList = data['hydra:member'] || [];

  // Fetch full content for up to 10 latest messages
  const emails: EmailRecord[] = [];

  for (const item of rawList.slice(0, 10)) {
    try {
      const msgRes = await fetch(`${MAILTM_BASE_URL}/messages/${item.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      if (!msgRes.ok) continue;

      const full = await msgRes.json();
      const textBody = full.text || item.intro || '';
      const htmlBody = Array.isArray(full.html) ? full.html.join('') : full.html || `<p>${textBody}</p>`;
      const subject = full.subject || item.subject || '(No Subject)';
      const sender = full.from?.address || item.from?.address || 'unknown@sender.com';
      const senderName = full.from?.name || item.from?.name || sender.split('@')[0];

      const combinedText = `${textBody}\n${htmlBody}`;
      const otpCode = extractOtpCode(combinedText, subject);
      const verificationLinks = extractVerificationLinks(htmlBody || textBody);

      const attachments = (full.attachments || []).map((att: any, idx: number) => ({
        id: att.id || `att_${idx}`,
        filename: att.filename || `file_${idx + 1}`,
        contentType: att.contentType || 'application/octet-stream',
        sizeBytes: att.size || 0,
        downloadUrl: att.downloadUrl ? `${MAILTM_BASE_URL}${att.downloadUrl}` : undefined,
      }));

      emails.push({
        id: `mtm_${full.id}`,
        address: accountAddress.toLowerCase(),
        sender,
        senderName,
        subject,
        textBody,
        htmlBody,
        otpCode,
        verificationLinks,
        attachments,
        sizeBytes: full.size || item.size || 0,
        isRead: full.seen ?? false,
        isLocked: false,
        receivedAt: full.createdAt || item.createdAt || new Date().toISOString(),
      });
    } catch (msgErr) {
      console.warn(`[MailtmService] Error fetching message ${item.id}:`, msgErr);
    }
  }

  return emails;
}
