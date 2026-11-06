import { NextRequest, NextResponse } from 'next/server';
import { recordDeviceHeartbeat, getDeviceSessions, revokeDeviceSession } from '@/lib/storage';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json(
      { success: false, message: 'userId is required' },
      { status: 400 }
    );
  }

  const currentDeviceId = searchParams.get('currentDeviceId') || '';
  const sessions = getDeviceSessions(userId);

  const markedSessions = sessions.map((s) => ({
    ...s,
    isCurrentDevice: Boolean(currentDeviceId && s.deviceId === currentDeviceId),
  }));

  return NextResponse.json({
    success: true,
    message: `Retrieved ${sessions.length} active device sessions`,
    data: {
      userId,
      activeDevicesCount: sessions.length,
      devices: markedSessions,
    },
    errors: [],
  });
}

export async function POST(req: NextRequest) {
  const clientIp = getClientIp(req);
  const rate = checkRateLimit(`device_hb_${clientIp}`, 120, 60);

  if (!rate.allowed) {
    return NextResponse.json(
      { success: false, message: 'Rate limit exceeded' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { deviceId, userId, deviceName, deviceType, browser, os } = body;

    if (!deviceId || !userId) {
      return NextResponse.json(
        { success: false, message: 'deviceId and userId are required' },
        { status: 400 }
      );
    }

    const updatedList = recordDeviceHeartbeat({
      deviceId,
      userId,
      deviceName: deviceName || 'Unknown Device',
      deviceType: deviceType || 'desktop',
      browser: browser || 'Browser',
      os: os || 'OS',
      lastActiveAt: new Date().toISOString(),
      ipAddress: clientIp,
    });

    return NextResponse.json({
      success: true,
      message: 'Device session recorded successfully',
      data: {
        activeDevicesCount: updatedList.length,
        devices: updatedList,
      },
      errors: [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to record device session' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const deviceId = searchParams.get('deviceId');

  if (!userId || !deviceId) {
    return NextResponse.json(
      { success: false, message: 'userId and deviceId are required' },
      { status: 400 }
    );
  }

  const success = revokeDeviceSession(userId, deviceId);
  return NextResponse.json({
    success,
    message: success ? 'Device session revoked' : 'Device session not found',
    data: { userId, deviceId },
    errors: [],
  });
}
