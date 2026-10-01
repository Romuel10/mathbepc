import { useRef, useState } from 'react';
import type { Lang } from '../utils/i18n';
import { analyseExercise, type SmartAnalysis } from '../utils/smartDetect';
import MathKeyboard from './MathKeyboard';
import StepDisplay from './StepDisplay';
import FunctionPlot from './FunctionPlot';

interface Props { lang: Lang; onOpenChapter: (id:string)=>void; }

export default function SmartSolve({ lang, onOpenChapter }: Props) {
  const [text,setText]=useState('');
  const [analysis,setAnalysis]=useState<SmartAnalysis|null>(null);
  const [keyboard,setKeyboard]=useState(true);
  const inputRef=useRef<HTMLTextAreaElement|null>(null);
  const mg=lang==='mg';

  const insert=(value:string)=>{
    const textarea=inputRef.current;
    const token=value==='x²'?'x²':value;
    if(!textarea){setText(v=>v+token);return;}
    const start=textarea.selectionStart??text.length,end=textarea.selectionEnd??text.length;
    const next=text.slice(0,start)+token+text.slice(end);
    setText(next);
    requestAnimationFrame(()=>{textarea.focus();textarea.setSelectionRange(start+token.length,start+token.length);});
  };
  const backspace=()=>{
    const textarea=inputRef.current;
    if(!textarea){setText(v=>v.slice(0,-1));return;}
    const start=textarea.selectionStart??text.length,end=textarea.selectionEnd??text.length;
    if(start!==end){setText(text.slice(0,start)+text.slice(end));return;}
    if(start>0){setText(text.slice(0,start-1)+text.slice(end));requestAnimationFrame(()=>textarea.setSelectionRange(start-1,start-1));}
  };
  const run=()=>setAnalysis(analyseExercise(text,lang));

  return <div className="max-w-3xl mx-auto animate-fade-up">
    <div className="mb-6">
      <span className="inline-flex px-3 py-1 rounded-full bg-[--color-accent-subtle] text-[--color-accent] text-[11px] font-bold">{mg?'Mpanampy marani-tsaina':'Saisie intelligente'}</span>
      <h1 className="text-2xl sm:text-4xl font-extrabold mt-3">{mg?'Soraty fotsiny ny fanontanianao.':'Écris simplement ton exercice.'}</h1>
      <p className="text-sm text-[--color-text-secondary] mt-2">{mg?'Ohatra: 3x + 5 = 20, 25% amin’ny 240, na 3/4 + 2/5.':'Exemples : 3x + 5 = 20, 25% de 240, ou 3/4 + 2/5.'}</p>
    </div>
    <div className="rounded-2xl border border-[--color-border] bg-[--color-card] p-4 sm:p-5">
      <textarea ref={inputRef} value={text} onChange={e=>setText(e.target.value)} rows={4}
        placeholder={mg?'Soraty eto ny exercice…':'Écris ton exercice ici…'}
        className="w-full resize-none rounded-xl border border-[--color-input-border] bg-[--color-input-bg] px-4 py-3 text-base font-mono focus:outline-none focus:ring-2 focus:ring-[--color-input-focus]" />
      <div className="flex flex-wrap gap-2 mt-3">
        {['3x + 5 = 20','x² - 5x + 6 = 0','25% de 240','3/4 + 2/5'].map(v=><button key={v} onClick={()=>{setText(v);setAnalysis(null);}} className="px-2.5 py-1.5 rounded-lg bg-[--color-btn-bg] text-[11px] font-mono cursor-pointer">{v}</button>)}
      </div>
      <button onClick={()=>setKeyboard(v=>!v)} className="mt-3 text-xs font-semibold text-[--color-accent] cursor-pointer">{keyboard?'Masquer':'Afficher'} le clavier mathématique</button>
      {keyboard&&<div className="mt-3"><MathKeyboard onInsert={insert} onBackspace={backspace} onClear={()=>{setText('');setAnalysis(null);}} /></div>}
      <button onClick={run} disabled={!text.trim()} className="mt-4 w-full py-3.5 rounded-xl bg-[--color-accent] text-white font-bold text-sm disabled:opacity-40 cursor-pointer">{mg?'Fantaro ary vahao':'Reconnaître et résoudre'}</button>
    </div>

    {analysis&&<div className="mt-5">
      <div className="rounded-2xl border border-[--color-border] bg-[--color-card] p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div><p className="text-[10px] uppercase tracking-widest text-[--color-text-muted] font-bold">{mg?'Toko hita':'Chapitre reconnu'} • {Math.round(analysis.confidence*100)}%</p><p className="font-bold mt-1">{analysis.title}</p><p className="text-xs text-[--color-text-secondary] mt-1">{analysis.reason}</p></div>
        <button onClick={()=>onOpenChapter(analysis.chapterId)} className="px-4 py-2.5 rounded-xl bg-[--color-btn-bg] hover:bg-[--color-btn-bg-hover] text-xs font-bold cursor-pointer whitespace-nowrap">{mg?'Sokafy ny fitaovana':'Ouvrir l’outil complet'}</button>
      </div>
      {analysis.steps&&<StepDisplay steps={analysis.steps} result={analysis.result} />}
      {analysis.graph&&<FunctionPlot {...analysis.graph} />}
    </div>}
  </div>;
}
