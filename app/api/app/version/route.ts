import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      appName: 'Owntemp',
      latestVersion: '2.5.2',
      edition: 'Edge CDN Caching, Real-time SSE Stream & Mobile Stability Edition',
      minimumSupportedVersion: '1.0.0',
      apkDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.5.2/app-v2.5.2-build27-android.apk',
      windowsDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.5.2/Owntemp-v2.5.2-windows-x64.zip',
      macDownloadUrl: 'https://github.com/sajjadhossan/owntempmail/releases/download/v2.5.2/Owntemp-v2.5.2-mac-universal.zip',
      releaseNotes: {
        bn: 'Owntemp v2.5.2: গ্লোবাল এজ সিডিএন (Cloudflare Edge CDN) ক্যাশিং আর্কিটেকচার, মেমোরি ও সেশন ব্রাউজার ক্যাশ, রিয়েল-টাইম SSE ইভেন্ট স্ট্রিম, ডোমেন ভেরিফিকেশন API এবং ৫০ হাজার ডোমেন ব্রাউজারে মোবাইল স্ক্রিন স্ট্যাবিলিটি।',
        en: 'Owntemp v2.5.2: Global Edge CDN (Cloudflare Edge CDN) caching architecture, memory & session browser cache, real-time SSE stream, DNS verification API, and mobile WebView domain browser stability overhaul.',
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
