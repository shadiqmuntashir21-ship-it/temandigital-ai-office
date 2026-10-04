"use server";

import { timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  return `${minutes} menit`;
}

export async function ownerPinLogin(formData: FormData) {
  const pin = String(formData.get("pin") ?? "").trim();

  if (!/^\d{6}$/.test(pin)) {
    redirect("/login?error=PIN%20harus%206%20digit");
  }

  const expectedPin = process.env.OWNER_PIN;
  if (!expectedPin) {
    redirect("/login?error=PIN%20owner%20belum%20dikonfigurasi%20di%20server");
  }

  const admin = createAdminClient();

  const { data: statusData, error: statusError } = await admin.rpc("owner_pin_status");
  if (statusError) {
    console.error("Owner PIN status error:", statusError.message);
    redirect("/login?error=Sistem%20PIN%20sedang%20tidak%20tersedia");
  }

  const status = asObject(statusData);
  if (status.locked === true) {
    const retry = Number(status.retry_after_seconds ?? 900);
    redirect(`/login?error=${encodeURIComponent(`Terlalu banyak percobaan. Coba lagi dalam ${formatRetry(retry)}.`)}`);
  }

  const valid = sameSecret(pin, expectedPin);

  const { data: attemptData, error: attemptError } = await admin.rpc(
    "record_owner_pin_attempt",
    { p_success: valid },
  );

  if (attemptError) {
    console.error("Owner PIN attempt error:", attemptError.message);
    redirect("/login?error=Sistem%20PIN%20sedang%20tidak%20tersedia");
  }

  const attempt = asObject(attemptData);

  if (!valid) {
    if (attempt.locked === true) {
      redirect("/login?error=PIN%20salah.%20Akses%20dikunci%2015%20menit");
    }

    const remaining = Number(attempt.attempts_remaining ?? 0);
    redirect(`/login?error=${encodeURIComponent(`PIN salah. Sisa percobaan: ${remaining}.`)}`);
  }

  const ownerEmail =
    process.env.OWNER_AUTH_EMAIL || "owner.ai.office@temandigital.id";
  const ownerName =
    process.env.OWNER_NAME || "Owner Teman Digital";

  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: ownerEmail,
    options: {
      data: {
        full_name: ownerName,
        internal_owner: true,
      },
    },
  });

  if (linkError || !linkData.user || !linkData.properties?.hashed_token) {
    console.error("Owner session link error:", linkError?.message);
    redirect("/login?error=Gagal%20membuat%20sesi%20owner");
  }

  const { error: profileError } = await admin.from("profiles").upsert({
    id: linkData.user.id,
    full_name: ownerName,
    role: "owner",
    department: "Owner Room",
    is_active: true,
  }, { onConflict: "id" });

  if (profileError) {
    console.error("Owner profile error:", profileError.message);
    redirect("/login?error=Gagal%20mengaktifkan%20profil%20owner");
  }

  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: "magiclink",
  });

  if (verifyError) {
    console.error("Owner session verify error:", verifyError.message);
    redirect("/login?error=Gagal%20membuat%20sesi%20login");
  }

  await admin.from("activity_logs").insert({
    actor_type: "human",
    actor_profile_id: linkData.user.id,
    action: "auth.owner_pin_login",
    entity_type: "profile",
    entity_id: linkData.user.id,
    summary: "Owner masuk menggunakan PIN.",
    metadata: { method: "owner_pin" },
  });

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
