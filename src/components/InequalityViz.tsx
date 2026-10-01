// SVG graph for 1-variable inequalities (number line)
// and 2-variable inequalities (coordinate plane with shaded half-planes)

interface NumberLineProps {
  solution: string; // parsed from result like "S = ]-∞ ; 3[" or "S = [2 ; +∞["
  bound?: number;
  sign?: string; // < ≤ > ≥
}

export function NumberLineViz({ bound, sign }: NumberLineProps) {
  if (bound === undefined || !sign || isNaN(bound)) return null;

  const W = 320, H = 60;
  const pad = 40;
  const lineY = 30;
  const cx = W / 2;

  const isClosed = sign === '≤' || sign === '≥';
  const goesLeft = sign === '<' || sign === '≤';

  return (
    <div className="flex justify-center my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[340px]" style={{ height: 'auto' }}>
        <line x1={pad} y1={lineY} x2={W - pad} y2={lineY} stroke="var(--color-border)" strokeWidth="2" />
        <polygon points={`${pad - 4},${lineY} ${pad + 6},${lineY - 4} ${pad + 6},${lineY + 4}`} fill="var(--color-border)" />
        <polygon points={`${W - pad + 4},${lineY} ${W - pad - 6},${lineY - 4} ${W - pad - 6},${lineY + 4}`} fill="var(--color-border)" />
        {goesLeft ? (
          <line x1={pad} y1={lineY} x2={cx} y2={lineY} stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" />
        ) : (
          <line x1={cx} y1={lineY} x2={W - pad} y2={lineY} stroke="var(--color-accent)" strokeWidth="4" strokeLinecap="round" />
        )}
        <circle cx={cx} cy={lineY} r="5" fill={isClosed ? 'var(--color-accent)' : 'var(--color-card)'} stroke="var(--color-accent)" strokeWidth="2.5" />
        <text x={cx} y={lineY + 22} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-text)" fontFamily="var(--font-mono)">
          {Number.isInteger(bound) ? bound : bound.toFixed(2)}
        </text>
        <text x={pad + 2} y={lineY + 22} textAnchor="start" fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">−∞</text>
        <text x={W - pad - 2} y={lineY + 22} textAnchor="end" fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">+∞</text>
        <text x={goesLeft ? pad + 30 : W - pad - 30} y={lineY - 10} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--color-accent)" fontFamily="var(--font-mono)">
          x {sign} {Number.isInteger(bound) ? bound : bound.toFixed(2)}
        </text>
      </svg>
    </div>
  );
}

interface TwoVarVizProps {
  a1: number; b1: number; c1: number; sign1: string;
  a2: number; b2: number; c2: number; sign2: string;
}

