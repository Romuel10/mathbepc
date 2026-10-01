import { useEffect, useMemo, useState } from 'react';
import type { Lang } from '../utils/i18n';
import { checkPracticeAnswer, generatePractice, type PracticeExercise, type PracticeLevel } from '../utils/practice';
import { recordAttempt, recordExam } from '../utils/progress';
import StepDisplay from './StepDisplay';

function buildExam(level:PracticeLevel,count:number):PracticeExercise[]{
  const wanted=['fractions','equations','geometry','stats','powers','radicals','development','factorization'];
  return Array.from({length:count},(_,i)=>generatePractice(level,wanted[i%wanted.length]));
}

export default function ExamMode({lang}:{lang:Lang}){
  const mg=lang==='mg';
  const [duration,setDuration]=useState(30);
  const [level,setLevel]=useState<PracticeLevel>('bepc');
  const [started,setStarted]=useState(false);
  const [submitted,setSubmitted]=useState(false);
  const [remaining,setRemaining]=useState(0);
  const [exercises,setExercises]=useState<PracticeExercise[]>([]);
  const [answers,setAnswers]=useState<Record<string,string>>({});
  const [score,setScore]=useState(0);

  const start=()=>{setExercises(buildExam(level,10));setAnswers({});setSubmitted(false);setScore(0);setRemaining(duration*60);setStarted(true);};
  const submit=()=>{
    if(submitted)return;
    let points=0;
    for(const ex of exercises){const ok=checkPracticeAnswer(ex,answers[ex.id]||'');if(ok)points++;recordAttempt(ex.chapterId,ok);}
    setScore(points);setSubmitted(true);setStarted(false);recordExam(points,exercises.length,exercises.map(e=>e.chapterId));
  };
  useEffect(()=>{
    if(!started||submitted)return;
    if(remaining<=0){submit();return;}
    const id=window.setInterval(()=>setRemaining(r=>r-1),1000);return()=>window.clearInterval(id);
  },[started,submitted,remaining]); // eslint-disable-line react-hooks/exhaustive-deps
  const time=useMemo(()=>`${String(Math.floor(remaining/60)).padStart(2,'0')}:${String(remaining%60).padStart(2,'0')}`,[remaining]);

  if(!started&&!submitted)return <div className="max-w-3xl mx-auto animate-fade-up"><h1 className="text-2xl sm:text-4xl font-extrabold">{mg?'Fanadinana andrana':'Mode examen'}</h1><p className="mt-2 text-sm text-[--color-text-secondary]">{mg?'Tsy misy indice mandritra ny fanadinana. Hivoaka aorian’ny farany ny correction.':'Aucun indice pendant l’épreuve. La correction apparaît seulement après avoir rendu la copie.'}</p><div className="mt-6 rounded-2xl border border-[--color-border] bg-[--color-card] p-5 space-y-5"><div><label className="text-xs font-bold">{mg?'Fotoana':'Durée'}</label><div className="grid grid-cols-3 gap-2 mt-2">{[15,30,45].map(v=><button key={v} onClick={()=>setDuration(v)} className={`py-3 rounded-xl font-bold text-sm cursor-pointer ${duration===v?'bg-[--color-accent] text-white':'bg-[--color-btn-bg]'}`}>{v} min</button>)}</div></div><div><label className="text-xs font-bold">Niveau</label><div className="grid grid-cols-2 gap-2 mt-2">{(['medium','bepc'] as PracticeLevel[]).map(v=><button key={v} onClick={()=>setLevel(v)} className={`py-3 rounded-xl font-bold text-sm cursor-pointer ${level===v?'bg-[--color-accent] text-white':'bg-[--color-btn-bg]'}`}>{v==='bepc'?'BEPC':mg?'Antonony':'Moyen'}</button>)}</div></div><div className="p-3 rounded-xl bg-[--color-inset] text-xs text-[--color-text-secondary]">10 {mg?'fanontaniana mifangaro. Naoty /20 (2 points isaky ny fanontaniana).':'questions mélangées. Note sur 20 (2 points par question).'}</div><button onClick={start} className="w-full py-3.5 rounded-xl bg-[--color-accent] text-white font-bold cursor-pointer">{mg?'Hanomboka':'Commencer l’épreuve'}</button></div></div>;

  if(submitted)return <div className="max-w-3xl mx-auto animate-fade-up"><div className="text-center rounded-2xl border border-[--color-border] bg-[--color-card] p-6"><p className="text-xs uppercase tracking-widest text-[--color-text-muted]">{mg?'Valin’ny fanadinana':'Résultat de l’examen'}</p><p className="text-5xl font-extrabold text-[--color-accent] mt-2">{score*2}/20</p><p className="text-sm text-[--color-text-secondary] mt-2">{score}/{exercises.length} {mg?'valiny marina':'réponses correctes'}</p><button onClick={()=>setSubmitted(false)} className="mt-4 px-4 py-2.5 rounded-xl bg-[--color-btn-bg] font-bold text-xs cursor-pointer">{mg?'Hanao fanadinana hafa':'Nouvel examen'}</button></div><div className="space-y-5 mt-5">{exercises.map((ex,i)=>{const ok=checkPracticeAnswer(ex,answers[ex.id]||'');return <div key={ex.id} className="rounded-2xl border border-[--color-border] bg-[--color-card] p-4"><div className="flex justify-between gap-3"><p className="font-bold">{i+1}. {ex.question[lang]}</p><span className={`text-xs font-bold ${ok?'text-[--color-ok-text]':'text-[--color-warn-text]'}`}>{ok?'OK':'À revoir'}</span></div><p className="text-xs mt-2">{mg?'Valinao':'Ta réponse'} : <span className="font-mono">{answers[ex.id]||'—'}</span></p><p className="text-xs">{mg?'Valiny marina':'Réponse attendue'} : <span className="font-mono font-bold">{ex.resultLabel}</span></p><StepDisplay steps={ex.steps} result={ex.resultLabel}/></div>})}</div></div>;

  return <div className="max-w-3xl mx-auto animate-fade-up"><div className="sticky top-[72px] z-30 flex items-center justify-between rounded-2xl border border-[--color-border] bg-[--color-card]/95 backdrop-blur px-4 py-3 shadow-lg"><div><p className="text-[10px] uppercase tracking-widest text-[--color-text-muted]">{mg?'Fotoana sisa':'Temps restant'}</p><p className={`font-mono text-xl font-bold ${remaining<300?'text-[--color-warn-text]':'text-[--color-accent]'}`}>{time}</p></div><button onClick={submit} className="px-4 py-2.5 rounded-xl bg-[--color-accent] text-white text-xs font-bold cursor-pointer">{mg?'Avereno ny copie':'Rendre la copie'}</button></div><div className="space-y-4 mt-5">{exercises.map((ex,i)=><div key={ex.id} className="rounded-2xl border border-[--color-border] bg-[--color-card] p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-[--color-accent]">Question {i+1}/10</p><p className="font-bold mt-2">{ex.question[lang]}</p><input value={answers[ex.id]||''} onChange={e=>setAnswers(a=>({...a,[ex.id]:e.target.value}))} placeholder={mg?'Valinao…':'Ta réponse…'} className="mt-3 w-full px-4 py-3 rounded-xl border border-[--color-input-border] bg-[--color-input-bg] font-mono" /></div>)}</div></div>;
}
