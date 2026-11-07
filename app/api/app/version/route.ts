import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '2.8.4',
      edition: 'Resilient Fullscreen Domain Directory & Edge-to-Edge Layout Edition',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.4/app-v2.8.4-build44-android.apk',
      windowsDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.4/Owntemp-v2.8.4-windows-x64.exe',
      macDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.4/Owntemp-v2.8.4-macOS-Universal.dmg',
      releaseNotes: {
        bn: 'Owntemp v2.8.4: ৫০,০০০+ ডিরেক্টরি মোডাল ফ্লেক্স হাইট ও min-h-0 ফিক্স, এজ-টু-এজ ফুলস্ক্রিন ভিউ এবং ক্র্যাশ-ফ্রি মোবাইল ডিসপ্লে।',
        en: 'Owntemp v2.8.4: 50,000+ directory modal flex height and min-h-0 fix, edge-to-edge full screen view and crash-free mobile rendering.',
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
