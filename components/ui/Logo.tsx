import Image from 'next/image';

/**
 * Logo asset descriptor.
 *
 * To swap the logo: drop the new file in /public and change `src` + the
 * intrinsic `width`/`height` here. No layout code anywhere else needs editing,
 * and proportions are preserved automatically because only the height is set
 * in CSS.
 */
export const LOGO_ASSET = {
  src: '/logo.png',
  width: 1003,
  height: 589,
  alt: 'Mohammed Al-Hafiz',
} as const;

type LogoProps = {
  /** Rendered height in px. Width follows the intrinsic aspect ratio. */
  height?: number;
  className?: string;
  priority?: boolean;
  /** Decorative usage - when the name is already announced nearby. */
  decorative?: boolean;
};

export function Logo({ height = 34, className, priority, decorative }: LogoProps) {
  const width = Math.round((LOGO_ASSET.width / LOGO_ASSET.height) * height);

  return (
    <Image
      src={LOGO_ASSET.src}
      width={width}
      height={height}
      alt={decorative ? '' : LOGO_ASSET.alt}
      aria-hidden={decorative || undefined}
      priority={priority}
      className={className}
      style={{ height, width: 'auto' }}
      sizes={`${width}px`}
    />
  );
}
