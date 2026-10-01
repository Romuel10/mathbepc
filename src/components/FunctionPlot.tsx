import { useState } from 'react';

interface FunctionPlotProps { a: number; b: number; c: number; label?: string; }

export default function FunctionPlot({ a, b, c, label }: FunctionPlotProps) {
  const [range, setRange] = useState(6);
  const W=360,H=260,pad=28;
  const gw=W-pad*2,gh=H-pad*2;
  const toX=(x:number)=>pad+(x+range)/(2*range)*gw;
  const toY=(y:number)=>pad+(range-y)/(2*range)*gh;
  const f=(x:number)=>a*x*x+b*x+c;
  const points:string[]=[];
  for(let i=0;i<=120;i++){
    const x=-range+(2*range*i/120);
    const y=f(x);
    if(Number.isFinite(y)) points.push(`${toX(x)},${toY(Math.max(-range*1.4,Math.min(range*1.4,y)))}`);
  }
  const ticks=[] as number[];
  for(let i=-range;i<=range;i+=Math.max(1,Math.ceil(range/6))) ticks.push(i);
  return (
    <div className="mt-5 rounded-2xl border border-[--color-border] bg-[--color-card] p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div><p className="text-xs font-bold">Représentation graphique</p><p className="text-[10px] font-mono text-[--color-text-muted]">{label || `y=${a}x²+${b}x+${c}`}</p></div>
        <div className="flex gap-1">
          <button onClick={()=>setRange(r=>Math.max(3,r-2))} className="w-9 h-9 rounded-lg bg-[--color-btn-bg] font-bold cursor-pointer">+</button>
          <button onClick={()=>setRange(r=>Math.min(20,r+2))} className="w-9 h-9 rounded-lg bg-[--color-btn-bg] font-bold cursor-pointer">−</button>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[520px] mx-auto">
        <rect x={pad} y={pad} width={gw} height={gh} rx="8" fill="var(--color-inset)" />
        {ticks.map(t=><g key={`g${t}`}>
          <line x1={toX(t)} y1={pad} x2={toX(t)} y2={H-pad} stroke="var(--color-border)" strokeWidth=".5" />
          <line x1={pad} y1={toY(t)} x2={W-pad} y2={toY(t)} stroke="var(--color-border)" strokeWidth=".5" />
          {t!==0&&<><text x={toX(t)} y={toY(0)+12} textAnchor="middle" fontSize="8" fill="var(--color-text-muted)">{t}</text><text x={toX(0)-6} y={toY(t)+3} textAnchor="end" fontSize="8" fill="var(--color-text-muted)">{t}</text></>}
        </g>)}
        <line x1={pad} y1={toY(0)} x2={W-pad} y2={toY(0)} stroke="var(--color-text-secondary)" strokeWidth="1.2" />
        <line x1={toX(0)} y1={pad} x2={toX(0)} y2={H-pad} stroke="var(--color-text-secondary)" strokeWidth="1.2" />
        <polyline points={points.join(' ')} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <p className="text-[10px] text-[--color-text-muted] text-center mt-2">Utilise + / − pour changer l’échelle.</p>
    </div>
  );
}
