export const AUTH_SESSION_SYNC_KEY = "authSessionSync";

export const notifyAuthSessionChanged = () => {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_SESSION_SYNC_KEY, String(Date.now()));
};
