import { weatherInfo } from "@/lib/weather";
import type { DayPart, DayPartKey } from "@/lib/dayparts";

type Props = {
  parts: DayPart[];
  active: DayPartKey;
  onSelect: (key: DayPartKey) => void;
  dayLabel: string;
  auto: boolean;
  onToggleAuto: () => void;
};

export function DayParts({ parts, active, onSelect, dayLabel, auto, onToggleAuto }: Props) {
  const activeIndex = Math.max(
    0,
    parts.findIndex((p) => p.key === active),
  );

  return (
    <div className="rounded-[2.5rem] bg-white/75 p-6 shadow-2xl shadow-sunset/40 ring-1 ring-white/60">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-deep">Gün İçi Geçişler</h2>
          <p className="text-xs font-bold text-deep/50">{dayLabel} · sabah → gece</p>
        </div>
        <button
          onClick={onToggleAuto}
          className="rounded-full bg-sun/25 px-4 py-1.5 text-xs font-bold text-deep transition hover:bg-sun/40"
        >
          {auto ? "⏸ Animasyonu durdur" : "▶ Günü oynat"}
        </button>
      </div>

      <div className="relative mb-5 h-2 overflow-hidden rounded-full bg-sky/15">
        <div
          className="h-full rounded-full bg-gradient-to-r from-sun to-sunset transition-all duration-700 ease-out"
          style={{ width: `${((activeIndex + 1) / parts.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {parts.map((p) => {
          const info = weatherInfo(p.code, p.isDay);
          const isActive = p.key === active;
          return (
            <button
              key={p.key}
              onClick={() => onSelect(p.key)}
              className={`rounded-3xl p-4 text-center transition-all duration-500 ${
                isActive
                  ? "-translate-y-1.5 bg-sun/25 shadow-xl shadow-sunset/30 ring-2 ring-sun/50"
                  : "bg-white/60 hover:-translate-y-1 hover:bg-sun/15"
              }`}
            >
              <p className="text-xs font-bold text-deep/60">
                {p.emojiHint} {p.label}
              </p>
              <div
                className={`my-2 transition-transform duration-500 ${
                  isActive ? "animate-bob text-4xl" : "text-3xl"
                }`}
              >
                {info.emoji}
              </div>
              <p className="font-display text-xl font-semibold text-deep">
                {p.temp === null ? "--°" : `${Math.round(p.temp)}°`}
              </p>
              <p className="mt-1 text-[0.7rem] font-semibold text-deep/50">{info.label}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
