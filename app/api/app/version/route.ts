import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '2.8.0',
      edition: 'Background Task Persistence & Resilient Settings Edition',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.0/app-v2.8.0-build40-android.apk',
      windowsDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.0/Owntemp-v2.8.0-windows-x64.exe',
      macDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.0/Owntemp-v2.8.0-macOS-Universal.dmg',
      releaseNotes: {
        bn: 'Owntemp v2.8.0: ব্যাকগ্রাউন্ড টাস্ক পারসিস্টেন্স (অ্যাপ বন্ধ না হয়ে ব্যাকগ্রাউন্ডে চালু থাকা), সেটিংস ও ডোমেইন মোডাল ফিক্স এবং সুপার অ্যাডমিন সেন্ট্রাল ডোমেইন কন্ট্রোল।',
        en: 'Owntemp v2.8.0: Background task persistence (app stays alive in background without reloading), mobile settings modal fix, and Super Admin Domain Control desk.',
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
