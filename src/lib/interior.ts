// Pure demo selection engine: parses user input and builds furniture/material kits within budget.

export type StyleId = "scandi" | "loft" | "minimal" | "modern";

export const STYLES: { id: StyleId; label: string; hint: string }[] = [
  { id: "scandi", label: "Скандинавский", hint: "Светлое дерево, уют" },
  { id: "loft", label: "Лофт", hint: "Металл, кирпич, кожа" },
  { id: "minimal", label: "Минимализм", hint: "Чистые линии, ничего лишнего" },
  { id: "modern", label: "Современный", hint: "Мягкие формы, акценты" },
];

export const styleLabel = (id: StyleId) => STYLES.find((s) => s.id === id)?.label ?? id;

export type CategoryId =
  | "sofa"
  | "armchair"
  | "coffeeTable"
  | "dining"
  | "chairs"
  | "bed"
  | "wardrobe"
  | "shelf"
  | "rug"
  | "light"
  | "curtains"
  | "floor"
  | "walls";

type StoreId = "kaspi" | "leroy" | "wb" | "ozon" | "lazurit" | "askona";

export const STORES: Record<StoreId, { name: string; search: string }> = {
  kaspi: { name: "Kaspi Магазин", search: "https://kaspi.kz/shop/search/?text=" },
  leroy: { name: "Leroy Merlin", search: "https://leroymerlin.kz/search/?q=" },
  wb: { name: "Wildberries", search: "https://www.wildberries.kz/catalog/0/search.aspx?search=" },
  ozon: { name: "Ozon", search: "https://ozon.kz/search/?text=" },
  lazurit: { name: "Lazurit", search: "https://www.lazurit.com/search/?q=" },
  askona: { name: "Askona", search: "https://www.askona.kz/search/?q=" },
};

interface CategoryDef {
  label: string;
  /** Price tiers in ₸; for per-m² categories this is the price per m². */
  tiers: [number, number, number];
  perSqm?: "floor" | "walls";
  stores: StoreId[];
  names: Record<StyleId, [string, string, string]>;
  keywords: string[];
  priority: number; // lower = more important to keep
}

