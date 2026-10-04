# Teman Digital AI Office

Kantor AI internal untuk operasional Teman Digital.

## Status implementasi
- PHASE A — Foundation: aktif
- Supabase schema + RLS: aktif
- Next.js 16 App Router + TypeScript: disiapkan
- Auth SSR: disiapkan
- Command Center shell: disiapkan
- Owner Room + AI Developer owner-only: diproteksi
- Vercel: **belum di-import** (akan dibuat sebagai project baru setelah fondasi stabil)

## Stack
- Next.js 16.3.8
- React 19.3.0
- TypeScript
- Supabase (PostgreSQL, Auth, Storage, Realtime, RLS)
- Gemini melalui server/API layer pada fase AI
- React Three Fiber / Three.js pada fase 3D

## Environment
Salin `.env.example` menjadi `.env.local`, lalu isi:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `GEMINI_API_KEY` (server-only; belum dipakai pada Phase A)
- `AI_PROVIDER=gemini`

Jangan commit `.env.local` atau credential apa pun.

## Menjalankan
```bash
npm install
npm run dev
```

## Owner bootstrap
Aplikasi tidak menyediakan public sign-up. User internal dibuat/invite melalui Supabase Auth. User baru otomatis mendapatkan profile role `staff`. Promosi ke `owner` dilakukan secara administratif setelah akun owner tersedia.

## Brand
Tagline: **Bangun Lebih Baik. Tumbuh Lebih Cepat.**

Logo resmi tidak dibuat ulang di source. Asset logo master akan dipasang saat file final diberikan ke workspace coding.
