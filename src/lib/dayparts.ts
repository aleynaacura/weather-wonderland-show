import type { Forecast } from "@/lib/weather";

export type DayPartKey = "morning" | "noon" | "evening" | "night";

export type DayPart = {
  key: DayPartKey;
  label: string;
  emojiHint: string;
  hour: number;
  /** 0 = horizon sunrise, 0.5 = zenith, 1 = horizon sunset, >1 = night */
  sunPhase: number;
  isDay: boolean;
  temp: number | null;
  code: number;
  time: string | null;
};

const DEFS: {
  key: DayPartKey;
  label: string;
  hour: number;
  sunPhase: number;
  isDay: boolean;
  emojiHint: string;
}[] = [
  { key: "morning", label: "Sabah", hour: 8, sunPhase: 0.18, isDay: true, emojiHint: "🌅" },
  { key: "noon", label: "Öğlen", hour: 13, sunPhase: 0.52, isDay: true, emojiHint: "🌞" },
  { key: "evening", label: "Akşam", hour: 19, sunPhase: 0.88, isDay: true, emojiHint: "🌇" },
  { key: "night", label: "Gece", hour: 23, sunPhase: 1.3, isDay: false, emojiHint: "🌙" },
];

export const DAY_PART_KEYS: DayPartKey[] = ["morning", "noon", "evening", "night"];

function hourOf(iso: string): number {
  return Number(iso.slice(11, 13));
}

/** Builds the four day parts for a given day index (0 = today) of the forecast. */
export function buildDayParts(
  data: Forecast | undefined,
  dayIndex: number,
): DayPart[] {
  const dayIso = data?.daily.time[dayIndex];
  return DEFS.map((d) => {
    let temp: number | null = null;
    let code = data?.daily.weather_code[dayIndex] ?? 0;
    let time: string | null = null;
    if (data && dayIso) {
      const idx = data.hourly.time.findIndex(
        (t) => t.slice(0, 10) === dayIso && hourOf(t) === d.hour,
      );
      if (idx >= 0) {
        temp = data.hourly.temperature_2m[idx] ?? null;
        code = data.hourly.weather_code[idx] ?? code;
        time = data.hourly.time[idx] ?? null;
      }
    }
    return { ...d, temp, code, time };
  });
}

/** Which part of the day is it right now (used as the initial selection). */
export function currentDayPart(isDay: boolean): DayPartKey {
  if (!isDay) return "night";
  const h = new Date().getHours();
  if (h < 11) return "morning";
  if (h < 16) return "noon";
  return "evening";
}
