export function SetupNotice() {
  return (
    <div className="min-h-screen bg-background px-5 py-16 text-foreground sm:px-8">
      <div className="mx-auto max-w-2xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-accent">Ρύθμιση admin</p>
        <h1 className="mt-4 text-3xl font-semibold">Το Supabase δεν έχει συνδεθεί ακόμα.</h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Προσθέστε τα `NEXT_PUBLIC_SUPABASE_URL` και `NEXT_PUBLIC_SUPABASE_ANON_KEY`
          στο `.env.local` για να ενεργοποιηθεί η σύνδεση admin.
        </p>
      </div>
    </div>
  );
}
