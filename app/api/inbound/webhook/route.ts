import { NextRequest, NextResponse } from 'next/server';
import { saveInboundEmail } from '@/lib/storage';
import { extractOtpCode, extractVerificationLinks } from '@/lib/otp-extractor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Support both Cloudflare Worker format and standard webhook format
    const toAddress = body.to || body.recipient || body.address;
    const fromAddress = body.from || body.sender || 'system@external.com';
    const senderName = body.senderName || body.fromName || fromAddress.split('@')[0];
    const subject = body.subject || '(No Subject)';
    const textBody = body.text || body.textBody || body.message || '';
    const htmlBody = body.html || body.htmlBody || `<p>${textBody.replace(/\n/g, '<br/>')}</p>`;

    if (!toAddress) {
      return NextResponse.json(
        {
          success: false,
          message: 'Recipient email address is required',
          errorCode: 'validation_error',
          errors: [{ field: 'to', message: 'Missing recipient address' }],
        },
        { status: 400 }
      );
    }

    const otpCode = extractOtpCode(textBody, subject);
    const verificationLinks = extractVerificationLinks(htmlBody || textBody);

    // Parse attachments if present
    const rawAttachments = Array.isArray(body.attachments) ? body.attachments : [];
    const attachments = rawAttachments.map((att: any, idx: number) => ({
      id: att.id || `att_${Date.now()}_${idx}`,
      filename: att.filename || att.name || `attachment_${idx + 1}.dat`,
      contentType: att.contentType || att.type || 'application/octet-stream',
      sizeBytes: att.size || att.sizeBytes || 0,
      downloadUrl: att.downloadUrl || att.url,
      dataBase64: att.dataBase64 || att.data,
    }));

    const saved = saveInboundEmail({
      address: toAddress,
      sender: fromAddress,
      senderName,
      subject,
      textBody,
      htmlBody,
      otpCode,
      verificationLinks,
      attachments,
      sizeBytes: Buffer.byteLength(textBody + (htmlBody || '')),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Inbound email received and processed successfully',
        data: saved,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[Inbound Webhook Error]', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to process inbound email',
        errorCode: 'inbound_processing_failed',
        errors: [{ field: 'server', message: error?.message || 'Internal error' }],
      },
      { status: 500 }
    );
  }
}
