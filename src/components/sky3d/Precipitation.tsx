import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = { kind: "rain" | "snow" | "storm" };

export function Precipitation({ kind }: Props) {
  const points = useRef<THREE.Points>(null);
  const snow = kind === "snow";
  const count = snow ? 420 : kind === "storm" ? 700 : 500;

  const { positions, speeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = Math.random() * 16;
      positions[i * 3 + 2] = -10 + Math.random() * 14;
      speeds[i] = snow ? 0.7 + Math.random() * 0.5 : 9 + Math.random() * 7;
    }
    return { positions, speeds };
  }, [count, snow]);

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((state, raw) => {
    const dt = Math.min(raw, 0.05);
    const attr = points.current?.geometry.getAttribute("position") as
      | THREE.BufferAttribute
      | undefined;
    if (!attr) return;
    const arr = attr.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      arr[i * 3 + 1] = (arr[i * 3 + 1] ?? 0) - (speeds[i] ?? 5) * dt;
      if (snow) arr[i * 3] = (arr[i * 3] ?? 0) + Math.sin(t * 0.8 + i) * 0.01;
      if ((arr[i * 3 + 1] ?? 0) < -3) {
        arr[i * 3 + 1] = 14 + Math.random() * 3;
        arr[i * 3] = (Math.random() - 0.5) * 30;
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={points} geometry={geo}>
      <pointsMaterial
        color={snow ? "#ffffff" : "#dbe7f5"}
        size={snow ? 0.22 : 0.12}
        transparent
        opacity={snow ? 0.95 : 0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}
