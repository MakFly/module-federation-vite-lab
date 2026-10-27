import { useId, type CSSProperties, type JSX } from 'react';
import type { FormFactor } from '@acme/contracts';
import { cn } from '../lib/utils';

// Product drawings as crisp vector geometry, frontal, tinted by the selected finish.
// Colours are set through `style` so a finish change animates (fill / stop-color transitions).

const mix = (hex: string, target: string, amount: number) => {
  const parse = (value: string) => [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16));
  const [r1, g1, b1] = parse(hex);
  const [r2, g2, b2] = parse(target);
  const channel = (a: number, b: number) => Math.round(a + (b - a) * amount).toString(16).padStart(2, '0');
  return `#${channel(r1!, r2!)}${channel(g1!, g2!)}${channel(b1!, b2!)}`;
};

const tint = (finish: string) => ({
  base: finish,
  light: mix(finish, '#ffffff', 0.38),
  shade: mix(finish, '#000000', 0.22),
  edge: mix(finish, '#000000', 0.45),
  wallpaperA: mix(finish, '#0b1020', 0.55),
  wallpaperB: mix(finish, '#ffffff', 0.2),
});

const glide: CSSProperties = { transition: 'fill 450ms var(--ease-out-expo), stop-color 450ms var(--ease-out-expo)' };
const fill = (color: string): CSSProperties => ({ ...glide, fill: color });
const stop = (color: string): CSSProperties => ({ ...glide, stopColor: color });

type Props = { formFactor: FormFactor; finish: string; className?: string; title?: string };