export const CATEGORIES: Record<CategoryId, CategoryDef> = {
  sofa: {
    label: "Диван",
    tiers: [89990, 169990, 289990],
    stores: ["kaspi", "lazurit", "askona"],
    keywords: ["диван", "софа"],
    priority: 1,
    names: {
      scandi: ["Диван «Осло» 3-местный", "Диван «Берген» с оттоманкой", "Диван «Нордик» модульный"],
      loft: ["Диван «Бруклин» экокожа", "Диван «Честер» на металлических ножках", "Диван «Сохо» кожаный"],
      minimal: ["Диван «Линия» прямой", "Диван «Куб» с низкой спинкой", "Диван «Монолит» модульный"],
      modern: ["Диван «Флоу» велюр", "Диван «Облако» угловой", "Диван «Милан» с подушками"],
    },
  },
  armchair: {
    label: "Кресло",
    tiers: [39990, 74990, 129990],
    stores: ["kaspi", "wb", "lazurit"],
    keywords: ["кресл"],
    priority: 4,
    names: {
      scandi: ["Кресло «Хюгге» рогожка", "Кресло «Фьорд» с подлокотниками", "Кресло-качалка «Тромсё»"],
      loft: ["Кресло «Индастриал» экокожа", "Кресло «Гарлем» на стальной раме", "Кресло «Клаб» кожаное"],
      minimal: ["Кресло «Форма» без подлокотников", "Кресло «Плато»", "Кресло «Дзен» лаунж"],
      modern: ["Кресло «Ракушка» букле", "Кресло «Тедди» велюр", "Кресло «Рим» поворотное"],
    },
  },
  coffeeTable: {
    label: "Журнальный стол",
    tiers: [14990, 32990, 64990],
    stores: ["kaspi", "ozon", "lazurit"],
    keywords: ["журнальн", "кофейн", "столик"],
    priority: 5,
    names: {
      scandi: ["Столик «Лунд» из берёзы", "Стол журнальный «Сага» дуб", "Стол «Нурланд» с полкой"],
      loft: ["Столик «Ферро» металл + дерево", "Стол «Цех» на колёсах", "Стол «Слэб» из массива"],
      minimal: ["Столик «Круг» белый", "Стол «Стекло» прозрачный", "Стол «Монолит» шпон"],
      modern: ["Столик «Галька» овальный", "Стол «Мрамор» с золотыми ножками", "Набор столиков «Дуэт»"],
    },
  },
  dining: {
    label: "Обеденный стол",
    tiers: [49990, 99990, 179990],
    stores: ["lazurit", "kaspi", "ozon"],
    keywords: ["обеден", "стол", "кухн"],
    priority: 2,
    names: {
      scandi: ["Стол «Упсала» 120×80", "Стол «Хельсинки» раздвижной", "Стол «Тур» массив дуба"],
      loft: ["Стол «Мастерская» 140×80", "Стол «Брикс» на металлокаркасе", "Стол «Слэб» карагач"],
      minimal: ["Стол «Белый лист» 120×75", "Стол «Ось» раздвижной", "Стол «Керамика» 160×90"],
      modern: ["Стол «Лофтон» круглый", "Стол «Аура» с керамикой", "Стол «Верона» мраморный"],
    },
  },
  chairs: {
    label: "Стулья (2 шт.)",
    tiers: [24990, 49990, 89990],
    stores: ["kaspi", "wb", "ozon"],
    keywords: ["стул"],
    priority: 3,
    names: {
      scandi: ["Стулья «Эймс» белые", "Стулья «Виндзор» бук", "Стулья «Ведэ» с мягким сиденьем"],
      loft: ["Стулья «Толикс» металл", "Стулья «Бар-ло» экокожа", "Стулья «Ковбой» кожа"],
      minimal: ["Стулья «Прут» чёрные", "Стулья «Пластика» матовые", "Стулья «Мона» шпон"],
      modern: ["Стулья «Сиена» велюр", "Стулья «Раунд» букле", "Стулья «Флоренция»"],
    },
  },
  bed: {
    label: "Кровать",
    tiers: [79990, 149990, 259990],
    stores: ["askona", "lazurit", "kaspi"],
    keywords: ["кроват", "спальн", "матрас"],
    priority: 1,
    names: {
      scandi: ["Кровать «Кальмар» 160×200", "Кровать «Ниора» с мягким изголовьем", "Кровать «Фрея» массив"],
      loft: ["Кровать «Стил» металлическая 160×200", "Кровать «Доки» экокожа", "Кровать «Гранж» с подсветкой"],
      minimal: ["Кровать «Платформа» 160×200", "Кровать «Тень» парящая", "Кровать «Лаконика» с ящиками"],
      modern: ["Кровать «Велюр» с каретной стяжкой", "Кровать «Сония» с подъёмным механизмом", "Кровать «Ривьера»"],
    },
  },
  wardrobe: {
    label: "Шкаф",
    tiers: [69990, 129990, 229990],
    stores: ["lazurit", "kaspi", "leroy"],
    keywords: ["шкаф", "гардероб", "хранен"],
    priority: 3,
    names: {
      scandi: ["Шкаф «Рамма» 2-дверный", "Шкаф-купе «Сканди» 160 см", "Шкаф «Тюльпан» с зеркалом"],
      loft: ["Шкаф «Цех» металлокаркас", "Шкаф-купе «Графит» 180 см", "Гардероб «Лофт-Систем»"],
      minimal: ["Шкаф «Белая стена» без ручек", "Шкаф-купе «Ультра» 200 см", "Встроенный шкаф «Ниша»"],
      modern: ["Шкаф «Аврора» 3-дверный", "Шкаф-купе «Глянец» 200 см", "Гардероб «Премьер» с подсветкой"],
    },
  },
  shelf: {
    label: "Стеллаж",
    tiers: [19990, 39990, 74990],
    stores: ["leroy", "kaspi", "wb"],
    keywords: ["стеллаж", "полк", "книж"],
    priority: 6,
    names: {
      scandi: ["Стеллаж «Каллакс» 4×2", "Стеллаж «Лестница» дуб", "Стеллаж «Билли» с дверцами"],
      loft: ["Стеллаж «Труба» металл + доска", "Стеллаж «Склад» 5 полок", "Стеллаж «Арсенал» массив"],
      minimal: ["Полки «Невидимка» 3 шт.", "Стеллаж «Сетка» белый", "Стеллаж «Модуль» встроенный"],
      modern: ["Стеллаж «Соты»", "Стеллаж «Арка» с подсветкой", "Стеллаж-перегородка «Ритм»"],
    },
  },
  rug: {
    label: "Ковёр",
    tiers: [12990, 29990, 59990],
    stores: ["wb", "ozon", "kaspi"],
    keywords: ["ковёр", "ковер", "палас"],
    priority: 7,
    names: {
      scandi: ["Ковёр «Скандия» 160×230", "Ковёр «Берберы» шерстяной", "Ковёр «Хюгге» ручной работы"],
      loft: ["Ковёр «Винтаж» потёртый 160×230", "Ковёр «Индиго» джут", "Ковёр «Персия» состаренный"],
      minimal: ["Ковёр «Гладь» однотонный", "Ковёр «Шёлк» короткий ворс", "Ковёр «Линия» шерсть"],
      modern: ["Ковёр «Волна» 160×230", "Ковёр «Абстракция»", "Ковёр «Букле» мягкий"],
    },
  },
  light: {
    label: "Освещение",
    tiers: [9990, 24990, 49990],
    stores: ["leroy", "kaspi", "ozon"],
    keywords: ["свет", "люстр", "ламп", "торшер", "светильник"],
    priority: 4,
    names: {
      scandi: ["Подвесной светильник «Норд»", "Торшер «Дерево и лён»", "Люстра «Купол» плетёная"],
      loft: ["Светильник «Эдисон» 3 лампы", "Трековые споты «Цех»", "Люстра «Паук» 8 плафонов"],
      minimal: ["Светильник «Диск» LED", "Трековая система «Ось»", "Линейный светильник «Тонкий»"],
      modern: ["Люстра «Сферы» латунь", "Торшер «Арка»", "Люстра «Каскад» LED"],
    },
  },
  curtains: {
    label: "Шторы",
    tiers: [9990, 19990, 39990],
    stores: ["wb", "ozon", "leroy"],
    keywords: ["штор", "занавес", "тюль", "жалюз"],
    priority: 8,
    names: {
      scandi: ["Шторы лён «Натура» 2×260", "Шторы «Утро» + тюль", "Шторы «Сканди» блэкаут"],
      loft: ["Рулонные шторы «Графит»", "Шторы «Канвас» плотные", "Шторы «Бархат» блэкаут"],
      minimal: ["Жалюзи «Белый день»", "Шторы «Воздух» вуаль", "Шторы на электрокарнизе"],
      modern: ["Шторы «Велюр» 2×270", "Шторы «Димаут» с подхватами", "Римские шторы «Комфорт»"],
    },
  },
  floor: {
    label: "Напольное покрытие",
    tiers: [3490, 6990, 12990],
    perSqm: "floor",
    stores: ["leroy", "kaspi", "leroy"],
    keywords: ["пол", "ламинат", "паркет", "плитк", "линолеум", "покрыти"],
    priority: 2,
    names: {
      scandi: ["Ламинат «Дуб беленый» 33 кл.", "Кварцвинил «Северный дуб»", "Инженерная доска «Ясень натур»"],
      loft: ["Ламинат «Дуб состаренный» 33 кл.", "Кварцвинил «Бетон»", "Паркетная доска «Дуб копчёный»"],
      minimal: ["Ламинат «Светлый серый» 32 кл.", "Кварцвинил «Микроцемент»", "Керамогранит «Монолит» 60×120"],
      modern: ["Ламинат «Дуб медовый» 33 кл.", "Кварцвинил «Ёлочка»", "Паркет «Французская ёлка»"],
    },
  },
  walls: {
    label: "Отделка стен",
    tiers: [890, 1890, 3990],
    perSqm: "walls",
    stores: ["leroy", "leroy", "kaspi"],
    keywords: ["стен", "обои", "краск", "покрас", "отделк"],
    priority: 3,
    names: {
      scandi: ["Краска интерьерная «Молочный» матовая", "Обои флизелиновые «Лён»", "Краска Tikkurila «Тёплый белый»"],
      loft: ["Декоративная штукатурка «Бетон»", "Гибкий кирпич «Красный»", "Панели «Кирпич ручной формовки»"],
      minimal: ["Краска «Белый шёлк» моющаяся", "Обои под покраску «Гладь»", "Микроцемент для стен"],
      modern: ["Краска «Шалфей» глубокоматовая", "Обои «Текстиль» с тиснением", "Рейки декоративные МДФ"],
    },
  },
};

