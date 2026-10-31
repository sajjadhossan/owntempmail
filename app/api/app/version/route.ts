import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '1.0.0',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/owntemp/releases/latest/app-v1.0.0-android.apk',
      windowsDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v1.0.0-windows-x64.exe',
      macDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v1.0.0-mac-universal.dmg',
      releaseNotes: {
        bn: 'Owntemp v1.0.0 রিলিজ: কাস্টম ডোমেইন সাপোর্ট, লাইফটাইম পার্মানেন্ট ইনবক্স লক ফিচার, স্বয়ংক্রিয় ওটিপি (OTP) ও ভেরিফিকেশন লিংক নিষ্কাশন, রিয়েল-টাইম পুশ নোটিফিকেশন।',
        en: 'Owntemp v1.0.0 Initial Release: Custom domain aliases, Lifetime permanent inbox locking with secure PIN, Automatic OTP & verification link detection, Real-time inbound email routing.',
      },
      forceUpdate: false,
    },
  });
}
