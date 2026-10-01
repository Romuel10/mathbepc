import { useEffect, useState } from 'react';
import type { Lang } from '../utils/i18n';
import { checkPracticeAnswer, generatePractice, labelForLevel, PRACTICE_CHAPTERS, type PracticeExercise, type PracticeLevel } from '../utils/practice';
import { recordAttempt } from '../utils/progress';
import MathKeyboard from './MathKeyboard';
import StepDisplay from './StepDisplay';

const chapterNames:Record<string,{fr:string;mg:string}>={fractions:{fr:'Fractions',mg:'Fraction'},radicals:{fr:'Racines carrées',mg:'Racine carrée'},powers:{fr:'Puissances',mg:'Puissance'},equations:{fr:'Équations',mg:'Équation'},functions:{fr:'Applications affines',mg:'Application affine'},geometry:{fr:'Géométrie',mg:'Géométrie'},circle:{fr:'Angles inscrits',mg:'Angle inscrit'},vectors:{fr:'Vecteurs & droites',mg:'Vecteur & droite'},space:{fr:'Géométrie dans l’espace',mg:'Géométrie espace'},stats:{fr:'Statistiques',mg:'Statistique'},development:{fr:'Développement',mg:'Développement'},factorization:{fr:'Factorisation',mg:'Factorisation'}};

