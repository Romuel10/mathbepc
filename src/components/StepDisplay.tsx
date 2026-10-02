import { useEffect, useState } from 'react';
import { type Step } from '../utils/mathEngine';
import { explainStep } from '../utils/pedagogy';
import { getStoredLanguage, type Lang } from '../utils/i18n';

interface StepDisplayProps { steps:Step[]; result?:string; }

function escapeHtml(text:string):string{
  return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
}

function fmt(text:string):string{
  let html=escapeHtml(text).replace(/->|→/g,'⇒').replace(/\*/g,'×');
  html=html.replace(/(\([^()]{1,28}\)|-?\d+(?:[.,]\d+)?|[a-zA-Z]\w*)\s*\/\s*(\([^()]{1,28}\)|-?\d+(?:[.,]\d+)?|[a-zA-Z]\w*)/g,'<span class="math-frac"><span>$1</span><span>$2</span></span>');
  return html
    .replace(/√(\d+(?:[.,]\d+)?|[a-zA-Z])/g,'<span class="math-root">√$1</span>')
    .replace(/x²/g,'x<sup>2</sup>').replace(/x³/g,'x<sup>3</sup>')
    .replace(/(\d+)²/g,'$1<sup>2</sup>').replace(/(\d+)³/g,'$1<sup>3</sup>')
    .replace(/\^(\d+)/g,'<sup>$1</sup>')
    .replace(/x₁/g,'x<sub>1</sub>').replace(/x₂/g,'x<sub>2</sub>').replace(/x₀/g,'x<sub>0</sub>')
    .replace(/y₁/g,'y<sub>1</sub>').replace(/y₂/g,'y<sub>2</sub>')
    .replace(/a₁/g,'a<sub>1</sub>').replace(/a₂/g,'a<sub>2</sub>')
    .replace(/b₁/g,'b<sub>1</sub>').replace(/b₂/g,'b<sub>2</sub>')
    .replace(/c₁/g,'c<sub>1</sub>').replace(/c₂/g,'c<sub>2</sub>')
    .replace(/xᵢ/g,'x<sub>i</sub>').replace(/nᵢ/g,'n<sub>i</sub>')
    .replace(/Dₓ/g,'D<sub>x</sub>').replace(/Dᵧ/g,'D<sub>y</sub>')
    .replace(/σ²/g,'σ<sup>2</sup>');
}

function labelFor(type:string|undefined,index:number,lang:Lang){
  if(type==='result')return lang==='mg'?'Famaranana':'Conclusion';
  if(type==='info')return lang==='mg'?'Fitsipika':'Propriété';
  if(type==='warning')return lang==='mg'?'Fampitandremana':'Attention';
  return lang==='mg'?'Dingana '+(index+1):'Étape '+(index+1);
}

export default function StepDisplay({steps,result}:StepDisplayProps){
  const [lang,setLang]=useState<Lang>(()=>getStoredLanguage());
  const [open,setOpen]=useState<number|null>(null);
  useEffect(()=>{
    const handler=(event:Event)=>setLang(((event as CustomEvent<Lang>).detail)||getStoredLanguage());
    window.addEventListener('mathbepc-language',handler);
    return()=>window.removeEventListener('mathbepc-language',handler);
  },[]);
  if(!steps.length)return null;

  return <section className="solution-sheet" aria-label={lang==='mg'?'Vahaolana':'Solution'}>
    <div className="solution-sheet-header">
      <div><h2>{lang==='mg'?'Vahaolana':'Solution'}</h2><p>{lang==='mg'?'Araho tsikelikely ny dingana.':'Suis les étapes dans l’ordre.'}</p></div>
      <span>{steps.length} {lang==='mg'?'dingana':'étapes'}</span>
    </div>
    <div className="solution-list">
      {steps.map((step,index)=>{
        const warning=step.type==='warning';
        const emphasized=step.type==='result'||step.highlight;
        return <article key={index} className={'solution-row '+(warning?'is-warning ':'')+(emphasized?'is-emphasized':'')}>
          <div className="solution-row-head">
            <span className="solution-step-name">{labelFor(step.type,index,lang)}</span>
            {!warning&&<button type="button" onClick={()=>setOpen(open===index?null:index)} className="solution-explain-button">{open===index?(lang==='mg'?'Akatona':'Masquer'):(lang==='mg'?'Fanazavana':'Pourquoi ?')}</button>}
          </div>
          <div className="math-line" dangerouslySetInnerHTML={{__html:fmt(step.text)}}/>
          {open===index&&!warning&&<div className="explanation-box"><strong>{lang==='mg'?'Fanazavana':'Explication'}</strong><p>{explainStep(step.text,lang)}</p></div>}
        </article>;
      })}
    </div>
    {result&&<div className="answer-box"><span>{lang==='mg'?'Valiny':'Réponse'}</span><div dangerouslySetInnerHTML={{__html:fmt(result)}}/></div>}
  </section>;
}
