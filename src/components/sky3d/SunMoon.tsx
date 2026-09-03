import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

type Props = {
  sunPhase: number;
  light: string;
  lightTint: string;
  intensity: number;
  isNight: boolean;
};

/** Sun (or moon) travelling along an arc, with the matching directional light. */
export function SunMoon({ sunPhase, light, lightTint, intensity, isNight }: Props) {
  const body = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.Mesh>(null);
  const dir = useRef<THREE.DirectionalLight>(null);
  const bodyColor = useRef(new THREE.Color(light));
  const lightColor = useRef(new THREE.Color(lightTint));
  const pos = useRef(new THREE.Vector3(0, 8, -12));
  const t = useRef(0);

  useFrame((_, raw) => {
    const dt = Math.min(raw, 0.05);
    t.current += dt;

    // arc: phase 0 -> east horizon, 0.5 -> zenith, 1 -> west horizon, >1 -> below
    const phase = Math.min(sunPhase, 1.05);
    const a = phase * Math.PI;
    const targetX = -Math.cos(a) * 13;
    const targetY = isNight ? 7.5 : 1 + Math.sin(a) * 9;
    const targetZ = -12;
    pos.current.lerp(new THREE.Vector3(targetX, targetY, targetZ), 1 - Math.exp(-2.2 * dt));

    const bob = Math.sin(t.current * 0.9) * 0.18;
    if (body.current) {
      body.current.position.set(pos.current.x, pos.current.y + bob, pos.current.z);
      body.current.rotation.y += dt * 0.15;
      const m = body.current.material as THREE.MeshBasicMaterial;
      m.color.lerp(bodyColor.current.set(light), 1 - Math.exp(-3 * dt));
    }
    if (glow.current) {
      glow.current.position.copy(body.current?.position ?? pos.current);
      const gm = glow.current.material as THREE.MeshBasicMaterial;
      gm.color.lerp(bodyColor.current, 1 - Math.exp(-3 * dt));
      gm.opacity = isNight ? 0.16 : 0.26;
      const pulse = 1 + Math.sin(t.current * 1.4) * 0.04;
      glow.current.scale.setScalar(pulse);
    }
    if (dir.current) {
      dir.current.position.set(pos.current.x, Math.max(pos.current.y, 2), 6);
      dir.current.color.lerp(lightColor.current.set(lightTint), 1 - Math.exp(-3 * dt));
      dir.current.intensity += (intensity - dir.current.intensity) * (1 - Math.exp(-3 * dt));
    }
  });

  return (
    <>
      <mesh ref={glow} position={[0, 8, -12]}>
        <sphereGeometry args={[isNight ? 2.6 : 4.2, 24, 24]} />
        <meshBasicMaterial color={light} transparent opacity={0.25} depthWrite={false} />
      </mesh>
      <mesh ref={body} position={[0, 8, -12]}>
        <sphereGeometry args={[isNight ? 1.1 : 1.9, 32, 32]} />
        <meshBasicMaterial color={light} toneMapped={false} />
      </mesh>
      <directionalLight ref={dir} position={[0, 10, 6]} color={lightTint} intensity={intensity} />
    </>
  );
}
