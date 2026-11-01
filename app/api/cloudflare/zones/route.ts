import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { apiToken } = await req.json();

    if (!apiToken || apiToken.trim().length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: 'সঠিক ক্লাউডফ্লেয়ার API টোকেন প্রদান করুন (Valid Cloudflare API Token required).',
          errorCode: 'validation_error',
        },
        { status: 400 }
      );
    }

    const res = await fetch('https://api.cloudflare.com/client/v4/zones?per_page=50', {
      headers: {
        Authorization: `Bearer ${apiToken.trim()}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      const errorMsg = data.errors?.[0]?.message || 'Cloudflare API token verification failed.';
      return NextResponse.json(
        {
          success: false,
          message: `ক্লাউডফ্লেয়ার ত্রুটি: ${errorMsg}। নিশ্চিত করুন যে টোকেনে 'Zone:Read' এবং 'Zone:DNS' পারমিশন রয়েছে।`,
          errorCode: 'cloudflare_token_invalid',
        },
        { status: 400 }
      );
    }

    const zones = (data.result || []).map((z: any) => ({
      id: z.id,
      name: z.name,
      status: z.status,
      nameServers: z.name_servers || [],
    }));

    return NextResponse.json({
      success: true,
      message: `আপনার ক্লাউডফ্লেয়ার অ্যাকাউন্টে ${zones.length}টি ডোমেইন পাওয়া গেছে।`,
      data: {
        total: zones.length,
        zones,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to fetch zones from Cloudflare',
        errorCode: 'cloudflare_api_exception',
      },
      { status: 500 }
    );
  }
}
