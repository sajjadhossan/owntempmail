export interface EmailAttachment {
  id: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  downloadUrl?: string;
  dataBase64?: string;
}

export interface EmailRecord {
  id: string;
  address: string;
  sender: string;
  senderName?: string;
  subject: string;
  textBody: string;
  htmlBody?: string;
  otpCode?: string | null;
  verificationLinks?: string[];
  attachments?: EmailAttachment[];
  receivedAt: string;
  isRead: boolean;
  isLocked: boolean;
  sizeBytes?: number;
}

export interface InboxMetadata {
  address: string;
  isLocked: boolean;
  lockPin?: string;
  lockedAt?: string;
  failedAttempts?: number;
  lockedUntil?: string | null;
  createdAt: string;
  lastActiveAt: string;
  totalEmails: number;
}

export interface DomainItem {
  id: string;
  domain: string;
  businessName?: string;
  isDefault: boolean;
  isCustom: boolean;
  status: 'active' | 'pending' | 'verified';
  createdAt: string;
}

export interface BusinessProfile {
  businessName: string;
  tagline?: string;
  primaryDomain: string;
  updatedAt: string;
}

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  notifyOnOtpOnly: boolean;
  updatedAt?: string;
}

export type DeploymentSlot = 'blue' | 'green';

export interface DeploymentEnvironment {
  slot: DeploymentSlot;
  version: string;
  url: string;
  status: 'healthy' | 'degraded' | 'offline';
  trafficWeight: number; // 0 to 100%
  deployedAt: string;
  healthMetrics: {
    latencyMs: number;
    uptimePercent: number;
    dbConnected: boolean;
    otpEngineReady: boolean;
  };
}

export interface DeploymentSwitchLog {
  id: string;
  fromSlot: DeploymentSlot;
  toSlot: DeploymentSlot;
  switchedAt: string;
  switchedBy: string;
  reason: string;
}

export interface BlueGreenConfig {
  activeSlot: DeploymentSlot;
  autoRollbackOnError: boolean;
  canaryPercent: number;
  blue: DeploymentEnvironment;
  green: DeploymentEnvironment;
  switchHistory: DeploymentSwitchLog[];
  updatedAt: string;
}

export interface OutboundEmail {
  id: string;
  from: string;
  to: string;
  subject: string;
  textBody: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'simulated';
}

export interface ForwardingRule {
  inboxAddress: string;
  enabled: boolean;
  type: 'discord' | 'slack' | 'webhook' | 'email';
  destination: string;
  otpOnly: boolean;
  createdAt: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    purgedEmailsCount?: number;
    preservedLockedEmailsCount?: number;
    preservedLockedInboxesCount?: number;
  };
  errorCode?: string;
  errors?: Array<{ field: string; message: string }>;
}
