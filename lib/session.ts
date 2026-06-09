import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { SESSION_COOKIE } from "@/lib/constants";
import { getOrCreateSession } from "@/lib/db/queries";

export async function getSessionId(): Promise<string> {
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE)?.value;
  if (existing) {
    await getOrCreateSession(existing);
    return existing;
  }

  const sessionId = randomUUID();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  await getOrCreateSession(sessionId);
  return sessionId;
}

export async function getSessionIdFromRequest(
  request: Request,
): Promise<string | null> {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(
    new RegExp(`${SESSION_COOKIE}=([^;]+)`),
  );
  return match?.[1] ?? null;
}
