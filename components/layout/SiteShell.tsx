'use client';

import dynamic from 'next/dynamic';
import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

import { Footer } from '@/components/layout/Footer';
import { Navbar } from '@/components/layout/Navbar';
import { MotionProvider } from '@/components/motion/MotionProvider';
import { OriCompanion } from '@/components/ori/OriCompanion';
import { Cursor } from '@/components/ui/Cursor';
import { Preloader } from '@/components/ui/Preloader';

/** ORI's guide bubble: its own chunk, fetched only once the intro is done. */
const OriGuide = dynamic(() => import('@/components/ori/OriGuide'), { ssr: false });

/** True once the preloader has finished (or was skipped entirely). */
const IntroContext = createContext(false);
export const useIntroDone = () => useContext(IntroContext);

/**
 * Client shell around the page: smooth scroll, preloader, cursor, chrome.
 *
 * The intro flag gates only the hero's entrance timeline - never the content
 * itself. If the preloader failed and never resolved, the page underneath is
 * still fully rendered, scrollable and readable.
 */
export function SiteShell({ children, oriAi = false }: { children: ReactNode; oriAi?: boolean }) {
  const [introDone, setIntroDone] = useState(false);
  const handleDone = useCallback(() => setIntroDone(true), []);

  return (
    <MotionProvider>
      <IntroContext.Provider value={introDone}>
        <Preloader onDone={handleDone} />
        <Cursor />
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
        <OriCompanion active={introDone} />
        {introDone && <OriGuide aiEnabled={oriAi} />}
      </IntroContext.Provider>
    </MotionProvider>
  );
}
