import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import FractionTopic from './topics/FractionTopic';
import RadicalTopic from './topics/RadicalTopic';
import AbsoluteValueTopic from './topics/AbsoluteValueTopic';
import DevelopmentTopic from './topics/DevelopmentTopic';
import FactorizationTopic from './topics/FactorizationTopic';
import EquationTopic from './topics/EquationTopic';
import GeometryTopic from './topics/GeometryTopic';
import StatsTopic from './topics/StatsTopic';
import PowersTopic from './topics/PowersTopic';
import VectorTopic from './topics/VectorTopic';
import SpaceTopic from './topics/SpaceTopic';
import FunctionsTopic from './topics/FunctionsTopic';
import CircleTopic from './topics/CircleTopic';
import SmartSolve from './components/SmartSolve';
import PracticeMode from './components/PracticeMode';
import ExamMode from './components/ExamMode';
import Lessons from './components/Lessons';
import ProgressDashboard from './components/ProgressDashboard';
import Annales from './components/Annales';
import SubjectSolver from './components/SubjectSolver';
import ProgrammeMap from './components/ProgrammeMap';
import { getStoredLanguage, setStoredLanguage, ui, type Lang } from './utils/i18n';
import { loadProgress, recordVisit } from './utils/progress';
import {
  FractionIcon, RadicalIcon, AbsoluteIcon, ExpandIcon, CompressIcon,
  EqualsIcon, TriangleIcon, ChartIcon, PowerIcon, ArrowLeftIcon,
  ArrowRightIcon, MenuIcon, CloseIcon, VectorIcon, BoxIcon,
  SunIcon, MoonIcon,
} from './components/Icons';

type Group = 'Calculs & nombres' | 'Algèbre' | 'Géométrie' | 'Données';
type View = 'home'|'smart'|'subject'|'practice'|'lessons'|'exam'|'progress'|'annales'|'programme'|'chapters'|'chapter';
interface Chapter { id:string; title:string; mgTitle:string; icon:ComponentType<{className?:string}>; description:string; mgDescription:string; keywords:string; group:Group; component:ComponentType; }
interface NavState { mathbepc:true; view:View; selected:string|null; }

