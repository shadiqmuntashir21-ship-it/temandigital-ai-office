# Login Owner dengan PIN

Owner tidak perlu memasukkan email atau password di UI.

## Cara kerja

1. Owner memasukkan PIN 6 digit.
2. PIN dibandingkan hanya pada server dengan secret `OWNER_PIN`.
3. Supabase menyimpan counter percobaan dan lockout, bukan nilai PIN.
4. Jika benar, server membuat magic-link token internal tanpa mengirim email.
5. Token diverifikasi server-side untuk menghasilkan sesi Supabase yang valid.
6. Profile internal otomatis dipastikan memiliki role `owner`.
7. RLS tetap menjadi sumber otorisasi.

## Perlindungan brute force

- Maksimal 5 percobaan salah.
- Setelah itu login owner dikunci 15 menit.
- Fungsi rate-limit hanya dapat dipanggil menggunakan role server.
- Staff/anon tidak memiliki execute permission.

## Environment

```
OWNER_PIN=<secret 6 digit>
OWNER_AUTH_EMAIL=owner.ai.office@temandigital.id
OWNER_NAME=Owner Teman Digital
```

`OWNER_PIN` adalah server-only dan tidak boleh memakai prefix `NEXT_PUBLIC_`.

Akun staff tetap memakai Supabase Auth email/password melalui opsi **Akses staf** pada halaman login.
