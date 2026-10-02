import type { Lang } from '../utils/i18n';
import PageHeader from './PageHeader';

const annales=[
  {year:2018,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2018',corrected:true},
  {year:2017,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2017',corrected:true},
  {year:2016,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2016',corrected:true},
  {year:2015,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2015',corrected:true},
  {year:2014,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2014',corrected:true},
  {year:2013,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2013',corrected:true},
  {year:2012,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2012',corrected:true},
  {year:2011,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2011',corrected:true},
  {year:2010,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2010',corrected:true},
  {year:2009,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2009',corrected:true},
];

export default function Annales({lang,onStartExam}:{lang:Lang;onStartExam:()=>void}){
  const mg=lang==='mg';
  return <div className="page-medium animate-fade-up">
    <PageHeader title={mg?'Sujet BEPC taloha':'Annales BEPC'} description={mg?'Manao fanazaran-tena amin’ny sujet matematika BEPC Madagascar taloha.':'Travaille à partir d’anciens sujets de mathématiques du BEPC Madagascar.'}/>

    <section className="exam-callout">
      <div><h2>{mg?'Simulation tsy misy internet':'Simulation hors ligne'}</h2><p>{mg?'Fanontaniana mifangaro sy naoty /20.':'10 questions mélangées, chronomètre et note sur 20.'}</p></div>
      <button type="button" onClick={onStartExam} className="primary-button">{mg?'Hanomboka':'Lancer une simulation'}</button>
    </section>

    <div className="annales-list">
      {annales.map(a=><a key={a.year} href={a.url} target="_blank" rel="noreferrer" className="annale-row">
        <div className="annale-year">{a.year}</div>
        <div className="min-w-0 flex-1"><p className="annale-title">Mathématiques • BEPC Madagascar</p><p className="annale-meta">{a.corrected?(mg?'Misy corrigé':'Corrigé disponible'):(mg?'Sujet':'Sujet uniquement')}</p></div>
        <span className="row-arrow" aria-hidden="true">↗</span>
      </a>)}
    </div>
    <p className="source-note">{mg?'Misokatra amin’ny tranonkala LeChaya ireo sujet ireo.':'Les sujets s’ouvrent sur la ressource externe LeChaya.'}</p>
  </div>;
}
