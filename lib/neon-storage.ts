import {
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3';
import { neonS3Client, NEON_ASSETS_BUCKET, hasNeonObjectStorage } from './neon';

export interface StorageUploadResult {
  success: boolean;
  key: string;
  url?: string;
  sizeBytes?: number;
  contentType?: string;
  error?: string;
}

/**
 * Upload an attachment or user asset to Neon Object Storage
 */
export async function uploadToNeonStorage(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType = 'application/octet-stream'
): Promise<StorageUploadResult> {
  if (!hasNeonObjectStorage || !neonS3Client) {
    return {
      success: false,
      key,
      error: 'Neon Object Storage is not configured.',
    };
  }

  try {
    const buffer = Buffer.isBuffer(body) ? body : Buffer.from(body);
    const command = new PutObjectCommand({
      Bucket: NEON_ASSETS_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await neonS3Client.send(command);

    const endpoint = process.env.AWS_ENDPOINT_URL_S3 || '';
    const publicUrl = `${endpoint}/${NEON_ASSETS_BUCKET}/${key}`;

    return {
      success: true,
      key,
      url: publicUrl,
      sizeBytes: buffer.length,
      contentType,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Neon Storage] Upload failed for ${key}:`, message);
    return {
      success: false,
      key,
      error: message,
    };
  }
}

/**
 * List objects in the Neon assets bucket
 */
export async function listNeonStorageObjects(prefix?: string) {
  if (!hasNeonObjectStorage || !neonS3Client) {
    return [];
  }

  try {
    const command = new ListObjectsV2Command({
      Bucket: NEON_ASSETS_BUCKET,
      Prefix: prefix,
      MaxKeys: 50,
    });

    const response = await neonS3Client.send(command);
    return (response.Contents || []).map((item) => ({
      key: item.Key || '',
      size: item.Size || 0,
      lastModified: item.LastModified?.toISOString() || null,
    }));
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Neon Storage] ListObjects failed:', message);
    return [];
  }
}
