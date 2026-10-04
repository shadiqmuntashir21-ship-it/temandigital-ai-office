# Bootstrap Owner Pertama

Kantor AI tidak menyediakan public sign-up.

## Tujuan
Membuat akun internal pertama dan menaikkan role-nya menjadi `owner` tanpa menaruh password di source code.

## Environment sementara
Isi hanya pada environment lokal/rahasia:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OWNER_EMAIL`
- `OWNER_PASSWORD`
- `OWNER_NAME`

Lalu jalankan:

```bash
npm run bootstrap:owner
```

Script akan:
1. membuat user Supabase Auth jika belum ada,
2. mengonfirmasi email,
3. menggunakan trigger database untuk profile,
4. mengubah profile menjadi `owner`,
5. tidak mencetak password ke terminal.

Setelah berhasil, hapus `OWNER_PASSWORD` dari environment.

Jangan commit file `.env.local`.

Akun staff berikutnya tetap dibuat/invite melalui Supabase Auth dan default role-nya `staff`.
