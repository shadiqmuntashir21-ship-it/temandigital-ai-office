type Props = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
};

export function ModulePage({ eyebrow, title, description, items }: Props) {
  return (
    <div className="module-page">
      <section className="page-heading">
        <div>
          <span className="eyebrow dark">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        <button className="secondary-button" disabled>Tambah data</button>
      </section>

      <section className="module-grid">
        {items.map((item, index) => (
          <article className="module-card" key={item}>
            <span className="module-index">{String(index + 1).padStart(2, "0")}</span>
            <h2>{item}</h2>
            <p>Struktur fondasi siap. Operasi CRUD dan automasi modul ini masuk Phase B.</p>
          </article>
        ))}
      </section>
    </div>
  );
}
