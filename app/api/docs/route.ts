import { NextResponse } from 'next/server';
import { APP_VERSION } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'Owntemp Developer API',
      version: APP_VERSION,
      description:
        'Commercial-grade disposable temporary email engine API with dual Cloudflare automation, permanent inbox lock, and realtime OTP extraction.',
      contact: {
        name: 'Owntemp Support',
        url: 'https://owntemp.live',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Current Environment API Server',
      },
    ],
    paths: {
      '/api/v1/inbox': {
        get: {
          summary: 'Get API Overview & Available Domains',
          description: 'Returns available domains and API capabilities.',
          responses: {
            '200': { description: 'Successful response' },
          },
        },
        post: {
          summary: 'Create or Provision Temporary Inbox',
          description: 'Generates a new disposable email address or initializes an existing address.',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    prefix: { type: 'string', example: 'tester_01' },
                    domain: { type: 'string', example: 'owntemp.live' },
                  },
                },
              },
            },
          },
          responses: {
            '201': { description: 'Inbox created successfully' },
          },
        },
      },
      '/api/v1/inbox/{address}/messages': {
        get: {
          summary: 'List Inbox Messages',
          description: 'Retrieves all received messages for the specified temporary email address.',
          parameters: [
            {
              name: 'address',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'The full email address (e.g. user@owntemp.live)',
            },
          ],
          responses: {
            '200': { description: 'Messages list retrieved' },
          },
        },
      },
      '/api/v1/inbox/{address}/otp': {
        get: {
          summary: 'Fetch Latest OTP (CI/CD Automated Testing)',
          description:
            'Polls or instantly fetches the latest one-time verification passcode detected in the inbox.',
          parameters: [
            {
              name: 'address',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'The target email address',
            },
            {
              name: 'timeout',
              in: 'query',
              required: false,
              schema: { type: 'integer', default: 0, maximum: 15 },
              description: 'Seconds to poll (0-15s) until OTP arrives',
            },
            {
              name: 'since',
              in: 'query',
              required: false,
              schema: { type: 'string' },
              description: 'ISO 8601 timestamp to filter messages received after this time',
            },
          ],
          responses: {
            '200': { description: 'OTP found and returned' },
            '404': { description: 'No OTP detected for this inbox' },
          },
        },
      },
      '/api/inbound/webhook': {
        post: {
          summary: 'Inbound Webhook Receiver',
          description:
            'Accepts incoming raw email payloads from Cloudflare Email Workers, SendGrid, or custom relays.',
          responses: {
            '200': { description: 'Inbound email parsed and saved' },
          },
        },
      },
      '/api/inbox/send': {
        post: {
          summary: 'Send Disposable Outbound Reply',
          description: 'Sends an email reply from the temporary address.',
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['from', 'to', 'subject', 'textBody'],
                  properties: {
                    from: { type: 'string' },
                    to: { type: 'string' },
                    subject: { type: 'string' },
                    textBody: { type: 'string' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Email sent successfully' },
          },
        },
      },
      '/api/cloudflare/test': {
        post: {
          summary: 'Run Live Webhook Pipeline Diagnostic',
          description: 'Runs synthetic diagnostic probe evaluating parser, OTP regex, and storage latency.',
          responses: {
            '200': { description: 'Diagnostic passed' },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec);
}

