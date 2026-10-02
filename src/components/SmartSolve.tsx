import { useRef, useState } from 'react';
import type { Lang } from '../utils/i18n';
import { analyseExercise, type SmartAnalysis } from '../utils/smartDetect';
import MathKeyboard from './MathKeyboard';
import StepDisplay from './StepDisplay';
import FunctionPlot from './FunctionPlot';
import PageHeader from './PageHeader';

interface Props { lang:Lang; onOpenChapter:(id:string)=>void; }

export default function SmartSolve({lang,onOpenChapter}:Props){
  const [text,setText]=useState('');
  const [analysis,setAnalysis]=useState<SmartAnalysis|null>(null);
  const [keyboard,setKeyboard]=useState(false);
  const inputRef=useRef<HTMLTextAreaElement|null>(null);
  const mg=lang==='mg';

  const insert=(value:string)=>{
    const textarea=inputRef.current;
    if(!textarea){setText(v=>v+value);return;}
    const start=textarea.selectionStart??text.length,end=textarea.selectionEnd??text.length;
    const next=text.slice(0,start)+value+text.slice(end);
    setText(next);
    requestAnimationFrame(()=>{textarea.focus();textarea.setSelectionRange(start+value.length,start+value.length);});
  };
  const backspace=()=>{
    const textarea=inputRef.current;
    if(!textarea){setText(v=>v.slice(0,-1));return;}
    const start=textarea.selectionStart??text.length,end=textarea.selectionEnd??text.length;
    if(start!==end){setText(text.slice(0,start)+text.slice(end));return;}
    if(start>0){setText(text.slice(0,start-1)+text.slice(end));requestAnimationFrame(()=>textarea.setSelectionRange(start-1,start-1));}
  };
  const run=()=>setAnalysis(analyseExercise(text,lang));

  return <div className="page-narrow animate-fade-up">
    <PageHeader
      title={mg?'Hamaha fanazarana':'Résoudre un exercice'}
      description={mg?'Soraty tahaka ny ao anaty kahie ny fanontaniana. Haseho amin’ny dingana mazava ny vahaolana.':'Écris l’exercice comme dans ton cahier. La solution sera présentée en étapes simples et lisibles.'}
    />

    <section className="solver-entry-card">
      <label className="solver-label" htmlFor="smart-exercise">{mg?'Fanontaniana':'Ton exercice'}</label>
      <textarea
        id="smart-exercise"
        ref={inputRef}
        value={text}
        onChange={e=>{setText(e.target.value);setAnalysis(null);}}
        rows={4}
        placeholder={mg?'Ohatra : 3x + 5 = 20':'Exemple : 3x + 5 = 20'}
        className="solver-textarea math-input"
      />
      <div className="example-row" aria-label={mg?'Ohatra':'Exemples'}>
        {['3x + 5 = 20','25% de 240','3/4 + 2/5','√72'].map(v=><button key={v} type="button" onClick={()=>{setText(v);setAnalysis(null);}} className="example-chip">{v}</button>)}
      </div>
      <div className="solver-tools-row">
        <button type="button" onClick={()=>setKeyboard(v=>!v)} className="text-button">
          {keyboard?(mg?'Akatona ny clavier':'Masquer le clavier'):(mg?'Clavier matematika':'Clavier mathématique')}
        </button>
        {text&&<button type="button" onClick={()=>{setText('');setAnalysis(null);}} className="text-button text-button-muted">{mg?'Hamafa':'Effacer'}</button>}
      </div>
      {keyboard&&<div className="mt-3"><MathKeyboard onInsert={insert} onBackspace={backspace} onClear={()=>{setText('');setAnalysis(null);}}/></div>}
      <button type="button" onClick={run} disabled={!text.trim()} className="primary-button w-full mt-4">{mg?'Asehoy ny vahaolana':'Voir la solution'}</button>
    </section>

    {analysis&&<section className="solution-area">
      <div className="method-card">
        <div className="min-w-0">
          <p className="method-card-label">{mg?'Fomba ampiasaina':'Méthode utilisée'}</p>
          <p className="method-card-title">{analysis.title}</p>
          <p className="method-card-description">{analysis.reason}</p>
        </div>
        <button type="button" onClick={()=>onOpenChapter(analysis.chapterId)} className="secondary-button shrink-0">{mg?'Toko':'Voir le chapitre'}</button>
      </div>
      {analysis.steps&&<StepDisplay steps={analysis.steps} result={analysis.result}/>}
      {analysis.graph&&<FunctionPlot {...analysis.graph}/>}
    </section>}
  </div>;
}
