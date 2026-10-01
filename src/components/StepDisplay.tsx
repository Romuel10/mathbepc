import { type Step } from '../utils/mathEngine';
import { CheckIcon } from './Icons';

interface StepDisplayProps { steps: Step[]; result?: string; }

function fmt(text: string): string {
  return text
    .replace(/√(\d+)/g, '<span style="color:var(--color-accent);font-weight:600">√$1</span>')
    .replace(/x²/g, 'x<sup>2</sup>').replace(/x³/g, 'x<sup>3</sup>')
    .replace(/(\d+)x²/g, '$1x<sup>2</sup>').replace(/(\d+)x³/g, '$1x<sup>3</sup>')
    .replace(/x₁/g, 'x<sub>1</sub>').replace(/x₂/g, 'x<sub>2</sub>').replace(/x₀/g, 'x<sub>0</sub>')
    .replace(/y₁/g, 'y<sub>1</sub>').replace(/y₂/g, 'y<sub>2</sub>')
    .replace(/a₁/g, 'a<sub>1</sub>').replace(/a₂/g, 'a<sub>2</sub>')
    .replace(/b₁/g, 'b<sub>1</sub>').replace(/b₂/g, 'b<sub>2</sub>')
    .replace(/c₁/g, 'c<sub>1</sub>').replace(/c₂/g, 'c<sub>2</sub>')
    .replace(/L₁/g, 'L<sub>1</sub>').replace(/L₂/g, 'L<sub>2</sub>')
    .replace(/xᵢ/g, 'x<sub>i</sub>').replace(/nᵢ/g, 'n<sub>i</sub>')
    .replace(/Dₓ/g, 'D<sub>x</sub>').replace(/Dᵧ/g, 'D<sub>y</sub>')
    .replace(/σ²/g, 'σ<sup>2</sup>')
    .replace(/(\d+)²/g, '$1<sup>2</sup>').replace(/(\d+)³/g, '$1<sup>3</sup>')
    .replace(/\^(\d+)/g, '<sup>$1</sup>');
}

export default function StepDisplay({ steps, result }: StepDisplayProps) {
  if (!steps.length) return null;
  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-[--color-border] bg-[--color-card] shadow-[0_4px_24px_var(--color-glow)]">
      <div className="px-5 py-3 border-b border-[--color-border] flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-muted]">Résolution</h3>
        <span className="text-[9px] font-mono text-[--color-text-muted] bg-[--color-btn-bg] px-2 py-0.5 rounded-full">{steps.length}</span>
      </div>
      <div className="divide-y divide-[--color-border]/60">
        {steps.map((s, i) => {
          const ok = s.highlight || s.type === 'result';
          const warn = s.type === 'warning';
          const info = s.type === 'info';
          return (
            <div key={i} className="flex gap-3 px-5 py-3 text-[13px]"
              style={{ backgroundColor: ok ? 'var(--color-ok-bg)' : warn ? 'var(--color-warn-bg)' : info ? 'var(--color-info-bg)' : 'transparent' }}>
              <div className="flex-shrink-0 pt-0.5">
                {ok ? (
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--color-ok-text)' }}>
                    <CheckIcon className="w-3 h-3 text-white" />
                  </div>
                ) : (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-[9px] font-bold"
                    style={{
                      backgroundColor: warn ? 'var(--color-warn-bg)' : info ? 'var(--color-accent-subtle)' : 'var(--color-btn-bg)',
                      color: warn ? 'var(--color-warn-text)' : info ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    }}>{i + 1}</span>
                )}
              </div>
              <span className={`font-mono leading-relaxed ${ok ? 'font-semibold' : ''}`}
                style={{ color: ok ? 'var(--color-ok-text)' : warn ? 'var(--color-warn-text)' : info ? 'var(--color-text-secondary)' : 'var(--color-text)' }}
                dangerouslySetInnerHTML={{ __html: fmt(s.text) }} />
            </div>
          );
        })}
      </div>
      {result && (
        <div className="px-5 py-4 border-t" style={{ backgroundColor: 'var(--color-ok-bg)', borderColor: 'var(--color-ok-border)' }}>
          <p className="text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ color: 'var(--color-ok-text)', opacity: 0.5 }}>Résultat</p>
          <p className="text-lg font-bold font-mono" style={{ color: 'var(--color-ok-text)' }} dangerouslySetInnerHTML={{ __html: fmt(result) }} />
        </div>
      )}
    </div>
  );
}
