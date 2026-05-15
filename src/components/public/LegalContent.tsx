export function LegalContent({ body, notice }: { body: string; notice: string }) {
  return (
    <div className="max-w-3xl border border-line bg-surface p-6 sm:p-8">
      <p className="text-base leading-8 text-muted">{body}</p>
      <div className="mt-8 border-t border-line pt-6">
        <p className="text-sm font-medium text-accent">{notice}</p>
      </div>
    </div>
  );
}
