/**
 * Cloudflare Email Routing Worker for Owntemp
 * 
 * Instructions:
 * 1. In Cloudflare Dashboard, go to your domain -> Email -> Email Routing.
 * 2. Create an Email Worker and paste this code.
 * 3. Set the Environment Variable: `API_ENDPOINT` = "https://your-owntemp-app.vercel.app/api/inbound/webhook"
 * 4. Add a Catch-all rule: Send all emails to this Worker.
 * 
 * That's it! 100% Free email receiving for any address at your domain.
 */

import PostalMime from 'postal-mime';

export default {
  async email(message, env, ctx) {
    try {
      const rawEmail = await new Response(message.raw).arrayBuffer();
      const parser = new PostalMime();
      const parsed = await parser.parse(rawEmail);

      const payload = {
        to: message.to,
        from: message.from,
        senderName: parsed.from?.name || message.from.split('@')[0],
        subject: parsed.subject || '(No Subject)',
        text: parsed.text || '',
        html: parsed.html || parsed.text || '',
        messageId: parsed.messageId,
        date: parsed.date || new Date().toISOString(),
      };

      const endpoint = env.API_ENDPOINT || 'https://your-owntemp.vercel.app/api/inbound/webhook';
      const secret = env.WEBHOOK_SECRET || '';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Owntemp-Secret': secret,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        console.error(`Failed to forward email to Owntemp: ${response.status} ${await response.text()}`);
      } else {
        console.log(`Successfully forwarded email for ${message.to} to Owntemp`);
      }
    } catch (err) {
      console.error('Error processing email in Cloudflare Worker:', err);
    }
  },
};
