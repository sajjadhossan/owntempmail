import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '1.1.0',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/owntemp/releases/latest/app-v1.1.0-android.apk',
      windowsDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v1.1.0-windows-x64.exe',
      macDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v1.1.0-mac-universal.dmg',
      releaseNotes: {
        bn: 'Owntemp v1.1.0 আপডেট: পার্মানেন্ট লকড ইনবক্স সুইচার ট্রে, ইনস্ট্যান্ট QR কোড জেনারেটর, সার্চ ও ওটিপি ফিল্টারিং, সাউন্ড ও ব্রাউজার নোটিফিকেশন, ইমেইল ডাউনলোড/এক্সপোর্ট (EML/TXT)।',
        en: 'Owntemp v1.1.0 Update: Permanent locked inboxes switcher tray, Instant QR code generator, Search & OTP filtering, Audio chime & browser notifications, Email export (EML/TXT).',
      },
      forceUpdate: false,
    },
  });
}
