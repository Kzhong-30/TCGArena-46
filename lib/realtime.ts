import { EventEmitter } from 'events';
import type { MessageWithDetails } from '@/types';

export interface MessageNewEventPayload {
  message: MessageWithDetails;
  timestamp: number;
}

export interface MessageReadEventPayload {
  messageIds: string[];
  readerId: string;
  conversationPartnerId: string;
  timestamp: number;
}

export interface BookingStatusEventPayload {
  bookingId: string;
  propertyId: string;
  tenantId: string;
  landlordId: string;
  status: string;
  previousStatus?: string;
}

export interface HeartbeatEventPayload {
  timestamp: number;
}

export type RealtimeEventName = 'NEW_MESSAGE' | 'MESSAGE_READ' | 'BOOKING_STATUS' | 'HEARTBEAT';

export interface RealtimeEventMap {
  'NEW_MESSAGE': MessageNewEventPayload;
  'MESSAGE_READ': MessageReadEventPayload;
  'BOOKING_STATUS': BookingStatusEventPayload;
  'HEARTBEAT': HeartbeatEventPayload;
}

export interface SSEConnection {
  userId: string;
  controller: AbortController;
  writer: WritableStreamDefaultWriter<Uint8Array>;
}

type EventListener<E extends RealtimeEventName> = (
  payload: RealtimeEventMap[E]
) => void;

class RealtimeBus {
  private emitter: EventEmitter;
  private sseConnections: Map<string, Set<SSEConnection>>;
  private encoder: TextEncoder;

  constructor() {
    this.emitter = new EventEmitter();
    this.emitter.setMaxListeners(1000);
    this.sseConnections = new Map();
    this.encoder = new TextEncoder();
  }

  on<E extends RealtimeEventName>(
    event: E,
    listener: EventListener<E>
  ): () => void {
    this.emitter.on(event, listener);
    return () => {
      this.emitter.off(event, listener);
    };
  }

  off<E extends RealtimeEventName>(
    event: E,
    listener: EventListener<E>
  ): void {
    this.emitter.off(event, listener);
  }

  emit<E extends RealtimeEventName>(
    event: E,
    payload: RealtimeEventMap[E]
  ): boolean {
    return this.emitter.emit(event, payload);
  }

  broadcast<E extends RealtimeEventName>(
    event: E,
    payload: RealtimeEventMap[E]
  ): void {
    this.emitter.emit(event, payload);
  }

  registerSSEConnection(
    userId: string,
    writer: WritableStreamDefaultWriter<Uint8Array>,
    controller: AbortController
  ): void {
    const connection: SSEConnection = { userId, controller, writer };
    if (!this.sseConnections.has(userId)) {
      this.sseConnections.set(userId, new Set());
    }
    this.sseConnections.get(userId)!.add(connection);
  }

  cleanupSSEConnection(
    userId: string,
    controller: AbortController
  ): void {
    const userConnections = this.sseConnections.get(userId);
    if (!userConnections) return;

    let targetConn: SSEConnection | undefined;
    for (const conn of userConnections) {
      if (conn.controller === controller) {
        targetConn = conn;
        break;
      }
    }

    if (targetConn) {
      userConnections.delete(targetConn);
      try {
      } catch (_err) {
      }
    }

    if (userConnections.size === 0) {
      this.sseConnections.delete(userId);
    }
  }

  private formatSSEData(event: string, payload: unknown): Uint8Array {
    const jsonStr = JSON.stringify(payload);
    const sseStr = "event: " + event + "\ndata: " + jsonStr + "\n\n";
    return this.encoder.encode(sseStr);
  }

  async broadcastToUser<E extends RealtimeEventName>(
    userId: string,
    event: E,
    payload: RealtimeEventMap[E]
  ): Promise<void> {
    const userConnections = this.sseConnections.get(userId);
    if (!userConnections || userConnections.size === 0) {
      return;
    }

    const data = this.formatSSEData(event, payload);
    const deadConnections: Array<{ userId: string; controller: AbortController }> = [];

    for (const conn of userConnections) {
      try {
        await conn.writer.ready;
        await conn.writer.write(data);
      } catch (_err) {
        deadConnections.push({ userId: conn.userId, controller: conn.controller });
      }
    }

    for (const dead of deadConnections) {
      this.cleanupSSEConnection(dead.userId, dead.controller);
    }
  }

  getUserConnectionCount(userId: string): number {
    return this.sseConnections.get(userId)?.size ?? 0;
  }

  isUserConnected(userId: string): boolean {
    return this.getUserConnectionCount(userId) > 0;
  }
}

export const eventBus = new RealtimeBus();
export const realtime = eventBus;
export default eventBus;
