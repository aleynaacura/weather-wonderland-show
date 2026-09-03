export type GeoResult = {
  id: number;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

export type Forecast = {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    pressure_msl: number;
    is_day: number;
  };
  hourly: { time: string[]; temperature_2m: number[]; weather_code: number[] };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
  };
};

export async function searchCities(query: string): Promise<GeoResult[]> {
  const res = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=tr&format=json`,
  );
  if (!res.ok) throw new Error("Geocoding failed");
  const data = await res.json();
  return (data.results ?? []) as GeoResult[];
}

export async function fetchForecast(lat: number, lon: number): Promise<Forecast> {
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lon),
    current:
      "temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,pressure_msl,is_day",
    hourly: "temperature_2m,weather_code",
    daily: "weather_code,temperature_2m_max,temperature_2m_min",
    timezone: "auto",
    forecast_days: "7",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
  if (!res.ok) throw new Error("Forecast failed");
  return (await res.json()) as Forecast;
}

export type SceneKind = "clear" | "cloudy" | "rain" | "snow" | "storm";

export function sceneKind(code: number, isDay = true): SceneKind {
  if ([95, 96, 99].includes(code)) return "storm";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code))
    return "rain";
  if ([2, 3, 45, 48].includes(code)) return "cloudy";
  return isDay ? "clear" : "clear"; // night handled separately by skyClass
}

export function skyClass(code: number, isDay: boolean): string {
  if (!isDay) return "sky-night";
  const kind = sceneKind(code, isDay);
  if (kind === "storm" || kind === "rain") return "sky-rain";
  if (kind === "snow") return "sky-snow";
  if (kind === "cloudy") return "sky-cloudy";
  return "sky-clear";
}

export function weatherInfo(code: number, isDay = true): { emoji: string; label: string } {
  const map: Record<number, { emoji: string; label: string }> = {
    0: { emoji: isDay ? "☀️" : "🌙", label: isDay ? "Güneşli" : "Açık Gece" },
    1: { emoji: isDay ? "🌤️" : "🌙", label: "Az Bulutlu" },
    2: { emoji: "⛅", label: "Parçalı Bulutlu" },
    3: { emoji: "☁️", label: "Bulutlu" },
    45: { emoji: "🌫️", label: "Sisli" },
    48: { emoji: "🌫️", label: "Sisli" },
    51: { emoji: "🌦️", label: "Hafif Çisenti" },
    53: { emoji: "🌦️", label: "Çisenti" },
    55: { emoji: "🌧️", label: "Yoğun Çisenti" },
    61: { emoji: "🌧️", label: "Hafif Yağmur" },
    63: { emoji: "🌧️", label: "Yağmurlu" },
    65: { emoji: "🌧️", label: "Şiddetli Yağmur" },
    66: { emoji: "🌧️", label: "Dondurucu Yağmur" },
    67: { emoji: "🌧️", label: "Dondurucu Yağmur" },
    71: { emoji: "🌨️", label: "Hafif Kar" },
    73: { emoji: "🌨️", label: "Karlı" },
    75: { emoji: "❄️", label: "Yoğun Kar" },
    77: { emoji: "❄️", label: "Kar Taneleri" },
    80: { emoji: "🌦️", label: "Hafif Sağanak" },
    81: { emoji: "🌧️", label: "Sağanak" },
    82: { emoji: "⛈️", label: "Şiddetli Sağanak" },
    85: { emoji: "🌨️", label: "Kar Sağanağı" },
    86: { emoji: "❄️", label: "Yoğun Kar Sağanağı" },
    95: { emoji: "⛈️", label: "Fırtına" },
    96: { emoji: "⛈️", label: "Dolu Fırtınası" },
    99: { emoji: "⛈️", label: "Şiddetli Dolu" },
  };
  return map[code] ?? { emoji: "🌡️", label: "Bilinmiyor" };
}

const DAY_SHORT = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

export function dayName(iso: string, index: number): string {
  if (index === 0) return "Bugün";
  const d = new Date(iso + "T12:00:00");
  return DAY_SHORT[d.getDay()];
}
