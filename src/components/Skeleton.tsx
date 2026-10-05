export function SkeletonKartu() {
  return (
    <div className="skeleton-card">
      <div className="skeleton" style={{ height: 170 }} />
      <div style={{ padding: 16, display: "grid", gap: 10 }}>
        <div className="skeleton" style={{ height: 18, width: "85%" }} />
        <div className="skeleton" style={{ height: 13, width: "60%" }} />
        <div className="skeleton" style={{ height: 11, width: "40%" }} />
      </div>
    </div>
  );
}

export function SkeletonGrid({ jumlah = 6 }: { jumlah?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
      {Array.from({ length: jumlah }).map((_, i) => <SkeletonKartu key={i} />)}
    </div>
  );
}

export function EmptyState({ ikon, judul, sub, cta, href }: {
  ikon: string; judul: string; sub: string; cta?: string; href?: string;
}) {
  return (
    <div style={{ border: "1px dashed var(--rule2)", borderRadius: 8, padding: "48px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>{ikon}</div>
      <h3 style={{ fontFamily: "var(--fd)", fontSize: 21, margin: "0 0 6px" }}>{judul}</h3>
      <p style={{ color: "var(--mut)", fontSize: 15, maxWidth: "32em", margin: "0 auto 20px" }}>{sub}</p>
      {cta && href && (
        <a href={href} className="btn btn-acc" style={{ textDecoration: "none" }}>{cta}</a>
      )}
    </div>
  );
}
