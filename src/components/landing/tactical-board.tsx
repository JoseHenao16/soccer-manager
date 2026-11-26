/**
 * Pizarra táctica animada (SVG + CSS, sin JS): un 4-3-3 que ataca por la derecha.
 * Los pases se dibujan con stroke-dashoffset y el balón recorre la misma ruta con
 * offset-path; ambos usan la misma duración, así el balón va "pintando" el pase.
 * Con prefers-reduced-motion queda estática (ver globals.css).
 */
const PASS = "M205 150 L330 78 L388 168 L468 150";

const TEAM: [number, number, number][] = [
  // [x, y, retraso de flotación en ms]
  [40, 150, 0], // portero
  [110, 60, 400], [100, 120, 900], [100, 180, 200], [110, 240, 1200], // defensa
  [205, 150, 600], [180, 90, 1500], [180, 210, 300], // medio
  [330, 78, 800], [388, 168, 100], [320, 235, 1100], // ataque
];

const RIVALS: [number, number][] = [
  [440, 150], [410, 105], [405, 200], [360, 120], [350, 190], [290, 150], [280, 90],
];

export function TacticalBoard({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 480 300" className={className} role="img" aria-label="Pizarra táctica animada: jugada de ataque terminada en gol">
      <defs>
        <linearGradient id="turf" x1="0" x2="1">
          <stop offset="0" stopColor="#0f2a1e" />
          <stop offset="1" stopColor="#123222" />
        </linearGradient>
        <pattern id="stripes" width="60" height="300" patternUnits="userSpaceOnUse">
          <rect width="30" height="300" fill="rgb(255 255 255 / 0.025)" />
        </pattern>
        <marker id="arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="#a3e635" />
        </marker>
        <radialGradient id="ballGlow">
          <stop offset="0" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#a3e635" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Cancha */}
      <rect x="0" y="0" width="480" height="300" rx="14" fill="url(#turf)" />
      <rect x="0" y="0" width="480" height="300" rx="14" fill="url(#stripes)" />
      <g fill="none" stroke="rgb(238 243 238 / 0.35)" strokeWidth="1.5">
        <rect x="12" y="12" width="456" height="276" rx="2" />
        <path d="M240 12 V288" />
        <circle cx="240" cy="150" r="38" />
        <rect x="12" y="78" width="66" height="144" />
        <rect x="12" y="116" width="24" height="68" />
        <rect x="402" y="78" width="66" height="144" />
        <rect x="444" y="116" width="24" height="68" />
        <path d="M78 122 A34 34 0 0 1 78 178" />
        <path d="M402 122 A34 34 0 0 0 402 178" />
        <rect x="468" y="128" width="8" height="44" stroke="rgb(238 243 238 / 0.6)" />
      </g>
      <circle cx="240" cy="150" r="2.5" fill="rgb(238 243 238 / 0.5)" />

      {/* Desmarque (flecha punteada estática) */}
      <path d="M320 235 Q 370 230 395 205" fill="none" stroke="#a3e635" strokeOpacity="0.55" strokeWidth="1.6" strokeDasharray="4 5" markerEnd="url(#arrow)" />
      <path d="M180 90 Q 230 60 280 62" fill="none" stroke="#a3e635" strokeOpacity="0.4" strokeWidth="1.6" strokeDasharray="4 5" markerEnd="url(#arrow)" />

      {/* Rivales */}
      <g stroke="rgb(238 243 238 / 0.75)" strokeWidth="2" strokeLinecap="round">
        {RIVALS.map(([x, y]) => (
          <path key={`${x}-${y}`} d={`M${x - 5} ${y - 5} L${x + 5} ${y + 5} M${x + 5} ${y - 5} L${x - 5} ${y + 5}`} />
        ))}
      </g>

      {/* Equipo propio */}
      {TEAM.map(([x, y, delay], i) => (
        <g key={i} className="board-player" style={{ animationDelay: `${delay}ms` }}>
          <circle cx={x} cy={y} r="11" fill="#a3e635" fillOpacity="0.14" />
          <circle cx={x} cy={y} r="6.5" fill="#a3e635" stroke="#050f0a" strokeWidth="1.5" />
        </g>
      ))}

      {/* Jugada: el pase se dibuja y el balón lo recorre */}
      <path
        d={PASS}
        pathLength={1}
        className="board-pass"
        fill="none"
        stroke="#eef3ee"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="468" cy="150" r="10" fill="none" stroke="#a3e635" strokeWidth="2" className="board-ring" />
      <g className="board-ball" style={{ offsetPath: `path("${PASS}")` }}>
        <circle r="10" fill="url(#ballGlow)" />
        <circle r="4.5" fill="#fff" stroke="#050f0a" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
