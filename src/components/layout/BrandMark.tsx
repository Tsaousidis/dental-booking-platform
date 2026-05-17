import { brand } from "@/config/brand";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <path
          d="M12 6C12 6 20 6 20 20C20 34 12 34 12 34"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M28 6C28 6 20 6 20 20C20 34 28 34 28 34"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="grid gap-1 leading-none">
        <span className="text-sm font-medium uppercase tracking-[0.24em] text-foreground">
          {compact ? "Athenian" : brand.clinicName}
        </span>
        {!compact ? (
          <span className="text-[10px] font-light uppercase tracking-[0.22em] text-champagne">
            Clinical Excellence
          </span>
        ) : null}
      </span>
    </span>
  );
}
