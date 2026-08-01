import type { ClientMessage, StreamEnvelope } from "@netvizlab/shared";

type Listener = (envelope: StreamEnvelope<unknown>) => void;

const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://localhost:4000/ws";

class CommandSocketClient {
  private socket: WebSocket | null = null;
  private readonly listeners = new Map<string, Set<Listener>>();
  private readonly queue: ClientMessage[] = [];

  private ensureConnected(): WebSocket {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) {
      return this.socket;
    }

    const socket = new WebSocket(WS_URL);
    this.socket = socket;

    socket.addEventListener("open", () => {
      for (const message of this.queue.splice(0)) {
        socket.send(JSON.stringify(message));
      }
    });

    socket.addEventListener("message", (event) => {
      const envelope = JSON.parse(
        event.data as string,
      ) as StreamEnvelope<unknown>;
      const subscribers = this.listeners.get(envelope.sessionId);
      subscribers?.forEach((listener) => listener(envelope));
    });

    return socket;
  }

  subscribe(sessionId: string, listener: Listener): () => void {
    const existing = this.listeners.get(sessionId) ?? new Set<Listener>();
    existing.add(listener);
    this.listeners.set(sessionId, existing);

    return () => {
      existing.delete(listener);
      if (existing.size === 0) this.listeners.delete(sessionId);
    };
  }

  send(message: ClientMessage): void {
    const socket = this.ensureConnected();
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      this.queue.push(message);
    }
  }
}

export const commandSocket = new CommandSocketClient();
