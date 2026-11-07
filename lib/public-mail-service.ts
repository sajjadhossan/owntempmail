import { saveInboundEmail, getEmailsForAddress } from './storage';
import { EmailRecord, EmailAttachment } from './types';

export interface PublicDomainDef {
  domain: string;
  name: string;
  provider: 'guerrilla' | 'mailtm' | 'maildrop' | '1secmail' | 'ultrashort' | 'cloudgateway';
  category: 'ultrashort' | 'public' | 'developer' | 'security';
}

export const ALL_PUBLIC_DOMAINS: PublicDomainDef[] = [
  // --- 1. Ultra-Short & Mobile Easy-to-Type Fleet (১ থেকে ১১) ---
  { domain: 'grr.la', name: '⚡ grr.la (৬ অক্ষর • আল্ট্রা-শর্ট)', provider: 'guerrilla', category: 'ultrashort' },
  { domain: 'dis.es', name: '⚡ dis.es (৬ অক্ষর • আল্ট্রা-শর্ট)', provider: 'ultrashort', category: 'ultrashort' },
  { domain: 'box.im', name: '⚡ box.im (৬ অক্ষর • আল্ট্রা-শর্ট)', provider: 'ultrashort', category: 'ultrashort' },
  { domain: 'mail.tm', name: '⚡ mail.tm (৭ অক্ষর • ফাস্ট ক্লাউড)', provider: 'mailtm', category: 'ultrashort' },
  { domain: 'mail.gw', name: '⚡ mail.gw (৭ অক্ষর • লাইটওয়েট)', provider: 'mailtm', category: 'ultrashort' },
  { domain: '0box.eu', name: '⚡ 0box.eu (৭ অক্ষর • ইউরোপিয়ান)', provider: 'ultrashort', category: 'ultrashort' },
  { domain: 'tmail.ws', name: '⚡ tmail.ws (৮ অক্ষর • শর্ট টেম্পমেইল)', provider: 'ultrashort', category: 'ultrashort' },
  { domain: 'inbox.si', name: '⚡ inbox.si (৮ অক্ষর • স্লিক ইনবক্স)', provider: 'ultrashort', category: 'ultrashort' },
  { domain: 'mohmal.im', name: '⚡ mohmal.im (৯ অক্ষর • কুইক ওটিপি)', provider: 'ultrashort', category: 'ultrashort' },
  { domain: 'tmpbox.net', name: '⚡ tmpbox.net (১০ অক্ষর • শর্ট বক্স)', provider: 'ultrashort', category: 'ultrashort' },
  { domain: '10mail.org', name: '⚡ 10mail.org (১০ অক্ষর • মিনিম্যাল)', provider: 'ultrashort', category: 'ultrashort' },

  // --- 2. High-Speed & Global Public Fleet (১২ থেকে ৩৫) ---
  { domain: 'sharklasers.com', name: '🚀 SharkLasers (ফাস্ট পাবলিক ডোমেইন)', provider: 'guerrilla', category: 'public' },
  { domain: 'fldubai.com', name: '✈️ FL Dubai (হাই-স্পিড ক্লাউড গেটওয়ে)', provider: 'mailtm', category: 'public' },
  { domain: 'pokemail.net', name: '⚡ PokeMail (লাইটওয়েট ডোমেইন)', provider: 'guerrilla', category: 'public' },
  { domain: 'guerrillamail.com', name: '🌐 GuerrillaMail (.com গ্লোবাল)', provider: 'guerrilla', category: 'public' },
  { domain: 'guerrillamail.net', name: '🌐 GuerrillaMail (.net গ্লোবাল)', provider: 'guerrilla', category: 'public' },
  { domain: 'guerrillamail.org', name: '🌐 GuerrillaMail (.org ওপেন)', provider: 'guerrilla', category: 'public' },
  { domain: 'guerrillamail.info', name: '🌐 GuerrillaMail (.info গ্লোবাল)', provider: 'guerrilla', category: 'public' },
  { domain: 'guerrillamail.biz', name: '💼 GuerrillaMail (.biz বিজনেস)', provider: 'guerrilla', category: 'public' },
  { domain: 'guerrillamailblock.com', name: '🛡️ Guerrilla Block (স্প্যামগার্ড)', provider: 'guerrilla', category: 'public' },
  { domain: 'maildrop.cc', name: '📨 Maildrop (ওপেন-সোর্স লাইভ GraphQL)', provider: 'maildrop', category: 'public' },
  { domain: 'spam4.me', name: '🛡️ Spam4.me (স্প্যাম শিল্ড ওটিপি)', provider: 'guerrilla', category: 'public' },
  { domain: 'tempmail.lol', name: '🛡️ TempMail.lol (জিরো-লগিং ওপেন API)', provider: 'cloudgateway', category: 'security' },
  { domain: 'dropmail.me', name: '⚡ DropMail.me (লাইভ গ্রাফকিউএল গেটওয়ে)', provider: 'cloudgateway', category: 'public' },
  { domain: 'dispostable.com', name: '📨 Dispostable.com (ওপেন ইনবক্স)', provider: 'cloudgateway', category: 'public' },
  { domain: 'inboxes.com', name: '📬 Inboxes.com (ক্লাউড ডিসপোজেবল)', provider: 'cloudgateway', category: 'public' },
  { domain: 'getnada.com', name: '📬 GetNada.com (ফাস্ট ওটিপি ক্লাউড)', provider: 'cloudgateway', category: 'public' },
  { domain: 'mailforspam.com', name: '🛡️ MailForSpam (অ্যান্টি-স্প্যাম ইনবক্স)', provider: 'cloudgateway', category: 'security' },
  { domain: 'mohmal.com', name: '🌐 Mohmal.com (গ্লোবাল ডিসপোজেবল)', provider: 'cloudgateway', category: 'public' },
  { domain: 'trashmail.com', name: '🗑️ TrashMail.com (রি-ডাইরেকশন API)', provider: 'cloudgateway', category: 'public' },
  { domain: 'temp-mail.io', name: '📱 Temp-Mail.io (মোবাইল ওটিপি REST)', provider: 'cloudgateway', category: 'public' },

  // --- 3. Open Source Community & Webmail Engines (৩৬ থেকে ৫০) ---
  { domain: 'yopmail.com', name: '🌐 YOPmail.com (গ্লোবাল পাবলিক ওয়েবমেইল)', provider: 'cloudgateway', category: 'public' },
  { domain: 'yopmail.net', name: '🌐 YOPmail.net (ক্লাউড ব্যাকআপ)', provider: 'cloudgateway', category: 'public' },
  { domain: 'cool.fr.nf', name: '⚡ Cool.fr.nf (শর্ট ইউরোপিয়ান ডোমেইন)', provider: 'ultrashort', category: 'ultrashort' },
  { domain: 'jetable.fr.nf', name: '⚡ Jetable.fr.nf (ফ্রি ডিসপোজেবল)', provider: 'ultrashort', category: 'ultrashort' },
  { domain: 'crazymailing.com', name: '⏱️ CrazyMailing (১০-মিনিট ইনস্ট্যান্ট)', provider: 'cloudgateway', category: 'public' },
  { domain: 'emailfake.com', name: '🎭 EmailFake (অ্যানোনিমাস প্রটেকশন)', provider: 'cloudgateway', category: 'security' },
  { domain: 'generator.email', name: '⚙️ Generator.email (ডাইনামিক পুল)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'tempail.com', name: '⚡ Tempail (কুইক মোবাইল ওটিপি)', provider: 'cloudgateway', category: 'public' },
  { domain: 'bouncr.com', name: '🛡️ Bouncr (প্রাইভেসি-ফার্স্ট মাস্কিং)', provider: 'cloudgateway', category: 'security' },
  { domain: 'burnermail.io', name: '🔥 BurnerMail.io (ওয়ান-টাইম ইনবক্স)', provider: 'cloudgateway', category: 'security' },
  { domain: 'mailtub.org', name: '📦 MailTub.org (সিঙ্গেল-বাইনারি সার্ভার)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'cloakmail.net', name: '🕵️ CloakMail.net (জিরো-ট্র্যাকিং ইঞ্জিন)', provider: 'cloudgateway', category: 'security' },
  { domain: 'tempfastmail.com', name: '⚡ TempFastMail (৪৮-ঘণ্টা ভল্ট)', provider: 'cloudgateway', category: 'public' },
  { domain: 'inbucket.org', name: '🪣 InBucket.org (ওপেন-সোর্স Mailinator)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'mailhog.net', name: '🐗 MailHog.net (লোকাল SMTP ও API)', provider: 'cloudgateway', category: 'developer' },

  // --- 4. Developer Inbound Webhooks & Modern Mail Servers (৫১ থেকে ৬৫) ---
  { domain: 'smtp4dev.io', name: '🛠️ Smtp4Dev.io (.NET Core টেস্ট ইঞ্জিন)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'fluxmail.dev', name: '🦀 FluxMail.dev (আল্ট্রাফাস্ট রাস্ট ইঞ্জিন)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'stalwart.mail', name: '🛡️ Stalwart.mail (মডার্ন রাস্ট সার্ভার)', provider: 'cloudgateway', category: 'security' },
  { domain: 'postalmail.org', name: '📮 PostalMail.org (ওপেন এন্টারপ্রাইজ)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'wildduck.biz', name: '🦆 WildDuck.biz (হাই-পারফরম্যান্স Node)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'forwardemail.net', name: '🔒 ForwardEmail.net (এনক্রিপ্টেড গেটওয়ে)', provider: 'cloudgateway', category: 'security' },
  { domain: 'improvmx.com', name: '🔄 ImprovMX.com (ফ্রি ডোমেইন ফরওয়ার্ডার)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'resendinbound.com', name: '📨 ResendInbound.com (ইনবাউন্ড ওয়েব হুক)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'postmarkinbound.com', name: '⚡ PostmarkInbound.com (স্প্যাম ফিল্টার)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'mailguninbound.com', name: '🎯 MailgunInbound.com (ক্লাউড রাউটার)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'sendgridinbound.com', name: '🚀 SendGridInbound.com (এন্টারপ্রাইজ পার্সার)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'brevomail.net', name: '💌 BrevoMail.net (ইভেন্ট ট্র্যাকিং API)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'inboundmx.org', name: '🌐 InboundMX.org (পার্সিং প্রক্সি API)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'emailengine.app', name: '⚡ EmailEngine.app (REST Webhook Hub)', provider: 'cloudgateway', category: 'developer' },
  { domain: 'fakemail.tools', name: '🔧 FakeMail.tools (অটোমেশন CLI ও API)', provider: 'cloudgateway', category: 'developer' },
];

export const ALL_16_PUBLIC_DOMAINS = ALL_PUBLIC_DOMAINS;

// In-memory token cache for Mail.tm & Guerrilla Mail sessions
const mailtmTokenCache: Record<string, { token: string; expiresAt: number }> = {};
const guerrillaSidCache: Record<string, string> = {};

export function isPublicDomain(domain: string): boolean {
  const clean = domain.trim().toLowerCase();
  return ALL_PUBLIC_DOMAINS.some((d) => d.domain.toLowerCase() === clean);
}

// Extract 4-8 digit OTP code
export function extractOtp(text: string, subject: string = ''): string | null {
  const combined = `${subject}\n${text}`;

  const patterns = [
    /(?:verification|security|confirm(?:ation)?|otp|login|access|one[- ]time|code|pin)[^\d]{0,25}[:\s\-=#]*([0-9]{4,8})\b/i,
    /\b([0-9]{4,8})\b(?=[^\d]{0,20}(?:is your (?:verification|security|code|otp)|হলো আপনার যাচাইকরণ কোড|যাচাই কোড))/i,
    /(?:your code is|কোডটি হলো|কোড)[:\s]*([0-9]{4,8})\b/i,
  ];

  for (const regex of patterns) {
    const match = combined.match(regex);
    if (match && match[1]) {
      return match[1];
    }
  }

  const fallback = combined.match(/\b([0-9]{6})\b/);
  return fallback ? fallback[1] : null;
}

// Extract verification links
export function extractVerificationLinks(html: string = '', text: string = ''): string[] {
  const links: string[] = [];
  const urlRegex = /(https?:\/\/[^\s"'<>]+)/gi;

  const matches = (html + ' ' + text).match(urlRegex) || [];
  for (const url of matches) {
    if (
      /verify|confirm|activate|token|auth|reset|validate/i.test(url) &&
      !links.includes(url) &&
      links.length < 5
    ) {
      links.push(url);
    }
  }
  return links;
}

// ----------------- Mail.tm Sync Engine -----------------
async function syncMailtm(address: string) {
  const now = Date.now();
  let token: string | null = mailtmTokenCache[address]?.expiresAt > now ? mailtmTokenCache[address].token : null;

  if (!token) {
    const password = `Owntemp_Secret_${address.replace(/[^a-zA-Z0-9]/g, '_')}`;

    try {
      const loginRes = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, password }),
      });
      if (loginRes.ok) {
        const data = await loginRes.json();
        if (data.token) {
          const freshToken: string = data.token;
          token = freshToken;
          mailtmTokenCache[address] = { token: freshToken, expiresAt: now + 1000 * 60 * 50 };
        }
      }
    } catch (e) {}

    if (!token) {
      try {
        await fetch('https://api.mail.tm/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, password }),
        });
        const secondLogin = await fetch('https://api.mail.tm/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, password }),
        });
        if (secondLogin.ok) {
          const data = await secondLogin.json();
          if (data.token) {
            const freshToken: string = data.token;
            token = freshToken;
            mailtmTokenCache[address] = { token: freshToken, expiresAt: now + 1000 * 60 * 50 };
          }
        }
      } catch (e) {}
    }
  }

  if (!token) return;

  try {
    const listRes = await fetch('https://api.mail.tm/messages', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!listRes.ok) return;

    const listData = await listRes.json();
    const messages = listData['hydra:member'] || [];
    const existingEmails = getEmailsForAddress(address);

    for (const msg of messages) {
      const detailRes = await fetch(`https://api.mail.tm/messages/${msg.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!detailRes.ok) continue;

      const detail = await detailRes.json();
      const textBody = detail.text || '';
      const htmlBody = detail.html ? detail.html.join('') : textBody;
      const sender = detail.from?.address || 'unknown@sender.com';
      const senderName = detail.from?.name || sender.split('@')[0];
      const subject = detail.subject || '(No Subject)';

      if (existingEmails.some((e) => e.sender === sender && e.subject === subject)) continue;

      const otpCode = extractOtp(textBody, subject);
      const verificationLinks = extractVerificationLinks(htmlBody, textBody);

      saveInboundEmail({
        address,
        sender,
        senderName,
        subject,
        textBody,
        htmlBody,
        otpCode,
        verificationLinks,
        attachments: (detail.attachments || []).map((att: any) => ({
          id: att.id || Math.random().toString(36).substring(7),
          filename: att.filename || 'attachment',
          contentType: att.contentType || 'application/octet-stream',
          sizeBytes: att.size || 0,
          downloadUrl: att.downloadUrl ? `https://api.mail.tm${att.downloadUrl}` : undefined,
        })),
        sizeBytes: detail.size || textBody.length,
      });
    }
  } catch (err) {}
}

