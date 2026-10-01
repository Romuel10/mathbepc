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
    .replace(/->|→/g, '⇒')
    .replace(/\*/g, '×')
    .replace(/√(\d+(?:[.,]\d+)?)/g, '<span class="math-root">√$1</span>')
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
    .replace(/\^(\d+)/g, '<sup>$1</sup>')
    .replace(/(^|[^\w])(-?\d+(?:[.,]\d+)?)\/(-?\d+(?:[.,]\d+)?)(?=$|[^\w])/g,
      '$1<span class="math-frac"><span>$2</span><span>$3</span></span>');
}

function stepLabel(type: string | undefined, index: number, lang: Lang): string {
  if (type === 'result') return lang === 'mg' ? 'Famaranana' : 'Conclusion';
  if (type === 'info') return lang === 'mg' ? 'Fitsipika' : 'Propriété';
  if (type === 'warning') return lang === 'mg' ? 'Fampitandremana' : 'Attention';
  return lang === 'mg' ? `Dingana ${index + 1}` : `Étape ${index + 1}`;
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
    <section className="solution-panel mt-7" aria-label={lang==='mg'?'Vahaolana tsikelikely':'Solution détaillée'}>
      <header className="solution-header">
        <div>
          <p className="solution-eyebrow">{lang==='mg'?'VAHAOLANA':'SOLUTION'}</p>
          <h3 className="solution-title">{lang==='mg'?'Andao hatao tsikelikely':'Résolution étape par étape'}</h3>
          <p className="solution-subtitle">{lang==='mg'?'Dingana iray isaky ny mandeha. Tsindrio ny fanazavana raha mila mahafantatra ny antony.':'Une transformation à la fois. Ouvre l’explication d’une étape pour comprendre pourquoi elle est valable.'}</p>
        </div>
        <span className="solution-count">{steps.length} {lang==='mg'?'dingana':'étape(s)'}</span>
      </header>

      <div className="solution-steps">
        {steps.map((s, i) => {
          const warn=s.type==='warning';
          const conclusion=s.type==='result'||s.highlight;
          const explanation=explainStep(s.text,lang);
          return (
            <article key={i} className={`solution-step ${warn?'solution-step-warning':''} ${conclusion?'solution-step-result':''}`}>
              <div className="solution-step-rail" aria-hidden="true">
                <span className={`solution-step-dot ${conclusion?'solution-step-dot-done':''}`}>
                  {conclusion?<CheckIcon className="w-3.5 h-3.5"/>:i+1}
                </span>
                {i<steps.length-1&&<span className="solution-step-line"/>}
              </div>

              <div className="solution-step-body">
                <div className="solution-step-top">
                  <span className="solution-step-label">{stepLabel(s.type,i,lang)}</span>
                  {!warn&&<button
                    type="button"
                    onClick={()=>setOpenExplanation(openExplanation===i?null:i)}
                    className="solution-why"
                    aria-expanded={openExplanation===i}
                  >
                    {openExplanation===i
                      ? (lang==='mg'?'Akatona':'Masquer')
                      : (lang==='mg'?'Fa maninona ?':'Pourquoi ?')}
                  </button>}
                </div>

                <div
                  className={`math-expression ${conclusion?'math-expression-result':''} ${warn?'math-expression-warning':''}`}
                  dangerouslySetInnerHTML={{__html:fmt(s.text)}}
                />

                {openExplanation===i&&!warn&&(
                  <div className="solution-explanation">
                    <span className="solution-explanation-title">{lang==='mg'?'Fanazavana':'Explication'}</span>
                    <p>{explanation}</p>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {result&&(
        <footer className="final-answer">
          <div className="final-answer-icon"><CheckIcon className="w-4 h-4"/></div>
          <div className="min-w-0">
            <p className="final-answer-label">{lang==='mg'?'VALINY FARANY':'RÉPONSE FINALE'}</p>
            <div className="final-answer-value" dangerouslySetInnerHTML={{__html:fmt(result)}}/>
          </div>
        </footer>
      )}
    </section>
  );
}
