import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const OWNER_SESSION_COOKIE = "td_owner_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function sessionSecret() {
  const secret = process.env.OWNER_SESSION_SECRET;
  if (!secret) throw new Error("OWNER_SESSION_SECRET belum dikonfigurasi.");
  return secret;
}

function signature(issuedAt: string) {
  return createHmac("sha256", sessionSecret())
    .update(`teman-digital-owner:${issuedAt}`)
    .digest("base64url");
}

export function verifyOwnerSessionValue(value?: string | null) {
  if (!value) return false;

  const [issuedAt, provided] = value.split(".");
  if (!issuedAt || !provided) return false;

  const issued = Number(issuedAt);
  if (!Number.isFinite(issued)) return false;

  const now = Math.floor(Date.now() / 1000);
  if (issued > now + 300 || now - issued > MAX_AGE_SECONDS) return false;

  const expected = signature(issuedAt);
  const left = Buffer.from(provided);
  const right = Buffer.from(expected);

  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export async function hasValidOwnerSession() {
  const store = await cookies();
  return verifyOwnerSessionValue(store.get(OWNER_SESSION_COOKIE)?.value);
}

export async function issueOwnerSession() {
  const issuedAt = String(Math.floor(Date.now() / 1000));
  const token = `${issuedAt}.${signature(issuedAt)}`;
  const store = await cookies();

  store.set(OWNER_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function clearOwnerSession() {
  const store = await cookies();
  store.set(OWNER_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
