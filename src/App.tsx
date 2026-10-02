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
  ArrowRightIcon, MenuIcon, CloseIcon, VectorIcon, BoxIcon, SunIcon, MoonIcon,
} from './components/Icons';

type Group='Calculs & nombres'|'Algèbre'|'Géométrie'|'Données';
type View='home'|'smart'|'subject'|'practice'|'lessons'|'exam'|'progress'|'annales'|'programme'|'chapters'|'chapter';
interface Chapter{id:string;title:string;mgTitle:string;icon:ComponentType<{className?:string}>;description:string;mgDescription:string;keywords:string;group:Group;component:ComponentType;}
interface NavState{mathbepc:true;view:View;selected:string|null;}

const chapters:Chapter[]=[
{id:'fractions',title:'Fractions & rationnels',mgTitle:'Fraction & rationnel',icon:FractionIcon,description:'Fractions, PGCD/PPCM et calculs rationnels',mgDescription:'Fraction, PGCD/PPCM ary kajy rationnel',keywords:'fraction rationnel pgcd ppcm simplifier',group:'Calculs & nombres',component:FractionTopic},
{id:'radicals',title:'Racines carrées',mgTitle:'Racine carrée',icon:RadicalIcon,description:'Simplifier et calculer des radicaux',mgDescription:'Mampihena sy mikajy racine',keywords:'racine radical sqrt',group:'Calculs & nombres',component:RadicalTopic},
{id:'powers',title:'Puissances',mgTitle:'Puissance',icon:PowerIcon,description:'Règles et calculs sur les puissances',mgDescription:'Fitsipika sy kajy puissance',keywords:'puissance exposant',group:'Calculs & nombres',component:PowersTopic},
{id:'absolute',title:'Valeur absolue',mgTitle:'Valeur absolue',icon:AbsoluteIcon,description:'Distance, équations et inéquations',mgDescription:'Distance, équation ary inéquation',keywords:'valeur absolue distance',group:'Algèbre',component:AbsoluteValueTopic},
{id:'development',title:'Développement',mgTitle:'Développement',icon:ExpandIcon,description:'Distributivité et identités remarquables',mgDescription:'Distributivité sy identité remarquable',keywords:'développer identité remarquable distribution',group:'Algèbre',component:DevelopmentTopic},
{id:'factorization',title:'Factorisation',mgTitle:'Factorisation',icon:CompressIcon,description:'Facteur commun, groupement et identités',mgDescription:'Facteur commun, groupement ary identité',keywords:'factoriser facteur commun groupement',group:'Algèbre',component:FactorizationTopic},
{id:'equations',title:'Équations & inéquations',mgTitle:'Équation & inéquation',icon:EqualsIcon,description:'1er degré, systèmes et tableaux de signes',mgDescription:'Degré 1, système ary tableau de signes',keywords:'équation inequation système cramer premier degré problème',group:'Algèbre',component:EquationTopic},
{id:'functions',title:'Applications affines',mgTitle:'Application affine',icon:ChartIcon,description:'Images, antécédents, variation et graphique',mgDescription:'Image, antécédent, variation ary graphique',keywords:'fonction application affine lineaire image antécédent coefficient directeur graphique',group:'Algèbre',component:FunctionsTopic},
{id:'vectors',title:'Vecteurs & coordonnées',mgTitle:'Vecteur & coordonnée',icon:VectorIcon,description:'Vecteurs, droites et transformations',mgDescription:'Vecteur, droite ary transformation',keywords:'vecteur coordonnées milieu norme colinéaire orthogonal droite translation symétrie homothétie',group:'Géométrie',component:VectorTopic},
{id:'geometry',title:'Géométrie plane',mgTitle:'Géométrie plane',icon:TriangleIcon,description:'Pythagore, Thalès et trigonométrie',mgDescription:'Pythagore, Thalès ary trigonométrie',keywords:'pythagore thales trigonométrie aire périmètre',group:'Géométrie',component:GeometryTopic},
{id:'circle',title:'Angles & cercle',mgTitle:'Angle & cercle',icon:TriangleIcon,description:'Angles inscrits, arcs et demi-cercle',mgDescription:'Angle inscrit, arc ary demi-cercle',keywords:'cercle angle inscrit centre arc demi cercle tangente sécante',group:'Géométrie',component:CircleTopic},
{id:'space',title:'Géométrie dans l’espace',mgTitle:'Géométrie espace',icon:BoxIcon,description:'Cônes, pyramides, sections et volumes',mgDescription:'Cône, pyramide, section ary volume',keywords:'volume cube cylindre cone sphere pyramide section réduction tronc',group:'Géométrie',component:SpaceTopic},
{id:'stats',title:'Statistiques & proportionnalité',mgTitle:'Statistique & proportionnalité',icon:ChartIcon,description:'Histogrammes, moyenne et pourcentages',mgDescription:'Histogramme, moyenne ary pourcentage',keywords:'statistique classes histogramme fréquence cumul moyenne classe modale proportion pourcentage',group:'Données',component:StatsTopic},
];
const groups:Group[]=['Calculs & nombres','Algèbre','Géométrie','Données'];
const groupMg:Record<Group,string>={'Calculs & nombres':'Kajy & isa','Algèbre':'Algèbre','Géométrie':'Géométrie','Données':'Données'};

