import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '2.7.0',
      edition: 'New 3D Cyber Emblem & Universal Multi-Platform Edition',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.7.0/app-v2.7.0-build39-android.apk',
      windowsDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.7.0/Owntemp-v2.7.0-windows-x64.zip',
      macDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.7.0/Owntemp-v2.7.0-mac-universal.zip',
      releaseNotes: {
        bn: 'Owntemp v2.7.0: নতুন আধুনিক 3D গ্লাসফরমিক অ্যাপ ও ওয়েব আইকন, অ্যান্ড্রয়েড APK, উইন্ডোজ PC এবং ম্যাকবুক (ইনটেল ও অ্যাপল সিলিকন M-চিপ) ইউনিভার্সাল মাল্টি-প্ল্যাটফর্ম ডেলিভারি।',
        en: 'Owntemp v2.7.0: Brand-new modern 3D glassmorphic cyber emblem for app & web, Android APK, Windows PC, and MacBook (Intel & Apple Silicon M-series) universal delivery.',
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
