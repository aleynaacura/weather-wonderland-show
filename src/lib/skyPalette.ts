import { sceneKind } from "@/lib/weather";
import type { DayPartKey } from "@/lib/dayparts";

/**
 * Golden Sky 3D scene palette.
 * Single source of truth for the WebGL sky (three.js needs literal colors,
 * these mirror the CSS tokens in styles.css).
 */
export type SkyPalette = {
  /** background / fog color */
  sky: string;
  /** cloud tint */
  cloud: string;
  /** sun (or moon) body color */
  light: string;
  /** directional light color */
  lightTint: string;
  /** number of cloud puffs */
  cloudCount: number;
  /** cloud opacity 0..1 */
  cloudOpacity: number;
  /** ambient light strength */
  ambient: number;
  /** directional light strength */
  sunIntensity: number;
  stars: boolean;
};

const DAY_SKY: Record<DayPartKey, { sky: string; light: string; lightTint: string }> = {
  morning: { sky: "#ffd9a8", light: "#ffe6a3", lightTint: "#ffc478" },
  noon: { sky: "#8fc9f2", light: "#fff3c4", lightTint: "#fff0bd" },
  evening: { sky: "#f7a86b", light: "#ffcf8a", lightTint: "#ff9d5c" },
  night: { sky: "#2c2b52", light: "#e9ecff", lightTint: "#8b96d8" },
};

export function skyPalette(code: number, part: DayPartKey): SkyPalette {
  const kind = sceneKind(code, part !== "night");
  const base = DAY_SKY[part];
  const night = part === "night";

  let sky = base.sky;
  let cloud = night ? "#8f92bd" : "#fdf6ec";
  let cloudCount = kind === "clear" ? 3 : 6;
  let cloudOpacity = kind === "clear" ? 0.5 : 0.85;
  let ambient = night ? 0.5 : 0.85;
  let sunIntensity = night ? 0.5 : 1.8;

  if (kind === "cloudy") {
    sky = night ? "#3a3960" : mix(base.sky, "#cfd6e6");
    cloud = night ? "#7f83ad" : "#f0eee9";
    cloudCount = 7;
    cloudOpacity = 0.9;
    sunIntensity = night ? 0.45 : 1.2;
  }
  if (kind === "rain") {
    sky = night ? "#2a3049" : "#7f93ad";
    cloud = night ? "#5f6689" : "#b9c2cf";
    cloudCount = 8;
    cloudOpacity = 0.95;
    ambient = night ? 0.4 : 0.6;
    sunIntensity = night ? 0.35 : 0.8;
  }
  if (kind === "snow") {
    sky = night ? "#39415e" : "#c7d8e8";
    cloud = night ? "#8e97b8" : "#f4f7fb";
    cloudCount = 7;
    cloudOpacity = 0.9;
    ambient = night ? 0.5 : 0.95;
    sunIntensity = night ? 0.4 : 0.9;
  }
  if (kind === "storm") {
    sky = night ? "#1e2138" : "#5d6579";
    cloud = night ? "#494f70" : "#8b93a3";
    cloudCount = 9;
    cloudOpacity = 1;
    ambient = 0.4;
    sunIntensity = 0.6;
  }

  return {
    sky,
    cloud,
    light: base.light,
    lightTint: base.lightTint,
    cloudCount,
    cloudOpacity,
    ambient,
    sunIntensity,
    stars: night,
  };
}

function mix(a: string, b: string): string {
  const pa = parse(a);
  const pb = parse(b);
  const c = pa.map((v, i) => Math.round((v + (pb[i] ?? v)) / 2));
  return `#${c.map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function parse(hex: string): number[] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}
