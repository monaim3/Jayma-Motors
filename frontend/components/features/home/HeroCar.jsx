/**
 * Line-art car that assembles as `progress` goes from 0 to 1 (Step 5 §6.1.1).
 * Placeholder for the rendered frame sequence: same stages, drawn as SVG.
 *
 * Timeline (fraction of scroll):
 *   0.00–0.14 chassis · 0.17–0.33 engine & brakes · 0.33–0.50 body panels
 *   0.50–0.67 paint · 0.67–0.83 wheels & alignment · 0.83–0.96 lights on
 */
const clamp = (value) => Math.min(1, Math.max(0, value));
const segment = (progress, start, end) => clamp((progress - start) / (end - start));

/** Draws a path from 0 to 1 using a normalised path length. */
const draw = (t) => ({ strokeDasharray: 1, strokeDashoffset: 1 - t });

const BODY =
  "M70 205 C66 185 72 170 95 164 L205 150 C250 118 300 92 365 86 L470 86 C520 88 560 112 600 140 L700 152 C735 157 748 172 748 192 L748 205 L662 205 A48 48 0 0 0 568 205 L238 205 A48 48 0 0 0 142 205 Z";
const REAR_WINDOW = "M222 150 C262 122 300 102 352 98 L400 98 L400 148 Z";
const FRONT_WINDOW = "M414 98 L468 98 C505 100 540 118 572 144 L414 148 Z";
const WHEELS = [190, 615];

function Wheel({ cx, t }) {
  return (
    <g style={{ opacity: t > 0 ? 1 : 0 }}>
      <circle cx={cx} cy={215} r={42} fill="#0e0e10" fillOpacity={t} />
      <circle cx={cx} cy={215} r={42} pathLength={1} fill="none" stroke="#52525b" strokeWidth={9} style={draw(t)} />
      <circle cx={cx} cy={215} r={24} pathLength={1} fill="none" stroke="#d4d4d8" strokeWidth={3} style={draw(t)} />
      {[0, 72, 144, 216, 288].map((angle) => (
        <line
          key={angle}
          x1={cx}
          y1={215}
          x2={cx + 22 * Math.cos(((angle - 90) * Math.PI) / 180)}
          y2={215 + 22 * Math.sin(((angle - 90) * Math.PI) / 180)}
          stroke="#a1a1aa"
          strokeWidth={2.5}
          strokeLinecap="round"
          opacity={t}
        />
      ))}
      <circle cx={cx} cy={215} r={5} fill="#c42927" opacity={t} />
    </g>
  );
}

