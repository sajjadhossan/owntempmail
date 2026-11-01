import { NextResponse } from 'next/server';
import {
  getBlueGreenConfig,
  switchDeploymentSlot,
  setCanaryTraffic,
  performDeploymentHealthCheck,
} from '@/lib/storage';
import { ApiResponse, BlueGreenConfig, DeploymentSlot } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = getBlueGreenConfig();
    return NextResponse.json<ApiResponse<BlueGreenConfig>>({
      success: true,
      message: 'Blue-Green deployment status retrieved.',
      data: config,
    });
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: err.message || 'Failed to fetch deployment configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, targetSlot, canaryPercent, reason, switchedBy } = body;

    if (action === 'switch') {
      if (targetSlot !== 'blue' && targetSlot !== 'green') {
        return NextResponse.json<ApiResponse>(
          { success: false, message: 'Invalid deployment slot. Must be "blue" or "green".' },
          { status: 400 }
        );
      }
      const res = switchDeploymentSlot(targetSlot as DeploymentSlot, reason, switchedBy);
      return NextResponse.json<ApiResponse<BlueGreenConfig>>({
        success: res.success,
        message: res.message,
        data: res.config,
      });
    }

    if (action === 'canary') {
      const res = setCanaryTraffic(typeof canaryPercent === 'number' ? canaryPercent : 10);
      return NextResponse.json<ApiResponse<BlueGreenConfig>>({
        success: res.success,
        message: res.message,
        data: res.config,
      });
    }

    if (action === 'healthCheck') {
      const updated = performDeploymentHealthCheck();
      return NextResponse.json<ApiResponse<BlueGreenConfig>>({
        success: true,
        message: 'Live health check probe completed on both Blue and Green slots.',
        data: updated,
      });
    }

    return NextResponse.json<ApiResponse>(
      { success: false, message: 'Invalid deployment action' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json<ApiResponse>(
      { success: false, message: err.message || 'Failed to process deployment command' },
      { status: 500 }
    );
  }
}
