import { useEffect, useRef, useState } from "react";
import { searchCities, type GeoResult } from "@/lib/weather";

type Props = { onSelect: (city: GeoResult) => void; current: string };

export function CitySearch({ onSelect, current }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoResult[]>([]);
  const [open, setOpen] = useState(false);
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

  return (
    <div ref={boxRef} className="relative">
      <div className="flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-semibold text-deep shadow-sm shadow-sunset/20">
        <span className="text-base">📍</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder={current}
          aria-label="Şehir ara"
          className="w-32 bg-transparent placeholder:text-deep/60 focus:outline-none sm:w-44"
        />
      </div>
      {open && results.length > 0 && (
        <ul className="absolute right-0 z-30 mt-2 w-64 overflow-hidden rounded-2xl bg-white/95 p-1 shadow-2xl shadow-sunset/30 ring-1 ring-white/60 backdrop-blur">
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
  );
}
