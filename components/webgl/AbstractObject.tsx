'use client';

import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

/**
 * The hero object: stacked design surfaces resolving into one composition.
 *
 * The idea is literal on purpose - layers of design work, one of them the brand
 * green, held together and slowly turning. It reads as design + digital without
 * resorting to a spinning globe or a laptop mockup.
 *
 * Geometry is deliberately cheap: five rounded planes, one ring, no textures,
 * no environment map, no post-processing. It has to be a background detail that
 * costs almost nothing, not a tech demo.
 */

type PanelSpec = {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
  opacity: number;
  accent?: boolean;
};

const PANELS: PanelSpec[] = [
  {
    position: [-0.35, 0.85, -0.75],
    rotation: [0, 0, -0.16],
    scale: [2.05, 1.32, 1],
    color: '#ffffff',
    opacity: 0.94,
  },
  {
    position: [0.24, 0.2, -0.15],
    rotation: [0, 0, -0.07],
    scale: [2.15, 1.38, 1],
    color: '#70ba65',
    opacity: 1,
    accent: true,
  },
  {
    position: [-0.5, -0.62, 0.42],
    rotation: [0, 0, 0.05],
    scale: [2.1, 1.35, 1],
    color: '#ffffff',
    opacity: 0.97,
  },
  {
    position: [0.62, -1.35, 0.95],
    rotation: [0, 0, 0.13],
    scale: [1.25, 0.8, 1],
    color: '#f4f4f0',
    opacity: 0.95,
  },
];

/** Rounded rectangle plane built once and shared by every panel. */
function useRoundedPlane() {
  return useMemo(() => {
    const w = 1;
    const h = 0.62;
    const r = 0.06;
    const shape = new THREE.Shape();
    shape.moveTo(-w + r, -h);
    shape.lineTo(w - r, -h);
    shape.quadraticCurveTo(w, -h, w, -h + r);
    shape.lineTo(w, h - r);
    shape.quadraticCurveTo(w, h, w - r, h);
    shape.lineTo(-w + r, h);
    shape.quadraticCurveTo(-w, h, -w, h - r);
    shape.lineTo(-w, -h + r);
    shape.quadraticCurveTo(-w, -h, -w + r, -h);

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.045,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
      curveSegments: 8,
    });
    geo.center();
    return geo;
  }, []);
}

export function AbstractObject({ reduced = false }: { reduced?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  const geometry = useRoundedPlane();

  const pointer = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;

    if (reduced) {
      // Hold a single considered pose instead of animating.
      g.rotation.set(-0.08, -0.42, 0);
      return;
    }

    const t = state.clock.elapsedTime;

    // Pointer influence is damped hard - this is a drift, not a puppet.
    pointer.current.x += (state.pointer.x - pointer.current.x) * Math.min(1, delta * 2.4);
    pointer.current.y += (state.pointer.y - pointer.current.y) * Math.min(1, delta * 2.4);

    g.rotation.y = -0.35 + Math.sin(t * 0.22) * 0.16 + pointer.current.x * 0.22;
    g.rotation.x = -0.06 + Math.sin(t * 0.3) * 0.07 - pointer.current.y * 0.14;
    g.position.y = Math.sin(t * 0.5) * 0.09;

    if (ring.current) {
      ring.current.rotation.z = t * 0.14;
    }
  });

  return (
    <group ref={group} dispose={null}>
      {PANELS.map((panel, i) => (
        <mesh
          key={i}
          geometry={geometry}
          position={panel.position}
          rotation={panel.rotation}
          scale={panel.scale}
          castShadow={false}
          receiveShadow={false}
        >
          <meshPhysicalMaterial
            color={panel.color}
            roughness={panel.accent ? 0.32 : 0.22}
            metalness={0}
            clearcoat={panel.accent ? 0.5 : 0.85}
            clearcoatRoughness={0.25}
            reflectivity={0.35}
            transparent={panel.opacity < 1}
            opacity={panel.opacity}
          />
        </mesh>
      ))}

      {/* Thin accent ring holding the stack together. */}
      <mesh ref={ring} rotation={[1.28, 0, 0]} position={[0, -0.1, 0]}>
        <torusGeometry args={[2.55, 0.006, 8, 128]} />
        <meshBasicMaterial color="#70ba65" transparent opacity={0.55} />
      </mesh>

      {/* Single accent node on the ring. */}
      <mesh position={[-2.35, 0.62, -0.6]}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshBasicMaterial color="#70ba65" />
      </mesh>
    </group>
  );
}
