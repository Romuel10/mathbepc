import type { Lang } from '../utils/i18n';

const annales=[
  {year:2018,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2018',corrected:true},
  {year:2017,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2017',corrected:true},
  {year:2016,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2016',corrected:true},
  {year:2015,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2015',corrected:false},
  {year:2014,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2014',corrected:true},
  {year:2013,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2013',corrected:true},
  {year:2012,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2012',corrected:true},
  {year:2011,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2011',corrected:true},
  {year:2010,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2010',corrected:true},
  {year:2009,url:'https://www.lechaya.com/madagascar/subjects/madagascar-bepc-general-math-2009',corrected:true},
];

export default function Annales({lang,onStartExam}:{lang:Lang;onStartExam:()=>void}){
  const mg=lang==='mg';
  return <div className="max-w-4xl mx-auto animate-fade-up"><h1 className="text-2xl sm:text-4xl font-extrabold">{mg?'Sujet BEPC taloha':'Annales BEPC Madagascar'}</h1><p className="mt-2 text-sm text-[--color-text-secondary]">{mg?'Sujet matematika BEPC taloha. Mila internet ny rohy ivelany.':'Accès à des sujets de mathématiques BEPC Madagascar disponibles sur une ressource externe. Une connexion est nécessaire pour les ouvrir.'}</p><div className="mt-5 p-4 rounded-2xl border border-[--color-accent]/20 bg-[--color-accent-subtle] flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><p className="font-bold">{mg?'Te hanao simulation tsy misy internet?':'Tu veux t’entraîner hors ligne ?'}</p><p className="text-xs text-[--color-text-secondary] mt-1">{mg?'Ny mode examen dia mamorona sujet mifangaro ary manome naoty /20.':'Le mode examen génère une épreuve mélangée et donne une note sur 20.'}</p></div><button onClick={onStartExam} className="px-4 py-2.5 rounded-xl bg-[--color-accent] text-white text-xs font-bold cursor-pointer">{mg?'Simulation BEPC':'Lancer une simulation'}</button></div><div className="grid sm:grid-cols-2 gap-3 mt-5">{annales.map(a=><a key={a.year} href={a.url} target="_blank" rel="noreferrer" className="rounded-2xl border border-[--color-border] bg-[--color-card] p-4 hover:border-[--color-accent]/40 transition-colors"><div className="flex justify-between items-start"><div><p className="text-xl font-extrabold">BEPC {a.year}</p><p className="text-xs text-[--color-text-secondary] mt-1">Mathématiques • Madagascar</p></div><span className={`text-[10px] px-2 py-1 rounded-full ${a.corrected?'bg-[--color-ok-bg] text-[--color-ok-text]':'bg-[--color-btn-bg] text-[--color-text-muted]'}`}>{a.corrected?(mg?'Corrigé misy':'Corrigé disponible'):(mg?'Sujet ihany':'Sujet')}</span></div><p className="text-xs font-semibold text-[--color-accent] mt-4">{mg?'Sokafy ny sujet →':'Ouvrir le sujet →'}</p></a>)}</div><p className="text-[10px] text-[--color-text-muted] mt-5">{mg?'Ireo rohy ireo dia mankany amin’ny tranonkala LeChaya ary tsy tahirin’ny MathBEPC ny PDF.':'Les liens ci-dessus pointent vers LeChaya ; les PDF ne sont pas copiés ni hébergés dans MathBEPC.'}</p></div>;
}
