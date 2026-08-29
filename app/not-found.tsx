import Link from 'next/link';

import { Logo } from '@/components/ui/Logo';
import { profile } from '@/data/profile';

export const metadata = {
  title: 'Page not found',
};

export default function NotFound() {
  return (
    <section className="flex min-h-[100svh] flex-col justify-between pb-12 pt-32">
      <div className="shell">
        <div className="flex items-baseline justify-between border-t border-rule pt-5">
          <span className="label label-marked">Error</span>
          <span className="label numeral text-ink-faint">404</span>
        </div>
      </div>

      <div className="shell">
        <p className="numeral text-[clamp(5rem,18vw,14rem)] font-medium leading-[0.8] tracking-[-0.05em] text-accent">
          404
        </p>
        <h1 className="mt-8 text-[clamp(2rem,5vw,3.5rem)] font-medium leading-[1.02] tracking-[-0.04em]">
          This page doesn&rsquo;t exist.
        </h1>
        <p className="lead mt-5 max-w-md">
          The link may be out of date, or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-9 inline-flex items-center gap-3 rounded-full bg-ink px-7 py-4 text-[0.9375rem] font-medium text-white transition-colors duration-500 hover:bg-accent-deep"
        >
          Back to the homepage
          <span aria-hidden="true">&#8599;</span>
        </Link>
      </div>

      <div className="shell">
        <div className="flex items-center justify-between gap-6 border-t border-rule pt-5">
          <Logo height={26} />
          <span className="label">{profile.role}</span>
        </div>
      </div>
    </section>
  );
}
