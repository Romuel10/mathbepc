import { useEffect, useState } from 'react';
import type { Lang } from '../utils/i18n';
import { checkPracticeAnswer, generatePractice, labelForLevel, PRACTICE_CHAPTERS, type PracticeExercise, type PracticeLevel } from '../utils/practice';
import { recordAttempt } from '../utils/progress';
import MathKeyboard from './MathKeyboard';
import StepDisplay from './StepDisplay';
import PageHeader from './PageHeader';

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
    const ok=checkPracticeAnswer(exercise,answer);
    setStatus(ok?'correct':'wrong');
    if(!recorded){recordAttempt(exercise.chapterId,ok);setRecorded(true);}
  };

  return <div className="page-narrow animate-fade-up">
    <PageHeader title={mg?'Hanao fanazarana':'S’entraîner'} description={mg?'Mamalia aloha, avy eo ampiasao ny indice raha tena ilaina.':'Réponds d’abord seul, puis utilise un indice seulement si tu bloques.'}/>

    <section className="control-panel">
      <div className="control-field">
        <span className="field-label">Niveau</span>
        <div className="segmented-control">
          {(['easy','medium','bepc'] as PracticeLevel[]).map(l=><button key={l} type="button" onClick={()=>setLevel(l)} className={level===l?'is-active':''}>{labelForLevel(l,lang)}</button>)}
        </div>
      </div>
      <label className="control-field">
        <span className="field-label">{mg?'Toko':'Chapitre'}</span>
        <select value={chapter} onChange={e=>setChapter(e.target.value)} className="field-input">
          <option value="">{mg?'Mifangaro':'Tous les chapitres'}</option>
          {PRACTICE_CHAPTERS.map(id=><option key={id} value={id}>{chapterNames[id][lang]}</option>)}
        </select>
      </label>
    </section>

    <section className="exercise-card">
      <div className="exercise-meta"><span>{exercise.title[lang]}</span><span>{labelForLevel(level,lang)}</span></div>
      <p className="exercise-question">{exercise.question[lang]}</p>
      <label className="field mt-6">
        <span className="field-label">{mg?'Valinao':'Ta réponse'}</span>
        <input value={answer} onChange={e=>{setAnswer(e.target.value);setStatus('idle');}} onKeyDown={e=>e.key==='Enter'&&check()} placeholder={mg?'Soraty eto…':'Écris ta réponse…'} className="field-input math-input answer-input"/>
      </label>

      <details className="keyboard-details">
        <summary>{mg?'Clavier matematika':'Clavier mathématique'}</summary>
        <div className="mt-3"><MathKeyboard onInsert={v=>setAnswer(a=>a+v)} onBackspace={()=>setAnswer(a=>a.slice(0,-1))} onClear={()=>setAnswer('')}/></div>
      </details>

      <div className="action-row">
        <button type="button" onClick={check} className="primary-button">{mg?'Hamarino':'Vérifier'}</button>
        <button type="button" onClick={next} className="secondary-button">{mg?'Hafa':'Nouvel exercice'}</button>
      </div>

      {status==='correct'&&<div className="feedback feedback-success">{mg?'Marina. Tohizo!':'Bonne réponse. Continue !'}</div>}
      {status==='wrong'&&<div className="feedback feedback-warning">{mg?'Mbola tsy marina. Andramo indray na mangataha torohevitra.':'Pas encore. Réessaie ou demande un indice.'}</div>}

      <div className="help-actions">
        <button type="button" onClick={()=>setHints(h=>Math.min(exercise.hints.length,h+1))} disabled={hints>=exercise.hints.length}>{mg?'Torohevitra':'Indice'}</button>
        <button type="button" onClick={()=>setSteps(s=>Math.min(exercise.steps.length,s+1))} disabled={steps>=exercise.steps.length}>{mg?'Dingana manaraka':'Étape suivante'}</button>
        <button type="button" onClick={()=>setSteps(exercise.steps.length)}>{mg?'Vahaolana rehetra':'Solution complète'}</button>
      </div>

      {hints>0&&<div className="hint-list">{exercise.hints.slice(0,hints).map((h,i)=><div key={i} className="hint-card"><strong>{mg?'Torohevitra':'Indice'} {i+1}</strong><span>{h[lang]}</span></div>)}</div>}
    </section>

    {steps>0&&<StepDisplay steps={exercise.steps.slice(0,steps)} result={steps===exercise.steps.length?exercise.resultLabel:undefined}/>}
  </div>;
}
