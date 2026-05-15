import { type ReactNode } from "react";

export function PublicPageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-background">
      <section className="border-b border-line bg-surface">
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <p className="text-sm uppercase tracking-[0.22em] text-accent">{eyebrow}</p>
          <h1 className="mt-5 max-w-4xl text-4xl font-semibold leading-tight sm:text-6xl">
            {title}
          </h1>
          {intro ? (
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{intro}</p>
          ) : null}
        </div>
      </section>
      <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        {children}
      </div>
    </div>
  );
}
