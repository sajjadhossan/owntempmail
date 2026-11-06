export interface DeviceSession {
  deviceId: string;
  userId: string;
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
  lastActiveAt: string;
  ipAddress?: string;
  isCurrentDevice?: boolean;
}

export interface SyncedUserState {
  userId: string;
  email: string;
  activeEmail: string;
  recentInboxes: string[];
  pinnedDomains: string[];
  theme: 'dark' | 'light' | 'amoled';
  lang: string;
  soundEnabled: boolean;
  voiceEnabled: boolean;
  updatedAt: string;
}

/**
 * Generates or retrieves a unique persistent client device identifier.
 */
export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return 'server_device';
  try {
    let id = localStorage.getItem('owntemp_device_id');
    if (!id) {
      id = `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('owntemp_device_id', id);
    }
    return id;
  } catch (e) {
    return `dev_fallback_${Date.now()}`;
  }
}

/**
 * Detects device hardware type, OS and browser from userAgent.
 */
export function detectDeviceDetails(): {
  deviceName: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  os: string;
} {
  if (typeof window === 'undefined') {
    return {
      deviceName: 'Web Client',
      deviceType: 'desktop',
      browser: 'Web Browser',
      os: 'Unknown OS',
    };
  }

  const ua = navigator.userAgent;

  // OS detection
  let os = 'Unknown OS';
  if (/Windows/i.test(ua)) os = 'Windows PC';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS (Apple)';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Device type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/iPad|Tablet/i.test(ua)) deviceType = 'tablet';
  else if (/Mobile|Android|iPhone/i.test(ua)) deviceType = 'mobile';

  // Browser detection
  let browser = 'Chrome';
  if (/Edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/Chrome/i.test(ua) && !/Edg/i.test(ua)) browser = 'Google Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Apple Safari';
  else if (/Firefox/i.test(ua)) browser = 'Mozilla Firefox';

  const deviceName = `${os} • ${browser}`;

  return { deviceName, deviceType, browser, os };
}
