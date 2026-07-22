import {
  connectAssignPresenceSocket,
  disconnectAssignPresenceSocket,
  ensureSocketConnected,
} from "@admin/@config/socket.config";

const HEARTBEAT_INTERVAL_MS = 20_000;

let sessionActive = false;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
let connectListenerAttached = false;

const reassertPresenceOnConnect = () => {
  if (!sessionActive) return;
  connectAssignPresenceSocket();
};

const clearHeartbeat = () => {
  if (heartbeatTimer == null) return;
  clearInterval(heartbeatTimer);
  heartbeatTimer = null;
};

const startHeartbeat = () => {
  if (typeof window === "undefined" || heartbeatTimer != null) return;

  const beat = async () => {
    if (!sessionActive) return;
    try {
      const { OrderAssignmentService } = await import(
        "@admin/@services/apis/OrdersService/OrderAssignment.service"
      );
      await OrderAssignmentService.heartbeat();
    } catch {
      // Socket + cron remain the offline safety net
    }
  };

  void beat();
  heartbeatTimer = window.setInterval(beat, HEARTBEAT_INTERVAL_MS);
};

/**
 * Keep assign presence + heartbeat for the whole app session while the agent
 * is online. Do NOT stop on route changes (e.g. order view). Stop only on
 * manual offline or logout / app close (socket disconnect).
 */
export const startAssignPresenceSession = () => {
  if (typeof window === "undefined") return;
  sessionActive = true;

  const socket = ensureSocketConnected();
  if (socket && !connectListenerAttached) {
    socket.on("connect", reassertPresenceOnConnect);
    connectListenerAttached = true;
  }

  connectAssignPresenceSocket();
  startHeartbeat();
};

export const stopAssignPresenceSession = () => {
  sessionActive = false;
  clearHeartbeat();
  disconnectAssignPresenceSocket();
};

export const isAssignPresenceSessionActive = () => sessionActive;
