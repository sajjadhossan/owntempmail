import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '2.5.1',
      edition: 'Clean Modern UI & Android Stability Edition',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.5.1/app-v2.5.1-build26-android.apk',
      windowsDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.5.1/Owntemp-v2.5.1-windows-x64.zip',
      macDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.5.1/Owntemp-v2.5.1-mac-universal.zip',
      releaseNotes: {
        bn: 'Owntemp v2.5.1: অ্যান্ড্রয়েড অ্যাপের ক্র্যাশ সমাধান ও নেটওয়ার্ক স্ট্যাবিলিটি আপডেট। ফেইলসেফ অফলাইন স্ক্রিন, ডাউনলোড পারমিশন এবং রিলিজ বাটন সরাসরি ডাউনলোডযোগ্য।',
        en: 'Owntemp v2.5.1: Android runtime crash fixes and network stability updates. Failsafe offline screen, attachment permissions, and verified direct release binaries.',
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
