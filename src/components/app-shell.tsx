"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type Props = {
  children: React.ReactNode;
  userName: string;
  role: "owner" | "staff";
};

const nav = [
  { href: "/kantor", label: "Command Center", short: "Beranda" },
  { href: "/ai", label: "Pegawai AI", short: "AI" },
  { href: "/sales", label: "Sales Room", short: "Sales" },
  { href: "/orders", label: "Produk & Order", short: "Order" },
  { href: "/projects", label: "Project Room", short: "Proyek" },
  { href: "/creative", label: "Creative Room", short: "Creative" },
  { href: "/finance", label: "Finance Room", short: "Finance" },
  { href: "/review", label: "Review Room", short: "Review" },
  { href: "/approval", label: "Approval Center", short: "Approval" },
  { href: "/automation", label: "Automation", short: "Auto" },
  { href: "/knowledge", label: "Knowledge Base", short: "Knowledge" },
  { href: "/activity", label: "Activity Log", short: "Aktivitas" },
];

function matchesPath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children, userName, role }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const prefetch = useCallback((href: string) => {
    router.prefetch(href);
  }, [router]);

  const loadUnread = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications/unread", {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) return;
      const data = await response.json() as { unread?: number };
      setUnreadCount(Number(data.unread ?? 0));
    } catch {
      // Badge tidak boleh menghambat navigasi utama.
    }
  }, []);

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  useEffect(() => {
    void loadUnread();
    const timer = window.setInterval(() => void loadUnread(), 60_000);
    return () => window.clearInterval(timer);
  }, [loadUnread]);

  function navLink(item: { href: string; label: string; short: string }, mobile = false) {
    const active = matchesPath(pathname, item.href);
    const pending = pendingHref === item.href;

    return (
      <Link
        key={item.href}
        href={item.href}
        prefetch={false}
        onPointerEnter={() => prefetch(item.href)}
        onFocus={() => prefetch(item.href)}
        onClick={() => {
          if (!active) setPendingHref(item.href);
        }}
        className={[active ? "active" : "", pending ? "pending" : ""].filter(Boolean).join(" ")}
        aria-current={active ? "page" : undefined}
      >
        {mobile ? item.short : item.label}
      </Link>
    );
  }

  const ownerActive = matchesPath(pathname, "/owner");

  return (
    <div className={pendingHref ? "app-frame is-routing" : "app-frame"}>
      <div className={pendingHref ? "nav-progress active" : "nav-progress"} aria-hidden="true" />
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-kicker">TEMAN DIGITAL</span>
          <strong>Kantor AI</strong>
          <small>Internal workspace</small>
        </div>
        <nav className="side-nav">
          {nav.map((item) => navLink(item))}
          {role === "owner" ? (
            <Link
              className={`owner-link ${ownerActive ? "active" : ""} ${pendingHref === "/owner" ? "pending" : ""}`}
              href="/owner"
              prefetch={false}
              onPointerEnter={() => prefetch("/owner")}
              onFocus={() => prefetch("/owner")}
              onClick={() => {
                if (!ownerActive) setPendingHref("/owner");
              }}
            >
              Owner Room
            </Link>
          ) : null}
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">{userName.slice(0, 1).toUpperCase()}</div>
          <div><strong>{userName}</strong><span>{role === "owner" ? "Owner" : "Staf"}</span></div>
          <form action="/auth/signout" method="post">
            <button type="submit" className="ghost-button">Keluar</button>
          </form>
        </div>
      </aside>

      <div className="app-main">
        <header className="topbar">
          <div><span className="topbar-kicker">KANTOR AI</span><strong>Operasional Teman Digital</strong></div>
          <div className="topbar-actions">
            <Link
              href="/notifications"
              prefetch={false}
              onPointerEnter={() => prefetch("/notifications")}
              onFocus={() => prefetch("/notifications")}
              onClick={() => {
                if (!matchesPath(pathname, "/notifications")) setPendingHref("/notifications");
              }}
              className={`notification-link ${matchesPath(pathname, "/notifications") ? "active" : ""}`}
            >
              Notifikasi
              {unreadCount > 0 ? <span>{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
            </Link>
            <div className="live-pill"><span /> Sistem aktif</div>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>

      <nav className="mobile-nav">
        {nav.slice(0, 5).map((item) => navLink(item, true))}
      </nav>
    </div>
  );
}