export default function PracticeMode({lang}:{lang:Lang}){
  const [level,setLevel]=useState<PracticeLevel>('easy');
  const [chapter,setChapter]=useState('');
  const [exercise,setExercise]=useState<PracticeExercise>(()=>generatePractice('easy'));
  const [answer,setAnswer]=useState('');
  const [status,setStatus]=useState<'idle'|'correct'|'wrong'>('idle');
  const [hints,setHints]=useState(0);
  const [steps,setSteps]=useState(0);
  const [recorded,setRecorded]=useState(false);
  const mg=lang==='mg';
  const next=()=>{setExercise(generatePractice(level,chapter||undefined));setAnswer('');setStatus('idle');setHints(0);setSteps(0);setRecorded(false);};
  useEffect(()=>{next();},[level,chapter]); // eslint-disable-line react-hooks/exhaustive-deps
  const check=()=>{
    const ok=checkPracticeAnswer(exercise,answer);setStatus(ok?'correct':'wrong');
    if(!recorded){recordAttempt(exercise.chapterId,ok);setRecorded(true);}
  };
  return <div className="max-w-3xl mx-auto animate-fade-up">
    <h1 className="text-2xl sm:text-4xl font-extrabold">{mg?'Fanazarana tsikelikely':'Entraînement guidé'}</h1>
    <p className="mt-2 text-sm text-[--color-text-secondary]">{mg?'Miezaha mamaly aloha. Raha voasakana ianao dia mangataha torohevitra iray monja.':'Essaie d’abord seul. Si tu bloques, demande un indice ou seulement l’étape suivante.'}</p>
    <div className="grid sm:grid-cols-2 gap-3 mt-5">
      <div><label className="text-[10px] uppercase tracking-widest font-bold text-[--color-text-muted]">Niveau</label><div className="flex gap-2 mt-2">{(['easy','medium','bepc'] as PracticeLevel[]).map(l=><button key={l} onClick={()=>setLevel(l)} className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer ${level===l?'bg-[--color-accent] text-white':'bg-[--color-btn-bg]'}`}>{labelForLevel(l,lang)}</button>)}</div></div>
      <div><label className="text-[10px] uppercase tracking-widest font-bold text-[--color-text-muted]">{mg?'Toko':'Chapitre'}</label><select value={chapter} onChange={e=>setChapter(e.target.value)} className="mt-2 w-full py-2.5 px-3 rounded-xl bg-[--color-input-bg] border border-[--color-input-border] text-sm"><option value="">{mg?'Mifangaro':'Mélangé'}</option>{PRACTICE_CHAPTERS.map(id=><option key={id} value={id}>{chapterNames[id][lang]}</option>)}</select></div>
    </div>
    <div className="mt-5 rounded-2xl border border-[--color-border] bg-[--color-card] p-5">
      <div className="flex items-center justify-between"><span className="text-[10px] uppercase tracking-widest font-bold text-[--color-accent]">{exercise.title[lang]}</span><span className="text-[10px] text-[--color-text-muted]">{labelForLevel(level,lang)}</span></div>
      <p className="text-lg sm:text-xl font-bold mt-3 leading-relaxed">{exercise.question[lang]}</p>
      <div className="mt-5"><input value={answer} onChange={e=>{setAnswer(e.target.value);setStatus('idle');}} onKeyDown={e=>e.key==='Enter'&&check()} placeholder={mg?'Valinao…':'Ta réponse…'} className="w-full px-4 py-3 rounded-xl border border-[--color-input-border] bg-[--color-input-bg] font-mono text-base focus:outline-none focus:ring-2 focus:ring-[--color-input-focus]" /></div>
      <details className="mt-3"><summary className="text-xs font-semibold text-[--color-accent] cursor-pointer">{mg?'Clavier matematika':'Clavier mathématique'}</summary><div className="mt-2"><MathKeyboard onInsert={v=>setAnswer(a=>a+v)} onBackspace={()=>setAnswer(a=>a.slice(0,-1))} onClear={()=>setAnswer('')} /></div></details>
      <div className="grid grid-cols-2 gap-2 mt-4"><button onClick={check} className="py-3 rounded-xl bg-[--color-accent] text-white font-bold text-sm cursor-pointer">{mg?'Hamarino':'Vérifier ma réponse'}</button><button onClick={next} className="py-3 rounded-xl bg-[--color-btn-bg] font-bold text-sm cursor-pointer">{mg?'Fanontaniana hafa':'Nouvel exercice'}</button></div>
      {status==='correct'&&<div className="mt-3 p-3 rounded-xl bg-[--color-ok-bg] text-[--color-ok-text] text-sm font-bold">{mg?'Marina. Tohizo!':'Bonne réponse. Continue !'}</div>}
      {status==='wrong'&&<div className="mt-3 p-3 rounded-xl bg-[--color-warn-bg] text-[--color-warn-text] text-sm font-semibold">{mg?'Mbola tsy marina. Andramo indray na mangataha torohevitra.':'Pas encore. Réessaie ou demande un indice.'}</div>}
      <div className="flex flex-wrap gap-2 mt-4"><button onClick={()=>setHints(h=>Math.min(exercise.hints.length,h+1))} disabled={hints>=exercise.hints.length} className="px-3 py-2 rounded-xl bg-[--color-btn-bg] text-xs font-bold disabled:opacity-40 cursor-pointer">{mg?'Torohevitra':'Indice'}</button><button onClick={()=>setSteps(s=>Math.min(exercise.steps.length,s+1))} disabled={steps>=exercise.steps.length} className="px-3 py-2 rounded-xl bg-[--color-btn-bg] text-xs font-bold disabled:opacity-40 cursor-pointer">{mg?'Dingana manaraka':'Étape suivante'}</button><button onClick={()=>setSteps(exercise.steps.length)} className="px-3 py-2 rounded-xl bg-[--color-btn-bg] text-xs font-bold cursor-pointer">{mg?'Asehoy ny vahaolana':'Voir toute la solution'}</button></div>
      {hints>0&&<div className="mt-4 space-y-2">{exercise.hints.slice(0,hints).map((h,i)=><div key={i} className="p-3 rounded-xl bg-[--color-accent-subtle] text-xs"><strong>{mg?'Torohevitra':'Indice'} {i+1} :</strong> {h[lang]}</div>)}</div>}
    </div>
    {steps>0&&<StepDisplay steps={exercise.steps.slice(0,steps)} result={steps===exercise.steps.length?exercise.resultLabel:undefined} />}
  </div>;
}