export function TwoVarInequalityViz({ a1, b1, c1, sign1, a2, b2, c2, sign2 }: TwoVarVizProps) {
  if ([a1, b1, c1, a2, b2, c2].some(v => isNaN(v))) return null;

  const W = 300, H = 300;
  const pad = 35;
  const gw = W - pad * 2, gh = H - pad * 2;
  const ox = pad + gw / 2, oy = pad + gh / 2;

  const points: number[] = [];
  if (b1 !== 0) { points.push(c1 / b1); if (a1 !== 0) points.push(c1 / a1); }
  else if (a1 !== 0) points.push(c1 / a1);
  if (b2 !== 0) { points.push(c2 / b2); if (a2 !== 0) points.push(c2 / a2); }
  else if (a2 !== 0) points.push(c2 / a2);
  points.push(0);

  const maxAbs = Math.max(3, ...points.map(p => Math.abs(p))) * 1.3;
  const range = Math.ceil(maxAbs);

  const toSvgX = (x: number) => ox + (x / range) * (gw / 2);
  const toSvgY = (y: number) => oy - (y / range) * (gh / 2);

  const getLinePoints = (a: number, b: number, c: number) => {
    const pts: [number, number][] = [];
    if (b !== 0) {
      const xMin = -range, xMax = range;
      pts.push([xMin, (c - a * xMin) / b]);
      pts.push([xMax, (c - a * xMax) / b]);
    } else if (a !== 0) {
      const xv = c / a;
      pts.push([xv, -range]);
      pts.push([xv, range]);
    }
    return pts;
  };

  const line1 = getLinePoints(a1, b1, c1);
  const line2 = getLinePoints(a2, b2, c2);

  const testSide = (_a: number, _b: number, c: number, sign: string) => {
    const val = 0;
    const originSatisfies = (sign === '<' && val < c) || (sign === '≤' && val <= c)
      || (sign === '>' && val > c) || (sign === '≥' && val >= c);
    return originSatisfies;
  };

  const origin1 = testSide(a1, b1, c1, sign1);
  const origin2 = testSide(a2, b2, c2, sign2);

  const buildHalfPlane = (a: number, b: number, c: number, originSide: boolean) => {
    const corners: [number, number][] = [
      [-range, -range], [range, -range], [range, range], [-range, range],
    ];

    const sideSign = originSide ? 1 : -1;
    const isOnSide = (x: number, y: number) => {
      const v = a * x + b * y - c;
      return sideSign * v <= 0;
    };

    const lineCorners = corners.filter(([x, y]) => isOnSide(x, y));
    const intersections: [number, number][] = [];
    if (b !== 0) {
      const yAtMinX = (c - a * (-range)) / b;
      const yAtMaxX = (c - a * range) / b;
      if (yAtMinX >= -range && yAtMinX <= range) intersections.push([-range, yAtMinX]);
      if (yAtMaxX >= -range && yAtMaxX <= range) intersections.push([range, yAtMaxX]);
    }
    if (a !== 0) {
      const xAtMinY = (c - b * (-range)) / a;
      const xAtMaxY = (c - b * range) / a;
      if (xAtMinY > -range && xAtMinY < range) intersections.push([xAtMinY, -range]);
      if (xAtMaxY > -range && xAtMaxY < range) intersections.push([xAtMaxY, range]);
    }

    const allPts = [...intersections, ...lineCorners];
    if (allPts.length < 3) return '';

    const cx2 = allPts.reduce((s, p) => s + p[0], 0) / allPts.length;
    const cy2 = allPts.reduce((s, p) => s + p[1], 0) / allPts.length;
    allPts.sort((pa, pb) => Math.atan2(pa[1] - cy2, pa[0] - cx2) - Math.atan2(pb[1] - cy2, pb[0] - cx2));

    return allPts.map(([x, y]) => `${toSvgX(x)},${toSvgY(y)}`).join(' ');
  };

  const poly1 = buildHalfPlane(a1, b1, c1, origin1);
  const poly2 = buildHalfPlane(a2, b2, c2, origin2);

  const gridLines: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = -range; i <= range; i++) {
    if (i === 0) continue;
    gridLines.push({ x1: toSvgX(i), y1: pad, x2: toSvgX(i), y2: H - pad });
    gridLines.push({ x1: pad, y1: toSvgY(i), x2: W - pad, y2: toSvgY(i) });
  }

  const ticks: { x: number; y: number; label: string; anchor: 'start'|'middle'|'end' }[] = [];
  const step = range <= 5 ? 1 : range <= 15 ? 2 : 5;
  for (let i = -range; i <= range; i += step) {
    if (i === 0) continue;
    ticks.push({ x: toSvgX(i), y: oy + 14, label: `${i}`, anchor: 'middle' });
    ticks.push({ x: ox - 8, y: toSvgY(i) + 4, label: `${i}`, anchor: 'end' });
  }

  return (
    <div className="flex justify-center my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[320px]" style={{ height: 'auto' }}>
        <defs>
          <clipPath id="graphClip"><rect x={pad} y={pad} width={gw} height={gh} /></clipPath>
        </defs>
        <rect x={pad} y={pad} width={gw} height={gh} fill="var(--color-inset)" rx="4" />
        {gridLines.map((g, i) => (
          <line key={i} x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} stroke="var(--color-border)" strokeWidth="0.5" />
        ))}
        <g clipPath="url(#graphClip)">
          {poly1 && <polygon points={poly1} fill="var(--color-accent)" opacity="0.12" />}
          {poly2 && <polygon points={poly2} fill="var(--color-ok-text)" opacity="0.12" />}
        </g>
        <line x1={pad} y1={oy} x2={W - pad} y2={oy} stroke="var(--color-text-muted)" strokeWidth="1.2" />
        <line x1={ox} y1={pad} x2={ox} y2={H - pad} stroke="var(--color-text-muted)" strokeWidth="1.2" />
        <polygon points={`${W - pad + 3},${oy} ${W - pad - 5},${oy - 3} ${W - pad - 5},${oy + 3}`} fill="var(--color-text-muted)" />
        <polygon points={`${ox},${pad - 3} ${ox - 3},${pad + 5} ${ox + 3},${pad + 5}`} fill="var(--color-text-muted)" />
        <text x={W - pad + 2} y={oy - 6} fontSize="11" fontWeight="600" fill="var(--color-text-secondary)" fontFamily="var(--font-mono)">x</text>
        <text x={ox + 8} y={pad + 2} fontSize="11" fontWeight="600" fill="var(--color-text-secondary)" fontFamily="var(--font-mono)">y</text>
        {ticks.map((t, i) => (
          <text key={i} x={t.x} y={t.y} textAnchor={t.anchor} fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">{t.label}</text>
        ))}
        <g clipPath="url(#graphClip)">
          {line1.length === 2 && (
            <line
              x1={toSvgX(line1[0][0])} y1={toSvgY(line1[0][1])}
              x2={toSvgX(line1[1][0])} y2={toSvgY(line1[1][1])}
              stroke="var(--color-accent)" strokeWidth="2"
              strokeDasharray={sign1 === '<' || sign1 === '>' ? '6 3' : ''}
            />
          )}
          {line2.length === 2 && (
            <line
              x1={toSvgX(line2[0][0])} y1={toSvgY(line2[0][1])}
              x2={toSvgX(line2[1][0])} y2={toSvgY(line2[1][1])}
              stroke="var(--color-ok-text)" strokeWidth="2"
              strokeDasharray={sign2 === '<' || sign2 === '>' ? '6 3' : ''}
            />
          )}
        </g>
        <rect x={pad + 4} y={pad + 4} width="8" height="3" rx="1" fill="var(--color-accent)" />
        <text x={pad + 16} y={pad + 8} fontSize="8" fill="var(--color-text-secondary)" fontFamily="var(--font-mono)">(1)</text>
        <rect x={pad + 4} y={pad + 12} width="8" height="3" rx="1" fill="var(--color-ok-text)" />
        <text x={pad + 16} y={pad + 16} fontSize="8" fill="var(--color-text-secondary)" fontFamily="var(--font-mono)">(2)</text>
        <text x={ox + 5} y={oy + 12} fontSize="9" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">0</text>
      </svg>
    </div>
  );
}
