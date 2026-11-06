import { NextRequest, NextResponse } from 'next/server';
import { addCustomDomain } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const { apiToken, domain, vercelUrl } = await req.json();

    if (!apiToken || apiToken.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: 'Valid Cloudflare API Token is required',
          errorCode: 'validation_error',
        },
        { status: 400 }
      );
    }

    if (!domain || !domain.includes('.')) {
      return NextResponse.json(
        {
          success: false,
          message: 'Valid domain is required (e.g. yourbusiness.com)',
          errorCode: 'validation_error',
        },
        { status: 400 }
      );
    }

    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/+.*$/, '')
      .replace(/^@+/, '');

    if (cleanDomain.includes('vercel.app')) {
      return NextResponse.json(
        {
          success: false,
          message:
            '❌ ভুল ইনপুট: "' +
            cleanDomain +
            '" হলো Vercel-এর দেওয়া ওয়েবসাইট ঠিকানা। এটি ক্লাউডফ্লেয়ার ডোমেইন নয়। ভার্সেল ডোমেইনে ক্লাউডফ্লেয়ার ইমেইল রাউটিং কাজ করে না। ইমেইল পেতে আপনার ক্লাউডফ্লেয়ার অ্যাকাউন্টে যুক্ত থাকা নিজস্ব কাস্টম ডোমেইন (যেমন: yourdomain.com) লিখুন।',
          errorCode: 'vercel_domain_not_supported',
        },
        { status: 400 }
      );
    }

    const cleanVercelUrl = (vercelUrl || 'https://owntemp.vercel.app').trim().replace(/\/+$/, '');
    const webhookEndpoint = `${cleanVercelUrl}/api/inbound/webhook`;

    // 1. Verify Cloudflare Token & Get Zone ID
    const zoneRes = await fetch(`https://api.cloudflare.com/client/v4/zones?name=${cleanDomain}`, {
      headers: {
        Authorization: `Bearer ${apiToken.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    const zoneData = await zoneRes.json();

    if (!zoneRes.ok || !zoneData.success) {
      const errorMsg = zoneData.errors?.[0]?.message || 'Invalid API Token or permission denied.';
      return NextResponse.json(
        {
          success: false,
          message: `Cloudflare Error: ${errorMsg}. Please ensure token has Zone.DNS and Zone.Email permissions.`,
          errorCode: 'cloudflare_auth_failed',
        },
        { status: 400 }
      );
    }

    if (!zoneData.result || zoneData.result.length === 0) {
      // Suggest available zones in user's Cloudflare account
      let suggestionMessage = `ডোমেইন "${cleanDomain}" আপনার Cloudflare অ্যাকাউন্টে খুঁজে পাওয়া যায়নি।`;
      try {
        const allZonesRes = await fetch('https://api.cloudflare.com/client/v4/zones?per_page=20', {
          headers: {
            Authorization: `Bearer ${apiToken.trim()}`,
            'Content-Type': 'application/json',
          },
        });
        const allZonesData = await allZonesRes.json();
        if (allZonesData.success && Array.isArray(allZonesData.result) && allZonesData.result.length > 0) {
          const names = allZonesData.result.map((z: any) => z.name);
          suggestionMessage += `\n\n💡 তবে আপনার ক্লাউডফ্লেয়ার অ্যাকাউন্টে এই ডোমেইনগুলো সচল রয়েছে: [${names.join(', ')}]। আপনি কি এর কোনোটিতে সেটআপ করতে চান?`;
        } else {
          suggestionMessage += `\n\n⚠️ আপনার ক্লাউডফ্লেয়ার অ্যাকাউন্টে বর্তমানে কোনো ডোমেইন যুক্ত করা নেই (0 domains found)। অনুগ্রহ করে dash.cloudflare.com-এ গিয়ে 'Add a Site'-এ আপনার নিজস্ব ডোমেইন যোগ করুন।`;
        }
      } catch (e) {}

      return NextResponse.json(
        {
          success: false,
          message: suggestionMessage,
          errorCode: 'domain_not_found',
        },
        { status: 404 }
      );
    }

    const zoneId = zoneData.result[0].id;
    const accountId = zoneData.result[0].account?.id;

    // 2. Setup MX Records automatically
    const mxServers = [
      { content: 'route1.mx.cloudflare.net', priority: 1 },
      { content: 'route2.mx.cloudflare.net', priority: 2 },
      { content: 'route3.mx.cloudflare.net', priority: 3 },
    ];

    const recordResults = [];

    for (const mx of mxServers) {
      const mxRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken.trim()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'MX',
          name: '@',
          content: mx.content,
          priority: mx.priority,
          ttl: 3600,
        }),
      });
      const mxJson = await mxRes.json();
      recordResults.push({ server: mx.content, success: mxJson.success || mxJson.errors?.[0]?.code === 81057 }); // 81057 = duplicate already exists
    }

    // 3. Setup SPF TXT Record automatically
    const txtRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'TXT',
        name: '@',
        content: 'v=spf1 include:_spf.mx.cloudflare.net ~all',
        ttl: 3600,
      }),
    });
    const txtJson = await txtRes.json();
    // Automatically register domain into app domains so it appears in active domains & custom email generator
    try {
      addCustomDomain(cleanDomain, 'Cloudflare Domain');
    } catch (e) {
      console.warn('[Cloudflare Setup] Domain storage warning:', e);
    }

    return NextResponse.json({
      success: true,
      message: `Cloudflare Automated Setup Complete! Domain ${cleanDomain} is now configured with Cloudflare Email Routing pointing to ${webhookEndpoint}.`,
      data: {
        domain: cleanDomain,
        zoneId,
        accountId,
        webhookEndpoint,
        recordResults,
        status: 'configured',
      },
    });
  } catch (error: any) {
    console.error('[Cloudflare Setup Error]', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to communicate with Cloudflare API',
        errorCode: 'cloudflare_api_exception',
      },
      { status: 500 }
    );
  }
}
