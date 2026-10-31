import fs from 'fs';
import path from 'path';
import { EmailRecord, InboxMetadata, DomainItem } from './types';

interface DatabaseSchema {
  inboxes: Record<string, InboxMetadata>;
  emails: EmailRecord[];
  domains: DomainItem[];
  version: string;
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'owntemp-db.json');

// Default initial state
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
    console.warn('[Storage] Could not read db file, initializing fresh:', err);
  }

  if (!memoryDb) {
    memoryDb = {
      inboxes: {},
      emails: [],
      domains: DEFAULT_DOMAINS,
      version: '1.0.0',
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
    console.error('[Storage] Error saving db:', err);
  }
}

export function getInboxMetadata(address: string): InboxMetadata {
  const db = ensureDbLoaded();
  const normalized = address.trim().toLowerCase();

  if (!db.inboxes[normalized]) {
    db.inboxes[normalized] = {
      address: normalized,
      isLocked: false,
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

  // Also flag existing emails as locked
  db.emails.forEach((email) => {
    if (email.address.toLowerCase() === normalized) {
      email.isLocked = true;
    }
  });

  persistDb();
  return { success: true, message: 'Inbox permanently locked with lifetime protection.' };
}

export function unlockInbox(address: string, pin: string): { success: boolean; message: string } {
  const db = ensureDbLoaded();
  const normalized = address.trim().toLowerCase();
  const meta = db.inboxes[normalized];

  if (!meta || !meta.isLocked) {
    return { success: true, message: 'Inbox was not locked.' };
  }

  if (meta.lockPin && meta.lockPin !== pin.trim()) {
    return { success: false, message: 'Invalid Lock PIN / Key. Access denied.' };
  }

  meta.isLocked = false;
  meta.lockPin = undefined;
  meta.lockedAt = undefined;

  db.emails.forEach((email) => {
    if (email.address.toLowerCase() === normalized) {
      email.isLocked = false;
    }
  });

  persistDb();
  return { success: true, message: 'Inbox unlocked successfully.' };
}

export function verifyInboxPin(address: string, pin: string): boolean {
  const db = ensureDbLoaded();
  const normalized = address.trim().toLowerCase();
  const meta = db.inboxes[normalized];
  if (!meta || !meta.isLocked) return true;
  return meta.lockPin === pin.trim();
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

  // Protect locked inbox emails unless unlocked
  if (target.isLocked) {
    throw new Error('This email belongs to a lifetime locked inbox and cannot be deleted without unlocking.');
  }

  db.emails = db.emails.filter((e) => e.id !== id);
  persistDb();
  return true;
}

export function getAllDomains(): DomainItem[] {
  const db = ensureDbLoaded();
  return db.domains;
}

export function addCustomDomain(domainName: string): DomainItem {
  const db = ensureDbLoaded();
  const cleanDomain = domainName.trim().toLowerCase().replace(/^@+/, '');

  const existing = db.domains.find((d) => d.domain === cleanDomain);
  if (existing) return existing;

  const newDomain: DomainItem = {
    id: `dom_${Date.now()}`,
    domain: cleanDomain,
    isDefault: false,
    isCustom: true,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  db.domains.push(newDomain);
  persistDb();
  return newDomain;
}
