import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

const normalizeToken = (token?: string | null) =>
  token?.trim().replace(/^["']|["']$/g, "") || "";

const getAuthToken = (): string | null => {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.split("=");
    if (name === "authToken") {
      return normalizeToken(decodeURIComponent(rest.join("=")));
    }
  }
  return null;
};

const getSocketUrl = () =>
  process.env.NEXT_PUBLIC_SOCKET_BASE_URL ||
  process.env.NEXT_PUBLIC_ADMIN_API_URL?.replace(/\/api\/v1(\/admin)?\/?$/, "") ||
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/api\/v1\/?$/, "") ||
  "";

/**
 * Shared authenticated socket. Used for admin notifications (Header)
 * and assign-order presence (Assign Order page).
 */
export const ensureSocketConnected = (): Socket | null => {
  if (typeof window === "undefined") return null;

  const token = getAuthToken();
  if (!token) return null;

  const url = getSocketUrl();
  if (!url) {
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    socket.auth = { token };
    socket.connect();
    return socket;
  }

  socket = io(url, {
    transports: ["websocket", "polling"],
    withCredentials: true,
    autoConnect: true,
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 8,
    reconnectionDelay: 1000,
  });

  return socket;
};

export const connectAssignPresenceSocket = (): Socket | null => {
  const s = ensureSocketConnected();
  if (!s) return null;
  const markPresence = () => s.emit("assign:presence-on");
  if (s.connected) {
    markPresence();
  } else {
    s.once("connect", markPresence);
  }
  return s;
};

export const disconnectAssignPresenceSocket = () => {
  if (!socket) return;
  if (socket.connected) {
    socket.emit("assign:presence-off");
  }
};

/** Lock order while agent has assign view open — prevents transfer of that order. */
export const markAssignOrderViewing = (orderId: string): Socket | null => {
  const s = ensureSocketConnected();
  if (!s || !orderId) return null;
  const emit = () => s.emit("assign:viewing-on", { order_id: String(orderId) });
  if (s.connected) emit();
  else s.once("connect", emit);
  return s;
};

export const clearAssignOrderViewing = () => {
  if (!socket) return;
  if (socket.connected) {
    socket.emit("assign:viewing-off");
  }
};

export const getAssignPresenceSocket = () => socket;

export const getSocket = () => socket;
