// Browser-only demo "AI" analysis: reads real pixels of the uploaded photo
// to get dominant colors and brightness, then derives style and size estimates.
import type { RoomAnalysis, StyleId } from "./interior";

function toHex(r: number, g: number, b: number) {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
  }
  return { h, s, l };
}

export function colorName(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  const { h, s, l } = rgbToHsl(r, g, b);
  if (l > 0.9) return "белый";
  if (l < 0.15) return "чёрный";
  if (s < 0.12) return l > 0.65 ? "светло-серый" : l > 0.4 ? "серый" : "графитовый";
  if (h < 20 || h >= 340) return l > 0.6 ? "розовый" : "терракотовый";
  if (h < 45) return l > 0.7 ? "бежевый" : l > 0.45 ? "песочный" : "коричневый";
  if (h < 70) return l > 0.65 ? "кремовый" : "охристый";
  if (h < 160) return l > 0.6 ? "мятный" : "зелёный";
  if (h < 250) return l > 0.6 ? "голубой" : "синий";
  return "сиреневый";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export async function analyzePhoto(src: string): Promise<RoomAnalysis> {
  const img = await loadImage(src);
  const size = 72;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = Math.max(1, Math.round((img.height / img.width) * size));
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const buckets = new Map<string, { r: number; g: number; b: number; n: number }>();
  let lum = 0, sat = 0, warm = 0, count = 0, hash = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!, g = data[i + 1]!, b = data[i + 2]!;
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const bk = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
    bk.r += r; bk.g += g; bk.b += b; bk.n++;
    buckets.set(key, bk);
    const hsl = rgbToHsl(r, g, b);
    lum += hsl.l; sat += hsl.s; warm += r - b; count++;
    hash = (hash * 31 + r + g * 7 + b * 13) % 100003;
  }
  lum /= count; sat /= count; warm /= count;

  const sorted = [...buckets.values()].sort((a, b) => b.n - a.n);
  const colors: string[] = [];
  for (const bk of sorted) {
    const hex = toHex(bk.r / bk.n, bk.g / bk.n, bk.b / bk.n);
    const close = colors.some((c) => {
      const dr = parseInt(c.slice(1, 3), 16) - bk.r / bk.n;
      const dg = parseInt(c.slice(3, 5), 16) - bk.g / bk.n;
      const db = parseInt(c.slice(5, 7), 16) - bk.b / bk.n;
      return Math.sqrt(dr * dr + dg * dg + db * db) < 48;
    });
    if (!close) colors.push(hex);
    if (colors.length === 5) break;
  }

  let detectedStyle: StyleId;
  if (lum < 0.38) detectedStyle = "loft";
  else if (sat < 0.12 && lum > 0.6) detectedStyle = "minimal";
  else if (warm > 12 && lum > 0.5) detectedStyle = "scandi";
  else detectedStyle = "modern";

  const lighting = lum > 0.58 ? "bright" : lum > 0.4 ? "medium" : "low";
  const lightingLabel =
    lighting === "bright" ? "Хорошее естественное" : lighting === "medium" ? "Умеренное" : "Недостаточное";

  const areaSqm = 12 + (hash % 11); // 12–22 m²
  const w = Math.round(Math.sqrt(areaSqm * 1.3) * 10) / 10;
  const l = Math.round((areaSqm / w) * 10) / 10;

  return {
    detectedStyle,
    colors,
    colorNames: [...new Set(colors.map(colorName))],
    lighting,
    lightingLabel,
    areaSqm,
    dimensions: `≈ ${String(w).replace(".", ",")} × ${String(l).replace(".", ",")} м`,
    confidence: 82 + (hash % 14),
  };
}
