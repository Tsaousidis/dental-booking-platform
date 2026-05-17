import { LoginForm } from "@/components/admin/LoginForm";
import { brand } from "@/config/brand";

export default function AdminLoginPage() {
  return (
    <main className="grid min-h-screen bg-background px-5 py-12 text-foreground sm:px-8 lg:grid-cols-[1fr_0.9fr]">
      <section className="flex items-center justify-center">
        <div className="w-full max-w-md rounded-lg border border-line/50 bg-surface p-6 ambient-shadow sm:p-8">
          <p className="label-caps text-accent">Admin γιατρού</p>
          <h1 className="mt-4 text-4xl font-light leading-tight">Σύνδεση</h1>
          <p className="mt-4 text-base leading-7 text-muted">
            Διαχείριση ραντεβού, ρυθμίσεων κλινικής και στατιστικών για το {brand.clinicName}.
          </p>
          <LoginForm />
        </div>
      </section>
      <section className="hidden items-end rounded-lg border border-line/50 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(250,249,247,0.25)),url('https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center p-8 ambient-shadow lg:flex">
        <div className="max-w-sm rounded-lg bg-surface/90 p-6 backdrop-blur">
          <p className="text-sm font-semibold">{brand.clinicName}</p>
          <p className="mt-2 text-sm leading-6 text-muted">
            Ένα ήρεμο περιβάλλον διαχείρισης για premium οδοντιατρική κλινική.
          </p>
        </div>
      </section>
    </main>
  );
}
