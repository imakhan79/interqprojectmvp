import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Copy, Loader2, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/SimpleAuthContext";
import { useToast } from "@/hooks/use-toast";
import { JITSI_DOMAIN, isValidRoomId, liveInterviewUrl, loadJitsiScript } from "@/lib/jitsi";

const homeForRole: Record<string, string> = {
  admin: "/admin/interviews",
  company: "/company/interviews",
  recruiter: "/recruiter/interviews",
  jobseeker: "/jobseeker/interviews",
};

export default function LiveInterviewRoom() {
  const { roomId = "" } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  const exitPath = (user && homeForRole[user.role]) || "/";
  const validRoom = isValidRoomId(roomId);

  useEffect(() => {
    if (!validRoom || !containerRef.current) return;
    let api: any;
    let cancelled = false;

    loadJitsiScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const JitsiMeetExternalAPI = (window as any).JitsiMeetExternalAPI;
        api = new JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: roomId,
          parentNode: containerRef.current,
          width: "100%",
          height: "100%",
          userInfo: { displayName: user?.name, email: user?.email },
          configOverwrite: {
            prejoinPageEnabled: true,
            disableDeepLinking: true,
          },
          interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false },
        });
        api.addListener("readyToClose", () => navigate(exitPath));
        setStatus("ready");
      })
      .catch(() => !cancelled && setStatus("error"));

    return () => {
      cancelled = true;
      api?.dispose();
    };
  }, [roomId, validRoom, user?.name, user?.email, exitPath, navigate]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(liveInterviewUrl(roomId));
      toast({ title: "Link copied", description: "Share it with the other participant." });
    } catch {
      toast({ title: "Copy failed", description: liveInterviewUrl(roomId), variant: "destructive" });
    }
  };

  return (
    <div className="flex h-dvh flex-col bg-background">
      <header className="flex items-center justify-between gap-2 border-b px-4 py-2">
        <Button variant="ghost" size="sm" onClick={() => navigate(exitPath)}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Leave
        </Button>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Video className="h-4 w-4 text-primary" /> Live Interview
        </div>
        <Button variant="outline" size="sm" onClick={copyLink} disabled={!validRoom}>
          <Copy className="mr-2 h-4 w-4" /> Copy link
        </Button>
      </header>

      <main className="relative flex-1">
        {!validRoom ? (
          <p className="p-8 text-center text-muted-foreground">This interview link is invalid.</p>
        ) : (
          <>
            {status === "loading" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            )}
            {status === "error" && (
              <p className="p-8 text-center text-muted-foreground">
                Could not connect to the video service. Check your connection and try again.
              </p>
            )}
            <div ref={containerRef} className="h-full w-full" />
          </>
        )}
      </main>
    </div>
  );
}
