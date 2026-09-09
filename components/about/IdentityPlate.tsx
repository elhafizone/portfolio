import Image from 'next/image';

import { useLocale } from '@/components/i18n/LocaleProvider';
import { Logo } from '@/components/ui/Logo';
import { formatSize, getSlot, portraitImageSpec } from '@/data/images';
import { profile } from '@/data/profile';

/**
 * Stands in for a portrait.
 *
 * No photograph of Mohammed was supplied, and inventing one would be worse than
 * not having one - so the About section gets a typographic identity treatment
 * instead: the real logo, the real name, a fine grid and a single green accent.
 * It carries the image-slot number and required size so it doubles as the brief
 * for the photo that will replace it.
 *
 * Setting `profile.portrait` swaps in the real image with no other changes.
 */
export function IdentityPlate() {
  const { t } = useLocale();
  const slot = getSlot('portrait');

  if (profile.portrait) {
    return (
      <div
        data-mask-image
        className={`relative w-full overflow-hidden bg-surface ${portraitImageSpec.aspectClass}`}
      >
        <Image
          src={profile.portrait.src}
          alt={profile.portrait.alt}
          fill
          sizes="(min-width: 1024px) 40vw, 92vw"
          className="object-cover"
        />
        <p
          className="absolute bottom-0 end-0 m-3 rounded-sm bg-surface/85 px-2.5 py-1 text-[0.625rem] leading-none text-ink-mute backdrop-blur-sm"
        >
          {t.about.portraitNote}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden border border-rule bg-surface ${portraitImageSpec.aspectClass}`}
    >
      {/* fine grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            'linear-gradient(to right, var(--rule) 1px, transparent 1px), linear-gradient(to bottom, var(--rule) 1px, transparent 1px)',
          backgroundSize: '14.2857% 11.1111%',
        }}
      />

      {/* accent field */}
      <div
        aria-hidden="true"
        className="absolute -right-16 -top-16 h-56 w-56 rounded-full"
        style={{ background: 'var(--accent-wash)' }}
      />

      <div className="relative flex h-full flex-col justify-between p-7 sm:p-9">
        <div className="flex items-start justify-between">
          <Logo height={40} />
          {slot && (
            <span className="label flex items-center gap-2 text-[0.5625rem] text-ink-mute">
              <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
              {t.about.imageSlot} {String(slot.slot).padStart(2, '0')}
            </span>
          )}
        </div>

        <div>
          <span aria-hidden="true" className="mb-6 block h-2.5 w-2.5 rounded-full bg-accent" />
          <p className="text-[clamp(1.75rem,4.4vw,2.75rem)] font-medium leading-[0.98] tracking-[-0.04em]">
            {t.identity.name}
          </p>
          <p className="mt-3 text-[0.9375rem] leading-snug text-ink-body">{t.identity.role}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-rule pt-5">
            {t.identity.plateFacts.map((fact) => (
              <span key={fact} className="label">
                {fact}
              </span>
            ))}
            <span className="label numeral text-ink-faint ms-auto">
              {formatSize(portraitImageSpec.width, portraitImageSpec.height)} &middot;{' '}
              {portraitImageSpec.ratio}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
