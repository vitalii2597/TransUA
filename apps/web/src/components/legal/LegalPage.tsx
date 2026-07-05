import { Container } from '@/components/ui/Container';
import { Card } from '@/components/ui/Card';

/** Shared shell for static legal/content pages (privacy, terms). */
export function LegalPage({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}) {
  return (
    <Container className="max-w-2xl py-12">
      <h1 className="font-display text-3xl font-semibold text-ink">{title}</h1>
      <p className="mb-8 mt-2 text-sm text-slate-400">{updated}</p>

      <Card className="divide-y divide-slate-100 p-0">
        {sections.map((s) => (
          <section key={s.heading} className="p-6">
            <h2 className="mb-2 text-lg font-semibold text-ink">{s.heading}</h2>
            <p className="leading-relaxed text-slate-600">{s.body}</p>
          </section>
        ))}
      </Card>
    </Container>
  );
}
