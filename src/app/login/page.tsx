import { login } from "./actions";
import { brand } from "@/lib/brand";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="eyebrow">TEMAN DIGITAL · INTERNAL</div>
        <h1>Kantor AI yang terasa seperti tim sungguhan.</h1>
        <p>
          Satu ruang kerja untuk sales, proyek, creative, finance, review,
          approval, dan pegawai AI yang saling terhubung.
        </p>
        <div className="login-orbit" aria-hidden="true">
          <span className="orbit-core">AI</span>
          <span className="orbit-dot dot-a" />
          <span className="orbit-dot dot-b" />
          <span className="orbit-dot dot-c" />
        </div>
      </section>

      <section className="login-panel">
        <div className="brand-text">
          <strong>{brand.name}</strong>
          <span>{brand.product}</span>
        </div>
        <div className="login-card">
          <div>
            <span className="soft-label">AKSES INTERNAL</span>
            <h2>Masuk ke kantor</h2>
            <p>Gunakan akun owner atau staf yang sudah terdaftar.</p>
          </div>

          {error ? <div className="form-alert">{error}</div> : null}

          <form action={login} className="form-stack">
            <label>
              <span>Email</span>
              <input name="email" type="email" autoComplete="email" placeholder="nama@temandigital.id" required />
            </label>
            <label>
              <span>Kata sandi</span>
              <input name="password" type="password" autoComplete="current-password" placeholder="••••••••" required />
            </label>
            <button className="primary-button" type="submit">Masuk ke Kantor AI</button>
          </form>
        </div>
        <p className="login-footnote">{brand.tagline}</p>
      </section>
    </main>
  );
}