const chapters:Chapter[]=[
  {id:'fractions',title:'Fractions & rationnels',mgTitle:'Fraction & rationnel',icon:FractionIcon,description:'Fractions, expressions, PGCD/PPCM, rationalisation',mgDescription:'Fraction, expression, PGCD/PPCM ary rationalisation',keywords:'fraction rationnel pgcd ppcm simplifier',group:'Calculs & nombres',component:FractionTopic},
  {id:'radicals',title:'Racines carrées',mgTitle:'Racine carrée',icon:RadicalIcon,description:'Simplifier, calculer et comparer des radicaux',mgDescription:'Mampihena, mikajy ary mampitaha racine',keywords:'racine radical sqrt',group:'Calculs & nombres',component:RadicalTopic},
  {id:'powers',title:'Puissances',mgTitle:'Puissance',icon:PowerIcon,description:'Calculs et règles sur les puissances',mgDescription:'Kajy sy fitsipiky ny puissance',keywords:'puissance exposant',group:'Calculs & nombres',component:PowersTopic},
  {id:'absolute',title:'Valeur absolue',mgTitle:'Valeur absolue',icon:AbsoluteIcon,description:'Distance, équations et inéquations',mgDescription:'Distance, équation ary inéquation',keywords:'valeur absolue distance',group:'Algèbre',component:AbsoluteValueTopic},
  {id:'development',title:'Développement',mgTitle:'Développement',icon:ExpandIcon,description:'Identités remarquables et double distribution',mgDescription:'Identité remarquable sy distributivité',keywords:'développer identité remarquable distribution',group:'Algèbre',component:DevelopmentTopic},
  {id:'factorization',title:'Factorisation',mgTitle:'Factorisation',icon:CompressIcon,description:'Facteur commun, groupement et trinômes',mgDescription:'Facteur commun, groupement ary trinôme',keywords:'factoriser facteur commun groupement',group:'Algèbre',component:FactorizationTopic},
  {id:'equations',title:'Équations & inéquations',mgTitle:'Équation & inéquation',icon:EqualsIcon,description:'1er degré, systèmes, tableaux de signes et problèmes',mgDescription:'Degré 1, système, tableau de signes ary problème',keywords:'équation inequation système cramer premier degré problème',group:'Algèbre',component:EquationTopic},
  {id:'functions',title:'Applications affines & linéaires',mgTitle:'Application affine & linéaire',icon:ChartIcon,description:'Image, antécédent, variation, coefficient directeur et graphique',mgDescription:'Image, antécédent, variation, coefficient directeur ary graphique',keywords:'fonction application affine lineaire image antécédent coefficient directeur graphique',group:'Algèbre',component:FunctionsTopic},
  {id:'vectors',title:'Vecteurs & coordonnées',mgTitle:'Vecteur & coordonnée',icon:VectorIcon,description:'Opérations, colinéarité, orthogonalité, droites et transformations',mgDescription:'Opération, colinéarité, orthogonalité, droite ary transformation',keywords:'vecteur coordonnées milieu norme colinéaire orthogonal droite translation symétrie homothétie',group:'Géométrie',component:VectorTopic},
  {id:'geometry',title:'Géométrie plane',mgTitle:'Géométrie plane',icon:TriangleIcon,description:'Pythagore, Thalès, trigonométrie, aires',mgDescription:'Pythagore, Thalès, trigonométrie ary aire',keywords:'pythagore thales trigonométrie aire périmètre',group:'Géométrie',component:GeometryTopic},
  {id:'circle',title:'Angles inscrits & cercle',mgTitle:'Angle inscrit & cercle',icon:TriangleIcon,description:'Angle au centre, angle inscrit, même arc et droite-cercle',mgDescription:'Angle au centre, angle inscrit, arc mitovy ary droite-cercle',keywords:'cercle angle inscrit centre arc demi cercle tangente sécante',group:'Géométrie',component:CircleTopic},
  {id:'space',title:'Géométrie dans l’espace',mgTitle:'Géométrie dans l’espace',icon:BoxIcon,description:'Cônes, pyramides, sections, réduction, troncs et volumes',mgDescription:'Cône, pyramide, section, réduction, tronc ary volume',keywords:'volume cube cylindre cone sphere pyramide section réduction tronc',group:'Géométrie',component:SpaceTopic},
  {id:'stats',title:'Statistiques & proportionnalité',mgTitle:'Statistique & proportionnalité',icon:ChartIcon,description:'Classes, histogrammes, cumuls, moyenne, proportionnalité et pourcentages',mgDescription:'Classes, histogramme, cumul, moyenne, proportionnalité ary pourcentage',keywords:'statistique classes histogramme fréquence cumul moyenne classe modale proportion pourcentage',group:'Données',component:StatsTopic},
];
const groups:Group[]=['Calculs & nombres','Algèbre','Géométrie','Données'];
const groupMg:Record<Group,string>={'Calculs & nombres':'Kajy & isa','Algèbre':'Algèbre','Géométrie':'Géométrie','Données':'Données'};

