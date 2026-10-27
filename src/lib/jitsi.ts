import { supabase } from "@/integrations/supabase/client";

// Jitsi Meet configuration for in-app live interviews.
// With VITE_JAAS_APP_ID set, calls run on 8x8 JaaS and each participant gets a signed
// token from /api/jitsi-token. Without it, the public meet.jit.si server is used, which
// limits embedded calls to 5 minutes and requires a moderator login (demo use only).
export const JAAS_APP_ID: string | undefined = import.meta.env.VITE_JAAS_APP_ID || undefined;
export const JITSI_DOMAIN: string = JAAS_APP_ID ? "8x8.vc" : import.meta.env.VITE_JITSI_DOMAIN || "meet.jit.si";

// Room names act as the access secret on public Jitsi servers, so they must be unguessable.
export const createInterviewRoomId = (): string =>
  `InterQ-${crypto.randomUUID().replace(/-/g, "")}`;

export const isValidRoomId = (roomId: string): boolean => /^InterQ-[a-f0-9]{32}$/.test(roomId);

export const liveInterviewPath = (roomId: string): string => `/interview/live/${roomId}`;

export const liveInterviewUrl = (roomId: string): string =>
  `${window.location.origin}${liveInterviewPath(roomId)}`;

// JaaS rooms are namespaced by the app ID.
export const jitsiRoomName = (roomId: string): string => (JAAS_APP_ID ? `${JAAS_APP_ID}/${roomId}` : roomId);

export async function fetchJitsiToken(roomId: string): Promise<string | undefined> {
  if (!JAAS_APP_ID) return undefined;
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Sign in required");
  const response = await fetch("/api/jitsi-token", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ roomId }),
  });
  if (!response.ok) throw new Error(`Token request failed (${response.status})`);
  const { token } = await response.json();
  return token;
}

let scriptPromise: Promise<void> | null = null;

export const loadJitsiScript = (): Promise<void> => {
  if ((window as any).JitsiMeetExternalAPI) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = JAAS_APP_ID
        ? `https://8x8.vc/${JAAS_APP_ID}/external_api.js`
        : `https://${JITSI_DOMAIN}/external_api.js`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => {
        scriptPromise = null;
        reject(new Error(`Failed to load Jitsi from ${JITSI_DOMAIN}`));
      };
      document.body.appendChild(script);
    });
  }
  return scriptPromise;
};
