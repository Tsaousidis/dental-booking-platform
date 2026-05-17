export function LegalContent({ body, notice }: { body: string; notice: string }) {
  return (
    <div className="max-w-3xl rounded-lg border border-line/50 bg-surface p-6 ambient-shadow sm:p-8">
      <p className="text-base leading-8 text-muted">{body}</p>
      <div className="mt-8 border-t border-line/60 pt-6">
        <p className="text-sm font-medium text-accent">{notice}</p>
      </div>
    </div>
  );
}
