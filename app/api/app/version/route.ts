import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '2.5.0',
      edition: 'Clean Modern UI Overhaul Edition',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/owntemp/releases/latest/app-v2.5.0-android.apk',
      windowsDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v2.5.0-windows-x64.exe',
      macDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v2.5.0-mac-universal.dmg',
      releaseNotes: {
        bn: 'Owntemp v2.5.0: সম্পূর্ণ নতুন পরিচ্ছন্ন ও আধুনিক ইউআই। পিসিতে ডুয়াল-পেন মাস্টার-ডিটেইল ভিউ, মোবাইলে বটম নেভিগেশন বার, হেডারের অপ্রয়োজনীয় বাটন হ্রাস, ফ্লোটিং কুইক-ওটিপি ব্যানার এবং সুবিন্যস্ত সেটিংস হাব।',
        en: 'Owntemp v2.5.0: Clean Modern UI Overhaul. Master-detail split pane for desktop, mobile bottom navigation bar, uncluttered slim header, floating quick-OTP banner, and streamlined settings hub.',
      },
      platforms: {
        android: {
          appId: 'live.owntemp.app',
          target: 'Android 8.0 - 15.0',
          format: 'APK / AAB',
          nativeDirectory: 'android/',
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
