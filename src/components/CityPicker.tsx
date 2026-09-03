import { useEffect, useRef, useState } from "react";
import { searchCities, type GeoResult } from "@/lib/weather";

type Props = { onSelect: (city: GeoResult) => void; current: GeoResult };

const POPULAR: GeoResult[] = [
  { id: 745044, name: "İstanbul", country: "TR", latitude: 41.0138, longitude: 28.9497 },
  { id: 323786, name: "Ankara", country: "TR", latitude: 39.9199, longitude: 32.8543 },
  { id: 311046, name: "İzmir", country: "TR", latitude: 38.4189, longitude: 27.1287 },
  { id: 323777, name: "Antalya", country: "TR", latitude: 36.9081, longitude: 30.6956 },
  { id: 750269, name: "Bursa", country: "TR", latitude: 40.1956, longitude: 29.061 },
  { id: 739566, name: "Trabzon", country: "TR", latitude: 41.0027, longitude: 39.7168 },
];

export function CityPicker({ onSelect, current }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setResults(await searchCities(query.trim()));
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function useMyLocation() {
    if (!("geolocation" in navigator)) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const near = await searchCities("");
          void near;
        } catch {
          /* ignore */
        }
        onSelect({
          id: Date.now(),
          name: "Konumum",
          country: "",
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 },
    );
  }

  return (
    <div
      ref={boxRef}
      className="rounded-[2rem] bg-white/75 p-4 shadow-2xl shadow-sunset/40 ring-1 ring-white/60"
    >
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[14rem]">
          <div className="flex items-center gap-2 rounded-full bg-sky/10 px-4 py-2.5">
            <span className="text-base">🔎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => results.length && setOpen(true)}
              placeholder="Şehir ara (örn. Eskişehir, Paris…)"
              aria-label="Şehir ara"
              className="w-full bg-transparent text-sm font-semibold text-deep placeholder:text-deep/50 focus:outline-none"
            />
          </div>
          {open && results.length > 0 && (
            <ul className="absolute left-0 z-40 mt-2 w-full overflow-hidden rounded-2xl bg-white/95 p-1 shadow-2xl shadow-sunset/30 ring-1 ring-white/60 backdrop-blur">
              {results.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      onSelect(c);
                      setQuery("");
                      setOpen(false);
                    }}
                    className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-deep transition hover:bg-sun/20"
                  >
                    {c.name}
                    <span className="block text-xs font-medium text-deep/50">
                      {[c.admin1, c.country].filter(Boolean).join(", ")}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          onClick={useMyLocation}
          className="rounded-full bg-sun/25 px-4 py-2.5 text-sm font-bold text-deep transition hover:bg-sun/40"
        >
          {locating ? "Bulunuyor…" : "📍 Konumumu kullan"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {POPULAR.map((c) => {
          const active = Math.abs(c.latitude - current.latitude) < 0.05;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                active
                  ? "bg-deep text-white shadow-md shadow-sunset/40"
                  : "bg-white/70 text-deep hover:bg-sun/25"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
