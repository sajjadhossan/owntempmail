import { NextRequest } from 'next/server';
import { eventHub } from '@/lib/event-hub';
import { EmailRecord } from '@/lib/types';
import { syncPublicInbox } from '@/lib/public-mail-service';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  const normalized = decodeURIComponent(address).trim().toLowerCase();
  const channel = `inbox:${normalized}`;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection handshake
      const handshake = `data: ${JSON.stringify({ type: 'connected', address: normalized, time: Date.now() })}\n\n`;
      controller.enqueue(encoder.encode(handshake));

      // Trigger immediate sync on connection
      syncPublicInbox(normalized).catch(() => {});

      // Listener for incoming emails
      const onEmail = (email: EmailRecord) => {
        try {
          const payload = `data: ${JSON.stringify({ type: 'new_email', email })}\n\n`;
          controller.enqueue(encoder.encode(payload));
        } catch (err) {
          console.error('[SSE Enqueue Error]', err);
        }
      };

      // Keepalive heartbeat every 15s to prevent cloud proxies from dropping connection
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
          syncPublicInbox(normalized).catch(() => {});
        } catch (e) {
          clearInterval(heartbeat);
        }
      }, 15000);

      eventHub.on(channel, onEmail);

      // Clean up when client disconnects
      req.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        eventHub.off(channel, onEmail);
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform, no-store, must-revalidate',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
      'CDN-Cache-Control': 'no-store',
      'Cloudflare-CDN-Cache-Control': 'no-store',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

