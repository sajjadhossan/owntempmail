import { NextResponse } from 'next/server';
import { neonSql, hasNeonDatabase, neonAuthConfig, neonRealtimeConfig } from '@/lib/neon';
import { prisma } from '@/lib/prisma';
import { uploadToNeonStorage, listNeonStorageObjects } from '@/lib/neon-storage';

export const dynamic = 'force-dynamic';

export async function GET() {
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    services: {},
  };

  // 1. Test Neon Postgres (via @neondatabase/serverless)
  try {
    if (neonSql) {
      const sqlRes = await neonSql`SELECT NOW() as current_time, current_database() as database, version() as pg_version;`;
      results.services.neonPostgres = {
        status: 'healthy',
        database: sqlRes[0]?.database,
        currentTime: sqlRes[0]?.current_time,
        version: sqlRes[0]?.pg_version?.slice(0, 40) + '...',
      };
    } else {
      results.services.neonPostgres = {
        status: 'disabled',
        reason: 'DATABASE_URL not set or not targeting Neon',
      };
    }
  } catch (err: any) {
    results.services.neonPostgres = {
      status: 'error',
      message: err?.message || String(err),
    };
    results.status = 'degraded';
  }

  // 2. Test Prisma ORM with Neon Postgres
  try {
    const sessionCount = await prisma.deviceSession.count();
    const inboxCount = await prisma.inbox.count();
    results.services.prismaOrm = {
      status: 'healthy',
      deviceSessionsCount: sessionCount,
      inboxCount,
    };
  } catch (err: any) {
    results.services.prismaOrm = {
      status: 'error',
      message: err?.message || String(err),
    };
    results.status = 'degraded';
  }

  // 3. Test Neon Auth
  try {
    results.services.neonAuth = {
      status: neonAuthConfig.isConfigured ? 'healthy' : 'missing_config',
      baseUrl: neonAuthConfig.baseUrl,
      jwksUrl: neonAuthConfig.jwksUrl,
      provider: 'better_auth',
    };
  } catch (err: any) {
    results.services.neonAuth = {
      status: 'error',
      message: err?.message || String(err),
    };
  }

  // 4. Test Neon Object Storage (S3)
  try {
    // Perform a small health check write and list to bucket 'assets'
    const testKey = `health-check/probe-${Date.now()}.txt`;
    const uploadRes = await uploadToNeonStorage(testKey, `Neon probe timestamp ${new Date().toISOString()}`, 'text/plain');
    const objects = await listNeonStorageObjects('health-check/');

    results.services.neonObjectStorage = {
      status: uploadRes.success ? 'healthy' : 'error',
      bucket: 'assets',
      testUploadUrl: uploadRes.url,
      recentObjectsFound: objects.length,
      error: uploadRes.error || null,
    };
  } catch (err: any) {
    results.services.neonObjectStorage = {
      status: 'error',
      message: err?.message || String(err),
    };
  }

  // 5. Test Neon Realtime
  try {
    results.services.neonRealtime = {
      status: neonRealtimeConfig.isConfigured ? 'healthy' : 'missing_config',
      endpoint: neonRealtimeConfig.url,
    };
  } catch (err: any) {
    results.services.neonRealtime = {
      status: 'error',
      message: err?.message || String(err),
    };
  }

  return NextResponse.json({
    success: results.status !== 'error',
    data: results,
  });
}
