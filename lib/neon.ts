import { neon } from '@neondatabase/serverless';
import { S3Client } from '@aws-sdk/client-s3';

/**
 * Neon Serverless Postgres Client
 * Uses HTTP pipeline for fast, connection-pool-friendly serverless queries.
 */
export const NEON_DEFAULT_DATABASE_URL =
  'postgresql://neondb_owner:npg_VAt8OEvx0pIk@ep-rapid-recipe-aoa945op-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const effectiveDbUrl = process.env.DATABASE_URL || NEON_DEFAULT_DATABASE_URL;

export const hasNeonDatabase = Boolean(
  effectiveDbUrl && effectiveDbUrl.includes('neon.tech')
);

export const neonSql = hasNeonDatabase && effectiveDbUrl
  ? neon(effectiveDbUrl)
  : null;

/**
 * Neon Object Storage S3 Client
 * Uses S3-compatible credentials injected by `neon deploy`.
 */
export const hasNeonObjectStorage = Boolean(
  process.env.AWS_ENDPOINT_URL_S3 &&
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY
);

export const neonS3Client = hasNeonObjectStorage
  ? new S3Client({
      region: process.env.AWS_REGION || 'ap-southeast-1',
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    })
  : null;

export const NEON_ASSETS_BUCKET = 'assets';

/**
 * Neon Auth Config
 */
export const neonAuthConfig = {
  baseUrl: process.env.NEON_AUTH_BASE_URL || null,
  jwksUrl: process.env.NEON_AUTH_JWKS_URL || null,
  isConfigured: Boolean(process.env.NEON_AUTH_BASE_URL && process.env.NEON_AUTH_JWKS_URL),
};

/**
 * Neon Realtime Config
 */
export const neonRealtimeConfig = {
  url: process.env.NEON_REALTIME_URL || null,
  secret: process.env.NEON_REALTIME_SECRET || null,
  isConfigured: Boolean(process.env.NEON_REALTIME_URL && process.env.NEON_REALTIME_SECRET),
};
