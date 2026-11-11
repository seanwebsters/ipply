import { useId } from "react";

/**
 * Generative poster-style key art.
 *
 * Every project without an uploaded cover gets an editorial, abstract poster
 * built from a motif + palette + seed. It is deliberately graphic (think
 * screen-printed film posters), not illustrative, so it never pretends to be
 * the creator's own artwork.
 *
 * The canvas is 1600×1000 and composed so the central 800px survives being
 * cropped to portrait (4:5) cards as well as wide heroes.
 */

export const MOTIFS = ["orbit", "horizon", "arch", "tide", "grid", "bloom", "stage", "stack"] as const;
export const PALETTES = ["dawn", "lagoon", "ember", "dusk", "mint", "noir", "blush", "citrus"] as const;
export type Motif = (typeof MOTIFS)[number];
export type PaletteName = (typeof PALETTES)[number];
export type KeyArtSpec = { motif: Motif; palette: PaletteName };

type Palette = { bg: [string, string, string]; a: string; b: string; c: string; ink: string; light: boolean };

export const PALETTE_DEFS: Record<PaletteName, Palette> = {
  dawn: { bg: ["#E9E1FF", "#F7DCEB", "#FFE3CF"], a: "#B9A6FF", b: "#FFB8A1", c: "#9FC3FF", ink: "#2A2140", light: true },
  lagoon: { bg: ["#0C2B3A", "#124659", "#2E7E8C"], a: "#9FE3E0", b: "#F5D9A8", c: "#5FB2C9", ink: "#E8FBFA", light: false },
  ember: { bg: ["#2A0E10", "#5B1A16", "#B4472A"], a: "#FF9F6B", b: "#FFD9A0", c: "#E2603F", ink: "#FFF1E6", light: false },
  dusk: { bg: ["#14163A", "#3B2A6B", "#C4729B"], a: "#FFB3C9", b: "#B9A6FF", c: "#FFD8B8", ink: "#FFF4F8", light: false },
  mint: { bg: ["#E4F1EA", "#CFE6DA", "#A9D2BF"], a: "#2F6E57", b: "#F2C9A8", c: "#6FAF93", ink: "#173A2E", light: true },
  noir: { bg: ["#08080B", "#121219", "#1C1A26"], a: "#C9B8FF", b: "#FFC9DD", c: "#A8D2FF", ink: "#F5F3FF", light: false },
  blush: { bg: ["#FFF3EE", "#FBE0E6", "#F3CFE0"], a: "#7A2E5A", b: "#F29C8B", c: "#C8A2D9", ink: "#3D1530", light: true },
  citrus: { bg: ["#FFF6E0", "#FFE3A3", "#FFC66E"], a: "#1F3A8A", b: "#F06B3E", c: "#5C86D6", ink: "#14254F", light: true },
};

