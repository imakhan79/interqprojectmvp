// Issues a short-lived 8x8 JaaS JWT for one InterQ interview room.
// The caller must send their Supabase access token; company, recruiter and admin
// accounts join as moderators, job seekers as regular participants.
//
// Env: VITE_JAAS_APP_ID, JAAS_API_KEY_ID, JAAS_PRIVATE_KEY (PEM), VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
import { createSign } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const ROOM_ID_PATTERN = /^InterQ-[a-f0-9]{32}$/;
const MODERATOR_ROLES = new Set(["admin", "company", "recruiter"]);
const TOKEN_TTL_SECONDS = 2 * 60 * 60;

const base64url = (input: string | Buffer) => Buffer.from(input).toString("base64url");

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function signJwt(header: object, payload: object, privateKey: string): string {
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = createSign("RSA-SHA256").update(unsigned).sign(privateKey);
  return `${unsigned}.${base64url(signature)}`;
}

export async function POST(request: Request): Promise<Response> {
  const appId = process.env.VITE_JAAS_APP_ID;
  const keyId = process.env.JAAS_API_KEY_ID;
  // Env UIs often store the PEM with literal "\n" sequences.
  const privateKey = process.env.JAAS_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
  if (!appId || !keyId || !privateKey || !supabaseUrl || !supabaseAnonKey) {
    return json(500, { error: "Video service is not configured" });
  }

  const accessToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!accessToken) return json(401, { error: "Sign in required" });

  let roomId: unknown;
  try {
    ({ roomId } = await request.json());
  } catch {
    return json(400, { error: "Invalid request body" });
  }
  if (typeof roomId !== "string" || !ROOM_ID_PATTERN.test(roomId)) {
    return json(400, { error: "Invalid room" });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { persistSession: false },
  });
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) return json(401, { error: "Sign in required" });

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  const now = Math.floor(Date.now() / 1000);
  const token = signJwt(
    { alg: "RS256", typ: "JWT", kid: keyId },
    {
      aud: "jitsi",
      iss: "chat",
      sub: appId,
      room: roomId,
      nbf: now - 10,
      exp: now + TOKEN_TTL_SECONDS,
      context: {
        user: {
          id: user.id,
          name: profile?.full_name || user.email || "Participant",
          email: user.email ?? "",
          moderator: MODERATOR_ROLES.has(profile?.role ?? "") ? "true" : "false",
        },
        features: { livestreaming: "false", recording: "false", transcription: "false", "outbound-call": "false" },
      },
    },
    privateKey,
  );

  return json(200, { token });
}
