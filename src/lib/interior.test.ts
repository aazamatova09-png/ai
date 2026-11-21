import { describe, expect, it } from "vitest";
import { buildKits, parseBudget, parseCategories, type SelectionParams } from "./interior";

const base: SelectionParams = {
  budget: 300000,
  style: "scandi",
  categories: ["sofa", "floor"],
  colorway: 0,
  cheaperLevel: 0,
  room: { areaSqm: 16, lighting: "bright", colorNames: ["бежевый", "белый"] },
};

describe("interior selection rules", () => {
  it("parses a budget written as «300 000 ₸»", () => {
    expect(parseBudget("300 000 ₸")).toBe(300000);
  });

  it("detects sofa and flooring from the comment", () => {
    expect(parseCategories("нужен диван и напольное покрытие")).toEqual(["sofa", "floor"]);
  });

  it("returns 3 kits and none exceeds the budget", () => {
    for (const budget of [100000, 300000, 800000]) {
      const kits = buildKits({ ...base, budget, categories: ["sofa", "floor", "light", "rug", "armchair"] });
      expect(kits).toHaveLength(3);
      for (const k of kits) expect(k.total).toBeLessThanOrEqual(budget);
    }
  });

  it("«Сделать дешевле» lowers the most expensive kit total", () => {
    const before = Math.max(...buildKits(base).map((k) => k.total));
    const after = Math.max(...buildKits({ ...base, cheaperLevel: 1 }).map((k) => k.total));
    expect(after).toBeLessThan(before);
  });

  it("«Другой стиль / цвет» changes the products", () => {
    const a = buildKits(base)[1]!.items.map((i) => i.name);
    const b = buildKits({ ...base, style: "loft", colorway: 1 })[1]!.items.map((i) => i.name);
    expect(b).not.toEqual(a);
  });
});
