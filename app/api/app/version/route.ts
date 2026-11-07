import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '2.8.1',
      edition: 'Resilient Directory & Multi-Engine Public Mail Sync Edition',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.1/app-v2.8.1-build41-android.apk',
      windowsDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.1/Owntemp-v2.8.1-windows-x64.exe',
      macDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.1/Owntemp-v2.8.1-macOS-Universal.dmg',
      releaseNotes: {
        bn: 'Owntemp v2.8.1: ৫০,০০০+ ডিরেক্টরি মোডাল লেআউট ও নাল-সেফটি ফিক্স, Maildrop GraphQL লাইভ ইঞ্জিন ইন্টিগ্রেশন এবং পাবলিক টেম্প মেইল সিঙ্ক নিশ্চিতকরণ।',
        en: 'Owntemp v2.8.1: 50,000+ directory modal mobile layout and null-safety fix, Maildrop GraphQL live engine integration, and verified public temp mail delivery.',
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
  }, {
    status: 200,
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      'CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  });
}
