"use server";

import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { createOwnerClient } from "@/lib/supabase/owner";
import { createClient } from "@/lib/supabase/server";
import { issueOwnerSession } from "@/lib/auth/owner-session";

type JsonObject = Record<string, unknown>;

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject
    : {};
}

function sameSecret(input: string, expected: string) {
  const left = Buffer.from(input);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function formatRetry(seconds: number) {
  return `${Math.max(1, Math.ceil(seconds / 60))} menit`;
}

export async function ownerPinLogin(formData: FormData) {
  const pin = String(formData.get("pin") ?? "").trim();

  if (!/^\d{6}$/.test(pin)) {
    redirect("/login?error=PIN%20harus%206%20digit");
  }

  const expectedPin = process.env.OWNER_PIN;
  if (!expectedPin) {
    redirect("/login?error=PIN%20owner%20belum%20dikonfigurasi");
  }

  let ownerDb;
  try {
    ownerDb = createOwnerClient();
  } catch {
    redirect("/login?error=Konfigurasi%20owner%20belum%20lengkap");
  }

  const valid = sameSecret(pin, expectedPin);

  const { data: attemptData, error: attemptError } = await ownerDb.rpc(
    "record_owner_pin_attempt",
    { p_success: valid },
  );

  if (attemptError) {
    console.error("Owner PIN attempt error:", attemptError.message);
    redirect("/login?error=Sistem%20PIN%20sedang%20tidak%20tersedia");
  }

  const attempt = asObject(attemptData);

  if (attempt.locked === true) {
    const retry = Number(attempt.retry_after_seconds ?? 900);
    const message = valid
      ? `Akses masih dikunci. Coba lagi dalam ${formatRetry(retry)}.`
      : "PIN salah. Akses dikunci 15 menit.";
    redirect(`/login?error=${encodeURIComponent(message)}`);
  }

  if (!valid) {
    const remaining = Number(attempt.attempts_remaining ?? 0);
    redirect(`/login?error=${encodeURIComponent(`PIN salah. Sisa percobaan: ${remaining}.`)}`);
  }

  await issueOwnerSession();
  redirect("/kantor");
}

export async function staffLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email%20dan%20kata%20sandi%20staf%20wajib%20diisi");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/login?error=Email%20atau%20kata%20sandi%20staf%20tidak%20valid");
  }

  redirect("/kantor");
}
