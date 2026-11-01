import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '1.4.0',
      edition: 'Custom Business Setup & Multi-Domain Engine',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/owntemp/releases/latest/app-v1.4.0-android.apk',
      windowsDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v1.4.0-windows-x64.exe',
      macDownloadUrl: 'https://github.com/owntemp/releases/latest/Owntemp-v1.4.0-mac-universal.dmg',
      releaseNotes: {
        bn: 'Owntemp v1.4.0 আপডেট: যেকোনো কাস্টম বিজনেস সেটআপ ও ব্র্যান্ডিং ইঞ্জিন, সরাসরি যেকোনো বিজনেস ডোমেইন টাইপ ও যোগ করার সুবিধা, প্রতিটি ডোমেইনের জন্য তাৎক্ষণিক ক্লাউডফ্লেয়ার DNS রেকর্ড জেনারেটর।',
        en: 'Owntemp v1.4.0 Update: Custom Business Workspace & Branding engine, Direct business domain input & management, Automatic instant Cloudflare DNS records generator for any domain.',
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
