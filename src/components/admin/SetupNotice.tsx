export function SetupNotice() {
  return (
    <div className="min-h-screen bg-background px-5 py-16 text-foreground sm:px-8">
      <div className="mx-auto max-w-2xl rounded-lg border border-line/50 bg-surface p-6 ambient-shadow sm:p-8">
        <p className="label-caps text-accent">Ρύθμιση admin</p>
        <h1 className="mt-4 text-3xl font-light">Το Supabase δεν έχει συνδεθεί ακόμα.</h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Προσθέστε τα `NEXT_PUBLIC_SUPABASE_URL` και `NEXT_PUBLIC_SUPABASE_ANON_KEY`
          στο `.env.local` για να ενεργοποιηθεί η σύνδεση admin.
        </p>
      </div>
    </div>
  );
}
