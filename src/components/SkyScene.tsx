import { sceneKind, skyClass } from "@/lib/weather";

type Props = { code: number; isDay: boolean };

function Cloud({ className, size = 1 }: { className?: string; size?: number }) {
  const s = (n: number) => `${n * size}rem`;
  return (
    <div className={className}>
      <div className="relative">
        <div
          className="rounded-full bg-cloud shadow-[0_18px_40px_-10px_oklch(0.7_0.17_40/0.5)]"
          style={{ width: s(7), height: s(7) }}
        />
        <div
          className="absolute rounded-full bg-cloud"
          style={{ width: s(4), height: s(4), top: s(-1.5), left: s(2) }}
        />
        <div
          className="absolute rounded-full bg-cloud"
          style={{ width: s(3), height: s(3), top: s(-0.75), right: s(-1) }}
        />
      </div>
    </div>
  );
}

function Rain({ heavy = false }: { heavy?: boolean }) {
  const drops = heavy ? 16 : 9;
  return (
    <div className="pointer-events-none absolute inset-x-0 top-40 mx-auto h-40 max-w-3xl">
      {Array.from({ length: drops }).map((_, i) => (
        <span
          key={i}
          className="animate-raindrop absolute h-5 w-1 rounded-full bg-white/60"
          style={{
            left: `${(i * 97) % 100}%`,
            animationDelay: `${(i * 0.17) % 1.5}s`,
          }}
        />
      ))}
    </div>
  );
}

function Snow() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-32 mx-auto h-48 max-w-3xl">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="animate-snowfall absolute size-2 rounded-full bg-white/85"
          style={{
            left: `${(i * 89) % 100}%`,
            animationDelay: `${(i * 0.3) % 3.2}s`,
          }}
        />
      ))}
    </div>
  );
}

export function SkyScene({ code, isDay }: Props) {
  const kind = sceneKind(code, isDay);
  const showSun = isDay && (kind === "clear" || kind === "cloudy");

  return (
    <div
      className={`pointer-events-none absolute inset-0 overflow-hidden ${skyClass(code, isDay)}`}
      aria-hidden="true"
    >
      {showSun && (
        <div className="absolute left-1/2 top-8 -translate-x-1/2">
          <div className="animate-rayspin relative size-64">
            <div className="absolute inset-0 rounded-full bg-sun/40 blur-3xl" />
            <div className="absolute inset-6 rounded-full bg-sun/70 blur-xl" />
            <div className="absolute inset-12 rounded-full bg-sunsoft shadow-[0_0_60px_20px_oklch(0.8_0.16_70/0.55)]" />
          </div>
        </div>
      )}

      {!isDay && (
        <div className="absolute left-1/2 top-10 -translate-x-1/2">
          <div className="animate-bob relative size-40">
            <div className="absolute inset-0 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute inset-10 rounded-full bg-cloud/90 shadow-[0_0_50px_16px_oklch(0.96_0.02_85/0.4)]" />
          </div>
        </div>
      )}

      <Cloud className="animate-floaty absolute left-[6%] top-24" size={1} />
      <Cloud className="animate-floaty-slow absolute right-[8%] top-40" size={1.4} />
      <Cloud className="animate-floaty-slower absolute left-[38%] top-2" size={0.7} />
      {(kind === "cloudy" || kind === "rain" || kind === "snow" || kind === "storm") && (
        <>
          <Cloud className="animate-floaty-slow absolute left-[20%] top-56" size={1.1} />
          <Cloud className="animate-floaty absolute right-[28%] top-16" size={0.9} />
        </>
      )}

      {(kind === "rain" || kind === "storm") && <Rain heavy={kind === "storm"} />}
      {kind === "snow" && <Snow />}
      {kind === "storm" && <div className="animate-flash absolute inset-0 bg-white" />}

      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-deep/30 to-transparent" />
    </div>
  );
}
