import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '2.5.3',
      edition: 'Silky Smooth UI, Haptics & Pinned Domains Edition',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.5.3/app-v2.5.3-build28-android.apk',
      windowsDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.5.3/Owntemp-v2.5.3-windows-x64.zip',
      macDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.5.3/Owntemp-v2.5.3-mac-universal.zip',
      releaseNotes: {
        bn: 'Owntemp v2.5.3: ট্যাকটাইল হ্যাপটিক ভাইব্রেশন ফিডব্যাক, ৫০ হাজার ডোমেন ব্রাউজারে স্টার/পিনড ফেভারিট সিস্টেম, ১২০ হার্জ আল্ট্রা-স্মুথ স্ক্রলিং এবং অ্যামোলেড পিওর ব্ল্যাক অপটিমাইজেশন।',
        en: 'Owntemp v2.5.3: Tactile haptic vibration feedback, Star/Pinned favorite domain subsystem across 50,000+ pool, 120Hz ultra-smooth touch scrolling, and AMOLED optimizations.',
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
