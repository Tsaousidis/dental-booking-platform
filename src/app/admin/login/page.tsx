import { LoginForm } from "@/components/admin/LoginForm";
import { brand } from "@/config/brand";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen bg-background px-5 py-12 text-foreground sm:px-8 lg:grid-cols-[1fr_0.9fr]">
      <section className="flex items-center justify-center">
        <div className="w-full max-w-md border border-line bg-surface p-6 sm:p-8">
          <p className="text-sm uppercase tracking-[0.22em] text-accent">Admin γιατρού</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">Σύνδεση</h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Διαχείριση ραντεβού, ρυθμίσεων κλινικής και στατιστικών για το {brand.clinicName}.
          </p>
          <LoginForm />
        </div>
      </section>
      <section className="hidden items-end border border-line bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(251,250,248,0.25)),url('https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center p-8 lg:flex">
        <div className="max-w-sm bg-surface/90 p-6 backdrop-blur">
          <p className="text-sm font-semibold">{brand.clinicName}</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Ένα ήρεμο περιβάλλον διαχείρισης για premium οδοντιατρική κλινική.
          </p>
        </div>
      </section>
    </main>
  );
}