function useTheme(){
  const [theme,setTheme]=useState<'dark'|'light'>(()=>localStorage.getItem('mathbepc-theme')==='dark'?'dark':'light');
  useEffect(()=>{document.documentElement.setAttribute('data-theme',theme);localStorage.setItem('mathbepc-theme',theme);document.querySelector('meta[name="theme-color"]')?.setAttribute('content',theme==='dark'?'#111512':'#f7f8fa');},[theme]);
  return{theme,toggle:()=>setTheme(t=>t==='dark'?'light':'dark')};
}

function usePWA(){
  const [installPrompt,setInstallPrompt]=useState<any>(null);
  const [installed,setInstalled]=useState(false);
  const [offline,setOffline]=useState(()=>!navigator.onLine);
  useEffect(()=>{
    const before=(e:Event)=>{e.preventDefault();setInstallPrompt(e);};
    const done=()=>setInstalled(true);
    const off=()=>setOffline(true);
    const on=()=>setOffline(false);
    window.addEventListener('beforeinstallprompt',before);
    window.addEventListener('appinstalled',done);
    window.addEventListener('offline',off);
    window.addEventListener('online',on);
    if(window.matchMedia('(display-mode: standalone)').matches)setInstalled(true);
    return()=>{window.removeEventListener('beforeinstallprompt',before);window.removeEventListener('appinstalled',done);window.removeEventListener('offline',off);window.removeEventListener('online',on);};
  },[]);
  const install=useCallback(async()=>{if(!installPrompt)return;await installPrompt.prompt();const choice=await installPrompt.userChoice;if(choice.outcome==='accepted')setInstalled(true);setInstallPrompt(null);},[installPrompt]);
  return{canInstall:!!installPrompt&&!installed,offline,install};
}

function AppLogo(){
  return <span className="brand-mark"><svg viewBox="0 0 36 36" aria-hidden="true"><path d="M6 18c4 .2 7.2 1.1 10.1 3v8.6C13.3 28 10 27.1 6 26.8V18Z" fill="white"/><path d="M30 18c-4 .2-7.2 1.1-10.1 3v8.6C22.7 28 26 27.1 30 26.8V18Z" fill="white"/><path d="M18 21v8.6" stroke="#dce9e4" strokeWidth="1.2"/><text x="18" y="15" textAnchor="middle" fontSize="12" fontWeight="800" fill="#ffd454">π</text><path d="M28.6 5.2 30.8 8l-1 2.2 1.3 2.4-1.5 3-1.2-2.5.8-2.7-1.3-2.2.7-3Z" fill="#df3f44"/></svg></span>;
}

