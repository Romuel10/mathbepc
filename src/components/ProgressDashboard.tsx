import { useEffect, useState } from 'react';
import type { Lang } from '../utils/i18n';
import { loadProgress, resetProgress, type ProgressData } from '../utils/progress';
import PageHeader from './PageHeader';

const names:Record<string,string>={fractions:'Fractions',radicals:'Racines carrées',powers:'Puissances',absolute:'Valeur absolue',development:'Développement',factorization:'Factorisation',equations:'Équations',functions:'Applications affines',vectors:'Vecteurs',geometry:'Géométrie plane',circle:'Angles inscrits',space:'Espace',stats:'Statistiques'};

export default function ProgressDashboard({lang}:{lang:Lang}){
  const [data,setData]=useState<ProgressData>(()=>loadProgress());
  const mg=lang==='mg';
  useEffect(()=>{const h=()=>setData(loadProgress());window.addEventListener('mathbepc-progress',h);return()=>window.removeEventListener('mathbepc-progress',h);},[]);
  const accuracy=data.attempts?Math.round(data.correct/data.attempts*100):0;
  const reset=()=>{if(window.confirm(mg?'Hofafana ve ny fandrosoana rehetra?':'Effacer tout l’historique de progression ?')){resetProgress();setData(loadProgress());}};
  const rows=Object.entries(data.byChapter).sort((a,b)=>b[1].attempts-a[1].attempts);

  return <div className="page-medium animate-fade-up">
    <PageHeader title={mg?'Fandrosoako':'Mes progrès'} description={mg?'Voatahiry ao amin’ity appareil ity ihany.':'Tes résultats sont enregistrés uniquement sur cet appareil.'}/>

    <div className="metrics-grid">
      {[
        [mg?'Fanazarana':'Exercices',data.attempts],
        [mg?'Fahombiazana':'Réussite',`${accuracy}%`],
        [mg?'Fanadinana':'Examens',data.examsCompleted],
        [mg?'Andro misesy':'Jours de suite',data.streakDays],
      ].map(([label,value])=><div key={String(label)} className="metric-card"><strong>{value}</strong><span>{label}</span></div>)}
    </div>

    <section className="progress-highlight">
      <div><h2>{mg?'Examen tsara indrindra':'Meilleur examen'}</h2><p>{mg?'Naoty ambony indrindra voatahiry':'Meilleur résultat enregistré'}</p></div>
      <strong>{data.bestExamPercent}%</strong>
    </section>

    <section className="progress-section">
      <h2>{mg?'Isaky ny toko':'Par chapitre'}</h2>
      {rows.length===0?<p className="empty-state">{mg?'Mbola tsy misy fanazarana vita.':'Aucun exercice enregistré pour le moment.'}</p>:<div className="chapter-progress-list">
        {rows.map(([id,p])=>{const pct=p.attempts?Math.round(p.correct/p.attempts*100):0;return <div key={id} className="chapter-progress-row">
          <div className="chapter-progress-top"><span>{names[id]||id}</span><small>{p.correct}/{p.attempts} • {pct}%</small></div>
          <div className="progress-track"><span style={{width:`${pct}%`}}/></div>
        </div>;})}
      </div>}
    </section>

    <button type="button" onClick={reset} className="danger-text-button">{mg?'Hamafa ny fandrosoana':'Réinitialiser mes progrès'}</button>
  </div>;
}
