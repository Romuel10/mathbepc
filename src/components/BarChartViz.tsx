interface BarChartProps {
  data: { value: number; freq: number }[];
  mean?: number;
  median?: number;
  q1?: number;
  q3?: number;
  title?: string;
}

export default function BarChartViz({ data, mean, median, q1, q3, title }: BarChartProps) {
  if (!data.length) return null;

  const maxFreq = Math.max(...data.map(d => d.freq));
  const W = 360, H = 220;
  const pad = { top: 30, right: 20, bottom: 45, left: 40 };
  const gw = W - pad.left - pad.right;
  const gh = H - pad.top - pad.bottom;

  const barW = Math.min(gw / data.length * 0.7, 40);
  const gap = (gw - barW * data.length) / (data.length + 1);

  const yScale = (v: number) => pad.top + gh - (v / maxFreq) * gh;
  const xPos = (i: number) => pad.left + gap * (i + 1) + barW * i;

  const yTicks: number[] = [];
  const yStep = maxFreq <= 5 ? 1 : maxFreq <= 20 ? 2 : maxFreq <= 50 ? 5 : 10;
  for (let v = 0; v <= maxFreq; v += yStep) yTicks.push(v);
  if (yTicks[yTicks.length - 1] < maxFreq) yTicks.push(maxFreq);

  const valToX = (val: number): number | null => {
    const idx = data.findIndex(d => d.value === val);
    if (idx >= 0) return xPos(idx) + barW / 2;
    if (val < data[0].value || val > data[data.length - 1].value) return null;
    for (let i = 0; i < data.length - 1; i++) {
      if (val >= data[i].value && val <= data[i + 1].value) {
        const ratio = (val - data[i].value) / (data[i + 1].value - data[i].value);
        return xPos(i) + barW / 2 + ratio * (xPos(i + 1) - xPos(i));
      }
    }
    return null;
  };

  const meanX = mean !== undefined ? valToX(mean) : null;
  const medX = median !== undefined ? valToX(median) : null;

  return (
    <div className="my-4">
      {title && <p className="text-[11px] font-semibold uppercase tracking-wider text-[--color-text-muted] mb-2 text-center">{title}</p>}
      <div className="flex justify-center">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[380px]" style={{ height: 'auto' }}>
          <rect x={pad.left} y={pad.top} width={gw} height={gh} fill="var(--color-inset)" rx="3" />
          {yTicks.map(v => (
            <g key={v}>
              <line x1={pad.left} y1={yScale(v)} x2={pad.left + gw} y2={yScale(v)} stroke="var(--color-border)" strokeWidth="0.5" />
              <text x={pad.left - 6} y={yScale(v) + 3} textAnchor="end" fontSize="9" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">{v}</text>
            </g>
          ))}
          {data.map((d, i) => {
            const bh = (d.freq / maxFreq) * gh;
            const bx = xPos(i);
            const by = pad.top + gh - bh;
            return (
              <g key={i}>
                <rect x={bx} y={by} width={barW} height={bh} fill="var(--color-accent)" rx="2" opacity="0.85" />
                <text x={bx + barW / 2} y={by - 4} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--color-accent)" fontFamily="var(--font-mono)">{d.freq}</text>
                <text x={bx + barW / 2} y={pad.top + gh + 14} textAnchor="middle" fontSize="9" fill="var(--color-text)" fontFamily="var(--font-mono)">{d.value}</text>
              </g>
            );
          })}
          <line x1={pad.left} y1={pad.top} x2={pad.left} y2={pad.top + gh} stroke="var(--color-text-muted)" strokeWidth="1" />
          <line x1={pad.left} y1={pad.top + gh} x2={pad.left + gw} y2={pad.top + gh} stroke="var(--color-text-muted)" strokeWidth="1" />
          {meanX && (
            <g>
              <line x1={meanX} y1={pad.top} x2={meanX} y2={pad.top + gh} stroke="var(--color-ok-text)" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={meanX} y={pad.top - 4} textAnchor="middle" fontSize="8" fill="var(--color-ok-text)" fontFamily="var(--font-mono)">x̄</text>
            </g>
          )}
          {medX && medX !== meanX && (
            <g>
              <line x1={medX} y1={pad.top} x2={medX} y2={pad.top + gh} stroke="var(--color-warn-text)" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={medX} y={pad.top - 4} textAnchor="middle" fontSize="8" fill="var(--color-warn-text)" fontFamily="var(--font-mono)">Med</text>
            </g>
          )}
          {q1 !== undefined && q3 !== undefined && (() => {
            const q1x = valToX(q1), q3x = valToX(q3);
            if (q1x && q3x) return (
              <rect x={q1x} y={pad.top} width={q3x - q1x} height={gh} fill="var(--color-accent)" opacity="0.07" rx="2" />
            );
            return null;
          })()}
          <text x={pad.left + gw / 2} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-sans)">Valeurs</text>
          <text x={12} y={pad.top + gh / 2} textAnchor="middle" fontSize="10" fill="var(--color-text-muted)" fontFamily="var(--font-sans)" transform={`rotate(-90, 12, ${pad.top + gh / 2})`}>Effectifs</text>
          <g transform={`translate(${pad.left + gw - 80}, ${pad.top + 6})`}>
            {meanX && <>
              <line x1="0" y1="0" x2="12" y2="0" stroke="var(--color-ok-text)" strokeWidth="1.5" strokeDasharray="3 2" />
              <text x="16" y="3" fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">Moyenne</text>
            </>}
            {medX && medX !== meanX && <>
              <line x1="0" y1="10" x2="12" y2="10" stroke="var(--color-warn-text)" strokeWidth="1.5" strokeDasharray="3 2" />
              <text x="16" y="13" fontSize="8" fill="var(--color-text-muted)" fontFamily="var(--font-mono)">Médiane</text>
            </>}
          </g>
        </svg>
      </div>
    </div>
  );
}

export function FrequencyTable({ data }: { data: { value: number; freq: number; relFreq: number; cumFreq: number; cumRelFreq: number }[] }) {
  if (!data.length) return null;

  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-[--color-border]">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="bg-[--color-inset]">
            <th className="px-3 py-2 text-left text-[--color-text-muted] font-semibold">xᵢ</th>
            <th className="px-3 py-2 text-right text-[--color-text-muted] font-semibold">nᵢ</th>
            <th className="px-3 py-2 text-right text-[--color-text-muted] font-semibold">fᵢ (%)</th>
            <th className="px-3 py-2 text-right text-[--color-text-muted] font-semibold">Nᵢ cum.</th>
            <th className="px-3 py-2 text-right text-[--color-text-muted] font-semibold">Fᵢ cum. (%)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[--color-border]">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-[--color-card-hover] transition-colors">
              <td className="px-3 py-1.5 text-[--color-accent] font-semibold">{row.value}</td>
              <td className="px-3 py-1.5 text-right text-[--color-text]">{row.freq}</td>
              <td className="px-3 py-1.5 text-right text-[--color-text-secondary]">{(row.relFreq * 100).toFixed(1)}</td>
              <td className="px-3 py-1.5 text-right text-[--color-text]">{row.cumFreq}</td>
              <td className="px-3 py-1.5 text-right text-[--color-text-secondary]">{(row.cumRelFreq * 100).toFixed(1)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
