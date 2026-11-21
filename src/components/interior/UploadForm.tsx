import { useRef, useState, type DragEvent } from "react";
import { ImagePlus, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { STYLES, type StyleId } from "@/lib/interior";

const BUDGET_CHIPS = [150000, 300000, 500000, 1000000];
const COMMENT_CHIPS = [
  "Нужен диван и напольное покрытие",
  "Спальня: кровать, шкаф и шторы",
  "Кухня: обеденный стол и стулья",
  "Обновить стены и освещение",
];

const fmt = (digits: string) => (digits ? Number(digits).toLocaleString("ru-RU").replace(/\u00a0/g, " ") : "");

interface Props {
  photo: string | null;
  onPhoto: (url: string | null) => void;
  budget: string;
  onBudget: (v: string) => void;
  style: StyleId;
  onStyle: (s: StyleId) => void;
  comment: string;
  onComment: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function UploadForm(p: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleFile = (file?: File) => {
    if (!file || !file.type.startsWith("image/")) return;
    p.onPhoto(URL.createObjectURL(file));
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files[0]);
  };

  return (
    <form
      className="surface grid gap-6 p-4 sm:p-6 md:grid-cols-[1.05fr_1fr] md:gap-8 md:p-8"
      onSubmit={(e) => {
        e.preventDefault();
        p.onSubmit();
      }}
    >
      {/* Photo */}
      <div className="flex flex-col gap-3">
        <FieldLabel>Фото комнаты</FieldLabel>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Загрузить фото комнаты"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        {p.photo ? (
          <div className="group relative overflow-hidden rounded-2xl border bg-muted">
            <img src={p.photo} alt="Загруженное фото комнаты" className="aspect-[4/3] w-full object-cover" />
            <div className="absolute inset-x-3 bottom-3 flex gap-2">
              <Button type="button" size="sm" variant="outline" className="rounded-full bg-card/90 backdrop-blur" onClick={() => inputRef.current?.click()}>
                <RefreshCw /> Заменить
              </Button>
              <Button type="button" size="sm" variant="outline" className="rounded-full bg-card/90 backdrop-blur" onClick={() => p.onPhoto(null)}>
                Удалить
              </Button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={cn(
              "flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-input bg-muted/60 p-6 text-center transition-colors hover:border-primary hover:bg-primary-soft",
              drag && "border-primary bg-primary-soft",
            )}
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-card text-primary shadow-soft">
              <ImagePlus className="size-7" />
            </span>
            <span className="font-semibold">Загрузите фото комнаты</span>
            <span className="text-sm text-muted-foreground">Нажмите или перетащите файл · JPG, PNG, HEIC</span>
          </button>
        )}
        {!p.photo && (
          <button
            type="button"
            onClick={() => p.onPhoto("/images/sample-room.jpg")}
            className="self-start text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            Нет фото под рукой? Попробовать на примере
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2.5">
          <FieldLabel htmlFor="budget">Бюджет</FieldLabel>
          <div className="relative">
            <input
              id="budget"
              inputMode="numeric"
              placeholder="300 000"
              value={p.budget}
              onChange={(e) => p.onBudget(fmt(e.target.value.replace(/\D/g, "").slice(0, 9)))}
              className="h-14 w-full rounded-2xl border border-input bg-card pl-4 pr-12 font-display text-xl font-semibold outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-display text-xl text-muted-foreground">₸</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {BUDGET_CHIPS.map((b) => {
              const v = fmt(String(b));
              return (
                <Chip key={b} active={p.budget === v} onClick={() => p.onBudget(v)}>
                  {v} ₸
                </Chip>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <FieldLabel>Желаемый стиль</FieldLabel>
          <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Стиль интерьера">
            {STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                role="radio"
                aria-checked={p.style === s.id}
                onClick={() => p.onStyle(s.id)}
                className={cn(
                  "rounded-2xl border bg-card px-3.5 py-3 text-left transition-all hover:border-primary/60",
                  p.style === s.id && "border-primary bg-primary-soft ring-2 ring-primary/20",
                )}
              >
                <span className="block text-sm font-bold">{s.label}</span>
                <span className="block text-xs text-muted-foreground">{s.hint}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <FieldLabel htmlFor="comment">Что нужно подобрать?</FieldLabel>
          <Textarea
            id="comment"
            rows={3}
            placeholder="Например: нужен диван и напольное покрытие"
            value={p.comment}
            onChange={(e) => p.onComment(e.target.value)}
            className="min-h-24 rounded-2xl bg-card px-4 py-3 text-base focus-visible:ring-4 focus-visible:ring-primary/15"
          />
          <div className="flex flex-wrap gap-2">
            {COMMENT_CHIPS.map((c) => (
              <Chip key={c} active={p.comment === c} onClick={() => p.onComment(c)}>
                {c}
              </Chip>
            ))}
          </div>
        </div>

        <Button type="submit" variant="cta" size="xl" disabled={p.loading} className="w-full">
          {p.loading ? <Sparkles className="animate-pulse" /> : <Wand2 />}
          {p.loading ? "Анализируем фото…" : "Подобрать интерьер"}
        </Button>
      </div>
    </form>
  );
}

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
      {children}
    </label>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border bg-card px-3 py-1.5 text-xs font-semibold text-foreground/80 transition-colors hover:border-primary hover:text-primary",
        active && "border-primary bg-primary-soft text-primary",
      )}
    >
      {children}
    </button>
  );
}
