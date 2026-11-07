import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '2.6.3',
      edition: 'Jitter-Free Smooth UI & Super Admin Approval Edition',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.6.3/app-v2.6.3-build38-android.apk',
      windowsDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.6.3/Owntemp-v2.6.3-windows-x64.zip',
      macDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.6.3/Owntemp-v2.6.3-mac-universal.zip',
      releaseNotes: {
        bn: 'Owntemp v2.6.3: অ্যান্ড্রয়েড স্ক্রিন কাঁপাকাপি দূরীকরণ, স্মার্ট মডাল ওভারল্যাপ কন্ট্রোল, নিয়ন ডিবি ও সুপারবেজ সুপার অ্যাডমিন অনুমোদন ব্যবস্থা এবং নিরবচ্ছিন্ন পারফরম্যান্স।',
        en: 'Owntemp v2.6.3: Android screen jitter elimination, smart non-overlapping modal stacking, Neon DB & Supabase Super Admin user approval system, and peak performance.',
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
