# Teman Digital AI Office

Kantor AI internal untuk operasional Teman Digital.

## Status implementasi
- PHASE A — Foundation: ✅
- PHASE B — Core Operations: ✅
- PHASE C — AI Orchestration: ✅ fondasi aktif
- PHASE D — 3D Office: ✅ adaptive lobby
- PHASE E — Automation & Workflow Engine: ✅
- Security hardening: ✅
- Owner bootstrap tooling: ✅ siap
- Vercel: **belum di-import**. Akan dibuat sebagai project baru setelah owner + secret produksi siap.

## Stack
- Next.js 16.3.8
- React 19.3.0
- TypeScript
- Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- Gemini melalui server/API layer
- Google GenAI SDK
- React Three Fiber + Three.js

## Environment
Salin `.env.example` menjadi `.env.local`.

Runtime:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `GEMINI_API_KEY` — server-only
- `GEMINI_MODEL=gemini-3.8-flash`
- `AI_PROVIDER=gemini`
- `SUPABASE_SERVICE_ROLE_KEY` — server-only, scheduler/admin task
- `AUTOMATION_SECRET` — server-only, autentikasi scheduler

Bootstrap sementara:
- `OWNER_EMAIL`
- `OWNER_PASSWORD`
- `OWNER_NAME`

Jangan commit credential/API key.

## Menjalankan
```bash
npm install
npm run dev
```

## Owner bootstrap
```bash
npm run bootstrap:owner
```

Detail: `docs/OWNER_BOOTSTRAP.md`.

Aplikasi tidak menyediakan public sign-up. User internal baru default menjadi `staff`.

## Arsitektur AI
```
User / Owner
→ AI Router
→ Pegawai AI
→ Permission Layer
→ Action aman ATAU Approval Center
→ Database
→ Activity Log
```

AI Developer owner-only dan dilindungi backend/RLS.

## Automation Engine
Rule bawaan:
- Daily Brief
- Lead Follow-up
- Project Deadline Watch
- Finance Pending Watch
- Approval Watch
- Review Queue Watch

Scheduler internal:
- `GET /api/automation/scheduled?cadence=hourly`
- `GET /api/automation/scheduled?cadence=daily`

Wajib `Authorization: Bearer <AUTOMATION_SECRET>`.

Scheduling eksternal belum diaktifkan karena Vercel project sengaja belum dibuat.

## 3D Office
Desktop mendukung lobby 3D interaktif. Mobile/reduced-motion/perangkat rendah memori otomatis memakai mode ringan.

## Database migrations
- `20261004065419_foundation_core_schema`
- `20261004065551_optimize_notification_rls`
- `20261004072134_cover_foreign_key_indexes`
- `20261004072516_automation_workflow_engine`
- `20261004072557_automation_notification_dedupe`
- `20261004073336_harden_automation_write_policies`

Rollback destruktif harus melalui review/approval owner.

## Brand
Tagline: **Bangun Lebih Baik. Tumbuh Lebih Cepat.**

Logo master resmi belum ditemukan sebagai asset file pada workspace yang bisa dipakai langsung. Karena itu aplikasi tidak memakai brand-board lama sebagai pengganti logo final.
