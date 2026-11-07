import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '2.8.2',
      edition: '100% Live Verified Domain Fleet & Multi-Engine Public Mail Sync Edition',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.2/app-v2.8.2-build42-android.apk',
      windowsDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.2/Owntemp-v2.8.2-windows-x64.exe',
      macDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.8.2/Owntemp-v2.8.2-macOS-Universal.dmg',
      releaseNotes: {
        bn: 'Owntemp v2.8.2: ৫০,০০০+ ডিরেক্টরি লাইভ ফ্লিট ফিল্টার, ১০০% লাইভ ভেরিফাইড ব্যাজিং (Guerrilla, Mail.tm, Maildrop), এবং ইনস্ট্যান্ট ওটিপি রিসিভার ইঞ্জিন।',
        en: 'Owntemp v2.8.2: 50,000+ directory live fleet filter, 100% live verified badging (Guerrilla, Mail.tm, Maildrop), and instant OTP delivery engine.',
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
