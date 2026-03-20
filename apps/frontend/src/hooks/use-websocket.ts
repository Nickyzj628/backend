import { useCallback, useEffect, useRef, useState } from "preact/hooks";

export type WebSocketStatus = "connecting" | "open" | "closing" | "closed";

export type MessageHandler = (payload: unknown) => void;

export type UseWebSocketReturn = {
  ws: WebSocket | null;
  status: WebSocketStatus;
  send: (event: string, payload?: unknown) => void;
  on: (event: string, handler: MessageHandler) => void;
  off: (event: string, handler: MessageHandler) => void;
};

export function useWebSocket(url: string): UseWebSocketReturn {
  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const wsRef = useRef<WebSocket | null>(null);
  const handlersRef = useRef<Map<string, Set<MessageHandler>>>(new Map());
  const reconnectTimeoutRef = useRef<number | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus("open");
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event) {
          const handlers = handlersRef.current.get(data.event);
          handlers?.forEach((handler) => void handler(data.payload));
        }
      } catch {
        // Ignore non-JSON messages
      }
    };

    ws.onclose = () => {
      setStatus("closed");
      wsRef.current = null;
      // Auto reconnect after 3s
      reconnectTimeoutRef.current = window.setTimeout(() => {
        connect();
      }, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((event: string, payload?: unknown) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ event, payload }));
    }
  }, []);

  const on = useCallback((event: string, handler: MessageHandler) => {
    const handlers = handlersRef.current.get(event);
    if (handlers) {
      handlers.add(handler);
    } else {
      handlersRef.current.set(event, new Set([handler]));
    }
  }, []);

  const off = useCallback((event: string, handler: MessageHandler) => {
    handlersRef.current.get(event)?.delete(handler);
  }, []);

  return {
    ws: wsRef.current,
    status,
    send,
    on,
    off,
  };
}
