import { describe, expect, it } from "vitest";

import {
  aggregateDailyTotals,
  calculateWaterProgress,
  countDaysMeetingGoal,
  getDateKeyForTimezone,
  normalizeWaterPresets,
} from "@/features/water/waterUtils";

describe("water utils", () => {
  it("builds date_key using timezone", () => {
    const date = new Date("2026-03-04T03:30:00.000Z");
    expect(getDateKeyForTimezone(date, "America/Lima")).toBe("2026-03-03");
  });

  it("aggregates range totals and fills missing days", () => {
    const totals = aggregateDailyTotals(
      [
        { date_key: "2026-03-01", consumed_ml: 250 },
        { date_key: "2026-03-01", consumed_ml: 500 },
        { date_key: "2026-03-03", consumed_ml: 1000 },
      ],
      new Date("2026-03-01T00:00:00"),
      new Date("2026-03-03T00:00:00"),
    );

    expect(totals).toEqual([
      { date_key: "2026-03-01", total_ml: 750 },
      { date_key: "2026-03-02", total_ml: 0 },
      { date_key: "2026-03-03", total_ml: 1000 },
    ]);
  });

  it("computes progress against goal", () => {
    expect(calculateWaterProgress(1000, 2000)).toBe(50);
    expect(calculateWaterProgress(3000, 2000)).toBe(100);
    expect(calculateWaterProgress(500, 0)).toBe(0);
  });

  it("normalizes and deduplicates presets", () => {
    expect(normalizeWaterPresets([500, 250, 500, -1, 0, 12000])).toEqual([250, 500]);
  });

  it("counts met-goal days", () => {
    expect(
      countDaysMeetingGoal(
        [
          { total_ml: 2000 },
          { total_ml: 1800 },
          { total_ml: 2200 },
        ],
        2000,
      ),
    ).toBe(2);
  });
});
