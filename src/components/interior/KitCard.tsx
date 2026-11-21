import { ExternalLink, Sparkles, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatTenge, type Kit } from "@/lib/interior";

export function KitCard({ kit, budget, featured, index }: { kit: Kit; budget: number; featured?: boolean; index: number }) {
  const percent = Math.min(100, Math.round((kit.total / budget) * 100));
  return (
    <article
      className={cn(
        "surface relative flex flex-col overflow-hidden animate-rise",
        featured && "border-primary/50 shadow-lift ring-2 ring-primary/15",
      )}
      style={{ animationDelay: `${index * 90}ms` }}
    >
      <header className="flex items-start justify-between gap-3 border-b p-4 sm:p-5">
        <div>
          {featured && (
            <span className="mb-2 inline-block rounded-full bg-gradient-cta px-2.5 py-0.5 text-xs font-bold text-primary-foreground">
              Рекомендуем
            </span>
          )}
          <h3 className="text-lg font-semibold leading-tight">{kit.title}</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">{kit.tagline}</p>
        </div>
        <div className="flex shrink-0 -space-x-1.5 pt-1" aria-label="Палитра комплекта">
          {kit.palette.map((c) => (
            <span key={c} className="size-6 rounded-full border-2 border-card" style={{ backgroundColor: c }} />
          ))}
        </div>
      </header>

      {kit.items.length === 0 ? (
        <p className="flex-1 p-5 text-sm text-muted-foreground">
          В этот бюджет пока ничего не помещается — увеличьте сумму или уберите часть товаров из запроса.
        </p>
      ) : (
        <ul className="flex-1 divide-y">
          {kit.items.map((item) => (
            <li key={item.id} className="flex flex-col gap-2.5 p-4 sm:px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="inline-block rounded-md bg-secondary px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-secondary-foreground">
                    {item.categoryLabel}
                  </span>
                  <p className="mt-1.5 text-sm font-semibold leading-snug">{item.name}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Store className="size-3.5" />
                    {item.store}
                    {item.note && <span>· {item.note}</span>}
                  </p>
                </div>
                <span className="shrink-0 whitespace-nowrap font-display text-sm font-semibold">{formatTenge(item.price)}</span>
              </div>
              <Button asChild variant="soft" size="sm" className="self-start rounded-full">
                <a href={item.url} target="_blank" rel="noopener noreferrer">
                  Перейти в магазин <ExternalLink />
                </a>
              </Button>
            </li>
          ))}
        </ul>
      )}

      {kit.skipped.length > 0 && kit.items.length > 0 && (
        <p className="border-t px-4 py-2.5 text-xs text-muted-foreground sm:px-5">
          Не вошло в бюджет: {kit.skipped.join(", ").toLowerCase()}
        </p>
      )}

      <footer className="mt-auto space-y-4 border-t bg-muted/50 p-4 sm:p-5">
        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold text-muted-foreground">Итого</span>
            <span className="font-display text-2xl font-semibold">{formatTenge(kit.total)}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-border">
            <div className="h-full rounded-full bg-gradient-cta transition-all" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {percent}% бюджета · остаётся {formatTenge(budget - kit.total)}
          </p>
        </div>
        <div className="rounded-2xl bg-card p-3.5 text-sm leading-relaxed">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
            <Sparkles className="size-3.5" /> Почему это подходит
          </p>
          {kit.explanation}
        </div>
      </footer>
    </article>
  );
}