export const COLORWAYS: Record<StyleId, { name: string; colors: string[]; productColor: string[] }[]> = {
  scandi: [
    { name: "светлая", colors: ["#F4EFE6", "#D9C7A7", "#A8B5A2"], productColor: ["молочный", "светлый дуб", "шалфей"] },
    { name: "тёплая", colors: ["#EADBC8", "#C49A6C", "#8B6F55"], productColor: ["песочный", "орех", "карамель"] },
    { name: "холодная", colors: ["#EEF1F3", "#B8C4CC", "#6E7F8D"], productColor: ["серо-голубой", "берёза", "графит"] },
  ],
  loft: [
    { name: "индустриальная", colors: ["#3A3A3A", "#8C5A3C", "#BFB5A8"], productColor: ["графит", "коньяк", "бетон"] },
    { name: "кирпичная", colors: ["#9C4A32", "#2E2E2E", "#D8CFC4"], productColor: ["терракота", "чёрный", "состаренный дуб"] },
    { name: "мягкая", colors: ["#6B6259", "#C8B8A6", "#4E5B52"], productColor: ["тауп", "бежевый", "оливковый"] },
  ],
  minimal: [
    { name: "белая", colors: ["#FAFAF8", "#E3E1DC", "#1F1F1F"], productColor: ["белый", "светло-серый", "чёрный"] },
    { name: "графитовая", colors: ["#D6D6D3", "#5B5E61", "#2A2B2D"], productColor: ["серый", "графит", "антрацит"] },
    { name: "природная", colors: ["#F1ECE4", "#CBB89D", "#7A7466"], productColor: ["кремовый", "натуральный дуб", "камень"] },
  ],
  modern: [
    { name: "пастельная", colors: ["#F3E9E2", "#D8B4A0", "#8FA89B"], productColor: ["пудровый", "персиковый", "мятный"] },
    { name: "глубокая", colors: ["#1F3A4D", "#C9A66B", "#EDE6DC"], productColor: ["тёмно-синий", "латунь", "айвори"] },
    { name: "терракотовая", colors: ["#C46A4A", "#EBD9C6", "#5E4B3C"], productColor: ["терракотовый", "сливочный", "шоколад"] },
  ],
};

