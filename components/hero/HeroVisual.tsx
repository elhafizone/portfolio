'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

import { useMotion } from '@/components/motion/MotionProvider';
import { CanvasBoundary } from '@/components/webgl/CanvasBoundary';
import { WebGLFallback } from '@/components/webgl/WebGLFallback';
import { supportsWebGL } from '@/lib/gsap';

/**
 * The 3D bundle is the single heaviest dependency on the page, so it is code
 * split and only requested after mount, once WebGL support is confirmed. The
 * SVG fallback renders immediately and stays as the visual until (and unless)
 * the canvas is ready.
 */
const Scene = dynamic(() => import('@/components/webgl/Scene'), {
  ssr: false,
  loading: () => <WebGLFallback animated />,
});

export function HeroVisual() {
  const { reduced } = useMotion();
  const [canRender, setCanRender] = useState(false);

  useEffect(() => {
    // Deferred one frame so the hero text paints before the 3D work begins.
    const id = window.requestAnimationFrame(() => setCanRender(supportsWebGL()));
    return () => window.cancelAnimationFrame(id);
  }, []);

  if (!canRender) {
    return <WebGLFallback animated={!reduced} />;
  }

  return (
    <CanvasBoundary fallback={<WebGLFallback animated={!reduced} />}>
      <Scene reduced={reduced} />
    </CanvasBoundary>
  );
}
