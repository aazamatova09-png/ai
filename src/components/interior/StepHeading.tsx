export function StepHeading({ n, title, subtitle }: { n: number; title: string; subtitle?: string }) {
  return (
    <div className="mb-5 flex items-start gap-3 sm:mb-6 sm:gap-4">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-cta font-display text-sm font-semibold text-primary-foreground shadow-cta sm:size-10">
        {n}
      </span>
      <div>
        <h2 className="text-xl font-semibold leading-tight sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground sm:text-base">{subtitle}</p>}
      </div>
    </div>
  );
}
