import { useEffect, useState } from 'react';
import { type Step } from '../utils/mathEngine';
import { explainStep } from '../utils/pedagogy';
import { getStoredLanguage, type Lang } from '../utils/i18n';
import { CheckIcon } from './Icons';

interface StepDisplayProps { steps: Step[]; result?: string; }

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function fmt(text: string): string {
  return escapeHtml(text)
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


function stepLabel(type: string | undefined, index: number, total: number, lang: Lang): string {
  if (type === 'result' || index === total - 1) return lang === 'mg' ? 'Famaranana' : 'Conclusion';
  if (type === 'info' || index === 0) return lang === 'mg' ? 'Données / Fitsipika' : 'Données / Propriété';
  if (type === 'warning') return lang === 'mg' ? 'Fampitandremana' : 'Attention';
  return lang === 'mg' ? 'Kajy' : 'Calcul';
}

export default function StepDisplay({ steps, result }: StepDisplayProps) {
  const [lang,setLang]=useState<Lang>(()=>getStoredLanguage());
  const [openExplanation,setOpenExplanation]=useState<number|null>(null);
  useEffect(()=>{
    const handler=(event:Event)=>setLang(((event as CustomEvent<Lang>).detail)||getStoredLanguage());
    window.addEventListener('mathbepc-language',handler);
    return()=>window.removeEventListener('mathbepc-language',handler);
  },[]);
  if (!steps.length) return null;
  return (
    <div className="mt-8 rounded-2xl overflow-hidden border border-[--color-border] bg-[--color-card] shadow-[0_4px_24px_var(--color-glow)]">
      <div className="px-5 py-3 border-b border-[--color-border] flex items-center justify-between">
        <div><h3 className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-muted]">{lang==='mg'?'Vahaolana tsikelikely':'Résolution étape par étape'}</h3><p className="text-[10px] text-[--color-text-muted] mt-0.5">{lang==='mg'?'Tsindrio “Fa maninona?” raha mila fanazavana.':'Appuie sur “Pourquoi ?” pour comprendre une étape.'}</p></div>
        <span className="text-[9px] font-mono text-[--color-text-muted] bg-[--color-btn-bg] px-2 py-0.5 rounded-full">{steps.length}</span>
      </div>
      <div className="divide-y divide-[--color-border]/60">
        {steps.map((s, i) => {
          const warn = s.type === 'warning';
          const ok = !warn && (s.highlight || s.type === 'result');
          const info = s.type === 'info';
          return (
            <div key={i} className="px-5 py-3 text-[13px]"
              style={{ backgroundColor: ok ? 'var(--color-ok-bg)' : warn ? 'var(--color-warn-bg)' : info ? 'var(--color-info-bg)' : 'transparent' }}>
              <div className="flex gap-3">
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
                <div className="min-w-0 flex-1">
                  <span className="inline-flex mb-1 px-2 py-0.5 rounded-full bg-[--color-btn-bg] text-[8px] uppercase tracking-widest font-bold text-[--color-text-muted]">{stepLabel(s.type,i,steps.length,lang)}</span>
                  <span className={`block font-mono leading-relaxed ${ok ? 'font-semibold' : ''}`}
                    style={{ color: ok ? 'var(--color-ok-text)' : warn ? 'var(--color-warn-text)' : info ? 'var(--color-text-secondary)' : 'var(--color-text)' }}
                    dangerouslySetInnerHTML={{ __html: fmt(s.text) }} />
                  {!warn&&<button onClick={()=>setOpenExplanation(openExplanation===i?null:i)} className="block mt-2 text-[10px] font-bold text-[--color-accent] cursor-pointer">{openExplanation===i?(lang==='mg'?'Akatona':'Masquer'):(lang==='mg'?'Fa maninona?':'Pourquoi ?')}</button>}
                </div>
              </div>
              {openExplanation===i&&!warn&&<div className="ml-8 mt-2 p-3 rounded-xl bg-[--color-inset] text-xs leading-relaxed text-[--color-text-secondary]">{explainStep(s.text,lang)}</div>}
            </div>
          );
        })}
      </div>
      {result && (
        <div className="px-5 py-4 border-t" style={{ backgroundColor: 'var(--color-ok-bg)', borderColor: 'var(--color-ok-border)' }}>
          <p className="text-[9px] uppercase tracking-widest font-bold mb-1.5" style={{ color: 'var(--color-ok-text)', opacity: 0.65 }}>{lang==='mg'?'Valiny':'Résultat'}</p>
          <p className="text-lg font-bold font-mono" style={{ color: 'var(--color-ok-text)' }} dangerouslySetInnerHTML={{ __html: fmt(result) }} />
        </div>
      )}
    </div>
  );
}
