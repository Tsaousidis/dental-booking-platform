import { Clock, Mail, MapPin, Phone } from "lucide-react";

import { brand } from "@/config/brand";
import { type Dictionary } from "@/lib/i18n";

export function ContactContent({ dictionary }: { dictionary: Dictionary }) {
  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="grid gap-4">
        <InfoRow icon={MapPin} label={brand.address} value={brand.city} />
        <InfoRow icon={Phone} label={brand.phone} value="Reception" />
        <InfoRow icon={Mail} label={brand.email} value="Email" />
        <div className="rounded-lg border border-line/50 bg-surface p-6 ambient-shadow">
          <div className="flex items-start gap-4">
            <Clock className="mt-1 text-accent" size={22} aria-hidden="true" />
            <div>
              <h2 className="text-xl font-medium">{dictionary.contactPage.hoursTitle}</h2>
              <dl className="mt-5 grid gap-3 text-sm">
                <div className="flex justify-between gap-6 border-t border-line/60 pt-3">
                  <dt className="text-muted">{dictionary.contactPage.weekdays}</dt>
                  <dd className="font-medium">{dictionary.contactPage.weekdayHours}</dd>
                </div>
                <div className="flex justify-between gap-6 border-t border-line/60 pt-3">
                  <dt className="text-muted">{dictionary.contactPage.saturday}</dt>
                  <dd className="font-medium">{dictionary.contactPage.saturdayHours}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-[420px] items-end rounded-lg border border-line/50 bg-[linear-gradient(135deg,rgba(255,255,255,0.9),rgba(250,249,247,0.55)),url('https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center ambient-shadow">
        <div className="m-5 max-w-md rounded-lg bg-surface/90 p-6 backdrop-blur">
          <h2 className="text-2xl font-medium">{dictionary.contactPage.mapTitle}</h2>
          <p className="mt-3 text-base leading-7 text-muted">{dictionary.contactPage.mapBody}</p>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-4 rounded-lg border border-line/50 bg-surface p-6 ambient-shadow">
      <Icon className="mt-1 shrink-0 text-accent" size={22} aria-hidden="true" />
      <div>
        <p className="label-caps text-muted">{value}</p>
        <p className="mt-1 text-lg font-medium">{label}</p>
      </div>
    </div>
  );
}
