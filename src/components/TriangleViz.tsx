// Interactive right triangle visualization with computed values

interface TriangleVizProps {
  sideA?: number;     // opposite (vertical)
  sideB?: number;     // adjacent (horizontal)
  hypotenuse?: number;
  angle?: number;     // in degrees, at bottom-left
  labels?: { a?: string; b?: string; c?: string; angle?: string };
}

export default function TriangleViz({ sideA, sideB, hypotenuse, angle, labels }: TriangleVizProps) {
  // Compute missing values for drawing proportions
  let a = sideA || 0, b = sideB || 0, c = hypotenuse || 0;
  if (!a && b && c) a = Math.sqrt(c * c - b * b);
  if (!b && a && c) b = Math.sqrt(c * c - a * a);
  if (!c && a && b) c = Math.sqrt(a * a + b * b);
  if (a <= 0 || b <= 0 || c <= 0) {
    // Fallback: generic triangle
    a = 3; b = 4; c = 5;
  }

  const computedAngle = angle ?? (Math.atan(a / b) * 180 / Math.PI);

  // SVG layout: right angle at bottom-right
  const pad = 45;
  const W = 280, H = 220;
  const drawW = W - pad * 2, drawH = H - pad * 2;

  // Scale to fit
  const scale = Math.min(drawW / b, drawH / a);
  const bx = b * scale, ay = a * scale;

  // Points: A=bottom-left, B=bottom-right (right angle), C=top-right
  const Ax = pad, Ay = H - pad;
  const Bx = pad + bx, By = H - pad;
  const Cx = pad + bx, Cy = H - pad - ay;

  // Right angle marker
  const sq = 10;

  // Angle arc at A
  const arcR = 22;
  const arcEndX = Ax + arcR * Math.cos(-computedAngle * Math.PI / 180);
  const arcEndY = Ay + arcR * Math.sin(-computedAngle * Math.PI / 180);

  // Label positions
  const midAB_x = (Ax + Bx) / 2, midAB_y = Ay + 16;        // bottom side (b / adjacent)
  const midBC_x = Bx + 14, midBC_y = (By + Cy) / 2;          // right side (a / opposite)
  const midAC_x = (Ax + Cx) / 2 - 16, midAC_y = (Ay + Cy) / 2 - 4; // hypotenuse

  const fmt = (v: number) => Number.isInteger(v) ? `${v}` : v.toFixed(2);

  const labelA = labels?.a ?? (sideA ? fmt(sideA) : '?');
  const labelB = labels?.b ?? (sideB ? fmt(sideB) : '?');
  const labelC = labels?.c ?? (hypotenuse ? fmt(hypotenuse) : '?');
  const labelAngle = labels?.angle ?? (angle ? `${fmt(angle)}°` : computedAngle ? `${fmt(computedAngle)}°` : '');

  return (
    <div className="flex justify-center my-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[300px]" style={{ height: 'auto' }}>
        {/* Triangle fill */}
        <polygon
          points={`${Ax},${Ay} ${Bx},${By} ${Cx},${Cy}`}
          fill="var(--color-accent-subtle)"
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Right angle marker at B */}
        <polyline
          points={`${Bx - sq},${By} ${Bx - sq},${By - sq} ${Bx},${By - sq}`}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
        />

        {/* Angle arc at A */}
        {labelAngle && (
          <>
            <path
              d={`M ${Ax + arcR},${Ay} A ${arcR} ${arcR} 0 0 0 ${arcEndX} ${arcEndY}`}
              fill="none"
              stroke="var(--color-ok-text)"
              strokeWidth="1.5"
            />
            <text
              x={Ax + arcR + 8}
              y={Ay - 8}
              fontSize="11"
              fontWeight="600"
              fill="var(--color-ok-text)"
              fontFamily="var(--font-mono)"
            >
              {labelAngle}
            </text>
          </>
        )}

        {/* Labels */}
        {/* Bottom: b (adjacent) */}
        <text x={midAB_x} y={midAB_y} textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--color-text)" fontFamily="var(--font-mono)">
          {labelB}
        </text>
        <text x={midAB_x} y={midAB_y + 12} textAnchor="middle" fontSize="9" fill="var(--color-text-muted)" fontFamily="var(--font-sans)">
          adjacent
        </text>

        {/* Right: a (opposite) */}
        <text x={midBC_x} y={midBC_y} textAnchor="start" fontSize="12" fontWeight="700" fill="var(--color-text)" fontFamily="var(--font-mono)">
          {labelA}
        </text>
        <text x={midBC_x} y={midBC_y + 12} textAnchor="start" fontSize="9" fill="var(--color-text-muted)" fontFamily="var(--font-sans)">
          opposé
        </text>

        {/* Hypotenuse */}
        <text x={midAC_x} y={midAC_y} textAnchor="end" fontSize="12" fontWeight="700" fill="var(--color-accent)" fontFamily="var(--font-mono)">
          {labelC}
        </text>
        <text x={midAC_x} y={midAC_y + 12} textAnchor="end" fontSize="9" fill="var(--color-text-muted)" fontFamily="var(--font-sans)">
          hypoténuse
        </text>

        {/* Vertex labels */}
        <text x={Ax - 8} y={Ay + 4} textAnchor="end" fontSize="13" fontWeight="700" fill="var(--color-text-secondary)" fontFamily="var(--font-sans)">A</text>
        <text x={Bx + 8} y={By + 4} textAnchor="start" fontSize="13" fontWeight="700" fill="var(--color-text-secondary)" fontFamily="var(--font-sans)">B</text>
        <text x={Cx + 8} y={Cy - 4} textAnchor="start" fontSize="13" fontWeight="700" fill="var(--color-text-secondary)" fontFamily="var(--font-sans)">C</text>
      </svg>
    </div>
  );
}
