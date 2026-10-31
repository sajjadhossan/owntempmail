/**
 * Utility functions for extracting OTP verification codes and verification URLs
 * from inbound email text and HTML.
 */

export function extractOtpCode(text: string, subject: string = ''): string | null {
  const combined = `${subject}\n${text}`;

  // Patterns with explicit keywords (high confidence)
  const labeledPatterns = [
    /(?:verification|security|confirm(?:ation)?|otp|passcode|one[- ]time[- ]code|pin|code|access code)[\s:=is]+([0-9]{4,8})\b/i,
    /(?:code|pin)[\s:]*([0-9]{4,8})\b/i,
    /\b([0-9]{4,8})\b\s*(?:is your|is the|to verify|as your code)/i,
    /\b(?:enter|use)\s+([0-9]{4,8})\b/i,
  ];

  for (const pattern of labeledPatterns) {
    const match = combined.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Standalone 6-digit code pattern (common standard)
  const standalone6Digit = /\b([0-9]{6})\b/;
  const match6 = combined.match(standalone6Digit);
  if (match6 && match6[1]) {
    // Avoid false positives like year (e.g. 202610)
    return match6[1];
  }

  // Standalone 4-digit code in short sentences
  const standalone4Digit = /(?:code|pin)[^\d]{1,10}([0-9]{4})\b/i;
  const match4 = combined.match(standalone4Digit);
  if (match4 && match4[1]) {
    return match4[1];
  }

  return null;
}

export function extractVerificationLinks(htmlOrText: string): string[] {
  const links: string[] = [];
  const urlRegex = /https?:\/\/[^\s"'<>]+/gi;
  const matches = htmlOrText.match(urlRegex) || [];

  const verificationKeywords = [
    'verify',
    'confirm',
    'activate',
    'token',
    'auth',
    'validation',
    'register',
  ];

  for (const url of matches) {
    const cleanUrl = url.replace(/[.,;)]+$/, '');
    const lower = cleanUrl.toLowerCase();
    if (verificationKeywords.some((kw) => lower.includes(kw))) {
      if (!links.includes(cleanUrl)) {
        links.push(cleanUrl);
      }
    }
  }

  // If no keyword match, take first 3 standard URLs
  if (links.length === 0 && matches.length > 0) {
    for (const url of matches.slice(0, 3)) {
      const cleanUrl = url.replace(/[.,;)]+$/, '');
      if (!links.includes(cleanUrl) && !cleanUrl.includes('w3.org') && !cleanUrl.includes('schema.org')) {
        links.push(cleanUrl);
      }
    }
  }

  return links;
}
