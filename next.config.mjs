/** @type {import('next').NextConfig} */
const nextConfig = {
  /*
    Build output directory, overridable per process.

    `next build` and `next dev` share `.next` by default, so running a
    production build while the dev server is up deletes the chunks that server
    is actively serving — it starts throwing MODULE_NOT_FOUND on every request
    and keeps doing so until it is restarted. Worse, `next start` then serves a
    FROZEN copy of whatever was compiled before it booted, which is how edits
    can appear to have no effect at all.

    `npm run build:prod` / `npm run start:prod` point this at `.next-prod` so the
    two never touch each other's output. The switch reads the npm script name
    rather than an inline `VAR=value` prefix, because that prefix is POSIX shell
    syntax and this is a Windows machine — it would simply fail there.
  */
  distDir:
    process.env.NEXT_DIST_DIR ||
    (['build:prod', 'start:prod'].includes(process.env.npm_lifecycle_event ?? '')
      ? '.next-prod'
      : '.next'),
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600, 1920, 2560],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  async headers() {
    return [
      {
        /*
          Hash-panged build assets: safe to cache forever. MUST be a separate
          rule from the catch-all below, because the catch-all would otherwise
          also match /_next/static/* and strip its immutable caching.
        */
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        /*
          Everything else - above all the prerendered HTML documents. Next's
          default for static pages is `s-maxage=31536000`, which is correct on
          Vercel (the platform purges its edge cache on every deploy) but
          catastrophic behind Hostinger's CDN (hcdn): the CDN keeps serving a
          YEAR-old HTML that references hashed chunks the redeployed server no
          longer contains, every chunk request 404s, and the page dies with
          "Application error: a client-side exception has occurred"
          (ChunkLoadError). HTML must always be revalidated against the origin;
          the ETag makes that a cheap 304.
        */
        source: '/((?!_next/static|_next/image|favicon.ico).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
