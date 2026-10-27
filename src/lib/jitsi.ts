// Jitsi Meet configuration for in-app live interviews.
// meet.jit.si limits embedded calls to 5 minutes and requires a moderator login,
// so production should set VITE_JITSI_DOMAIN to a self-hosted Jitsi or JaaS (8x8.vc) domain.
export const JITSI_DOMAIN: string = import.meta.env.VITE_JITSI_DOMAIN || "meet.jit.si";

// Room names act as the access secret on public Jitsi servers, so they must be unguessable.
export const createInterviewRoomId = (): string =>
  `InterQ-${crypto.randomUUID().replace(/-/g, "")}`;

export const isValidRoomId = (roomId: string): boolean => /^InterQ-[a-f0-9]{32}$/.test(roomId);

export const liveInterviewPath = (roomId: string): string => `/interview/live/${roomId}`;

export const liveInterviewUrl = (roomId: string): string =>
  `${window.location.origin}${liveInterviewPath(roomId)}`;

let scriptPromise: Promise<void> | null = null;

export const loadJitsiScript = (): Promise<void> => {
  if ((window as any).JitsiMeetExternalAPI) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `https://${JITSI_DOMAIN}/external_api.js`;
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
