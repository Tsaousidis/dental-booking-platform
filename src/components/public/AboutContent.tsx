import { Award, GraduationCap, HeartPulse, ShieldCheck, Sparkles, UsersRound } from "lucide-react";

import { brand } from "@/config/brand";
import { type Dictionary } from "@/lib/i18n";

const icons = [Award, ShieldCheck, HeartPulse];

export function AboutContent({ dictionary }: { dictionary: Dictionary }) {
  const credentials = [
    dictionary.aboutPage.credentialOne,
    dictionary.aboutPage.credentialTwo,
    dictionary.aboutPage.credentialThree,
  ];
  const profileSections = [
    {
      title: dictionary.aboutPage.educationTitle,
      icon: GraduationCap,
      items: [dictionary.aboutPage.educationOne, dictionary.aboutPage.educationTwo],
    },
    {
      title: dictionary.aboutPage.specialtiesTitle,
      icon: Sparkles,
      items: [dictionary.aboutPage.specialtyOne, dictionary.aboutPage.specialtyTwo],
    },
    {
      title: dictionary.aboutPage.membershipsTitle,
      icon: UsersRound,
      items: [dictionary.aboutPage.membershipOne, dictionary.aboutPage.membershipTwo],
    },
    {
      title: dictionary.aboutPage.experienceTitle,
      icon: Award,
      items: [dictionary.aboutPage.experienceOne, dictionary.aboutPage.experienceTwo],
    },
  ];

  return (
    <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="min-h-[520px] rounded-lg border border-line/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(250,249,247,0.56)),url('https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=1100&q=80')] bg-cover bg-center ambient-shadow" />

      <div className="space-y-8">
        <div className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow sm:p-8">
          <p className="label-caps text-accent">
            {brand.doctorName}
          </p>
          <div className="mt-6 grid gap-4">
            {credentials.map((credential, index) => {
              const Icon = icons[index];

              return (
                <div key={credential} className="flex gap-4 border-t border-line/60 pt-4">
                  <Icon className="mt-1 shrink-0 text-accent" size={20} aria-hidden="true" />
                  <p className="text-base leading-7">{credential}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {profileSections.map((section) => {
            const Icon = section.icon;

            return (
              <article key={section.title} className="rounded-lg border border-line/50 bg-background p-6">
                <div className="flex items-center gap-3">
                  <Icon className="text-accent" size={20} aria-hidden="true" />
                  <h2 className="text-xl font-medium">{section.title}</h2>
                </div>
                <ul className="mt-5 space-y-3 text-sm leading-6 text-muted">
                  {section.items.map((item) => (
                    <li key={item} className="border-t border-line/50 pt-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow">
            <h2 className="text-2xl font-medium">{dictionary.aboutPage.philosophyTitle}</h2>
            <p className="mt-4 text-base leading-8 text-muted">
              {dictionary.aboutPage.philosophyBody}
            </p>
          </article>
          <article className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow">
            <h2 className="text-2xl font-medium">{dictionary.aboutPage.careTitle}</h2>
            <p className="mt-4 text-base leading-8 text-muted">
              {dictionary.aboutPage.careBody}
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