type GlyphName='solve'|'practice'|'lesson'|'exam'|'paper'|'history'|'program'|'progress'|'chapters';
function Glyph({name}:{name:GlyphName}){
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name==='solve'&&<><path d="M4 7h8"/><path d="M8 3v8"/><path d="M15 6h5"/><path d="M15 16h5"/><path d="M17.5 13.5v5"/></>}
    {name==='practice'&&<><rect x="4" y="3.5" width="16" height="17" rx="2"/><path d="m8 12 2.2 2.2L16 8.5"/></>}
    {name==='lesson'&&<><path d="M4 4.5c3.2 0 5.7.7 8 2.2v13c-2.3-1.5-4.8-2.2-8-2.2z"/><path d="M20 4.5c-3.2 0-5.7.7-8 2.2v13c2.3-1.5 4.8-2.2 8-2.2z"/></>}
    {name==='exam'&&<><rect x="5" y="3.5" width="14" height="17" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></>}
    {name==='paper'&&<><path d="M6 3.5h9l3 3V20.5H6z"/><path d="M14 3.5v4h4M9 12h6M9 15.5h5"/></>}
    {name==='history'&&<><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5"/><path d="M4 4.5v4h4"/><path d="M12 8v4l3 2"/></>}
    {name==='program'&&<><path d="M5 5h14M5 10h14M5 15h9M5 20h9"/><circle cx="18" cy="17.5" r="2.5"/></>}
    {name==='progress'&&<><path d="M5 19V9M12 19V5M19 19v-7"/></>}
    {name==='chapters'&&<><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></>}
  </svg>;
}