export function DeviceArt({ formFactor, finish, className, title }: Props) {
  // useId may contain characters that are invalid inside url(#...).
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const t = tint(finish);
  const Shape = shapes[formFactor];

  return (
    <svg
      viewBox={viewBoxes[formFactor]}
      className={cn('block h-auto w-full', className)}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={stop(t.light)} />
          <stop offset="0.55" style={stop(t.base)} />
          <stop offset="1" style={stop(t.shade)} />
        </linearGradient>
        <linearGradient id={`${id}-side`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={stop(t.shade)} />
          <stop offset="0.5" style={stop(t.light)} />
          <stop offset="1" style={stop(t.shade)} />
        </linearGradient>
        <radialGradient id={`${id}-screen`} cx="0.3" cy="0.25" r="1">
          <stop offset="0" style={stop(t.wallpaperB)} />
          <stop offset="0.45" style={stop(t.wallpaperA)} />
          <stop offset="1" stopColor="#05070b" />
        </radialGradient>
        <filter id={`${id}-shadow`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      <Shape id={id} t={t} />
    </svg>
  );
}

type ShapeProps = { id: string; t: ReturnType<typeof tint> };

const viewBoxes: Record<FormFactor, string> = {
  laptop: '0 0 640 400',
  phone: '0 0 420 520',
  earbuds: '0 0 420 340',
  headphones: '0 0 420 420',
  display: '0 0 640 480',
  stylus: '0 0 640 200',
  dock: '0 0 560 260',
};

const Ground = ({ id, cx, cy, rx }: { id: string; cx: number; cy: number; rx: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.06} fill="rgb(0 0 0 / 0.22)" filter={`url(#${id}-shadow)`} />
);

const Laptop = ({ id, t }: ShapeProps) => (
  <g>
    <Ground id={id} cx={320} cy={372} rx={270} />
    <rect x="96" y="14" width="448" height="300" rx="18" fill="#101114" />
    <rect x="96" y="14" width="448" height="300" rx="18" fill="none" style={{ ...glide, stroke: t.edge }} strokeWidth="2" />
    <rect x="110" y="28" width="420" height="272" rx="6" fill={`url(#${id}-screen)`} />
    <circle cx="320" cy="21" r="2.5" fill="#2a2c31" />
    <path d="M44 316 H596 L584 336 Q581 342 573 342 H67 Q59 342 56 336 Z" fill={`url(#${id}-body)`} />
    <path d="M44 316 H596" style={{ ...glide, stroke: t.light }} strokeWidth="2" />
    <rect x="286" y="316" width="68" height="6" rx="3" style={fill(t.shade)} />
  </g>
);

const Phone = ({ id, t }: ShapeProps) => (
  <g>
    <Ground id={id} cx={210} cy={496} rx={170} />
    {/* Front, behind */}
    <rect x="176" y="40" width="200" height="430" rx="42" fill={`url(#${id}-side)`} />
    <rect x="182" y="46" width="188" height="418" rx="37" fill="#08090c" />
    <rect x="190" y="54" width="172" height="402" rx="31" fill={`url(#${id}-screen)`} />
    <rect x="249" y="66" width="54" height="16" rx="8" fill="#000" />
    {/* Back, in front */}
    <rect x="44" y="20" width="200" height="440" rx="44" fill={`url(#${id}-body)`} />
    <rect x="44" y="20" width="200" height="440" rx="44" fill="none" style={{ ...glide, stroke: t.edge }} strokeWidth="1.5" />
    <rect x="62" y="38" width="88" height="88" rx="26" style={fill(t.light)} />
    <rect x="62" y="38" width="88" height="88" rx="26" fill="none" style={{ ...glide, stroke: t.shade }} strokeWidth="1.5" />
    {[[86, 62], [126, 62], [86, 102]].map(([cx, cy]) => (
      <g key={`${cx}-${cy}`}>
        <circle cx={cx} cy={cy} r="15" style={fill(t.edge)} />
        <circle cx={cx} cy={cy} r="10" fill="#0b0d12" />
        <circle cx={cx! - 3} cy={cy! - 3} r="3" fill="#3a4152" />
      </g>
    ))}
    <circle cx="126" cy="102" r="5" fill="#f4e7c3" opacity="0.9" />
  </g>
);

const Earbuds = ({ id, t }: ShapeProps) => (
  <g>
    <Ground id={id} cx={210} cy={318} rx={150} />
    <rect x="86" y="150" width="248" height="160" rx="64" fill={`url(#${id}-body)`} />
    <path d="M92 196 H328" style={{ ...glide, stroke: t.shade }} strokeWidth="2" />
    <circle cx="210" cy="246" r="4" fill="#7ed07a" />
    {[{ x: 150, r: -14 }, { x: 270, r: 14 }].map(({ x, r }) => (
      <g key={x} transform={`rotate(${r} ${x} 100)`}>
        <rect x={x - 13} y="96" width="26" height="74" rx="13" fill={`url(#${id}-side)`} />
        <circle cx={x} cy="86" r="38" fill={`url(#${id}-body)`} />
        <ellipse cx={x} cy="80" rx="20" ry="14" style={fill(t.edge)} opacity="0.85" />
      </g>
    ))}
  </g>
);

const Headphones = ({ id, t }: ShapeProps) => (
  <g>
    <Ground id={id} cx={210} cy={398} rx={160} />
    <path d="M86 238 V178 A124 124 0 0 1 334 178 V238" fill="none" style={{ ...glide, stroke: t.shade }} strokeWidth="26" strokeLinecap="round" />
    <path d="M100 236 V180 A110 110 0 0 1 320 180 V236" fill="none" style={{ ...glide, stroke: t.light }} strokeWidth="8" strokeLinecap="round" opacity="0.7" />
    {[54, 276].map((x) => (
      <g key={x}>
        <rect x={x + 30} y="214" width="30" height="40" rx="8" style={fill(t.edge)} />
        <rect x={x} y="236" width="90" height="150" rx="45" fill={`url(#${id}-body)`} />
        <rect x={x + (x < 200 ? 62 : 4)} y="252" width="24" height="118" rx="12" style={fill(t.edge)} opacity="0.75" />
      </g>
    ))}
  </g>
);

const Display = ({ id }: ShapeProps) => (
  <g>
    <Ground id={id} cx={320} cy={462} rx={180} />
    <path d="M286 336 H354 L372 448 H268 Z" fill={`url(#${id}-side)`} />
    <rect x="214" y="444" width="212" height="12" rx="6" fill={`url(#${id}-body)`} />
    <rect x="34" y="12" width="572" height="330" rx="14" fill={`url(#${id}-body)`} />
    <rect x="42" y="20" width="556" height="314" rx="8" fill="#08090c" />
    <rect x="50" y="28" width="540" height="298" rx="4" fill={`url(#${id}-screen)`} />
    <circle cx="320" cy="24" r="2.5" fill="#2a2c31" />
  </g>
);

const Stylus = ({ id, t }: ShapeProps) => (
  <g transform="rotate(-10 320 100)">
    <Ground id={id} cx={320} cy={150} rx={250} />
    <rect x="70" y="86" width="440" height="28" rx="14" fill={`url(#${id}-body)`} />
    <path d="M510 86 L560 100 L510 114 Z" style={fill(t.light)} />
    <path d="M552 98 L568 100 L552 102 Z" fill="#26282d" />
    <rect x="70" y="86" width="440" height="7" rx="3.5" style={fill(t.light)} opacity="0.8" />
  </g>
);

const Dock = ({ id, t }: ShapeProps) => (
  <g>
    <Ground id={id} cx={280} cy={226} rx={230} />
    <path d="M64 96 L96 70 H464 L496 96 Z" style={fill(t.light)} />
    <rect x="64" y="96" width="432" height="112" rx="18" fill={`url(#${id}-body)`} />
    {[96, 136, 176, 216].map((x) => <rect key={x} x={x} y="140" width="26" height="12" rx="6" fill="#16181c" />)}
    {[272, 322].map((x) => <rect key={x} x={x} y="134" width="36" height="22" rx="3" fill="#16181c" />)}
    <path d="M380 134 H432 L426 156 H386 Z" fill="#16181c" />
    <circle cx="470" cy="146" r="4" fill="#7ed07a" />
    <path d="M78 190 H482" style={{ ...glide, stroke: t.shade }} strokeWidth="1.5" />
  </g>
);

const shapes: Record<FormFactor, (props: ShapeProps) => JSX.Element> = {
  laptop: Laptop,
  phone: Phone,
  earbuds: Earbuds,
  headphones: Headphones,
  display: Display,
  stylus: Stylus,
  dock: Dock,
};
