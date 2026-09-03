import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import { sceneKind } from "@/lib/weather";
import { skyPalette } from "@/lib/skyPalette";
import type { DayPartKey } from "@/lib/dayparts";
import { CloudLayer } from "./CloudLayer";
import { SunMoon } from "./SunMoon";
import { Precipitation } from "./Precipitation";

type Props = { code: number; part: DayPartKey; sunPhase: number };

function SceneBackground({ color, storm }: { color: string; storm: boolean }) {
  const { scene } = useThree();
  const target = useRef(new THREE.Color(color));
  const flash = useRef(0);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    target.current.set(color);
    if (!(scene.background instanceof THREE.Color)) {
      scene.background = new THREE.Color(color);
    }
    const bg = scene.background as THREE.Color;
    bg.lerp(target.current, 1 - Math.exp(-2.5 * dt));
    if (scene.fog instanceof THREE.Fog) scene.fog.color.copy(bg);

    if (storm) {
      flash.current -= dt;
      if (flash.current <= 0 && Math.random() < 0.008) flash.current = 0.18;
      if (flash.current > 0) bg.lerp(new THREE.Color("#ffffff"), 0.55);
    }
  });

  return null;
}

function Scene({ code, part, sunPhase }: Props) {
  const p = skyPalette(code, part);
  const kind = sceneKind(code, part !== "night");
  const isNight = part === "night";

  return (
    <>
      <SceneBackground color={p.sky} storm={kind === "storm"} />
      <fog attach="fog" args={[p.sky, 16, 46]} />
      <hemisphereLight args={[p.sky, p.cloud, p.ambient]} />
      <ambientLight intensity={p.ambient * 0.6} />
      <SunMoon
        sunPhase={sunPhase}
        light={p.light}
        lightTint={p.lightTint}
        intensity={p.sunIntensity}
        isNight={isNight}
      />
      {p.stars && <Stars radius={60} depth={30} count={900} factor={3} fade speed={0.6} />}
      <CloudLayer color={p.cloud} opacity={p.cloudOpacity} count={p.cloudCount} />
      {(kind === "rain" || kind === "storm" || kind === "snow") && (
        <Precipitation kind={kind} />
      )}
    </>
  );
}

export default function SkyScene3D(props: Props) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.6]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 4, 14], fov: 55 }}
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
}
