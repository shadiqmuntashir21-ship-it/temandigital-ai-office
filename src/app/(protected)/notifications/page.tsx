import Link from "next/link";
import { requireProfile } from "@/lib/auth/require-profile";
import { tanggal } from "@/lib/format";
import { markAllRead, markNotificationRead } from "./actions";

export default async function NotificationsPage() {
  const { supabase, profile } = await requireProfile();
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const unread = (notifications ?? []).filter((item) => !item.read_at).length;

  return (
    <div className="ops-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow dark">INBOX</span>
          <h1>Notifikasi</h1>
          <p>Reminder operasional dari workflow engine dan sistem internal.</p>
        </div>
        {unread > 0 ? (
          <form action={markAllRead}>
            <button className="secondary-button" type="submit">Tandai semua dibaca</button>
          </form>
        ) : null}
      </section>

      <section className="notification-list">
        {(notifications ?? []).map((item) => (
          <article className={`notification-card ${item.read_at ? "read" : "unread"} level-${item.level}`} key={item.id}>
            <div className="notification-dot" />
            <div className="notification-copy">
              <div>
                <strong>{item.title}</strong>
                <small>{tanggal(item.created_at)}</small>
              </div>
              <p>{item.body || "Tidak ada detail tambahan."}</p>
              {item.link ? <Link href={item.link}>Buka terkait →</Link> : null}
            </div>
            {!item.read_at ? (
              <form action={markNotificationRead}>
                <input type="hidden" name="id" value={item.id} />
                <button className="ghost-button" type="submit">Sudah dibaca</button>
              </form>
            ) : null}
          </article>
        ))}
        {!notifications?.length ? <div className="empty-state">Belum ada notifikasi.</div> : null}
      </section>
    </div>
  );
}
