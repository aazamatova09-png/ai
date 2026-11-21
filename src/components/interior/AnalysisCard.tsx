import { useEffect, useState } from "react";
import { Maximize2, Palette, ScanSearch, Sun } from "lucide-react";
import { styleLabel, type RoomAnalysis } from "@/lib/interior";

const STEPS = ["Распознаём предметы и планировку…", "Определяем цветовую гамму…", "Оцениваем освещение и площадь…"];

export function AnalysisCard({ photo, analysis }: { photo: string; analysis: RoomAnalysis | null }) {
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (analysis) return;
    setStep(0);
    const t = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 700);
    return () => clearInterval(t);
  }, [analysis]);

  return (
    <div className="surface grid gap-5 overflow-hidden p-4 sm:p-6 md:grid-cols-[280px_1fr] md:gap-8 md:p-8">
      <div className="relative overflow-hidden rounded-2xl bg-muted">
        <img src={photo} alt="Анализируемая комната" className="aspect-[4/3] h-full w-full object-cover" />
        {!analysis && <div className="scan-line" />}
        {analysis && (
          <span className="absolute left-3 top-3 rounded-full bg-card/90 px-2.5 py-1 text-xs font-bold text-success backdrop-blur">
            Точность {analysis.confidence}%
          </span>
        )}
      </div>

      {!analysis ? (
        <div className="flex flex-col justify-center gap-3">
          <p className="font-display text-lg font-semibold">ИИ изучает вашу комнату</p>
          {STEPS.map((s, i) => (
            <div key={s} className={`flex items-center gap-3 text-sm transition-opacity ${i <= step ? "opacity-100" : "opacity-35"}`}>
              <span className={`size-2 rounded-full ${i < step ? "bg-success" : i === step ? "animate-pulse bg-primary" : "bg-border"}`} />
              {s}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 animate-rise sm:gap-4">
          <Metric icon={<ScanSearch />} label="Стиль комнаты" value={styleLabel(analysis.detectedStyle)} />
          <Metric
            icon={<Palette />}
            label="Основные цвета"
            value={
              <div className="mt-1 flex -space-x-1.5">
                {analysis.colors.map((c) => (
                  <span key={c} title={c} className="size-7 rounded-full border-2 border-card shadow-soft" style={{ backgroundColor: c }} />
                ))}
              </div>
            }
            hint={analysis.colorNames.slice(0, 3).join(", ")}
          />
          <Metric icon={<Sun />} label="Освещение" value={analysis.lightingLabel} />
          <Metric icon={<Maximize2 />} label="Примерный размер" value={`${analysis.areaSqm} м²`} hint={analysis.dimensions} />
        </div>
      )}
    </div>
  );
}

function Metric({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl bg-muted/70 p-3.5 sm:p-4">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground [&_svg]:size-4 [&_svg]:text-primary">
        {icon}
        {label}
      </div>
      <div className="break-words font-display text-[15px] font-semibold leading-tight sm:text-lg">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground first-letter:uppercase">{hint}</div>}
    </div>
  );
}
