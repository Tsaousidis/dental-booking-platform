export function SetupNotice() {
  return (
    <div className="min-h-screen bg-background px-5 py-16 text-foreground sm:px-8">
      <div className="mx-auto max-w-2xl border border-line bg-surface p-6 sm:p-8">
        <p className="text-sm uppercase tracking-[0.22em] text-accent">Admin setup</p>
        <h1 className="mt-4 text-3xl font-semibold">Supabase is not connected yet.</h1>
        <p className="mt-4 text-base leading-7 text-muted">
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to
          `.env.local` to enable admin authentication.
        </p>
      </div>
    </div>
  );
}
