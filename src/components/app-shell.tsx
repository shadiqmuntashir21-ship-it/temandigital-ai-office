import Link from "next/link";

type Props = {
  children: React.ReactNode;
  userName: string;
  role: "owner" | "staff";
};

const nav = [
  { href: "/kantor", label: "Command Center", short: "Beranda" },
  { href: "/sales", label: "Sales Room", short: "Sales" },
  { href: "/projects", label: "Project Room", short: "Proyek" },
  { href: "/creative", label: "Creative Room", short: "Creative" },
  { href: "/finance", label: "Finance Room", short: "Finance" },
  { href: "/review", label: "Review Room", short: "Review" },
  { href: "/approval", label: "Approval Center", short: "Approval" },
  { href: "/knowledge", label: "Knowledge Base", short: "Knowledge" },
  { href: "/activity", label: "Activity Log", short: "Aktivitas" },
];

export function AppShell({ children, userName, role }: Props) {
  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-kicker">TEMAN DIGITAL</span>
          <strong>Kantor AI</strong>
          <small>Internal workspace</small>
        </div>

        <nav className="side-nav">
          {nav.map((item) => (
            <Link key={item.href} href={item.href}>{item.label}</Link>
          ))}
          {role === "owner" ? <Link className="owner-link" href="/owner">Owner Room</Link> : null}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar">{userName.slice(0, 1).toUpperCase()}</div>
          <div>
            <strong>{userName}</strong>
            <span>{role === "owner" ? "Owner" : "Staf"}</span>
          </div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="ghost-button">Keluar</button>
          </form>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div>
            <span className="topbar-kicker">KANTOR AI</span>
            <strong>Operasional Teman Digital</strong>
          </div>
          <div className="live-pill"><span /> Sistem aktif</div>
        </header>
        <main className="page-content">{children}</main>
      </div>

      <nav className="mobile-nav">
        {nav.slice(0, 5).map((item) => (
          <Link key={item.href} href={item.href}>{item.short}</Link>
        ))}
      </nav>
    </div>
  );
}
