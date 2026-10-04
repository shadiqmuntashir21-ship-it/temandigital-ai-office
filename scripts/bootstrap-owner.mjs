import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.OWNER_EMAIL;
const password = process.env.OWNER_PASSWORD;
const fullName = process.env.OWNER_NAME || "Owner Teman Digital";

for (const [key, value] of Object.entries({
  NEXT_PUBLIC_SUPABASE_URL: url,
  SUPABASE_SERVICE_ROLE_KEY: serviceRole,
  OWNER_EMAIL: email,
  OWNER_PASSWORD: password,
})) {
  if (!value) {
    console.error(`Environment ${key} wajib diisi.`);
    process.exit(1);
  }
}

const admin = createClient(url, serviceRole, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let userId = null;

const created = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { full_name: fullName },
});

if (created.error) {
  if (!created.error.message.toLowerCase().includes("already")) {
    console.error("Gagal membuat owner:", created.error.message);
    process.exit(1);
  }

  const listed = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (listed.error) {
    console.error("Gagal mencari akun existing:", listed.error.message);
    process.exit(1);
  }
  userId = listed.data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase())?.id ?? null;
} else {
  userId = created.data.user.id;
}

if (!userId) {
  console.error("Akun owner tidak ditemukan setelah proses bootstrap.");
  process.exit(1);
}

const { error: profileError } = await admin
  .from("profiles")
  .update({
    role: "owner",
    full_name: fullName,
    is_active: true,
  })
  .eq("id", userId);

if (profileError) {
  console.error("Gagal mempromosikan profile menjadi owner:", profileError.message);
  process.exit(1);
}

console.log(`Owner aktif: ${email}`);
console.log("Hapus OWNER_PASSWORD dari environment setelah bootstrap selesai.");
