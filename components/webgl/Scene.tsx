'use client';

import { Canvas } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';

import { AbstractObject } from '@/components/webgl/AbstractObject';
import { WEBGL } from '@/config/motion';

/**
 * WebGL stage for the hero object.
 *
 * Guard rails, in order of importance:
 *  - DPR is capped, so a 3x retina display does not render 9x the pixels.
 *  - Rendering pauses entirely when the canvas scrolls out of view.
 *  - No environment HDR, no shadows, no post-processing - three lights only.
 *  - An error here is contained by the parent's boundary; the SVG fallback
 *    takes over rather than leaving a hole in the layout.
 */
export default function Scene({ reduced = false }: { reduced?: boolean }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '150px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="h-full w-full" aria-hidden="true">
      <Canvas
        frameloop={visible && !reduced ? 'always' : 'demand'}
        dpr={[WEBGL.minDpr, WEBGL.maxDpr]}
        camera={{ position: [0, 0, 6.4], fov: 34 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={1.15} />
        <directionalLight position={[3, 4, 5]} intensity={1.9} color="#ffffff" />
        <directionalLight position={[-4, -1, 2]} intensity={0.55} color="#a8dc9e" />
        <AbstractObject reduced={reduced} />
      </Canvas>
    </div>
  );
}
