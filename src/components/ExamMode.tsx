import { useEffect, useMemo, useState } from 'react';
import type { Lang } from '../utils/i18n';
import { checkPracticeAnswer, generatePractice, type PracticeExercise, type PracticeLevel } from '../utils/practice';
import { recordAttempt, recordExam } from '../utils/progress';
import StepDisplay from './StepDisplay';
import PageHeader from './PageHeader';

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
  const submit=()=>{if(submitted)return;let points=0;for(const ex of exercises){const ok=checkPracticeAnswer(ex,answers[ex.id]||'');if(ok)points++;recordAttempt(ex.chapterId,ok);}setScore(points);setSubmitted(true);setStarted(false);recordExam(points,exercises.length,exercises.map(e=>e.chapterId));};
  useEffect(()=>{if(!started||submitted)return;if(remaining<=0){submit();return;}const id=window.setInterval(()=>setRemaining(r=>r-1),1000);return()=>window.clearInterval(id);},[started,submitted,remaining]); // eslint-disable-line react-hooks/exhaustive-deps
  const time=useMemo(()=>String(Math.floor(remaining/60)).padStart(2,'0')+':'+String(remaining%60).padStart(2,'0'),[remaining]);

  if(!started&&!submitted)return <div className="page-narrow animate-fade-up">
    <PageHeader title={mg?'Fanadinana andrana':'Mode examen'} description={mg?'Fanontaniana 10, tsy misy indice, correction rehefa vita.':'10 questions, sans indice. La correction apparaît après avoir rendu la copie.'}/>
    <section className="exam-setup">
      <div className="control-field"><span className="field-label">{mg?'Fotoana':'Durée'}</span><div className="segmented-control">{[15,30,45].map(v=><button key={v} type="button" onClick={()=>setDuration(v)} className={duration===v?'is-active':''}>{v} min</button>)}</div></div>
      <div className="control-field"><span className="field-label">Niveau</span><div className="segmented-control">{(['medium','bepc'] as PracticeLevel[]).map(v=><button key={v} type="button" onClick={()=>setLevel(v)} className={level===v?'is-active':''}>{v==='bepc'?'BEPC':mg?'Antonony':'Moyen'}</button>)}</div></div>
      <div className="exam-summary-line"><span>10 {mg?'fanontaniana':'questions'}</span><span>•</span><span>{mg?'Naoty /20':'Note /20'}</span><span>•</span><span>{duration} min</span></div>
      <button type="button" onClick={start} className="primary-button w-full">{mg?'Hanomboka':'Commencer l’épreuve'}</button>
    </section>
  </div>;

  if(submitted)return <div className="page-medium animate-fade-up">
    <section className="exam-result"><p>{mg?'Valin’ny fanadinana':'Résultat'}</p><strong>{score*2}<small>/20</small></strong><span>{score}/{exercises.length} {mg?'valiny marina':'réponses correctes'}</span><button type="button" onClick={()=>setSubmitted(false)} className="secondary-button">{mg?'Fanadinana hafa':'Nouvel examen'}</button></section>
    <div className="correction-list">{exercises.map((ex,i)=>{const ok=checkPracticeAnswer(ex,answers[ex.id]||'');return <article key={ex.id} className="correction-card"><div className="correction-head"><span>Question {i+1}</span><strong className={ok?'is-correct':'is-wrong'}>{ok?(mg?'Marina':'Correct'):(mg?'Hojerena':'À revoir')}</strong></div><p className="correction-question">{ex.question[lang]}</p><div className="correction-answers"><span>{mg?'Valinao':'Ta réponse'} <strong>{answers[ex.id]||'—'}</strong></span><span>{mg?'Valiny':'Réponse'} <strong>{ex.resultLabel}</strong></span></div><StepDisplay steps={ex.steps} result={ex.resultLabel}/></article>;})}</div>
  </div>;

  return <div className="page-narrow animate-fade-up">
    <div className="exam-sticky-bar"><div><span>{mg?'Fotoana sisa':'Temps restant'}</span><strong className={remaining<300?'is-urgent':''}>{time}</strong></div><button type="button" onClick={submit} className="primary-button compact">{mg?'Avereno':'Rendre la copie'}</button></div>
    <div className="exam-question-list">{exercises.map((ex,i)=><article key={ex.id} className="exam-question-card"><div className="exam-question-count">Question {i+1} <span>/ 10</span></div><p>{ex.question[lang]}</p><input value={answers[ex.id]||''} onChange={e=>setAnswers(a=>({...a,[ex.id]:e.target.value}))} placeholder={mg?'Valinao…':'Ta réponse…'} className="field-input math-input"/></article>)}</div>
  </div>;
}