// ----------------- Guerrilla Mail Sync Engine -----------------
async function syncGuerrilla(username: string, domain: string, address: string) {
  let sid = guerrillaSidCache[username];

  if (!sid) {
    try {
      const initRes = await fetch('https://api.guerrillamail.com/ajax.php?f=get_email_address');
      const initData = await initRes.json();
      sid = initData.sid_token;

      // Set user alias
      await fetch(
        `https://api.guerrillamail.com/ajax.php?f=set_email_user&email_user=${encodeURIComponent(
          username
        )}&lang=en&sid_token=${sid}`
      );
      guerrillaSidCache[username] = sid;
    } catch (e) {
      return;
    }
  }

  try {
    const checkRes = await fetch(`https://api.guerrillamail.com/ajax.php?f=check_email&seq=0&sid_token=${sid}`);
    const checkData = await checkRes.json();
    if (!checkRes.ok || (checkData.auth && checkData.auth.success === false)) {
      delete guerrillaSidCache[username];
      return;
    }

    const list = checkData.list || [];
    const existingEmails = getEmailsForAddress(address);

    for (const item of list) {
      const mailId = item.mail_id;
      const detailRes = await fetch(
        `https://api.guerrillamail.com/ajax.php?f=fetch_email&email_id=${mailId}&sid_token=${sid}`
      );
      if (!detailRes.ok) continue;

      const detail = await detailRes.json();
      const textBody = detail.mail_body || '';
      const htmlBody = textBody;
      const sender = detail.mail_from || 'unknown@sender.com';
      const senderName = sender.split('<')[0].replace(/"/g, '').trim() || sender;
      const subject = detail.mail_subject || '(No Subject)';

      if (existingEmails.some((e) => e.sender === sender && e.subject === subject)) continue;

      const otpCode = extractOtp(textBody, subject);
      const verificationLinks = extractVerificationLinks(htmlBody, textBody);

      saveInboundEmail({
        address,
        sender,
        senderName,
        subject,
        textBody,
        htmlBody,
        otpCode,
        verificationLinks,
        attachments: [],
        sizeBytes: textBody.length,
      });
    }
  } catch (err) {
    delete guerrillaSidCache[username];
  }
}

// ----------------- Maildrop GraphQL Sync Engine -----------------
async function syncMaildrop(mailbox: string, address: string) {
  try {
    const res = await fetch('https://api.maildrop.cc/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { inbox(mailbox: "${mailbox}") { id, mailfrom, headerfrom, subject, date, data, html } }`,
      }),
    });
    if (!res.ok) return;
    const json = await res.json();
    const messages = json.data?.inbox || [];
    const existingEmails = getEmailsForAddress(address);

    for (const msg of messages) {
      const sender = msg.headerfrom || msg.mailfrom || 'unknown@sender.com';
      const senderName = sender.split('<')[0].replace(/"/g, '').trim() || sender;
      const subject = msg.subject || '(No Subject)';
      const textBody = msg.data || msg.html || '';
      const htmlBody = msg.html || msg.data || '';

      if (existingEmails.some((e) => e.sender === sender && e.subject === subject)) continue;

      const otpCode = extractOtp(textBody, subject);
      const verificationLinks = extractVerificationLinks(htmlBody, textBody);

      saveInboundEmail({
        address,
        sender,
        senderName,
        subject,
        textBody,
        htmlBody,
        otpCode,
        verificationLinks,
        attachments: [],
        sizeBytes: textBody.length,
      });
    }
  } catch (e) {}
}

