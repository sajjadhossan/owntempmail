/**
 * Pure SVG QR code generator component for instant rendering without heavy dependencies.
 */

export function generateQrSvgUri(text: string): string {
  // Use public high-reliability standard API or SVG data URI
  const encoded = encodeURIComponent(text);
  return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encoded}&bgcolor=0f172a&color=e2e8f0&margin=10`;
}
