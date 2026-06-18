import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/session";
import { realtime } from "@/lib/realtime";
import type { MessageNewEventPayload, MessageReadEventPayload, BookingStatusEventPayload } from "@/lib/realtime";

export const dynamic = "force-dynamic";

const SSE_HEADERS = {
  "Content-Type": "text/event-stream",
  "Cache-Control": "no-cache",
  "Connection": "keep-alive",
  "X-Accel-Buffering": "no",
};

const HEARTBEAT_INTERVAL = 30000;
const encoder = new TextEncoder();

function formatSSE(event: string, data: unknown): Uint8Array {
  const json = JSON.stringify(data);
  const str = "event: " + event + "\ndata: " + json + "\n\n";
  return encoder.encode(str);
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const userId = user.id;

    const transform = new TransformStream();
    const writer = transform.writable.getWriter();
    const abortController = new AbortController();

    realtime.registerSSEConnection(userId, writer, abortController);

    await writer.ready;
    await writer.write(formatSSE("connected", { connected: true }));

    const heartbeatInterval = setInterval(async () => {
      try {
        await writer.ready;
        await writer.write(formatSSE("HEARTBEAT", { timestamp: Date.now() }));
      } catch (_err) {
        clearInterval(heartbeatInterval);
      }
    }, HEARTBEAT_INTERVAL);

    const unsubMessageNew = realtime.on("NEW_MESSAGE", async (payload: MessageNewEventPayload) => {
      if (payload.message.senderId !== userId && payload.message.receiverId !== userId) return;
      try {
        await writer.ready;
        await writer.write(formatSSE("NEW_MESSAGE", payload));
      } catch (_err) {
      }
    });

    const unsubMessageRead = realtime.on("MESSAGE_READ", async (payload: MessageReadEventPayload) => {
      if (payload.readerId !== userId && payload.conversationPartnerId !== userId) return;
      try {
        await writer.ready;
        await writer.write(formatSSE("MESSAGE_READ", payload));
      } catch (_err) {
      }
    });

    const unsubBookingStatus = realtime.on("BOOKING_STATUS", async (payload: BookingStatusEventPayload) => {
      if (payload.tenantId !== userId && payload.landlordId !== userId) return;
      try {
        await writer.ready;
        await writer.write(formatSSE("BOOKING_STATUS", payload));
      } catch (_err) {
      }
    });

    const cleanup = () => {
      clearInterval(heartbeatInterval);
      unsubMessageNew();
      unsubMessageRead();
      unsubBookingStatus();
      realtime.cleanupSSEConnection(userId, abortController);
    };

    request.signal.addEventListener("abort", () => {
      cleanup();
      try {
        abortController.abort();
      } catch (_err) {
      }
    });

    return new Response(transform.readable, {
      headers: SSE_HEADERS,
    });
  } catch (error) {
    console.error("SSE stream error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "连接失败" },
      { status: 500 }
    );
  }
}