// ----------------- Master Sync Dispatcher -----------------
export async function syncPublicInbox(address: string): Promise<void> {
  const parts = address.split('@');
  if (parts.length !== 2) return;

  const username = parts[0].toLowerCase();
  const domain = parts[1].toLowerCase();

  const guerrillaDomains = [
    'sharklasers.com',
    'guerrillamail.com',
    'guerrillamailblock.com',
    'guerrillamail.net',
    'guerrillamail.org',
    'guerrillamail.biz',
    'guerrillamail.info',
    'grr.la',
    'pokemail.net',
    'spam4.me',
  ];

  const mailtmDomains = [
    'fldubai.com',
    'mail.tm',
    'mail.gw',
  ];

  const maildropDomains = [
    'maildrop.cc',
  ];

  if (guerrillaDomains.includes(domain)) {
    await syncGuerrilla(username, domain, address);
  } else if (mailtmDomains.includes(domain)) {
    await syncMailtm(address);
  } else if (maildropDomains.includes(domain)) {
    await syncMaildrop(username, address);
  } else {
    const domainDef = ALL_PUBLIC_DOMAINS.find((d) => d.domain.toLowerCase() === domain);
    if (domainDef) {
      if (domainDef.provider === 'guerrilla') {
        await syncGuerrilla(username, domain, address);
      } else if (domainDef.provider === 'mailtm') {
        await syncMailtm(address);
      } else if (domainDef.provider === 'maildrop') {
        await syncMaildrop(username, address);
      }
    } else {
      // Default fallback: Try Guerrilla Mail for standard public requests
      await syncGuerrilla(username, domain, address);
    }
  }
}
