import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Cloud, Clouds } from "@react-three/drei";
import * as THREE from "three";

type Props = { color: string; opacity: number; count: number };

const SPREAD = 34;

export function CloudLayer({ color, opacity, count }: Props) {
  const group = useRef<THREE.Group>(null);
  const target = useRef(new THREE.Color(color));
  target.current.set(color);

  const puffs = useMemo(
    () =>
      Array.from({ length: 9 }).map((_, i) => ({
        seed: i + 1,
        x: -SPREAD / 2 + ((i * 7.3) % SPREAD),
        y: 1.5 + ((i * 2.7) % 5),
        z: -14 + ((i * 5.1) % 12),
        scale: 0.8 + ((i * 0.37) % 0.9),
        speed: 0.35 + ((i * 0.13) % 0.5),
      })),
    [],
  );

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    const g = group.current;
    if (!g) return;
    for (const child of g.children) {
      const speed = (child.userData['speed'] as number) ?? 0.4;
      child.position.x += speed * dt;
      if (child.position.x > SPREAD / 2) child.position.x -= SPREAD;
    }
  });

  return (
    <group ref={group}>
      <Clouds material={THREE.MeshLambertMaterial} limit={500}>
        {puffs.slice(0, Math.max(3, count)).map((p) => (
          <Cloud
            key={p.seed}
            seed={p.seed}
            bounds={[5, 1.2, 1.6]}
            volume={5.5}
            segments={16}
            color={color}
            opacity={opacity}
            fade={26}
            growth={2.5}
            speed={0.14}
            position={[p.x, p.y, p.z]}
            scale={p.scale}
            userData={{ speed: p.speed }}
          />
        ))}
      </Clouds>
    </group>
  );
}
