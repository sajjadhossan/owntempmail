import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '1.2.0',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/owntemp/releases/latest/app-v1.2.0-android.apk',
      windowsDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v1.2.0-windows-x64.exe',
      macDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v1.2.0-mac-universal.dmg',
      releaseNotes: {
        bn: 'Owntemp v1.2.0 আপডেট: মাল্টি-প্ল্যাটফর্ম সাপোর্ট (অ্যান্ড্রয়েড APK, উইন্ডোজ PC .exe, ম্যাকবুক Intel ও Apple Silicon M-Series), Vercel প্রোডাকশন কনফিগারেশন, অটো-আপডেট চেকার এবং সেটিংস প্যানেল।',
        en: 'Owntemp v1.2.0 Release: Full multi-platform packaging (Android APK, Windows PC .exe, macOS Universal for Intel & Apple Silicon M-Series), Vercel production deployment config, Auto-update checker and App Settings drawer.',
      },
      platforms: {
        android: {
          appId: 'live.owntemp.app',
          target: 'Android 8.0 - 15.0',
          format: 'APK / AAB',
        },
        windows: {
          arch: 'x64 (64-bit)',
          format: 'Portable .exe & Installer',
        },
        macos: {
          arch: 'Universal (x86_64 Intel & arm64 Apple Silicon M1-M4)',
          format: '.dmg / .app',
        },
        web: {
          provider: 'Vercel Serverless Edge',
          ssl: 'Enforced HTTPS',
        },
      },
      forceUpdate: false,
    },
  });
}
