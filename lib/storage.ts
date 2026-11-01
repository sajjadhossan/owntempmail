import fs from 'fs';
import path from 'path';
import { EmailRecord, InboxMetadata, DomainItem, EmailAttachment, BusinessProfile } from './types';

interface DatabaseSchema {
  inboxes: Record<string, InboxMetadata>;
  emails: EmailRecord[];
  domains: DomainItem[];
  businessProfile?: BusinessProfile;
  version: string;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'owntemp-db.json');

const DEFAULT_DOMAINS: DomainItem[] = [
  { id: 'dom-1', domain: 'owntemp.live', isDefault: true, isCustom: false, status: 'active', createdAt: new Date().toISOString() },
  { id: 'dom-2', domain: 'mybusiness.com', isDefault: false, isCustom: true, status: 'active', createdAt: new Date().toISOString() },
  { id: 'dom-3', domain: 'tempinbox.click', isDefault: false, isCustom: false, status: 'active', createdAt: new Date().toISOString() },
];

let memoryDb: DatabaseSchema | null = null;

function ensureDbLoaded(): DatabaseSchema {
  if (memoryDb) return memoryDb;

  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      memoryDb = JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Storage] Initializing fresh schema:', err);
  }

  if (!memoryDb) {
    memoryDb = {
      inboxes: {},
      emails: [],
      domains: DEFAULT_DOMAINS,
      version: '1.3.0',
    };
    persistDb();
  }

  return memoryDb;
}

function persistDb() {
  if (!memoryDb) return;
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8');
  } catch (err) {
    console.error('[Storage] Error persisting database:', err);
  }
}

export function getInboxMetadata(address: string): InboxMetadata {
  const db = ensureDbLoaded();
  const normalized = address.trim().toLowerCase();

  if (!db.inboxes[normalized]) {
    db.inboxes[normalized] = {
      address: normalized,
      isLocked: false,
      failedAttempts: 0,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      totalEmails: 0,
    };
    persistDb();
  }

  const emailCount = db.emails.filter((e) => e.address.toLowerCase() === normalized).length;
  db.inboxes[normalized].totalEmails = emailCount;
  return db.inboxes[normalized];
}

export function lockInbox(address: string, pin: string): { success: boolean; message: string } {
  const db = ensureDbLoaded();
  const normalized = address.trim().toLowerCase();
  const meta = getInboxMetadata(normalized);

  meta.isLocked = true;
  meta.lockPin = pin.trim();
  meta.lockedAt = new Date().toISOString();
  meta.failedAttempts = 0;
  meta.lockedUntil = null;

  db.emails.forEach((email) => {
    if (email.address.toLowerCase() === normalized) {
      email.isLocked = true;
    }
  });

  persistDb();
  return { success: true, message: 'Inbox permanently locked with lifetime protection.' };
}

export function unlockInbox(address: string, pin: string): { success: boolean; message: string; errorCode?: string } {
  const db = ensureDbLoaded();
  const normalized = address.trim().toLowerCase();
  const meta = db.inboxes[normalized];

  if (!meta || !meta.isLocked) {
    return { success: true, message: 'Inbox is not locked.' };
  }

  // Check rate limiting
  if (meta.lockedUntil && new Date(meta.lockedUntil).getTime() > Date.now()) {
    const minutesLeft = Math.ceil((new Date(meta.lockedUntil).getTime() - Date.now()) / (60 * 1000));
    return {
      success: false,
      message: `Too many failed PIN attempts. Inbox is temporarily restricted for ${minutesLeft} more minute(s).`,
      errorCode: 'auth_rate_limited',
    };
  }

  if (meta.lockPin && meta.lockPin !== pin.trim()) {
    meta.failedAttempts = (meta.failedAttempts || 0) + 1;
    if (meta.failedAttempts >= 5) {
      meta.lockedUntil = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes lock
      persistDb();
      return {
        success: false,
        message: 'Security Alert: 5 incorrect PIN attempts. Inbox locked for 10 minutes.',
        errorCode: 'auth_rate_limited',
      };
    }
    persistDb();
    return {
      success: false,
      message: `Invalid Lock PIN. Attempt ${meta.failedAttempts}/5 before temporary cooldown.`,
      errorCode: 'auth_invalid_credentials',
    };
  }

  // Success
  meta.isLocked = false;
  meta.lockPin = undefined;
  meta.lockedAt = undefined;
  meta.failedAttempts = 0;
  meta.lockedUntil = null;

  db.emails.forEach((email) => {
    if (email.address.toLowerCase() === normalized) {
      email.isLocked = false;
    }
  });

  persistDb();
  return { success: true, message: 'Inbox unlocked successfully.' };
}

