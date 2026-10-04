import { AIDesk } from "@/components/ai-desk";
import { requireProfile } from "@/lib/auth/require-profile";

export default async function AIPage() {
  const { profile } = await requireProfile();

  return (
    <div className="ops-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow dark">AI EMPLOYEES</span>
          <h1>Meja kerja AI</h1>
          <p>
            Instruksi diarahkan melalui AI Router. Pegawai AI hanya dapat menjalankan action
            yang diizinkan; tindakan sensitif dialihkan ke Approval Center.
          </p>
        </div>
      </section>
      <AIDesk isOwner={profile.role === "owner"} />
    </div>
  );
}
