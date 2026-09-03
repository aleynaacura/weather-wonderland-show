import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { SkyScene } from "@/components/SkyScene";
import { CityPicker } from "@/components/CityPicker";
import { DayParts } from "@/components/DayParts";
import {
  buildDayParts,
  currentDayPart,
  DAY_PART_KEYS,
  type DayPartKey,
} from "@/lib/dayparts";
import { dayName, fetchForecast, weatherInfo, type GeoResult } from "@/lib/weather";

const SkyScene3D = lazy(() => import("@/components/sky3d/SkyScene3D"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GüneşPusula — 3D Animasyonlu Hava Durumu" },
      {
        name: "description",
        content:
          "Gerçek 3D bulutlar, hareket eden güneş ve sabah-öğlen-akşam-gece geçişleriyle canlı hava durumu. Şehrini seç, anlık, saatlik ve 7 günlük tahmini gör.",
      },
      { property: "og:title", content: "GüneşPusula — 3D Animasyonlu Hava Durumu" },
      {
        property: "og:description",
        content:
          "3D gökyüzü sahnesi, gün içi hava geçişleri ve 7 günlük tahmin. Şehir seçici ile dünyanın her yerinde.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Quicksand:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Index,
});

const DEFAULT_CITY: GeoResult = {
  id: 745044,
  name: "İstanbul",
  country: "TR",
  latitude: 41.0138,
  longitude: 28.9497,
};

const STORAGE_KEY = "gunespusula.city";

const SUN_PHASE: Record<DayPartKey, number> = {
  morning: 0.18,
  noon: 0.52,
  evening: 0.88,
  night: 1.3,
};

function Index() {
  const [city, setCity] = useState<GeoResult>(DEFAULT_CITY);
  const [dayIndex, setDayIndex] = useState(0);
  const [part, setPart] = useState<DayPartKey>("noon");
  const [auto, setAuto] = useState(true);
  const [userPicked, setUserPicked] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCity(JSON.parse(raw) as GeoResult);
    } catch {
      /* ignore */
    }
  }, []);

  function selectCity(next: GeoResult) {
    setCity(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ["forecast", city.latitude, city.longitude],
    queryFn: () => fetchForecast(city.latitude, city.longitude),
    staleTime: 10 * 60 * 1000,
  });

  const code = data?.current.weather_code ?? 0;
  const isDay = data ? data.current.is_day === 1 : true;
  const info = weatherInfo(code, isDay);

  // İlk veri geldiğinde günün gerçek bölümünü seç
  useEffect(() => {
    if (data && !userPicked) setPart(currentDayPart(data.current.is_day === 1));
  }, [data, userPicked]);

  // Otomatik gün animasyonu: sabah → öğlen → akşam → gece
  useEffect(() => {
    if (!auto) return;
    const t = setInterval(() => {
      setPart((p) => {
        const i = DAY_PART_KEYS.indexOf(p);
        return DAY_PART_KEYS[(i + 1) % DAY_PART_KEYS.length] ?? "noon";
      });
    }, 4000);
    return () => clearInterval(t);
  }, [auto]);

  const parts = useMemo(() => buildDayParts(data, dayIndex), [data, dayIndex]);
  const activePart = parts.find((p) => p.key === part) ?? parts[1];
  const sceneCode = activePart?.code ?? code;

  const nowIndex = data
    ? Math.max(
        0,
        data.hourly.time.findIndex((t) => new Date(t).getTime() >= Date.now() - 3600_000),
      )
    : 0;
  const hours = data
    ? data.hourly.time.slice(nowIndex, nowIndex + 5).map((t, i) => ({
        time: t,
        temp: data.hourly.temperature_2m[nowIndex + i],
        code: data.hourly.weather_code[nowIndex + i],
      }))
    : [];

  return (
    <div className="relative min-h-screen overflow-hidden font-body">
      <ClientOnly fallback={<SkyScene code={sceneCode} isDay={part !== "night"} />}>
        <Suspense fallback={<SkyScene code={sceneCode} isDay={part !== "night"} />}>
          <SkyScene3D code={sceneCode} part={part} sunPhase={SUN_PHASE[part]} />
        </Suspense>
      </ClientOnly>

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid size-12 place-items-center rounded-2xl bg-white/70 text-2xl shadow-lg shadow-sunset/30">
              {info.emoji}
            </div>
            <div>
              <h1 className="font-display text-xl font-bold leading-none text-deep">
                GüneşPusula
              </h1>
              <p className="text-xs font-semibold text-deep/60">3D canlı gökyüzü paneli</p>
            </div>
          </div>
          <div className="rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-deep shadow-sm shadow-sunset/20">
            {city.name} · °C
          </div>
        </header>

        <div className="mt-6">
          <CityPicker onSelect={selectCity} current={city} />
        </div>

        {isError && (
          <p className="mt-6 rounded-3xl bg-white/80 p-6 text-center font-semibold text-deep">
            Hava durumu verisi alınamadı. Lütfen tekrar deneyin.
          </p>
        )}

        <main className="mt-6 grid grid-cols-12 gap-6">
          <section className="col-span-12 lg:col-span-7">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-white/75 p-8 shadow-2xl shadow-sunset/40 ring-1 ring-white/60">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-deep/50">
                    Şu an
                  </p>
                  <p className="mt-1 font-display text-2xl font-semibold text-deep">
                    {city.name}
                  </p>
                </div>
                <span className="rounded-full bg-sun/20 px-4 py-1.5 text-sm font-bold text-deep">
                  {isLoading ? "Yükleniyor…" : info.label}
                </span>
              </div>

              <div className="mt-4 flex items-end gap-4">
                <span className="font-display text-7xl font-bold leading-none text-deep drop-shadow-[0_6px_14px_oklch(0.7_0.17_40/0.25)]">
                  {data ? `${Math.round(data.current.temperature_2m)}°` : "--°"}
                </span>
                <span className="mb-2 text-sm font-semibold text-deep/60">
                  {data
                    ? `Hissedilen ${Math.round(data.current.apparent_temperature)}°`
                    : "Hissedilen --°"}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-between gap-6">
                <div className="relative">
                  <div className="animate-rayspin absolute -inset-12 opacity-50">
                    <div className="size-40 rounded-full bg-sun/40 blur-2xl" />
                  </div>
                  <div className="animate-bob relative grid size-24 place-items-center rounded-full bg-sunsoft text-5xl shadow-[0_0_50px_14px_oklch(0.8_0.16_70/0.5)]">
                    {info.emoji}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-sky/15 p-3 text-center">
                      <p className="text-xs font-bold text-deep/50">Nem</p>
                      <p className="font-display text-lg font-semibold text-deep">
                        {data ? `${data.current.relative_humidity_2m}%` : "--"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-sky/15 p-3 text-center">
                      <p className="text-xs font-bold text-deep/50">Rüzgar</p>
                      <p className="font-display text-lg font-semibold text-deep">
                        {data ? `${Math.round(data.current.wind_speed_10m)} km` : "--"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-sky/15 p-3 text-center">
                      <p className="text-xs font-bold text-deep/50">Basınç</p>
                      <p className="font-display text-lg font-semibold text-deep">
                        {data ? Math.round(data.current.pressure_msl) : "--"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="col-span-12 lg:col-span-5">
            <div className="rounded-[2.5rem] bg-white/75 p-6 shadow-2xl shadow-sunset/40 ring-1 ring-white/60">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-deep">Saatlik</h2>
                <span className="text-xs font-bold text-deep/50">Sonraki 5 saat</span>
              </div>
              <div className="mt-5 space-y-3">
                {(hours.length ? hours : Array.from({ length: 5 })).map((h, i) => {
                  const hour = h as { time: string; temp: number; code: number } | undefined;
                  const hi = hour ? weatherInfo(hour.code, isDay) : info;
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                        i === 0 ? "bg-sun/15" : "bg-white/60"
                      }`}
                    >
                      <span
                        className={`text-sm font-bold ${i === 0 ? "text-deep" : "text-deep/70"}`}
                      >
                        {i === 0
                          ? "Şimdi"
                          : hour
                            ? new Date(hour.time).toLocaleTimeString("tr-TR", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "--:--"}
                      </span>
                      <span className="text-2xl">{hi.emoji}</span>
                      <span className="font-display text-lg font-semibold text-deep">
                        {hour ? `${Math.round(hour.temp)}°` : "--°"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="col-span-12">
            <DayParts
              parts={parts}
              active={part}
              onSelect={(k) => {
                setPart(k);
                setUserPicked(true);
                setAuto(false);
              }}
              dayLabel={
                data ? dayName(data.daily.time[dayIndex] ?? "", dayIndex) : "Bugün"
              }
              auto={auto}
              onToggleAuto={() => setAuto((a) => !a)}
            />
          </section>

          <section className="col-span-12">
            <div className="rounded-[2.5rem] bg-white/75 p-6 shadow-2xl shadow-sunset/40 ring-1 ring-white/60">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold text-deep">7 Günlük</h2>
                <span className="rounded-full bg-sky/15 px-3 py-1 text-xs font-bold text-deep">
                  Bir güne dokun, gün içi geçişleri gör
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
                {(data?.daily.time ?? Array.from({ length: 7 })).map((t, i) => {
                  const di = data ? weatherInfo(data.daily.weather_code[i] ?? 0, true) : info;
                  const active = i === dayIndex;
                  return (
                    <button
                      key={i}
                      onClick={() => setDayIndex(i)}
                      className={`rounded-2xl p-4 text-center transition duration-300 hover:-translate-y-1.5 ${
                        active
                          ? "bg-sun/25 ring-2 ring-sun/50"
                          : "bg-white/60 hover:bg-sun/15"
                      }`}
                    >
                      <p className="text-xs font-bold text-deep/50">
                        {data ? dayName(t as string, i) : "--"}
                      </p>
                      <div className="my-3 text-4xl">{di.emoji}</div>
                      <p className="font-display text-lg font-semibold text-deep">
                        {data
                          ? `${Math.round(data.daily.temperature_2m_max[i] ?? 0)}° / ${Math.round(
                              data.daily.temperature_2m_min[i] ?? 0,
                            )}°`
                          : "--° / --°"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-8 text-center text-xs font-semibold text-white/80">
          Veri: Open-Meteo · GüneşPusula
        </footer>
      </div>
    </div>
  );
}
