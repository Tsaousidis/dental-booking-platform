export function AdminPageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow sm:p-8">
      <p className="label-caps text-accent">{eyebrow}</p>
      <h1 className="mt-4 text-3xl font-light leading-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{description}</p>
    </section>
  );
}
