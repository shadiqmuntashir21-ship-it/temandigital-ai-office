# Teman Digital AI Office

Kantor AI internal untuk operasional Teman Digital.

## Status implementasi
- PHASE A — Foundation: ✅
- PHASE B — Core Operations: ✅
- PHASE C — AI Orchestration: ✅ fondasi aktif
- PHASE D — 3D Office: ✅ adaptive lobby
- PHASE E — Automation & Workflow Engine: ✅ fondasi aktif
- Vercel: **belum di-import**. Akan dibuat sebagai project baru setelah aplikasi siap untuk deployment.

## Stack
- Next.js 16.3.8
- React 19.3.0
- TypeScript
- Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- Gemini melalui server/API layer
- Google GenAI SDK
- React Three Fiber + Three.js

## Environment
Salin `.env.example` menjadi `.env.local`, lalu isi:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `GEMINI_API_KEY` — server-only
- `GEMINI_MODEL=gemini-3.8-flash`
- `AI_PROVIDER=gemini`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, khusus scheduler
- `AUTOMATION_SECRET` — server-only, autentikasi endpoint scheduler

Jangan commit `.env.local` atau credential apa pun.

## Menjalankan
```bash
npm install
npm run dev
```

## Owner bootstrap
Aplikasi tidak menyediakan public sign-up. User internal dibuat/invite melalui Supabase Auth. User baru otomatis mendapatkan profile role `staff`. Promosi ke `owner` dilakukan secara administratif setelah akun owner tersedia.

## Arsitektur AI
Permintaan tidak dikirim langsung dari user ke model untuk bebas melakukan action.

Alur:
```
User / Owner
→ AI Router
→ Pegawai AI
→ Permission Layer
→ Action aman ATAU Approval Center
→ Database
→ Activity Log
```

AI Developer bersifat owner-only dan dilindungi oleh backend/RLS, bukan hanya hidden menu.

## 3D Office
Desktop mendukung lobby 3D interaktif berbasis React Three Fiber/Three.js. Mobile, reduced-motion, atau perangkat dengan memori rendah otomatis memakai mode ringan tanpa kehilangan fungsi navigasi.

## Database migrations
Migration SQL yang sudah diterapkan ke Supabase disinkronkan di folder `supabase/migrations`.

Migration live saat ini:
- `20261004065419_foundation_core_schema`
- `20261004065551_optimize_notification_rls`
- `20261004072134_cover_foreign_key_indexes`
- `20261004072516_automation_workflow_engine`
- `20261004072557_automation_notification_dedupe`

Rollback destruktif harus selalu melalui review/approval owner.

## Brand
Tagline: **Bangun Lebih Baik. Tumbuh Lebih Cepat.**

Logo resmi tidak dibuat ulang di source. Asset logo master akan dipasang saat file final tersedia pada workspace coding.


## Automation Engine
Rule bawaan:
- Daily Brief
- Lead Follow-up
- Project Deadline Watch
- Finance Pending Watch
- Approval Watch
- Review Queue Watch

Endpoint scheduler internal:
- `GET /api/automation/scheduled?cadence=hourly`
- `GET /api/automation/scheduled?cadence=daily`

Endpoint harus menerima `Authorization: Bearer <AUTOMATION_SECRET>` dan menggunakan Supabase service-role hanya di server. Scheduling eksternal belum diaktifkan karena Vercel project sengaja belum dibuat.
