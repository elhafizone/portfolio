/**
 * Scroll-linked service visuals.
 *
 * One line-drawing per service, sharing a grid, a stroke weight and a single
 * green accent so the set reads as one system rather than six clip-art icons.
 * Pure inline SVG: no images to load, no WebGL, no layout cost.
 */

const stroke = '#0d0d0d';
const faint = '#d5d5cd';
const accent = '#70ba65';

const common = {
  fill: 'none',
  stroke,
  strokeWidth: 1.25,
  vectorEffect: 'non-scaling-stroke' as const,
};

function WebsiteDesign() {
  return (
    <>
      <rect x="60" y="70" width="280" height="200" rx="4" {...common} />
      <line x1="60" y1="104" x2="340" y2="104" {...common} stroke={faint} />
      <rect x="80" y="126" width="118" height="14" rx="2" fill={stroke} opacity="0.85" />
      <rect x="80" y="152" width="164" height="7" rx="2" fill={faint} />
      <rect x="80" y="167" width="140" height="7" rx="2" fill={faint} />
      <rect x="80" y="196" width="70" height="24" rx="12" fill={accent} />
      <rect x="248" y="126" width="72" height="94" rx="3" {...common} stroke={faint} />
      <circle cx="76" cy="87" r="3.5" fill={accent} />
      <circle cx="90" cy="87" r="3.5" fill={faint} />
    </>
  );
}

function WordPressDevelopment() {
  return (
    <>
      <rect x="76" y="92" width="248" height="52" rx="4" {...common} />
      <rect x="76" y="158" width="248" height="52" rx="4" {...common} stroke={accent} />
      <rect x="76" y="224" width="248" height="52" rx="4" {...common} />
      <line x1="100" y1="118" x2="176" y2="118" {...common} stroke={faint} strokeWidth="6" />
      <line x1="100" y1="184" x2="208" y2="184" stroke={accent} strokeWidth="6" strokeLinecap="round" />
      <line x1="100" y1="250" x2="150" y2="250" {...common} stroke={faint} strokeWidth="6" />
      <path d="M292 108 L308 118 L292 128" {...common} strokeLinecap="round" />
      <path d="M292 240 L308 250 L292 260" {...common} strokeLinecap="round" />
    </>
  );
}

function CustomWordPress() {
  return (
    <>
      <rect x="70" y="86" width="118" height="86" rx="4" {...common} />
      <rect x="204" y="86" width="118" height="86" rx="4" {...common} stroke={faint} />
      <rect x="70" y="190" width="118" height="86" rx="4" {...common} stroke={faint} />
      <rect x="216" y="202" width="118" height="86" rx="4" fill={accent} opacity="0.16" />
      <rect x="216" y="202" width="118" height="86" rx="4" {...common} stroke={accent} />
      <line x1="204" y1="188" x2="216" y2="202" {...common} stroke={accent} strokeDasharray="4 4" />
      <circle cx="129" cy="129" r="5" fill={stroke} />
    </>
  );
}

function WooCommerce() {
  return (
    <>
      <rect x="66" y="82" width="88" height="88" rx="4" {...common} />
      <rect x="166" y="82" width="88" height="88" rx="4" {...common} stroke={faint} />
      <rect x="266" y="82" width="68" height="88" rx="4" {...common} stroke={faint} />
      <rect x="66" y="186" width="88" height="10" rx="3" fill={faint} />
      <rect x="166" y="186" width="60" height="10" rx="3" fill={faint} />
      <path
        d="M92 236 h188 l-14 54 h-160 z"
        fill={accent}
        opacity="0.14"
      />
      <path d="M92 236 h188 l-14 54 h-160 z" {...common} stroke={accent} />
      <path d="M120 236 v-18 a26 26 0 0 1 52 0 v18" {...common} />
      <circle cx="123" cy="304" r="6" fill={accent} />
      <circle cx="249" cy="304" r="6" fill={accent} />
    </>
  );
}

function CreativeDesign() {
  return (
    <>
      <circle cx="160" cy="160" r="76" {...common} />
      <circle cx="238" cy="196" r="76" {...common} stroke={accent} />
      <circle cx="180" cy="248" r="52" {...common} stroke={faint} />
      <path d="M120 300 h160" {...common} strokeWidth="6" stroke={faint} />
      <rect x="120" y="76" width="46" height="46" rx="3" fill={accent} opacity="0.2" />
      <circle cx="299" cy="110" r="7" fill={accent} />
    </>
  );
}

function ResponsiveDesign() {
  return (
    <>
      <rect x="52" y="94" width="188" height="132" rx="4" {...common} />
      <line x1="52" y1="120" x2="240" y2="120" {...common} stroke={faint} />
      <rect x="252" y="118" width="86" height="120" rx="4" {...common} stroke={faint} />
      <rect x="252" y="250" width="52" height="76" rx="6" {...common} stroke={accent} />
      <rect x="262" y="266" width="32" height="42" rx="2" fill={accent} opacity="0.2" />
      <line x1="76" y1="152" x2="180" y2="152" {...common} strokeWidth="6" stroke={faint} />
      <line x1="76" y1="176" x2="140" y2="176" {...common} strokeWidth="6" stroke={faint} />
      <rect x="76" y="196" width="56" height="16" rx="8" fill={accent} />
      <path d="M120 268 h-44 m0 0 l12 -10 m-12 10 l12 10" {...common} strokeLinecap="round" />
    </>
  );
}

const VISUALS = [
  WebsiteDesign,
  WordPressDevelopment,
  CustomWordPress,
  WooCommerce,
  CreativeDesign,
  ResponsiveDesign,
];

export function ServiceVisual({ index, active }: { index: number; active: boolean }) {
  const Shape = VISUALS[index % VISUALS.length];

  return (
    <svg
      viewBox="0 0 400 380"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full transition-[opacity,transform] duration-[700ms] ease-editorial"
      style={{
        opacity: active ? 1 : 0,
        transform: active ? 'scale(1) translateY(0)' : 'scale(0.96) translateY(12px)',
      }}
    >
      <Shape />
    </svg>
  );
}

export const SERVICE_VISUAL_COUNT = VISUALS.length;