function useTheme(){
  const [theme,setTheme]=useState<'dark'|'light'>(()=>{const s=typeof window!=='undefined'?localStorage.getItem('mathbepc-theme'):null;return s==='dark'?'dark':'light';});
  useEffect(()=>{document.documentElement.setAttribute('data-theme',theme);localStorage.setItem('mathbepc-theme',theme);document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#0b0d12':'#145C48');},[theme]);
  return {theme,toggle:()=>setTheme(t=>t==='dark'?'light':'dark')};
}
function usePWA(){
  const [installPrompt,setInstallPrompt]=useState<any>(null);const [installed,setInstalled]=useState(false);const [offline,setOffline]=useState(()=>typeof navigator!=='undefined'?!navigator.onLine:false);
  useEffect(()=>{const b=(e:Event)=>{e.preventDefault();setInstallPrompt(e);};const i=()=>setInstalled(true);const off=()=>setOffline(true);const on=()=>setOffline(false);window.addEventListener('beforeinstallprompt',b);window.addEventListener('appinstalled',i);window.addEventListener('offline',off);window.addEventListener('online',on);if(window.matchMedia('(display-mode: standalone)').matches)setInstalled(true);return()=>{window.removeEventListener('beforeinstallprompt',b);window.removeEventListener('appinstalled',i);window.removeEventListener('offline',off);window.removeEventListener('online',on);};},[]);
  const install=useCallback(async()=>{if(!installPrompt)return;await installPrompt.prompt();const c=await installPrompt.userChoice;if(c.outcome==='accepted')setInstalled(true);setInstallPrompt(null);},[installPrompt]);
  return {canInstall:!!installPrompt&&!installed,offline,install};
}

function AppLogo(){return <div className="w-10 h-10 rounded-xl bg-[#145c48] flex items-center justify-center shadow-[0_0_14px_rgba(20,92,72,.25)]"><svg viewBox="0 0 36 36" className="w-8 h-8"><path d="M6 17.5c4.2.3 7.3 1.2 10.2 3.1v9C13.4 27.9 10 27 6 26.7V17.5Z" fill="white"/><path d="M30 17.5c-4.2.3-7.3 1.2-10.2 3.1v9C22.6 27.9 26 27 30 26.7V17.5Z" fill="white"/><path d="M18 20.5v9" stroke="#dbe9e3" strokeWidth="1.2"/><text x="18" y="15" textAnchor="middle" fontSize="12" fontWeight="800" fill="#ffcd4a">π</text><path d="M29 5.5l2 2.2-1.1 2.5 1.5 2.2-1.5 3-1.2-2.4.8-2.6-1.2-2.1.7-2.8Z" fill="#da3434"/></svg></div>}

export default function App(){
  const [view,setView]=useState<View>('home');const [selected,setSelected]=useState<string|null>(null);const [menuOpen,setMenuOpen]=useState(false);const [search,setSearch]=useState('');const [lang,setLang]=useState<Lang>(()=>getStoredLanguage());const [progressTick,setProgressTick]=useState(0);
  const {theme,toggle}=useTheme();const {canInstall,offline,install}=usePWA();const tr=ui(lang);const current=chapters.find(c=>c.id===selected);const currentIndex=chapters.findIndex(c=>c.id===selected);const progress=useMemo(()=>loadProgress(),[progressTick]);
  useEffect(()=>{const h=()=>setProgressTick(v=>v+1);window.addEventListener('mathbepc-progress',h);return()=>window.removeEventListener('mathbepc-progress',h);},[]);
  useEffect(()=>{
    window.history.replaceState({mathbepc:true,view:'home',selected:null} satisfies NavState,'');
    const onPop=(event:PopStateEvent)=>{
      const state=event.state as NavState|null;
      if(state?.mathbepc){setView(state.view);setSelected(state.selected);setMenuOpen(false);window.scrollTo({top:0,behavior:'smooth'});}
      else{setView('home');setSelected(null);setMenuOpen(false);}
    };
    window.addEventListener('popstate',onPop);
    return()=>window.removeEventListener('popstate',onPop);
  },[]);
  const navigate=(v:View,nextSelected:string|null=null)=>{
    const state:NavState={mathbepc:true,view:v,selected:v==='chapter'?nextSelected:null};
    window.history.pushState(state,'');
    setView(v);setSelected(state.selected);setMenuOpen(false);window.scrollTo({top:0,behavior:'smooth'});
  };
  const go=(v:View)=>navigate(v,null);
  const goBack=()=>{if(view!=='home')window.history.back();};
  const goHome=()=>{setSearch('');navigate('home',null);};
  const openChapter=(id:string)=>{recordVisit(id);navigate('chapter',id);};
  const toggleLang=()=>{const next=lang==='fr'?'mg':'fr';setLang(next);setStoredLanguage(next);};
  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();if(!q)return chapters;return chapters.filter(ch=>`${ch.title} ${ch.mgTitle} ${ch.description} ${ch.mgDescription} ${ch.keywords}`.toLowerCase().includes(q));},[search]);
  const accuracy=progress.attempts?Math.round(progress.correct/progress.attempts*100):0;
  const pageTitle=view==='chapter'&&current
    ? (lang==='mg'?current.mgTitle:current.title)
    : ({smart:lang==='mg'?'Hamaha exercice':'Résoudre',subject:lang==='mg'?'Sujet BEPC':'Sujet BEPC',practice:tr.practice,lessons:tr.revise,exam:tr.exam,progress:tr.progress,annales:tr.annales,programme:lang==='mg'?'Programme ofisialy':'Programme officiel',chapters:tr.explore} as Partial<Record<View,string>>)[view]||'MathBEPC';

  return <div className="min-h-screen bg-[--color-surface] text-[--color-text] transition-colors duration-300">
    <header className="sticky top-0 z-50 border-b border-[--color-border]/80 bg-[--color-surface]/94 backdrop-blur-xl safe-top"><div className="max-w-6xl mx-auto px-3 sm:px-6 min-h-16 py-2 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        {view!=='home'&&<button onClick={goBack} className="h-11 px-3 rounded-xl border border-[--color-border] bg-[--color-card] flex items-center gap-1.5 cursor-pointer font-extrabold text-xs shrink-0" aria-label={lang==='mg'?'Hiverina':'Retour'}><ArrowLeftIcon className="w-4 h-4"/><span>{lang==='mg'?'Hiverina':'Retour'}</span></button>}
        <button onClick={goHome} className={`items-center gap-3 cursor-pointer min-w-0 ${view==='home'?'flex':'hidden sm:flex'}`}><AppLogo/><div className="text-left hidden sm:block"><div className="text-sm font-extrabold">MathBEPC</div><div className="text-[10px] text-[--color-text-muted]">{tr.appSubtitle}</div></div></button>
        {view!=='home'&&<div className="sm:hidden min-w-0"><p className="text-[9px] uppercase tracking-wider font-bold text-[--color-text-muted]">MathBEPC</p><p className="text-sm font-extrabold truncate">{pageTitle}</p></div>}
      </div>
      <div className="flex items-center gap-1.5">{offline&&<span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-amber-500/10 text-[10px] font-semibold text-amber-500">{tr.offline}</span>}{canInstall&&<button onClick={install} className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-[--color-accent] text-white text-xs font-semibold cursor-pointer">{tr.install}</button>}<button onClick={toggleLang} title={tr.languageTitle} className="h-10 min-w-10 px-2 rounded-xl bg-[--color-btn-bg] text-[11px] font-extrabold cursor-pointer">{tr.language}</button><button onClick={toggle} className="hidden sm:flex w-10 h-10 rounded-xl bg-[--color-btn-bg] items-center justify-center cursor-pointer">{theme==='dark'?<SunIcon className="w-4 h-4"/>:<MoonIcon className="w-4 h-4"/>}</button><button onClick={()=>setMenuOpen(v=>!v)} className="h-10 w-10 sm:w-auto sm:px-3 rounded-xl bg-[--color-btn-bg] flex items-center justify-center sm:gap-2 cursor-pointer font-bold text-xs">{menuOpen?<CloseIcon className="w-4 h-4"/>:<MenuIcon className="w-4 h-4"/>}<span className="hidden sm:inline">Menu</span></button></div>
    </div>{menuOpen&&<div className="border-t border-[--color-border] bg-[--color-card]/98 shadow-xl"><div className="max-w-6xl mx-auto p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">{[
      ['home',tr.backHome],['smart',tr.solve],['subject',lang==='mg'?'Sujet iray manontolo':'Sujet BEPC complet'],['practice',tr.practice],['lessons',tr.revise],['exam',tr.exam],['annales',tr.annales],['programme',lang==='mg'?'Programme ofisialy':'Programme officiel'],['progress',tr.progress],['chapters',tr.explore]
    ].map(([id,label])=><button key={id} onClick={()=>go(id as View)} className="p-3 rounded-xl bg-[--color-surface] border border-[--color-border] text-left text-xs font-bold cursor-pointer hover:border-[--color-accent]/40">{label}</button>)}</div></div>}</header>

    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10 pb-32 sm:pb-24">
      {view==='home'&&<div className="animate-fade-up">
        <section className="max-w-3xl mx-auto text-center pt-3 sm:pt-8"><span className="inline-flex px-3 py-1 rounded-full bg-[--color-accent-subtle] text-[--color-accent] text-[11px] font-bold">BEPC Madagascar • 3e</span><h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">{tr.homeTitle}</h1><p className="mt-3 text-sm sm:text-base text-[--color-text-secondary] max-w-2xl mx-auto">{tr.homeLead}</p></section>
        <section className="grid md:grid-cols-3 gap-4 mt-9 max-w-5xl mx-auto">
          {[{id:'smart' as View,n:'01',title:tr.solve,desc:tr.solveDesc,accent:true},{id:'practice' as View,n:'02',title:tr.practice,desc:tr.practiceDesc},{id:'lessons' as View,n:'03',title:tr.revise,desc:tr.reviseDesc}].map(c=><button key={c.id} onClick={()=>go(c.id)} className={`text-left rounded-3xl border p-5 sm:p-6 transition-all cursor-pointer hover:-translate-y-0.5 ${c.accent?'border-[#145c48]/30 bg-[#145c48] text-white shadow-[0_10px_35px_rgba(20,92,72,.16)]':'border-[--color-border] bg-[--color-card] hover:border-[--color-accent]/30'}`}><span className={`text-[10px] font-mono font-bold ${c.accent?'text-white/60':'text-[--color-text-muted]'}`}>{c.n}</span><h2 className="text-xl font-extrabold mt-4">{c.title}</h2><p className={`text-sm leading-relaxed mt-2 ${c.accent?'text-white/80':'text-[--color-text-secondary]'}`}>{c.desc}</p><span className={`inline-flex mt-5 text-xs font-bold ${c.accent?'text-[#ffdf75]':'text-[--color-accent]'}`}>{lang==='mg'?'Hanomboka →':'Commencer →'}</span></button>)}
        </section>
        <section className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-5 max-w-5xl mx-auto">{[{id:'subject' as View,title:lang==='mg'?'Sujet iray manontolo':'Résoudre un sujet BEPC',sub:lang==='mg'?'PDF • sary • texte':'PDF • photo • texte'},{id:'exam' as View,title:tr.exam,sub:lang==='mg'?'Sujet 10 • chronomètre':'10 questions • chronomètre'},{id:'annales' as View,title:tr.annales,sub:lang==='mg'?'Sujets Madagascar':'Sujets Madagascar'},{id:'programme' as View,title:lang==='mg'?'Programme ofisialy':'Programme officiel',sub:'3e Madagascar'},{id:'progress' as View,title:tr.progress,sub:`${accuracy}% ${lang==='mg'?'fahombiazana':'de réussite'}`},{id:'chapters' as View,title:tr.explore,sub:`${chapters.length} chapitres`}].map(x=><button key={x.id} onClick={()=>go(x.id)} className="rounded-2xl border border-[--color-border] bg-[--color-card] p-4 text-left cursor-pointer hover:border-[--color-accent]/35"><p className="font-bold text-sm">{x.title}</p><p className="text-[10px] text-[--color-text-muted] mt-1">{x.sub}</p></button>)}</section>
        <section className="max-w-5xl mx-auto mt-7 rounded-2xl border border-[--color-border] bg-[--color-card] p-4 flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-sm">{lang==='mg'?'Mandroso tsikelikely':'Ta progression sur cet appareil'}</p><p className="text-xs text-[--color-text-secondary] mt-1">{progress.attempts} {lang==='mg'?'fanazarana •':'exercices •'} {progress.correct} {lang==='mg'?'marina •':'réussis •'} {progress.streakDays} {lang==='mg'?'andro misesy':'jour(s) de suite'}</p></div><button onClick={()=>go('progress')} className="px-4 py-2.5 rounded-xl bg-[--color-btn-bg] text-xs font-bold cursor-pointer">{tr.progress}</button></section>
      </div>}

      {view==='smart'&&<SmartSolve lang={lang} onOpenChapter={openChapter}/>} {view==='subject'&&<SubjectSolver lang={lang} onOpenChapter={openChapter}/>} {view==='practice'&&<PracticeMode lang={lang}/>} {view==='lessons'&&<Lessons lang={lang} onOpenChapter={openChapter}/>} {view==='exam'&&<ExamMode lang={lang}/>} {view==='progress'&&<ProgressDashboard lang={lang}/>} {view==='annales'&&<Annales lang={lang} onStartExam={()=>go('exam')}/>} {view==='programme'&&<ProgrammeMap lang={lang} onOpenChapter={openChapter}/>} 

      {view==='chapters'&&<div className="animate-fade-up"><div className="max-w-3xl"><h1 className="text-2xl sm:text-4xl font-extrabold">{tr.explore}</h1><p className="mt-2 text-sm text-[--color-text-secondary]">{lang==='mg'?'Safidio ny toko raha fantatrao sahady izay tianao hianarana.':'Choisis directement un chapitre si tu sais déjà quelle notion travailler.'}</p></div><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tr.searchChapter} className="mt-5 w-full max-w-2xl px-4 py-3 rounded-xl border border-[--color-input-border] bg-[--color-input-bg]"/><div className="space-y-7 mt-7">{groups.map(group=>{const list=filtered.filter(c=>c.group===group);if(!list.length)return null;return <section key={group}><h2 className="text-xs uppercase tracking-widest font-bold text-[--color-text-muted] mb-3">{lang==='mg'?groupMg[group]:group}</h2><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">{list.map(ch=><button key={ch.id} onClick={()=>openChapter(ch.id)} className="rounded-2xl border border-[--color-border] bg-[--color-card] p-4 text-left flex gap-3 cursor-pointer hover:border-[--color-accent]/35"><div className="w-11 h-11 rounded-xl bg-[--color-btn-bg] flex items-center justify-center flex-shrink-0"><ch.icon className="w-5 h-5 text-[--color-accent]"/></div><div><p className="font-bold text-sm">{lang==='mg'?ch.mgTitle:ch.title}</p><p className="text-xs text-[--color-text-secondary] mt-1">{lang==='mg'?ch.mgDescription:ch.description}</p></div></button>)}</div></section>})}{!filtered.length&&<p className="text-sm text-[--color-text-muted]">{tr.noResult}</p>}</div></div>}

      {view==='chapter'&&current&&<div className="max-w-3xl mx-auto animate-fade-up"><div className="flex flex-wrap gap-2 mb-6"><button onClick={()=>go('chapters')} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[--color-btn-bg] text-xs font-bold cursor-pointer"><ArrowLeftIcon className="w-3.5 h-3.5"/>{tr.changeChapter}</button><button onClick={()=>go('lessons')} className="px-3 py-2 rounded-xl bg-[--color-accent-subtle] text-[--color-accent] text-xs font-bold cursor-pointer">{lang==='mg'?'Hamerina ny lesona':'Réviser la méthode'}</button></div><div className="flex items-center gap-4 mb-6"><div className="w-13 h-13 rounded-2xl bg-[--color-accent] flex items-center justify-center shadow-[0_4px_20px_var(--color-accent-glow)]"><current.icon className="w-6 h-6 text-white"/></div><div><h1 className="text-xl sm:text-2xl font-extrabold">{lang==='mg'?current.mgTitle:current.title}</h1><p className="text-xs text-[--color-text-muted] mt-1">{lang==='mg'?current.mgDescription:current.description}</p></div></div><div className="bg-[--color-card] rounded-2xl border border-[--color-border] p-4 sm:p-7 shadow-[0_4px_32px_var(--color-glow)]"><current.component/></div><div className="flex justify-between gap-3 mt-7">{currentIndex>0?<button onClick={()=>openChapter(chapters[currentIndex-1].id)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[--color-btn-bg] text-xs font-bold cursor-pointer"><ArrowLeftIcon className="w-3 h-3"/>{tr.prev}</button>:<span/>}{currentIndex<chapters.length-1?<button onClick={()=>openChapter(chapters[currentIndex+1].id)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[--color-btn-bg] text-xs font-bold cursor-pointer">{tr.next}<ArrowRightIcon className="w-3 h-3"/></button>:<span/>}</div></div>}
    </main>

    <nav className="mobile-bottom-nav sm:hidden fixed bottom-0 inset-x-0 z-50 border-t border-[--color-border] bg-[--color-card]/96 backdrop-blur-xl px-1 pt-1" aria-label={lang==='mg'?'Navigation lehibe':'Navigation principale'}>
      <div className="grid grid-cols-5">
        {([
          ['home',lang==='mg'?'Fandraisana':'Accueil','home'],
          ['smart',lang==='mg'?'Hamaha':'Résoudre','solve'],
          ['practice',lang==='mg'?'Fanazarana':'Exercices','practice'],
          ['lessons',lang==='mg'?'Lesona':'Réviser','lesson'],
          ['menu',lang==='mg'?'Hafa':'Plus','menu']
        ] as const).map(([id,label,icon])=>{
          const active=id==='menu'?menuOpen:view===id;
          return <button key={id} onClick={()=>id==='menu'?setMenuOpen(v=>!v):go(id as View)} className="mobile-nav-button px-1 py-1.5 text-[9px] font-bold text-[--color-text-muted] cursor-pointer" aria-current={active?'page':undefined}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="mobile-nav-icon" aria-hidden="true">
              {icon==='home'&&<><path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9.5V20h13V9.5"/><path d="M9.5 20v-6h5v6"/></>}
              {icon==='solve'&&<><path d="M4 5h7"/><path d="M7.5 2v6"/><path d="M14 5h6"/><path d="m15 13 5 5"/><path d="m20 13-5 5"/></>}
              {icon==='practice'&&<><path d="M4 5h16v14H4z"/><path d="m8 12 2.2 2.2L16 8.5"/></>}
              {icon==='lesson'&&<><path d="M4 4.5c3.2 0 5.7.7 8 2.2v13c-2.3-1.5-4.8-2.2-8-2.2z"/><path d="M20 4.5c-3.2 0-5.7.7-8 2.2v13c2.3-1.5 4.8-2.2 8-2.2z"/></>}
              {icon==='menu'&&<><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>}
            </svg>
            <span>{label}</span>
          </button>;
        })}
      </div>
    </nav>

    <footer className="border-t border-[--color-border] mt-8"><div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row justify-between gap-2 text-[10px] text-[--color-text-muted]"><span>MathBEPC Madagascar • v{__APP_VERSION__} • Révision BEPC 3e</span><span>{lang==='mg'?'Ny calculateur dia manampy; ny fahatakarana no tanjona.':'Le calculateur aide ; comprendre la méthode reste l’objectif.'}</span></div></footer>
  </div>;
}
