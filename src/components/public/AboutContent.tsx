import { Award, HeartPulse, ShieldCheck } from "lucide-react";

import { brand } from "@/config/brand";
import { type Dictionary } from "@/lib/i18n";

const icons = [Award, ShieldCheck, HeartPulse];

export function AboutContent({ dictionary }: { dictionary: Dictionary }) {
  const credentials = [
    dictionary.aboutPage.credentialOne,
    dictionary.aboutPage.credentialTwo,
    dictionary.aboutPage.credentialThree,
  ];

  return (
    <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="min-h-[520px] border border-line bg-[linear-gradient(180deg,rgba(255,255,255,0.2),rgba(251,250,248,0.9)),url('https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1100&q=80')] bg-cover bg-center" />

      <div className="space-y-8">
        <div className="border border-line bg-surface p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">
            {brand.doctorName}
          </p>
          <div className="mt-6 grid gap-4">
            {credentials.map((credential, index) => {
              const Icon = icons[index];

              return (
                <div key={credential} className="flex gap-4 border-t border-line pt-4">
                  <Icon className="mt-1 shrink-0 text-accent" size={20} aria-hidden="true" />
                  <p className="text-base leading-7">{credential}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="border border-line bg-surface p-6">
            <h2 className="text-2xl font-semibold">{dictionary.aboutPage.philosophyTitle}</h2>
            <p className="mt-4 text-base leading-8 text-muted">
              {dictionary.aboutPage.philosophyBody}
            </p>
          </article>
          <article className="border border-line bg-surface p-6">
            <h2 className="text-2xl font-semibold">{dictionary.aboutPage.careTitle}</h2>
            <p className="mt-4 text-base leading-8 text-muted">
              {dictionary.aboutPage.careBody}
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