export default function App(){
  const [view,setView]=useState<View>('home');
  const [selected,setSelected]=useState<string|null>(null);
  const [menuOpen,setMenuOpen]=useState(false);
  const [search,setSearch]=useState('');
  const [lang,setLang]=useState<Lang>(()=>getStoredLanguage());
  const [progressTick,setProgressTick]=useState(0);
  const {theme,toggle}=useTheme();
  const {canInstall,offline,install}=usePWA();
  const tr=ui(lang);
  const current=chapters.find(c=>c.id===selected);
  const currentIndex=chapters.findIndex(c=>c.id===selected);
  const progress=useMemo(()=>loadProgress(),[progressTick]);
  const accuracy=progress.attempts?Math.round(progress.correct/progress.attempts*100):0;

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

  const navigate=(next:View,nextSelected:string|null=null)=>{
    const state:NavState={mathbepc:true,view:next,selected:next==='chapter'?nextSelected:null};
    window.history.pushState(state,'');
    setView(next);setSelected(state.selected);setMenuOpen(false);window.scrollTo({top:0,behavior:'smooth'});
  };
  const go=(next:View)=>navigate(next);
  const goBack=()=>{if(view!=='home')window.history.back();};
  const goHome=()=>{setSearch('');navigate('home');};
  const openChapter=(id:string)=>{recordVisit(id);navigate('chapter',id);};
  const toggleLang=()=>{const next=lang==='fr'?'mg':'fr';setLang(next);setStoredLanguage(next);};
  const filtered=useMemo(()=>{
    const q=search.trim().toLowerCase();
    return q?chapters.filter(ch=>[ch.title,ch.mgTitle,ch.description,ch.mgDescription,ch.keywords].join(' ').toLowerCase().includes(q)):chapters;
  },[search]);
  const pageTitle=view==='chapter'&&current
    ?(lang==='mg'?current.mgTitle:current.title)
    :({smart:tr.solve,subject:'Sujet BEPC',practice:tr.practice,lessons:tr.revise,exam:tr.exam,progress:tr.progress,annales:tr.annales,programme:lang==='mg'?'Programme ofisialy':'Programme de 3e',chapters:tr.explore} as Partial<Record<View,string>>)[view]||'MathBEPC';
  const featured=['fractions','equations','geometry','stats'].map(id=>chapters.find(c=>c.id===id)!);

  const menuItems:{id:View;label:string;icon:GlyphName}[]=[
    {id:'home',label:tr.backHome,icon:'chapters'},
    {id:'subject',label:lang==='mg'?'Sujet BEPC':'Résoudre un sujet BEPC',icon:'paper'},
    {id:'exam',label:tr.exam,icon:'exam'},
    {id:'annales',label:tr.annales,icon:'history'},
    {id:'programme',label:lang==='mg'?'Programme ofisialy':'Programme de 3e',icon:'program'},
    {id:'progress',label:tr.progress,icon:'progress'},
    {id:'chapters',label:tr.explore,icon:'chapters'},
  ];

  return <div className="app-shell">
    <header className="topbar safe-top">
      <div className="topbar-inner">
        <div className="topbar-left">
          {view!=='home'
            ?<button type="button" onClick={goBack} className="back-button"><ArrowLeftIcon/><span>{lang==='mg'?'Hiverina':'Retour'}</span></button>
            :<button type="button" onClick={goHome} className="brand-button"><AppLogo/><span><strong>MathBEPC</strong><small>{tr.appSubtitle}</small></span></button>}
          {view!=='home'&&<div className="page-location"><strong>{pageTitle}</strong><small>MathBEPC</small></div>}
        </div>
        <div className="topbar-actions">
          {offline&&<span className="offline-dot" title={tr.offline}/>}
          {canInstall&&<button type="button" onClick={install} className="install-button">{tr.install}</button>}
          <button type="button" onClick={toggleLang} className="topbar-text-button" title={tr.languageTitle}>{tr.language}</button>
          <button type="button" onClick={toggle} className="icon-button desktop-only" aria-label="Thème">{theme==='dark'?<SunIcon/>:<MoonIcon/>}</button>
          <button type="button" onClick={()=>setMenuOpen(true)} className="icon-button desktop-only" aria-label="Menu"><MenuIcon/></button>
        </div>
      </div>
    </header>

    <main className="app-main">
      {view==='home'&&<div className="home-page animate-fade-up">
        <section className="home-hero">
          <p className="home-kicker">BEPC • Madagascar • 3e</p>
          <h1>{tr.homeTitle}</h1>
          <p>{tr.homeLead}</p>
        </section>

        <section className="home-main-actions">
          <button type="button" onClick={()=>go('smart')} className="home-primary-card">
            <span className="home-action-icon"><Glyph name="solve"/></span>
            <span className="home-action-copy"><strong>{tr.solve}</strong><small>{tr.solveDesc}</small></span>
            <span className="home-action-arrow">→</span>
          </button>
          <div className="home-secondary-actions">
            <button type="button" onClick={()=>go('practice')} className="home-secondary-card"><span className="home-action-icon soft"><Glyph name="practice"/></span><span><strong>{tr.practice}</strong><small>{tr.practiceDesc}</small></span></button>
            <button type="button" onClick={()=>go('lessons')} className="home-secondary-card"><span className="home-action-icon soft"><Glyph name="lesson"/></span><span><strong>{tr.revise}</strong><small>{tr.reviseDesc}</small></span></button>
          </div>
        </section>

        <section className="home-section">
          <div className="section-title-row"><div><h2>{lang==='mg'?'Hiomana amin’ny BEPC':'Préparer le BEPC'}</h2><p>{lang==='mg'?'Fitaovana ho an’ny fanadinana.':'Les outils utiles avant l’examen.'}</p></div></div>
          <div className="tool-grid">
            {[
              {id:'exam' as View,name:tr.exam,sub:lang==='mg'?'Chronomètre • /20':'Chronomètre • note /20',icon:'exam' as GlyphName},
              {id:'subject' as View,name:lang==='mg'?'Sujet iray manontolo':'Résoudre un sujet',sub:'PDF • image • texte',icon:'paper' as GlyphName},
              {id:'annales' as View,name:tr.annales,sub:'2009 — 2018',icon:'history' as GlyphName},
              {id:'programme' as View,name:lang==='mg'?'Programme ofisialy':'Programme de 3e',sub:'Madagascar',icon:'program' as GlyphName},
            ].map(item=><button key={item.id} type="button" onClick={()=>go(item.id)} className="tool-card"><span><Glyph name={item.icon}/></span><strong>{item.name}</strong><small>{item.sub}</small></button>)}
          </div>
        </section>

        <section className="home-section">
          <div className="section-title-row"><div><h2>{lang==='mg'?'Toko fampiasa matetika':'Chapitres essentiels'}</h2><p>{lang==='mg'?'Fidirana haingana amin’ny toko lehibe.':'Accès rapide aux notions les plus travaillées.'}</p></div><button type="button" onClick={()=>go('chapters')} className="text-button">{tr.explore} →</button></div>
          <div className="featured-chapters">{featured.map(ch=><button key={ch.id} type="button" onClick={()=>openChapter(ch.id)} className="featured-chapter"><span className="featured-chapter-icon"><ch.icon/></span><div><strong>{lang==='mg'?ch.mgTitle:ch.title}</strong><small>{lang==='mg'?ch.mgDescription:ch.description}</small></div><i>→</i></button>)}</div>
        </section>

        <section className="progress-strip" onClick={()=>go('progress')} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')go('progress');}} role="button" tabIndex={0}>
          <div><span className="progress-strip-icon"><Glyph name="progress"/></span><p><strong>{tr.progress}</strong><small>{progress.attempts} {lang==='mg'?'fanazarana':'exercices'} • {accuracy}% {lang==='mg'?'fahombiazana':'de réussite'}</small></p></div><span>→</span>
        </section>
      </div>}

      {view==='smart'&&<SmartSolve lang={lang} onOpenChapter={openChapter}/>}
      {view==='subject'&&<SubjectSolver lang={lang} onOpenChapter={openChapter}/>}
      {view==='practice'&&<PracticeMode lang={lang}/>}
      {view==='lessons'&&<Lessons lang={lang} onOpenChapter={openChapter}/>}
      {view==='exam'&&<ExamMode lang={lang}/>}
      {view==='progress'&&<ProgressDashboard lang={lang}/>}
      {view==='annales'&&<Annales lang={lang} onStartExam={()=>go('exam')}/>}
      {view==='programme'&&<ProgrammeMap lang={lang} onOpenChapter={openChapter}/>}

      {view==='chapters'&&<div className="page-medium animate-fade-up">
        <header className="page-heading"><div><h1 className="page-title">{tr.explore}</h1><p className="page-description">{lang==='mg'?'Safidio ny toko tianao hianarana na hanaovana kajy.':'Choisis la notion que tu veux réviser ou calculer.'}</p></div></header>
        <label className="search-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><input value={search} onChange={e=>setSearch(e.target.value)} placeholder={tr.searchChapter}/></label>
        <div className="chapter-groups">{groups.map(group=>{const list=filtered.filter(c=>c.group===group);if(!list.length)return null;return <section key={group}><h2>{lang==='mg'?groupMg[group]:group}</h2><div className="chapter-grid">{list.map(ch=><button key={ch.id} type="button" onClick={()=>openChapter(ch.id)} className="chapter-card"><span className="chapter-icon"><ch.icon/></span><div><strong>{lang==='mg'?ch.mgTitle:ch.title}</strong><small>{lang==='mg'?ch.mgDescription:ch.description}</small></div><i>→</i></button>)}</div></section>;})}{!filtered.length&&<p className="empty-state">{tr.noResult}</p>}</div>
      </div>}

      {view==='chapter'&&current&&<div className="page-medium animate-fade-up">
        <header className="chapter-header">
          <span className="chapter-hero-icon"><current.icon/></span>
          <div><h1>{lang==='mg'?current.mgTitle:current.title}</h1><p>{lang==='mg'?current.mgDescription:current.description}</p><div className="chapter-header-actions"><button type="button" onClick={()=>go('lessons')} className="secondary-button">{lang==='mg'?'Lesona':'Voir le cours'}</button><button type="button" onClick={()=>go('chapters')} className="text-button">{tr.changeChapter}</button></div></div>
        </header>
        <section className="topic-workspace"><current.component/></section>
        <nav className="chapter-pagination">
          {currentIndex>0?<button type="button" onClick={()=>openChapter(chapters[currentIndex-1].id)}><ArrowLeftIcon/><span><small>{tr.prev}</small><strong>{lang==='mg'?chapters[currentIndex-1].mgTitle:chapters[currentIndex-1].title}</strong></span></button>:<span/>}
          {currentIndex<chapters.length-1?<button type="button" onClick={()=>openChapter(chapters[currentIndex+1].id)}><span><small>{tr.next}</small><strong>{lang==='mg'?chapters[currentIndex+1].mgTitle:chapters[currentIndex+1].title}</strong></span><ArrowRightIcon/></button>:<span/>}
        </nav>
      </div>}
    </main>

    <nav className="bottom-nav safe-bottom" aria-label={lang==='mg'?'Navigation':'Navigation principale'}>
      {[
        {id:'home' as View,label:lang==='mg'?'Fandraisana':'Accueil',icon:'chapters' as GlyphName},
        {id:'smart' as View,label:lang==='mg'?'Hamaha':'Résoudre',icon:'solve' as GlyphName},
        {id:'practice' as View,label:lang==='mg'?'Fanazarana':'Exercices',icon:'practice' as GlyphName},
        {id:'lessons' as View,label:lang==='mg'?'Lesona':'Réviser',icon:'lesson' as GlyphName},
      ].map(item=><button key={item.id} type="button" onClick={()=>go(item.id)} className={view===item.id?'is-active':''} aria-current={view===item.id?'page':undefined}><Glyph name={item.icon}/><span>{item.label}</span></button>)}
      <button type="button" onClick={()=>setMenuOpen(true)} className={['exam','subject','annales','programme','progress','chapters','chapter'].includes(view)?'is-active':''}><MenuIcon/><span>{lang==='mg'?'Hafa':'Plus'}</span></button>
    </nav>

    {menuOpen&&<div className="nav-overlay" onMouseDown={e=>{if(e.target===e.currentTarget)setMenuOpen(false);}}>
      <aside className="nav-panel" role="dialog" aria-modal="true" aria-label="Navigation">
        <div className="nav-panel-head"><div><strong>MathBEPC</strong><small>{tr.appSubtitle}</small></div><button type="button" onClick={()=>setMenuOpen(false)} className="icon-button"><CloseIcon/></button></div>
        <div className="nav-panel-list">{menuItems.map(item=><button key={item.id} type="button" onClick={()=>go(item.id)}><span><Glyph name={item.icon}/></span><strong>{item.label}</strong><i>→</i></button>)}</div>
        <div className="nav-panel-settings"><button type="button" onClick={toggle}><span>{theme==='dark'?<SunIcon/>:<MoonIcon/>}</span>{theme==='dark'?(lang==='mg'?'Mode mazava':'Mode clair'):(lang==='mg'?'Mode maizina':'Mode sombre')}</button>{canInstall&&<button type="button" onClick={install}><span>↓</span>{tr.install}</button>}</div>
        <p className="nav-version">MathBEPC v{__APP_VERSION__}{offline&&<span> • {tr.offline}</span>}</p>
      </aside>
    </div>}

    <footer className="desktop-footer"><span>MathBEPC Madagascar • v{__APP_VERSION__}</span><span>{lang==='mg'?'Matematika kilasy faha-3 • BEPC':'Mathématiques de 3e • BEPC'}</span></footer>
  </div>;
}
