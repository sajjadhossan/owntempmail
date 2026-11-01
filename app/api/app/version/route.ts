import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '1.3.0',
      edition: 'Enterprise Gold Release',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/owntemp/releases/latest/app-v1.3.0-android.apk',
      windowsDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v1.3.0-windows-x64.exe',
      macDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v1.3.0-mac-universal.dmg',
      releaseNotes: {
        bn: 'Owntemp v1.3.0 এন্টারপ্রাইজ গোল্ড রিলিজ: নেটিভ অ্যান্ড্রয়েড প্রজেক্ট (android/), ডুয়াল স্টোরেজ ইঞ্জিন (PostgreSQL/Supabase + Local fallback), স্বয়ংক্রিয় ক্লিনআপ ক্রন জব (/api/cron/cleanup), ইমেইল অ্যাটাচমেন্ট সাপোর্ট এবং পিন ব্রুট-ফোর্স রেট-লিমিটিং সিকিউরিটি।',
        en: 'Owntemp v1.3.0 Enterprise Gold Release: Native Android Gradle project (android/), Dual Storage Engine (PostgreSQL/Supabase + Local fallback), Automated Cleanup Cron (/api/cron/cleanup) protecting lifetime locks, Email Attachments viewer/downloader, and PIN brute-force rate-limiting security.',
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
