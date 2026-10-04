import { ownerPinLogin, staffLogin } from "./actions";
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
          approval, automation, dan pegawai AI yang saling terhubung.
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
            <span className="soft-label">OWNER ACCESS</span>
            <h2>Masuk dengan PIN</h2>
            <p>Owner cukup menggunakan PIN 6 digit. Email dan password tidak ditampilkan.</p>
          </div>

          {error ? <div className="form-alert">{error}</div> : null}

          <form action={ownerPinLogin} className="form-stack owner-pin-form">
            <label>
              <span>PIN Owner</span>
              <input
                className="pin-input"
                name="pin"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                pattern="[0-9]{6}"
                minLength={6}
                maxLength={6}
                placeholder="••••••"
                aria-label="PIN Owner 6 digit"
                required
              />
            </label>
            <button className="primary-button" type="submit">
              Buka Kantor AI
            </button>
          </form>

          <div className="pin-security-note">
            <span className="pin-lock-mark" aria-hidden="true">●</span>
            <div>
              <strong>Akses terlindungi</strong>
              <p>5 percobaan salah akan mengunci login owner selama 15 menit.</p>
            </div>
          </div>

          <details className="staff-login">
            <summary>Akses staf</summary>
            <form action={staffLogin} className="form-stack staff-form">
              <label>
                <span>Email staf</span>
                <input name="email" type="email" autoComplete="email" required />
              </label>
              <label>
                <span>Kata sandi</span>
                <input name="password" type="password" autoComplete="current-password" required />
              </label>
              <button className="secondary-button" type="submit">Masuk sebagai staf</button>
            </form>
          </details>
        </div>

        <p className="login-footnote">{brand.tagline}</p>
      </section>
    </main>
  );
}
