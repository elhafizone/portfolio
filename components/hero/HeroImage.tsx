import Image from 'next/image';

import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { getSlot, heroImage, heroImageAlt, heroImageSpec } from '@/data/images';

/**
 * Hero visual slot.
 *
 * Replaces the live WebGL canvas that used to sit here. The canvas measured its
 * own container to size itself, the container was `height: 100%` inside the
 * hero grid, and the two fed each other on every resize - so the cell kept
 * growing downwards during scroll. A fixed aspect ratio makes that impossible:
 * the box's height is derived from its width and nothing inside it can change
 * that.
 *
 * The 3D code is still in `components/webgl/` and `HeroVisual.tsx`; it is just
 * no longer mounted. Reinstating it means restoring it inside a container with
 * fixed dimensions, never a percentage height.
 */
export function HeroImage() {
  const slot = getSlot('hero');

  if (heroImage) {
    return (
      <div
        data-mask-image
        className={`relative w-full overflow-hidden bg-surface ${heroImageSpec.aspectClass}`}
      >
        <Image
          src={heroImage}
          alt={heroImageAlt}
          fill
          priority
          sizes="(min-width: 1280px) 38vw, (min-width: 1024px) 33vw, 92vw"
          className="object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full ${heroImageSpec.aspectClass}`}>
      <ImagePlaceholder
        slot={slot?.slot ?? 1}
        width={heroImageSpec.width}
        height={heroImageSpec.height}
        ratio={heroImageSpec.ratio}
        hint={slot?.label}
      />
    </div>
  );
}
