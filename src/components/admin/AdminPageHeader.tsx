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
    <section className="border border-line bg-surface p-6 sm:p-8">
      <p className="text-sm uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
      <h1 className="mt-4 text-3xl font-semibold leading-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{description}</p>
    </section>
  );
}
