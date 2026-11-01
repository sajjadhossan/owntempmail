import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '1.5.0',
      edition: 'Dual Cloudflare Automation & Vercel Integration Hub',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/owntemp/releases/latest/app-v1.5.0-android.apk',
      windowsDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v1.5.0-windows-x64.exe',
      macDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v1.5.0-mac-universal.dmg',
      releaseNotes: {
        bn: 'Owntemp v1.5.0 রিলিজ: ক্লাউডফ্লেয়ার ১-ক্লিক অটোমেটিক API টোকেন সেটআপ (/api/cloudflare/setup), কাস্টম Vercel লাইভ ওয়েবসাইট URL ইনপুট সাপোর্ট, এবং উভয় পদ্ধতির জন্য ধাপে ধাপে এ-টু-জেড বিস্তারিত গাইড।',
        en: 'Owntemp v1.5.0 Release: 1-Click Cloudflare Automated Setup via API Token (/api/cloudflare/setup), Custom Vercel Live Website URL input, and complete step-by-step A-to-Z setup guides for both automated and manual methods.',
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