function hashString(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function rng(seed: number) {
  let t = seed;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function parseKeyArt(value: unknown, fallbackSeed = "ipply"): KeyArtSpec {
  const v = (value ?? {}) as Partial<KeyArtSpec>;
  const h = hashString(fallbackSeed);
  return {
    motif: MOTIFS.includes(v.motif as Motif) ? (v.motif as Motif) : MOTIFS[h % MOTIFS.length],
    palette: PALETTES.includes(v.palette as PaletteName) ? (v.palette as PaletteName) : PALETTES[(h >> 3) % PALETTES.length],
  };
}

export function KeyArt({
  spec,
  seed,
  className,
  title,
}: {
  spec: KeyArtSpec;
  seed: string;
  className?: string;
  title?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const p = PALETTE_DEFS[spec.palette];
  const r = rng(hashString(seed));
  const id = (n: string) => `${uid}-${n}`;

  return (
    <svg
      viewBox="0 0 1600 1000"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title ? `Key art for ${title}` : undefined}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={id("bg")} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={p.bg[0]} />
          <stop offset="0.55" stopColor={p.bg[1]} />
          <stop offset="1" stopColor={p.bg[2]} />
        </linearGradient>
        <radialGradient id={id("glow")} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor={p.a} stopOpacity="0.85" />
          <stop offset="1" stopColor={p.a} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={id("iris")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={p.a} />
          <stop offset="0.5" stopColor={p.b} />
          <stop offset="1" stopColor={p.c} />
        </linearGradient>
        <filter id={id("grain")} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope={p.light ? "0.10" : "0.16"} />
          </feComponentTransfer>
        </filter>
        <filter id={id("soft")}>
          <feGaussianBlur stdDeviation="40" />
        </filter>
      </defs>

      <rect width="1600" height="1000" fill={`url(#${id("bg")})`} />
      <Motif motif={spec.motif} p={p} r={r} id={id} />
      <rect width="1600" height="1000" filter={`url(#${id("grain")})`} />
    </svg>
  );
}

function Motif({ motif, p, r, id }: { motif: Motif; p: Palette; r: () => number; id: (n: string) => string }) {
  switch (motif) {
    case "orbit": {
      const cx = 800 + (r() - 0.5) * 120;
      const cy = 470 + (r() - 0.5) * 80;
      const rad = 210 + r() * 40;
      const moons = Array.from({ length: 3 }, (_, i) => ({ a: r() * Math.PI * 2, d: rad + 90 + i * 70, s: 10 + r() * 16 }));
      return (
        <g>
          <circle cx={cx} cy={cy} r={rad * 1.9} fill={`url(#${id("glow")})`} opacity="0.55" filter={`url(#${id("soft")})`} />
          {[1.35, 1.75, 2.2, 2.7].map((k, i) => (
            <ellipse key={i} cx={cx} cy={cy} rx={rad * k} ry={rad * k * 0.32} fill="none" stroke={p.ink} strokeOpacity={0.18 + i * 0.04} strokeWidth="1.5" transform={`rotate(-14 ${cx} ${cy})`} />
          ))}
          <circle cx={cx} cy={cy} r={rad} fill={`url(#${id("iris")})`} />
          <circle cx={cx - rad * 0.28} cy={cy - rad * 0.3} r={rad * 0.55} fill="#fff" opacity="0.18" filter={`url(#${id("soft")})`} />
          {moons.map((m, i) => (
            <circle key={i} cx={cx + Math.cos(m.a) * m.d} cy={cy + Math.sin(m.a) * m.d * 0.4} r={m.s} fill={i === 1 ? p.b : p.ink} opacity={i === 1 ? 1 : 0.85} />
          ))}
        </g>
      );
    }
    case "horizon": {
      const sunY = 560 + r() * 40;
      return (
        <g>
          <circle cx="800" cy={sunY} r="260" fill={`url(#${id("glow")})`} filter={`url(#${id("soft")})`} />
          <clipPath id={id("above")}>
            <rect x="0" y="0" width="1600" height="640" />
          </clipPath>
          <circle cx="800" cy={sunY} r="190" fill={`url(#${id("iris")})`} clipPath={`url(#${id("above")})`} />
          <rect x="0" y="640" width="1600" height="360" fill={p.ink} opacity={p.light ? 0.85 : 0.35} />
          {Array.from({ length: 9 }, (_, i) => {
            const w = 360 - i * 34 + r() * 20;
            return <rect key={i} x={800 - w / 2} y={662 + i * 30} width={w} height={6 + (i % 3)} rx="3" fill={p.b} opacity={0.75 - i * 0.07} />;
          })}
          {Array.from({ length: 5 }, (_, i) => (
            <path key={i} d={`M0 ${640 - i * 0.5} L1600 ${640 - i * 0.5}`} stroke={p.a} strokeOpacity="0.4" />
          ))}
        </g>
      );
    }
    case "arch": {
      const n = 6;
      return (
        <g>
          <ellipse cx="800" cy="900" rx="700" ry="260" fill={`url(#${id("glow")})`} filter={`url(#${id("soft")})`} />
          {Array.from({ length: n }, (_, i) => {
            const w = 620 - i * 92;
            const top = 150 + i * 70;
            const x = 800 - w / 2;
            const fill = i % 2 === 0 ? p.ink : `url(#${id("iris")})`;
            return (
              <path key={i} d={`M${x} 1000 L${x} ${top + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${top + w / 2} L${x + w} 1000 Z`} fill={fill} opacity={i % 2 === 0 ? (p.light ? 0.9 : 0.55) : 1} />
            );
          })}
          <circle cx="800" cy={360 + r() * 30} r="16" fill={p.b} />
        </g>
      );
    }
    case "tide": {
      const layers = 7;
      return (
        <g>
          <circle cx={600 + r() * 400} cy="300" r="300" fill={`url(#${id("glow")})`} filter={`url(#${id("soft")})`} />
          {Array.from({ length: layers }, (_, i) => {
            const y = 380 + i * 85;
            const amp = 40 + r() * 50;
            const ph = r() * 400;
            const freq = 0.004 + i * 0.0006;
            let d = `M0 ${y + Math.sin(ph) * amp}`;
            for (let x = 20; x <= 1600; x += 20) d += ` L${x} ${(y + Math.sin(x * freq + ph) * amp).toFixed(1)}`;
            d += " L1600 1000 L0 1000 Z";
            const colors = [p.a, p.c, p.b, p.ink];
            return <path key={i} d={d} fill={colors[i % colors.length]} opacity={0.35 + i * 0.09} />;
          })}
        </g>
      );
    }
    case "grid": {
      const cols = 9;
      const rows = 6;
      const cell = 64;
      const gap = 22;
      const w = cols * cell + (cols - 1) * gap;
      const x0 = 800 - w / 2;
      const y0 = 210;
      return (
        <g>
          <rect x={x0 - 60} y={y0 - 60} width={w + 120} height={rows * (cell + gap) + 100} rx="12" fill={p.ink} opacity={p.light ? 0.9 : 0.5} />
          {Array.from({ length: cols * rows }, (_, i) => {
            const lit = r() > 0.62;
            const special = r() > 0.95;
            return (
              <rect key={i} x={x0 + (i % cols) * (cell + gap)} y={y0 + Math.floor(i / cols) * (cell + gap)} width={cell} height={cell} rx="6" fill={special ? `url(#${id("iris")})` : lit ? p.b : p.bg[1]} opacity={lit || special ? 1 : 0.22} />
            );
          })}
          <circle cx={x0 + w + 30} cy={y0 - 90} r="70" fill={`url(#${id("iris")})`} />
        </g>
      );
    }
    case "bloom": {
      const petals = 12;
      const cx = 800;
      const cy = 500;
      return (
        <g>
          <circle cx={cx} cy={cy} r="420" fill={`url(#${id("glow")})`} filter={`url(#${id("soft")})`} opacity="0.7" />
          {Array.from({ length: petals }, (_, i) => {
            const a = (i / petals) * 360 + r() * 6;
            return <ellipse key={i} cx={cx} cy={cy - 170} rx="62" ry="170" fill={i % 2 ? p.a : p.c} opacity="0.75" transform={`rotate(${a} ${cx} ${cy})`} style={{ mixBlendMode: "multiply" }} />;
          })}
          <circle cx={cx} cy={cy} r="96" fill={`url(#${id("iris")})`} />
          <circle cx={cx} cy={cy} r="36" fill={p.ink} />
        </g>
      );
    }
    case "stage": {
      return (
        <g>
          <path d="M800 0 L1180 1000 L420 1000 Z" fill={p.b} opacity="0.22" />
          <path d="M800 0 L1060 1000 L540 1000 Z" fill={p.b} opacity="0.25" />
          <ellipse cx="800" cy="880" rx="330" ry="56" fill={`url(#${id("iris")})`} />
          {Array.from({ length: 7 }, (_, i) => (
            <path key={`l${i}`} d={`M${i * 60} 0 C${i * 60 + 40} 400 ${i * 60 - 30} 700 ${i * 62 + 10} 1000 L${i * 60 + 60} 1000 C${i * 60 + 40} 700 ${i * 60 + 90} 400 ${i * 60 + 60} 0 Z`} fill={p.a} opacity={0.5 + (i % 2) * 0.25} />
          ))}
          {Array.from({ length: 7 }, (_, i) => (
            <path key={`r${i}`} d={`M${1600 - i * 60} 0 C${1560 - i * 60} 400 ${1630 - i * 60} 700 ${1590 - i * 62} 1000 L${1540 - i * 60} 1000 C${1560 - i * 60} 700 ${1510 - i * 60} 400 ${1540 - i * 60} 0 Z`} fill={p.a} opacity={0.5 + (i % 2) * 0.25} />
          ))}
          <rect x="0" y="0" width="1600" height="70" fill={p.light ? p.ink : p.bg[0]} opacity="0.9" />
          <circle cx={780 + r() * 40} cy="700" r="46" fill={p.ink} />
          <rect x={758 + r() * 40} y="740" width="64" height="130" rx="30" fill={p.ink} />
        </g>
      );
    }
    case "stack": {
      const blocks = [
        { w: 420, h: 120, c: p.ink },
        { w: 330, h: 130, c: `url(#${id("iris")})` },
        { w: 250, h: 110, c: p.a },
        { w: 180, h: 100, c: p.b },
        { w: 110, h: 110, c: p.c },
      ];
      let y = 900;
      return (
        <g>
          <ellipse cx="800" cy="900" rx="520" ry="80" fill={p.ink} opacity="0.12" />
          <circle cx="800" cy="360" r="320" fill={`url(#${id("glow")})`} filter={`url(#${id("soft")})`} opacity="0.6" />
          {blocks.map((b, i) => {
            y -= b.h;
            const tilt = (r() - 0.5) * 10;
            const x = 800 - b.w / 2 + (r() - 0.5) * 40;
            return <rect key={i} x={x} y={y} width={b.w} height={b.h} rx={i === blocks.length - 1 ? b.h / 2 : 28} fill={b.c} transform={`rotate(${tilt} ${x + b.w / 2} ${y + b.h / 2})`} />;
          })}
          <circle cx="800" cy={y - 40} r="14" fill={p.ink} />
        </g>
      );
    }
  }
}
