import { EventEmitter } from 'events';
import { EmailRecord } from './types';

// Global Event Hub for instant Server-Sent Events (SSE)
class InboundEventHub extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(200); // Allow many concurrent streaming clients
  }

  broadcastNewEmail(email: EmailRecord) {
    const channel = `inbox:${email.address.toLowerCase().trim()}`;
    this.emit(channel, email);
    this.emit('all_emails', email);
  }
}

// Global singleton across serverless invocations within same instance
const globalForEvents = global as unknown as { inboundEventHub?: InboundEventHub };
export const eventHub = globalForEvents.inboundEventHub || new InboundEventHub();
if (process.env.NODE_ENV !== 'production') globalForEvents.inboundEventHub = eventHub;

