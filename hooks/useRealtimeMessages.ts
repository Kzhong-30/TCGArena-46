"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type {
  MessageWithDetails,
  SSEConnectionStatus,
  SSEEventType,
  NewMessageEventData,
  MessageReadEventData,
} from "@/types";

interface UseRealtimeMessagesOptions {
  onMessage?: (message: MessageWithDetails) => void;
  onMessageRead?: (data: MessageReadEventData) => void;
  enabled?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatTimeout?: number;
}

interface UseRealtimeMessagesReturn extends SSEConnectionStatus {
  reconnect: () => void;
  disconnect: () => void;
}

const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;
const HEARTBEAT_TIMEOUT = 30000;

export function useRealtimeMessages(
  options: UseRealtimeMessagesOptions = {}
): UseRealtimeMessagesReturn {
  const {
    onMessage,
    onMessageRead,
    enabled = true,
    reconnectAttempts = MAX_RECONNECT_ATTEMPTS,
    reconnectDelay = BASE_RECONNECT_DELAY,
    heartbeatTimeout = HEARTBEAT_TIMEOUT,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [lastConnectedAt, setLastConnectedAt] = useState<number | undefined>();

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAttemptRef = useRef(0);
  const shouldReconnectRef = useRef(true);

  const clearHeartbeatTimeout = useCallback(() => {
    if (heartbeatTimeoutRef.current) {
      clearTimeout(heartbeatTimeoutRef.current);
      heartbeatTimeoutRef.current = null;
    }
  }, []);

  const resetHeartbeatTimeout = useCallback(() => {
    clearHeartbeatTimeout();
    heartbeatTimeoutRef.current = setTimeout(() => {
      if (eventSourceRef.current?.readyState === EventSource.OPEN) {
        console.warn("Heartbeat timeout, reconnecting...");
        eventSourceRef.current?.close();
        setIsConnected(false);
        scheduleReconnect();
      }
    }, heartbeatTimeout);
  }, [heartbeatTimeout, clearHeartbeatTimeout]);

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (!shouldReconnectRef.current) return;
    if (currentAttemptRef.current >= reconnectAttempts) {
      setError("连接失败次数过多，请稍后重试");
      setIsConnecting(false);
      return;
    }

    const delay = reconnectDelay * Math.pow(2, currentAttemptRef.current);
    currentAttemptRef.current += 1;

    clearReconnectTimeout();
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [reconnectAttempts, reconnectDelay, clearReconnectTimeout]);

  const connect = useCallback(() => {
    if (!enabled || !shouldReconnectRef.current) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnecting(true);
    setError(undefined);

    try {
      const eventSource = new EventSource("/api/messages/stream", {
        withCredentials: true,
      });

      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);
        setError(undefined);
        setLastConnectedAt(Date.now());
        currentAttemptRef.current = 0;
        resetHeartbeatTimeout();
      };

      eventSource.addEventListener("NEW_MESSAGE", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as NewMessageEventData & {
            timestamp: number;
          };
          resetHeartbeatTimeout();
          onMessage?.(data.message);
        } catch (e) {
          console.error("Error parsing NEW_MESSAGE event:", e);
        }
      });

      eventSource.addEventListener("MESSAGE_READ", (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data) as MessageReadEventData & {
            timestamp: number;
          };
          resetHeartbeatTimeout();
          onMessageRead?.(data);
        } catch (e) {
          console.error("Error parsing MESSAGE_READ event:", e);
        }
      });

      eventSource.addEventListener("HEARTBEAT", (event: MessageEvent) => {
        try {
          JSON.parse(event.data);
          resetHeartbeatTimeout();
        } catch (e) {
          console.error("Error parsing HEARTBEAT event:", e);
        }
      });

      eventSource.onerror = (e) => {
        console.error("SSE connection error:", e);
        setIsConnected(false);
        clearHeartbeatTimeout();

        if (eventSource.readyState === EventSource.CLOSED) {
          scheduleReconnect();
        } else {
          setError("连接出错，正在尝试重连...");
        }
      };
    } catch (e) {
      console.error("Error creating EventSource:", e);
      setError("无法创建连接");
      setIsConnecting(false);
      scheduleReconnect();
    }
  }, [enabled, onMessage, onMessageRead, resetHeartbeatTimeout, clearHeartbeatTimeout, scheduleReconnect]);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    clearReconnectTimeout();
    clearHeartbeatTimeout();

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
  }, [clearReconnectTimeout, clearHeartbeatTimeout]);

  const reconnect = useCallback(() => {
    currentAttemptRef.current = 0;
    shouldReconnectRef.current = true;
    setError(undefined);
    connect();
  }, [connect]);

  useEffect(() => {
    if (enabled) {
      shouldReconnectRef.current = true;
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    error,
    lastConnectedAt,
    reconnect,
    disconnect,
  };
}