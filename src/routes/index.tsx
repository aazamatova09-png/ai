import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Palette, PiggyBank, RotateCcw, Sofa } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StepHeading } from "@/components/interior/StepHeading";
import { UploadForm } from "@/components/interior/UploadForm";
import { AnalysisCard } from "@/components/interior/AnalysisCard";
import { KitCard } from "@/components/interior/KitCard";
import {
  COLORWAYS,
  MIN_BUDGET,
  STYLES,
  buildKits,
  formatTenge,
  parseBudget,
  parseCategories,
  styleLabel,
  type RoomAnalysis,
  type StyleId,
} from "@/lib/interior";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Уютно.AI — подбор мебели и материалов по фото комнаты" },
      {
        name: "description",
        content: "Загрузите фото комнаты, укажите бюджет в тенге и стиль — ИИ соберёт 2–3 готовых комплекта мебели и материалов из магазинов Казахстана.",
      },
      { property: "og:title", content: "Уютно.AI — интерьер по фото за минуту" },
      { property: "og:description", content: "ИИ анализирует фото комнаты и подбирает мебель и материалы под ваш бюджет в ₸." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const STEP_LABELS = ["Фото и бюджет", "Анализ ИИ", "Комплекты", "Настройка"];

function Index() {
  const [photo, setPhoto] = useState<string | null>(null);
  const [budgetText, setBudgetText] = useState("300 000");
  const [style, setStyle] = useState<StyleId>("scandi");
  const [comment, setComment] = useState("Нужен диван и напольное покрытие");

  const [status, setStatus] = useState<"idle" | "analyzing" | "ready">("idle");
  const [analysis, setAnalysis] = useState<RoomAnalysis | null>(null);
  const [submitted, setSubmitted] = useState<{ budget: number; comment: string; photo: string } | null>(null);
  const [kitStyle, setKitStyle] = useState<StyleId>("scandi");
  const [colorway, setColorway] = useState(0);
  const [cheaperLevel, setCheaperLevel] = useState(0);
  const [variantClicks, setVariantClicks] = useState(0);
  const [refining, setRefining] = useState(false);

  const analysisRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const kits = useMemo(() => {
    if (!analysis || !submitted) return [];
    return buildKits({
      budget: submitted.budget,
      style: kitStyle,
      categories: parseCategories(submitted.comment),
      colorway,
      cheaperLevel,
      room: analysis,
    });
  }, [analysis, submitted, kitStyle, colorway, cheaperLevel]);

  const currentStep = status === "idle" ? 0 : status === "analyzing" ? 1 : refining || cheaperLevel || variantClicks ? 3 : 2;

  const submit = async () => {
    const budget = parseBudget(budgetText);
    if (!photo) {
      toast.error("Загрузите фото комнаты");
      return;
    }
    if (budget < MIN_BUDGET) {
      toast.error(`Укажите бюджет от ${formatTenge(MIN_BUDGET)}`);
      return;
    }

    setStatus("analyzing");
    setAnalysis(null);
    setSubmitted({ budget, comment, photo });
    setKitStyle(style);
    setColorway(0);
    setCheaperLevel(0);
    setVariantClicks(0);
    requestAnimationFrame(() => analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));

    try {
      const [result] = await Promise.all([
        import("@/lib/photo-analysis").then((m) => m.analyzePhoto(photo)),
        new Promise((r) => setTimeout(r, 2300)),
      ]);
      setAnalysis(result);
      setStatus("ready");
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 900);
    } catch {
      setStatus("idle");
      toast.error("Не удалось прочитать фото. Попробуйте другое изображение.");
    }
  };

  const refine = (apply: () => void, message: string) => {
    setRefining(true);
    setTimeout(() => {
      apply();
      setRefining(false);
      toast.success(message);
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 750);
  };

  const makeCheaper = () => {
    const nextTotal = Math.max(...buildKitsTotals(cheaperLevel + 1));
    const curTotal = Math.max(...buildKitsTotals(cheaperLevel));
    if (nextTotal >= curTotal) {
      toast.info("Это уже самые доступные варианты в выбранном стиле");
      return;
    }
    refine(() => setCheaperLevel((l) => l + 1), `Нашли варианты дешевле — до ${formatTenge(nextTotal)}`);
  };

  function buildKitsTotals(level: number) {
    if (!analysis || !submitted) return [0];
    return buildKits({
      budget: submitted.budget,
      style: kitStyle,
      categories: parseCategories(submitted.comment),
      colorway,
      cheaperLevel: level,
      room: analysis,
    }).map((k) => k.total);
  }

  const changeVariant = () => {
    const n = variantClicks + 1;
    // Odd clicks change the palette, even clicks switch to the next style.
    if (n % 2 === 1) {
      const next = (colorway + 1) % 3;
      refine(() => {
        setColorway(next);
        setVariantClicks(n);
      }, `Новая палитра: ${COLORWAYS[kitStyle][next]!.name}`);
    } else {
      const idx = STYLES.findIndex((s) => s.id === kitStyle);
      const nextStyle = STYLES[(idx + 1) % STYLES.length]!.id;
      refine(() => {
        setKitStyle(nextStyle);
        setColorway(0);
        setVariantClicks(n);
      }, `Новый стиль: ${styleLabel(nextStyle)}`);
    }
  };

  const resetRefine = () =>
    refine(() => {
      setKitStyle(style);
      setColorway(0);
      setCheaperLevel(0);
      setVariantClicks(0);
    }, "Вернули исходную подборку");

  return (
    <div className="min-h-screen pb-24">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <a href="/" className="flex items-center gap-2 font-display text-lg font-semibold">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-cta text-primary-foreground shadow-cta">
            <Sofa className="size-5" />
          </span>
          <span>
            Уютно<span className="text-primary">.AI</span>
          </span>
        </a>
        <span className="hidden rounded-full border bg-card px-3 py-1 text-xs font-semibold text-muted-foreground sm:inline-block">
          Магазины Казахстана · цены в ₸
        </span>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="pb-8 pt-4 text-center sm:pb-12 sm:pt-10">
          <h1 className="mx-auto max-w-3xl text-3xl font-semibold leading-[1.1] sm:text-5xl">
            Мебель и материалы для ремонта <span className="text-primary">по фото вашей комнаты</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg">
            Загрузите фото, укажите бюджет — ИИ соберёт готовые комплекты с товарами из казахстанских магазинов.
          </p>
          <ol className="mx-auto mt-7 flex max-w-2xl items-center justify-center gap-1.5 sm:gap-3">
            {STEP_LABELS.map((label, i) => (
              <li key={label} className="flex items-center gap-1.5 sm:gap-3">
                <span
                  className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors sm:px-3 sm:text-sm ${
                    i <= currentStep ? "border-primary/40 bg-primary-soft text-primary" : "bg-card text-muted-foreground"
                  }`}
                >
                  <span className="font-display">{i + 1}</span>
                  <span className="hidden sm:inline">{label}</span>
                </span>
                {i < STEP_LABELS.length - 1 && <span className={`h-px w-4 sm:w-8 ${i < currentStep ? "bg-primary" : "bg-border"}`} />}
              </li>
            ))}
          </ol>
        </section>

        <section className="scroll-mt-6">
          <StepHeading n={1} title="Расскажите о комнате" subtitle="Фото, бюджет, стиль и что именно нужно подобрать" />
          <UploadForm
            photo={photo}
            onPhoto={setPhoto}
            budget={budgetText}
            onBudget={setBudgetText}
            style={style}
            onStyle={setStyle}
            comment={comment}
            onComment={setComment}
            onSubmit={submit}
            loading={status === "analyzing"}
          />
        </section>

        {status !== "idle" && submitted && (
          <section ref={analysisRef} className="mt-14 scroll-mt-6 animate-rise">
            <StepHeading n={2} title="Анализ фото" subtitle="Что ИИ увидел на вашем фото" />
            <AnalysisCard photo={submitted.photo} analysis={analysis} />
          </section>
        )}

        {status === "ready" && submitted && (
          <>
            <section ref={resultsRef} className="mt-14 scroll-mt-6">
              <StepHeading
                n={3}
                title="Готовые комплекты"
                subtitle={`Стиль «${styleLabel(kitStyle)}», ${COLORWAYS[kitStyle][colorway]!.name} палитра · бюджет до ${formatTenge(submitted.budget)}`}
              />
              <div className={`relative grid gap-5 lg:grid-cols-3 ${refining ? "pointer-events-none" : ""}`}>
                {refining && (
                  <div className="absolute inset-0 z-10 flex items-start justify-center rounded-3xl bg-background/60 pt-24 backdrop-blur-sm">
                    <span className="flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-semibold shadow-lift">
                      <Loader2 className="size-4 animate-spin text-primary" /> ИИ пересобирает подборку…
                    </span>
                  </div>
                )}
                {kits.map((kit, i) => (
                  <KitCard key={kit.id} kit={kit} budget={submitted.budget} featured={i === 1} index={i} />
                ))}
              </div>
            </section>

            <section className="mt-14">
              <StepHeading n={4} title="Не совсем то?" subtitle="Перенастройте подборку — ИИ покажет другие варианты" />
              <div className="surface flex flex-col gap-4 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
                <div className="grid gap-3 sm:grid-cols-2 md:flex md:flex-1">
                  <Button variant="cta" size="xl" disabled={refining} onClick={makeCheaper}>
                    <PiggyBank /> Сделать дешевле
                  </Button>
                  <Button variant="sage" size="xl" disabled={refining} onClick={changeVariant}>
                    <Palette /> Другой стиль / цвет
                  </Button>
                </div>
                {(cheaperLevel > 0 || variantClicks > 0) && (
                  <Button variant="ghost" disabled={refining} onClick={resetRefine} className="self-center">
                    <RotateCcw /> Вернуть исходную
                  </Button>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="mx-auto mt-20 max-w-6xl px-4 text-center text-xs text-muted-foreground sm:px-6">
        Демо-версия: товары и цены приведены для примера.
      </footer>
    </div>
  );
}