export function HeroCar({ progress }) {
  const chassis = segment(progress, 0, 0.14);
  const engine = segment(progress, 0.17, 0.33);
  const body = segment(progress, 0.33, 0.5);
  const paint = segment(progress, 0.5, 0.67);
  const wheels = segment(progress, 0.67, 0.8);
  const align = segment(progress, 0.67, 0.83);
  const lights = segment(progress, 0.83, 0.96);

  // Alignment guides flash in and out during the wheels stage.
  const alignGlow = Math.sin(Math.PI * align);

  return (
    <svg viewBox="50 60 750 220" className="h-auto w-full" role="img" aria-label="A car being assembled and serviced">
      <defs>
        <linearGradient id="hero-paint" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#5d1514" />
          <stop offset="0.45" stopColor="#a2221f" />
          <stop offset="1" stopColor="#c42927" />
        </linearGradient>
        <linearGradient id="hero-sheen" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.45" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="hero-glass" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#3f3f46" />
          <stop offset="1" stopColor="#0e0e10" />
        </linearGradient>
        <linearGradient id="hero-beam" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#fef3c7" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fef3c7" stopOpacity="0" />
        </linearGradient>
        <radialGradient id="hero-shadow">
          <stop offset="0" stopColor="#000000" stopOpacity="0.7" />
          <stop offset="1" stopColor="#000000" stopOpacity="0" />
        </radialGradient>
        <clipPath id="hero-body-clip">
          <path d={BODY} />
        </clipPath>
        <filter id="hero-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Floor */}
      <line x1="20" y1="258" x2="780" y2="258" stroke="#ffffff" strokeOpacity="0.12" />
      <ellipse cx="405" cy="262" rx="340" ry="14" fill="url(#hero-shadow)" opacity={0.3 + 0.5 * paint} />

      {/* Ghost outline so the stage is never empty */}
      <path d={BODY} fill="none" stroke="#ffffff" strokeOpacity={0.07 * (1 - body)} strokeWidth="2" />

      {/* 1 · Chassis */}
      <g stroke="#a1a1aa" strokeWidth="4" strokeLinecap="round" fill="none" opacity={1 - paint}>
        <path d="M120 222 L700 222" pathLength={1} style={draw(chassis)} />
        <path d="M150 232 L670 232" pathLength={1} style={draw(chassis)} />
        {[190, 330, 470, 615].map((x) => (
          <path key={x} d={`M${x} 214 L${x} 236`} pathLength={1} style={draw(chassis)} />
        ))}
      </g>

      {/* 2 · Engine & brakes — the engine drops into place */}
      <g
        style={{
          opacity: engine,
          transform: `translateY(${(1 - engine) * -70}px)`,
        }}
      >
        <rect x="585" y="160" width="96" height="44" rx="6" fill="#18181b" stroke="#d4d4d8" strokeWidth="2.5" />
        {[603, 621, 639, 657].map((x) => (
          <rect key={x} x={x} y="168" width="10" height="16" rx="2" fill="#c42927" />
        ))}
        <path d="M592 194 L674 194" stroke="#71717a" strokeWidth="2" />
      </g>
      {WHEELS.map((cx) => (
        <circle
          key={cx}
          cx={cx}
          cy={215}
          r={27}
          pathLength={1}
          fill="none"
          stroke="#c42927"
          strokeWidth={6}
          style={{ ...draw(engine), opacity: 1 - wheels }}
        />
      ))}

      {/* 3 · Body panels — drawn and settling into place */}
      <g style={{ transform: `translateY(${(1 - body) * -24}px)` }}>
        <path d={BODY} fill="url(#hero-paint)" fillOpacity={paint} />
        <g clipPath="url(#hero-body-clip)" opacity={paint > 0 && paint < 1 ? 1 : 0}>
          <rect x={-260 + paint * 1100} y="60" width="180" height="170" fill="url(#hero-sheen)" />
        </g>
        <path
          d={BODY}
          pathLength={1}
          fill="none"
          stroke="#f4f4f5"
          strokeOpacity={0.85}
          strokeWidth="3"
          strokeLinejoin="round"
          style={draw(body)}
        />
        <path d={REAR_WINDOW} fill="url(#hero-glass)" fillOpacity={paint} />
        <path d={FRONT_WINDOW} fill="url(#hero-glass)" fillOpacity={paint} />
        <path
          d={REAR_WINDOW}
          pathLength={1}
          fill="none"
          stroke="#d4d4d8"
          strokeWidth="2"
          style={draw(segment(progress, 0.4, 0.5))}
        />
        <path
          d={FRONT_WINDOW}
          pathLength={1}
          fill="none"
          stroke="#d4d4d8"
          strokeWidth="2"
          style={draw(segment(progress, 0.4, 0.5))}
        />
        <path d="M407 100 L407 200" stroke="#ffffff" strokeOpacity={0.35 * body} strokeWidth="2" />
        <path d="M100 166 L690 158" stroke="#ffffff" strokeOpacity={0.18 * body} strokeWidth="2" />
        <path
          d="M350 168 L378 167 M440 166 L468 165"
          stroke="#ffffff"
          strokeOpacity={0.5 * body}
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Lights */}
        <path
          d="M712 160 L744 168 L744 178 L708 172 Z"
          fill="#fef3c7"
          fillOpacity={0.15 + 0.85 * lights}
          stroke="#d4d4d8"
          strokeOpacity={body}
        />
        <path
          d="M72 172 L96 168 L96 180 L72 184 Z"
          fill="#c42927"
          fillOpacity={0.3 + 0.7 * lights}
          stroke="#d4d4d8"
          strokeOpacity={body}
        />
      </g>

      {/* 4 · Wheels + alignment guides */}
      {WHEELS.map((cx) => (
        <Wheel key={cx} cx={cx} t={wheels} />
      ))}
      <g opacity={alignGlow} stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 6">
        <line x1="120" y1="258" x2="700" y2="258" />
        {WHEELS.map((cx) => (
          <line key={cx} x1={cx} y1="150" x2={cx} y2="290" />
        ))}
      </g>

      {/* 5 · Ready — headlight beam and glow */}
      <g opacity={lights}>
        <path d="M744 164 L800 140 L800 210 L744 178 Z" fill="url(#hero-beam)" />
        <circle cx="730" cy="169" r="14" fill="#fef3c7" filter="url(#hero-glow)" />
        <circle cx="84" cy="176" r="10" fill="#c42927" filter="url(#hero-glow)" />
      </g>
    </svg>
  );
}
