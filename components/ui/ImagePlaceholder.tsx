import { formatSize } from '@/data/images';

type Props = {
  /** Printed on the plate. Matches a row in data/images.ts. */
  slot: number;
  width: number;
  height: number;
  ratio: string;
  /** Optional one-line hint about what belongs here. */
  hint?: string;
  className?: string;
};

/**
 * Numbered image placeholder.
 *
 * Shown wherever an image slot has no file yet. It states its slot number and
 * the exact pixel size the asset should be, so the page itself is the brief -
 * no separate spec document to fall out of date. It never pretends to be
 * artwork; it reads as an empty slot on purpose.
 */
export function ImagePlaceholder({ slot, width, height, ratio, hint, className = '' }: Props) {
  const number = String(slot).padStart(2, '0');

  return (
    <div
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-surface ${className}`}
      role="img"
      aria-label={`Image slot ${number}, awaiting artwork at ${formatSize(width, height)} pixels`}
    >
      {/* fine grid, same language as the About identity plate */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--rule) 1px, transparent 1px), linear-gradient(to bottom, var(--rule) 1px, transparent 1px)',
          backgroundSize: '12.5% 16.6667%',
        }}
      />

      {/* diagonals, so an empty slot never reads as a broken image */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line x1="0" y1="0" x2="100" y2="100" stroke="var(--rule)" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
        <line x1="100" y1="0" x2="0" y2="100" stroke="var(--rule)" strokeWidth="0.2" vectorEffect="non-scaling-stroke" />
      </svg>

      <span
        aria-hidden="true"
        className="numeral relative select-none text-[clamp(3.5rem,11vw,8rem)] font-medium leading-none tracking-[-0.05em] text-ink-faint/60"
      >
        {number}
      </span>

      <span
        aria-hidden="true"
        className="label absolute left-4 top-4 flex items-center gap-2 text-[0.5625rem] text-ink-mute"
      >
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        Image {number}
      </span>

      <span
        aria-hidden="true"
        className="label numeral absolute bottom-4 left-4 text-[0.5625rem] text-ink-mute"
      >
        {formatSize(width, height)}
      </span>

      <span
        aria-hidden="true"
        className="label absolute bottom-4 right-4 text-[0.5625rem] text-ink-faint"
      >
        {ratio}
      </span>

      {hint && (
        <span
          aria-hidden="true"
          className="absolute inset-x-4 top-1/2 mt-[clamp(2rem,6vw,4.5rem)] text-center text-[0.75rem] leading-snug text-ink-faint"
        >
          {hint}
        </span>
      )}
    </div>
  );
}