/** "300 000 ₸" -> 300000 */
export function parseBudget(input: string): number {
  const digits = input.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

export function formatTenge(value: number): string {
  return `${Math.round(value).toLocaleString("ru-RU").replace(/\u00a0|,/g, " ")} ₸`;
}

export const DEFAULT_CATEGORIES: CategoryId[] = ["sofa", "floor", "light", "rug"];

/** Detects requested categories from a free-form comment. Falls back to a living-room set. */
export function parseCategories(comment: string): CategoryId[] {
  const text = comment.toLowerCase().replace(/ё/g, "е");
  const found: CategoryId[] = [];
  const ids = Object.keys(CATEGORIES) as CategoryId[];
  // check specific tables before the generic "стол" keyword
  const order: CategoryId[] = ["coffeeTable", ...ids.filter((i) => i !== "coffeeTable")];
  for (const id of order) {
    const kws = CATEGORIES[id].keywords.map((k) => k.replace(/ё/g, "е"));
    if (id === "dining" && found.includes("coffeeTable") && !/обеден|кухн/.test(text)) continue;
    if (kws.some((k) => text.includes(k))) found.push(id);
  }
  return found.length ? ids.filter((i) => found.includes(i)) : DEFAULT_CATEGORIES;
}

export interface KitItem {
  id: string;
  category: CategoryId;
  categoryLabel: string;
  name: string;
  price: number;
  store: string;
  url: string;
  note?: string;
}

export interface Kit {
  id: string;
  title: string;
  tagline: string;
  items: KitItem[];
  total: number;
  skipped: string[];
  explanation: string;
  palette: string[];
}

export interface RoomAnalysis {
  detectedStyle: StyleId;
  colors: string[];
  colorNames: string[];
  lighting: "bright" | "medium" | "low";
  lightingLabel: string;
  areaSqm: number;
  dimensions: string;
  confidence: number;
}

export interface SelectionParams {
  budget: number;
  style: StyleId;
  categories: CategoryId[];
  colorway: number;
  cheaperLevel: number;
  room: Pick<RoomAnalysis, "areaSqm" | "lighting" | "colorNames">;
}

const KIT_PROFILES = [
  { title: "Разумный старт", tagline: "Максимум пользы за минимум денег", share: 0.6 },
  { title: "Золотая середина", tagline: "Баланс цены и качества", share: 0.8 },
  { title: "Комфорт по полной", tagline: "Лучшее, что помещается в бюджет", share: 1 },
];

const roundPrice = (v: number) => Math.max(990, Math.round(v / 1000) * 1000 - 10);

function itemPrice(cat: CategoryId, tier: number, style: StyleId, area: number): number {
  const def = CATEGORIES[cat];
  const styleMult = style === "loft" ? 1.06 : style === "minimal" ? 0.97 : style === "modern" ? 1.03 : 1;
  const base = def.tiers[tier]! * styleMult;
  if (def.perSqm === "floor") return roundPrice(base * Math.ceil(area * 1.08));
  if (def.perSqm === "walls") return roundPrice(base * Math.ceil(area * 2.6));
  return roundPrice(base);
}

function buildItem(
  cat: CategoryId,
  tier: number,
  kitIndex: number,
  p: SelectionParams,
): KitItem {
  const def = CATEGORIES[cat];
  const cw = COLORWAYS[p.style][p.colorway % 3]!;
  const nameIdx = (kitIndex + p.colorway + p.cheaperLevel) % 3;
  const baseName = def.names[p.style][nameIdx]!;
  const color = cw.productColor[(kitIndex + tier + cat.length) % 3]!;
  const storeId = def.stores[(tier + kitIndex) % def.stores.length]!;
  const store = STORES[storeId];
  const area = Math.ceil(def.perSqm === "walls" ? p.room.areaSqm * 2.6 : p.room.areaSqm * 1.08);
  return {
    id: `${cat}-${tier}-${kitIndex}`,
    category: cat,
    categoryLabel: def.label,
    name: `${baseName}, ${color}`,
    price: itemPrice(cat, tier, p.style, p.room.areaSqm),
    store: store.name,
    url: store.search + encodeURIComponent(baseName.replace(/[«»]/g, "")),
    ...(def.perSqm ? { note: `с запасом на ${area} м²` } : {}),
  };
}

function explain(kit: { items: KitItem[] }, kitIndex: number, p: SelectionParams): string {
  const style = styleLabel(p.style).toLowerCase();
  const cw = COLORWAYS[p.style][p.colorway % 3]!;
  const roomColors = p.room.colorNames.slice(0, 3).join(", ");
  const [first, second] = kit.items;
  const leads = [
    `${cw.name[0]!.toUpperCase()}${cw.name.slice(1)} палитра в стиле «${style}» спокойно ложится на цвета вашей комнаты (${roomColors}).`,
    `Оттенки комплекта перекликаются с цветами на фото (${roomColors}), а ${cw.name} палитра сохраняет характер стиля «${style}».`,
    `Для стиля «${style}» мы взяли ${cw.name} палитру — она поддержит тона комнаты (${roomColors}) и добавит глубины.`,
  ];
  const light =
    p.room.lighting === "bright"
      ? "Света в комнате много, поэтому можно смело брать насыщенные фактуры."
      : p.room.lighting === "medium"
        ? "Освещение умеренное — светлые материалы визуально добавят воздуха."
        : "Света немного, поэтому в подборке светлые поверхности и тёплый искусственный свет.";
  const size =
    p.room.areaSqm < 14
      ? `Для компактных ${p.room.areaSqm} м² выбраны вещи без громоздких деталей.`
      : `На ${p.room.areaSqm} м² всё разместится без тесноты.`;
  const pair =
    first && second
      ? ` ${first.categoryLabel} и ${second.categoryLabel.toLowerCase()} подобраны в одной гамме, чтобы смотреться как единый проект.`
      : "";
  const tone = [
    "Акцент на практичных и недорогих в уходе материалах.",
    "Вещи среднего сегмента служат заметно дольше бюджетных аналогов.",
    "Основные предметы — из старшей линейки: лучше материалы, обивка и гарантия.",
  ][kitIndex];
  return `${leads[kitIndex]} ${light} ${size}${pair} ${tone}`;
}

/** Builds three kits; every kit total stays within the budget. */
export function buildKits(p: SelectionParams): Kit[] {
  const cheaperFactor = Math.pow(0.78, p.cheaperLevel);
  const cats = [...p.categories].sort((a, b) => CATEGORIES[a].priority - CATEGORIES[b].priority);

  return KIT_PROFILES.map((profile, kitIndex) => {
    const ceiling = Math.min(p.budget, p.budget * profile.share * cheaperFactor);
    let included = [...cats];
    const tiers = new Map<CategoryId, number>(included.map((c) => [c, 0]));
    const sum = () => included.reduce((s, c) => s + itemPrice(c, tiers.get(c)!, p.style, p.room.areaSqm), 0);

    const skipped: string[] = [];
    // Drop least important categories until the cheapest set fits the budget.
    while (included.length > 1 && sum() > p.budget) {
      const removed = included.pop()!;
      skipped.push(CATEGORIES[removed].label);
    }

    // Upgrade tiers round-robin while staying under the ceiling.
    const maxTier = p.cheaperLevel >= 2 ? 0 : kitIndex === 0 ? 1 : 2;
    let changed = true;
    while (changed) {
      changed = false;
      for (const c of included) {
        const t = tiers.get(c)!;
        if (t >= maxTier) continue;
        tiers.set(c, t + 1);
        if (sum() <= ceiling) changed = true;
        else tiers.set(c, t);
      }
    }

    let items = included.map((c) => buildItem(c, tiers.get(c)!, kitIndex, p));
    // Hard rule: never exceed the budget even for a single expensive category.
    if (items.reduce((s, i) => s + i.price, 0) > p.budget) {
      items = [];
      skipped.push(...included.map((c) => CATEGORIES[c].label));
    }
    const total = items.reduce((s, i) => s + i.price, 0);
    const cw = COLORWAYS[p.style][p.colorway % 3]!;
    return {
      id: `kit-${kitIndex}-${p.style}-${p.colorway}-${p.cheaperLevel}`,
      title: profile.title,
      tagline: profile.tagline,
      items,
      total,
      skipped,
      explanation: explain({ items }, kitIndex, p),
      palette: cw.colors,
    };
  });
}

export const MIN_BUDGET = 30000;
