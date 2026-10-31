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
  createdAt: string;
  lastActiveAt: string;
  totalEmails: number;
}

export interface DomainItem {
  id: string;
  domain: string;
  isDefault: boolean;
  isCustom: boolean;
  status: 'active' | 'pending' | 'verified';
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
  };
  errorCode?: string;
  errors?: Array<{ field: string; message: string }>;
}
