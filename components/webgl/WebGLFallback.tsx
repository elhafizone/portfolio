/**
 * Non-WebGL rendition of the hero object.
 *
 * Used when: WebGL is unavailable, the visitor asked for reduced motion, or the
 * 3D chunk failed to load. It is the same idea - stacked design surfaces with
 * one accent layer - drawn in SVG, so the composition never just disappears.
 */
export function WebGLFallback({ animated = false }: { animated?: boolean }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <svg
        viewBox="0 0 420 420"
        className="h-full w-full max-w-[520px]"
        role="img"
        aria-label="Abstract composition of layered design surfaces with a green accent panel"
      >
        <defs>
          <linearGradient id="panelSheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#f2f2ee" />
          </linearGradient>
          <linearGradient id="accentSheen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8ccb82" />
            <stop offset="100%" stopColor="#5da652" />
          </linearGradient>
          <filter id="panelShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#0d0d0d" floodOpacity="0.07" />
          </filter>
        </defs>

        <g
          filter="url(#panelShadow)"
          className={animated ? 'origin-center [animation:heroFloat_9s_ease-in-out_infinite]' : ''}
        >
          {/* back panel */}
          <rect
            x="96"
            y="60"
            width="230"
            height="150"
            rx="10"
            fill="url(#panelSheen)"
            stroke="#e7e7e1"
            transform="rotate(-9 211 135)"
          />
          {/* accent panel */}
          <rect
            x="112"
            y="130"
            width="230"
            height="150"
            rx="10"
            fill="url(#accentSheen)"
            transform="rotate(-4 227 205)"
          />
          {/* front panel */}
          <rect
            x="80"
            y="200"
            width="230"
            height="150"
            rx="10"
            fill="url(#panelSheen)"
            stroke="#e7e7e1"
            transform="rotate(3 195 275)"
          />
          {/* content lines on the front panel */}
          <g transform="rotate(3 195 275)" opacity="0.5">
            <rect x="104" y="228" width="86" height="6" rx="3" fill="#0d0d0d" opacity="0.5" />
            <rect x="104" y="248" width="150" height="4" rx="2" fill="#0d0d0d" opacity="0.22" />
            <rect x="104" y="262" width="126" height="4" rx="2" fill="#0d0d0d" opacity="0.22" />
            <rect x="104" y="300" width="54" height="18" rx="9" fill="#70ba65" />
          </g>
        </g>

        {/* orbiting accent ring */}
        <ellipse
          cx="210"
          cy="212"
          rx="168"
          ry="62"
          fill="none"
          stroke="#70ba65"
          strokeWidth="1"
          opacity="0.45"
          transform="rotate(-22 210 212)"
        />
        <circle cx="46" cy="164" r="5" fill="#70ba65" />
      </svg>

      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(-6px); }
          50% { transform: translateY(6px); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="heroFloat"], .origin-center { animation: none !important; }
        }
      `}</style>
    </div>
  );
}