export function getEmailsForAddress(address: string): EmailRecord[] {
  const db = ensureDbLoaded();
  const normalized = address.trim().toLowerCase();
  return db.emails
    .filter((e) => e.address.toLowerCase() === normalized)
    .sort((a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime());
}

export function saveInboundEmail(record: Omit<EmailRecord, 'id' | 'receivedAt' | 'isRead' | 'isLocked'>): EmailRecord {
  const db = ensureDbLoaded();
  const normalizedAddress = record.address.trim().toLowerCase();
  const meta = getInboxMetadata(normalizedAddress);

  const newEmail: EmailRecord = {
    ...record,
    id: `em_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    address: normalizedAddress,
    receivedAt: new Date().toISOString(),
    isRead: false,
    isLocked: meta.isLocked,
    attachments: record.attachments || [],
  };

  db.emails.unshift(newEmail);
  meta.totalEmails = db.emails.filter((e) => e.address.toLowerCase() === normalizedAddress).length;
  meta.lastActiveAt = new Date().toISOString();

  persistDb();
  return newEmail;
}

export function deleteEmail(id: string): boolean {
  const db = ensureDbLoaded();
  const target = db.emails.find((e) => e.id === id);
  if (!target) return false;

  if (target.isLocked) {
    throw new Error('This email belongs to a lifetime locked inbox and cannot be deleted.');
  }

  db.emails = db.emails.filter((e) => e.id !== id);
  persistDb();
  return true;
}

export function getLockedInboxes(): InboxMetadata[] {
  const db = ensureDbLoaded();
  return Object.values(db.inboxes)
    .filter((meta) => meta.isLocked)
    .sort((a, b) => new Date(b.lockedAt || b.createdAt).getTime() - new Date(a.lockedAt || a.createdAt).getTime());
}

export function cleanupExpiredEmails(maxAgeHours: number = 24): {
  purgedEmailsCount: number;
  preservedLockedEmailsCount: number;
  preservedLockedInboxesCount: number;
} {
  const db = ensureDbLoaded();
  const cutoffTime = Date.now() - maxAgeHours * 60 * 60 * 1000;

  const initialCount = db.emails.length;

  // STRICT RULE: Only purge emails that:
  // 1. are older than cutoffTime
  // 2. AND are NOT locked (email.isLocked !== true)
  // 3. AND the parent inbox is NOT locked (inbox.isLocked !== true)
  db.emails = db.emails.filter((email) => {
    const parentInbox = db.inboxes[email.address.toLowerCase()];
    const isProtected = email.isLocked || (parentInbox && parentInbox.isLocked);
    if (isProtected) {
      return true; // Keep permanently
    }

    const emailTime = new Date(email.receivedAt).getTime();
    return emailTime >= cutoffTime; // Keep if newer than cutoff
  });

  const purgedEmailsCount = initialCount - db.emails.length;
  const preservedLockedEmailsCount = db.emails.filter((e) => e.isLocked).length;
  const preservedLockedInboxesCount = Object.values(db.inboxes).filter((i) => i.isLocked).length;

  // Recalculate inbox totals
  Object.keys(db.inboxes).forEach((addr) => {
    db.inboxes[addr].totalEmails = db.emails.filter((e) => e.address.toLowerCase() === addr).length;
  });

  persistDb();
  return {
    purgedEmailsCount,
    preservedLockedEmailsCount,
    preservedLockedInboxesCount,
  };
}

export function getAllDomains(): DomainItem[] {
  const db = ensureDbLoaded();
  return db.domains;
}

export function getBusinessProfile(): BusinessProfile {
  const db = ensureDbLoaded();
  if (!db.businessProfile) {
    db.businessProfile = {
      businessName: 'My Business Workspace',
      tagline: 'Custom Domain Temp Mail Engine',
      primaryDomain: 'owntemp.live',
      updatedAt: new Date().toISOString(),
    };
    persistDb();
  }
  return db.businessProfile;
}

export function updateBusinessProfile(businessName: string, tagline?: string, primaryDomain?: string): BusinessProfile {
  const db = ensureDbLoaded();
  db.businessProfile = {
    businessName: businessName.trim() || 'My Business Workspace',
    tagline: tagline?.trim() || '',
    primaryDomain: primaryDomain?.trim().toLowerCase() || db.businessProfile?.primaryDomain || 'owntemp.live',
    updatedAt: new Date().toISOString(),
  };
  persistDb();
  return db.businessProfile;
}

export function addCustomDomain(domainName: string, businessName?: string): DomainItem {
  const db = ensureDbLoaded();
  const cleanDomain = domainName.trim().toLowerCase().replace(/^@+/, '');

  const existing = db.domains.find((d) => d.domain === cleanDomain);
  if (existing) {
    if (businessName) existing.businessName = businessName.trim();
    persistDb();
    return existing;
  }

  const newDomain: DomainItem = {
    id: `dom_${Date.now()}`,
    domain: cleanDomain,
    businessName: businessName?.trim() || undefined,
    isDefault: false,
    isCustom: true,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  db.domains.push(newDomain);
  persistDb();
  return newDomain;
}

export function deleteCustomDomain(idOrDomain: string): boolean {
  const db = ensureDbLoaded();
  const initialLen = db.domains.length;
  db.domains = db.domains.filter((d) => d.id !== idOrDomain && d.domain !== idOrDomain && !d.isDefault);
  if (db.domains.length !== initialLen) {
    persistDb();
    return true;
  }
  return false;
}
