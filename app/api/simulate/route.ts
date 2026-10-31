import { NextRequest, NextResponse } from 'next/server';
import { saveInboundEmail } from '@/lib/storage';
import { extractOtpCode, extractVerificationLinks } from '@/lib/otp-extractor';

export async function POST(req: NextRequest) {
  try {
    const { to, from, subject, message, otp } = await req.json();

    if (!to || !to.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Valid recipient email required' },
        { status: 400 }
      );
    }

    const senderEmail = from || 'accounts@verify-service.com';
    const emailSubject = subject || 'Your Verification Code / ভেরিফিকেশন কোড';
    const generatedOtp = otp || Math.floor(100000 + Math.random() * 900000).toString();
    const text = message || `Hello,\n\nYour security verification code is: ${generatedOtp}\n\nThis code will expire in 10 minutes. If you did not request this code, please ignore this email.\n\nVerify online: https://example.com/verify?token=tok_${Math.random().toString(36).substring(2, 10)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
        <h2 style="color: #4f46e5; margin-top: 0;">🔒 Security Verification</h2>
        <p style="color: #475569; font-size: 15px;">Please use the following single-use verification code to complete your sign-in / registration:</p>
        <div style="background: #f8fafc; border: 2px dashed #6366f1; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #1e1b4b;">${generatedOtp}</span>
        </div>
        <p style="color: #64748b; font-size: 13px;">If you prefer, you can also confirm by clicking the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
          <a href="https://example.com/verify?token=tok_${Math.random().toString(36).substring(2, 10)}" style="display: inline-block; background: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: bold;">Confirm Account Now</a>
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px;">This is an automated test message dispatched to <b>${to}</b>.</p>
      </div>
    `;

    const detectedOtp = extractOtpCode(text, emailSubject);
    const links = extractVerificationLinks(html);

    const saved = saveInboundEmail({
      address: to,
      sender: senderEmail,
      senderName: senderEmail.split('@')[0].toUpperCase(),
      subject: emailSubject,
      textBody: text,
      htmlBody: html,
      otpCode: detectedOtp || generatedOtp,
      verificationLinks: links,
      sizeBytes: Buffer.byteLength(text + html),
    });

    return NextResponse.json({
      success: true,
      message: 'Simulated email delivered successfully to inbox',
      data: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Simulation failed',
        errors: [{ field: 'server', message: error?.message }],
      },
      { status: 500 }
    );
  }
}
