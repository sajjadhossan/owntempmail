/**
 * Owntemp - Production Cloudflare Email Routing Worker (Zero-Dependency)
 * 
 * Works 100% directly inside Cloudflare Dashboard Web Editor.
 * No npm packages or build steps required.
 */

export default {
  async email(message, env, ctx) {
    try {
      // 1. Read raw incoming email text
      const rawText = await new Response(message.raw).text();

      // 2. Extract standard email headers
      const subject = message.headers.get('subject') || '(No Subject)';
      const fromHeader = message.headers.get('from') || message.from;
      
      let senderName = message.from.split('@')[0];
      const matchName = fromHeader.match(/^"?([^"<]+)"?\s*<.*>$/);
      if (matchName && matchName[1]) {
        senderName = matchName[1].trim();
      }

      // 3. Extract text and HTML body from MIME stream
      let textBody = '';
      let htmlBody = '';

      if (rawText.includes('Content-Type:')) {
        // Multi-part MIME parsing
        const parts = rawText.split(/--[\w=-]+/);
        for (const part of parts) {
          if (part.includes('text/html')) {
            const bodySplit = part.split(/\r?\n\r?\n/);
            if (bodySplit.length > 1) {
              htmlBody = bodySplit.slice(1).join('\n\n').trim();
            }
          } else if (part.includes('text/plain')) {
            const bodySplit = part.split(/\r?\n\r?\n/);
            if (bodySplit.length > 1) {
              textBody = bodySplit.slice(1).join('\n\n').trim();
            }
          }
        }
      }

      // Fallback for simple single-part emails
      if (!textBody && !htmlBody) {
        const bodySplit = rawText.split(/\r?\n\r?\n/);
        textBody = bodySplit.slice(1).join('\n\n').trim();
      }

      // 4. Construct payload for Owntemp Webhook
      const payload = {
        to: message.to,
        from: message.from,
        senderName: senderName,
        subject: subject,
        text: textBody || rawText,
        html: htmlBody || (textBody ? `<p>${textBody.replace(/\n/g, '<br/>')}</p>` : `<pre>${rawText}</pre>`),
      };

      // 5. Forward to Owntemp Webhook
      const endpoint = env.API_ENDPOINT || 'https://owntempmail.vercel.app/api/inbound/webhook';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Cloudflare-Email-Worker/1.5',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Webhook forward failed with status: ${response.status}`);
      } else {
        console.log(`Successfully forwarded email for ${message.to} to ${endpoint}`);
      }
    } catch (err) {
      console.error('Error in Email Worker:', err);
    }
  },
};
