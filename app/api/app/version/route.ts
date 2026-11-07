import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '2.8.3',
      edition: 'Fullscreen 50,000+ Domain Directory & Responsive Grid Edition',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.3/app-v2.8.3-build43-android.apk',
      windowsDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.3/Owntemp-v2.8.3-windows-x64.exe',
      macDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.3/Owntemp-v2.8.3-macOS-Universal.dmg',
      releaseNotes: {
        bn: 'Owntemp v2.8.3: ৫০,০০০+ ডিরেক্টরি মোডাল সম্পূর্ণ ফুলস্ক্রিন ভিউ, রেসপনসিভ ওয়াইড গ্রিড ও ব্যাচ ২৪০ ডোমেইন একসাথে দেখার সুবিধা।',
        en: 'Owntemp v2.8.3: 50,000+ directory modal full screen view, responsive wide grid and batch 240 domains viewing support.',
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
