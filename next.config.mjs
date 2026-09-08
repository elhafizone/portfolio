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
};

export default nextConfig;
