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
import {
  FractionIcon, RadicalIcon, AbsoluteIcon, ExpandIcon, CompressIcon,
  EqualsIcon, TriangleIcon, ChartIcon, PowerIcon, ArrowLeftIcon,
  ArrowRightIcon, MenuIcon, CloseIcon, VectorIcon, BoxIcon,
  SunIcon, MoonIcon,
} from './components/Icons';

type Group = 'Calculs & nombres' | 'Algèbre' | 'Géométrie' | 'Données';
interface Chapter {
  id: string;
  title: string;
  icon: ComponentType<{className?:string}>;
  description: string;
  keywords: string;
  group: Group;
  component: ComponentType;
}

const chapters: Chapter[] = [
  { id: 'fractions', title: 'Fractions & rationnels', icon: FractionIcon, description: 'Fractions, expressions, PGCD/PPCM, rationalisation', keywords: 'fraction rationnel pgcd ppcm simplifier', group: 'Calculs & nombres', component: FractionTopic },
  { id: 'radicals', title: 'Racines carrées', icon: RadicalIcon, description: 'Simplifier, calculer et comparer des radicaux', keywords: 'racine radical sqrt', group: 'Calculs & nombres', component: RadicalTopic },
  { id: 'powers', title: 'Puissances', icon: PowerIcon, description: 'Calculs et règles sur les puissances', keywords: 'puissance exposant', group: 'Calculs & nombres', component: PowersTopic },
  { id: 'absolute', title: 'Valeur absolue', icon: AbsoluteIcon, description: 'Distance, équations et inéquations', keywords: 'valeur absolue distance', group: 'Algèbre', component: AbsoluteValueTopic },
  { id: 'development', title: 'Développement', icon: ExpandIcon, description: 'Identités remarquables et double distribution', keywords: 'développer identité remarquable distribution', group: 'Algèbre', component: DevelopmentTopic },
  { id: 'factorization', title: 'Factorisation', icon: CompressIcon, description: 'Facteur commun, groupement et trinômes', keywords: 'factoriser facteur commun groupement', group: 'Algèbre', component: FactorizationTopic },
  { id: 'equations', title: 'Équations & inéquations', icon: EqualsIcon, description: '1er/2nd degré, systèmes et tableaux de signes', keywords: 'équation inequation système cramer second degré', group: 'Algèbre', component: EquationTopic },
  { id: 'vectors', title: 'Vecteurs & coordonnées', icon: VectorIcon, description: 'Coordonnées, norme et milieu', keywords: 'vecteur coordonnées milieu norme', group: 'Géométrie', component: VectorTopic },
  { id: 'geometry', title: 'Géométrie plane', icon: TriangleIcon, description: 'Pythagore, Thalès, trigonométrie, aires', keywords: 'pythagore thales trigonométrie aire périmètre', group: 'Géométrie', component: GeometryTopic },
  { id: 'space', title: 'Géométrie dans l’espace', icon: BoxIcon, description: 'Volumes, surfaces et solides composés', keywords: 'volume cube cylindre cone sphere pyramide', group: 'Géométrie', component: SpaceTopic },
  { id: 'stats', title: 'Statistiques & proportionnalité', icon: ChartIcon, description: 'Moyenne, médiane, quartiles, pourcentages', keywords: 'statistique moyenne médiane quartile proportion pourcentage', group: 'Données', component: StatsTopic },
];

const groups: Group[] = ['Calculs & nombres', 'Algèbre', 'Géométrie', 'Données'];

function useTheme() {
  const [theme, setTheme] = useState<'dark'|'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mathbepc-theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'light';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mathbepc-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#14171f' : '#ffffff');
  }, [theme]);
  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}

function usePWA() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [offline, setOffline] = useState(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);
  useEffect(() => {
    const beforeInstall = (event: Event) => { event.preventDefault(); setInstallPrompt(event); };
    const onInstalled = () => setInstalled(true);
    const onOffline = () => setOffline(true);
    const onOnline = () => setOffline(false);
    window.addEventListener('beforeinstallprompt', beforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);
  const install = useCallback(async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === 'accepted') setInstalled(true);
    setInstallPrompt(null);
  }, [installPrompt]);
  return { canInstall: !!installPrompt && !installed, offline, install };
}

export default function App() {
  const [selected, setSelected] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { theme, toggle } = useTheme();
  const { canInstall, offline, install } = usePWA();
  const current = chapters.find(c => c.id === selected);
  const currentIndex = chapters.findIndex(c => c.id === selected);

  const filtered = useMemo(() => {
    const q = search.trim().toLocaleLowerCase('fr');
    if (!q) return chapters;
    return chapters.filter(ch => `${ch.title} ${ch.description} ${ch.keywords}`.toLocaleLowerCase('fr').includes(q));
  }, [search]);

  const openChapter = (id: string) => {
    setSelected(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goHome = () => {
    setSelected(null);
    setMenuOpen(false);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[--color-surface] text-[--color-text] transition-colors duration-300">
      <header className="sticky top-0 z-50 border-b border-[--color-border]/80 bg-[--color-surface]/90 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <button onClick={goHome} className="flex items-center gap-3 cursor-pointer" aria-label="Accueil MathBEPC">
            <div className="w-9 h-9 rounded-xl bg-[#145c48] flex items-center justify-center shadow-[0_0_14px_rgba(20,92,72,.25)]" aria-hidden="true">
              <svg viewBox="0 0 36 36" className="w-7 h-7">
                <path d="M6 17.5c4.2.3 7.3 1.2 10.2 3.1v9C13.4 27.9 10 27 6 26.7V17.5Z" fill="white"/>
                <path d="M30 17.5c-4.2.3-7.3 1.2-10.2 3.1v9C22.6 27.9 26 27 30 26.7V17.5Z" fill="white"/>
                <path d="M18 20.5v9" stroke="#dbe9e3" strokeWidth="1.2"/>
                <text x="18" y="15" textAnchor="middle" fontSize="12" fontWeight="800" fill="#ffcd4a">π</text>
                <path d="M29 5.5l2 2.2-1.1 2.5 1.5 2.2-1.5 3-1.2-2.4.8-2.6-1.2-2.1.7-2.8Z" fill="#da3434"/>
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-extrabold tracking-tight">MathBEPC</div>
              <div className="text-[10px] text-[--color-text-muted]">Maths de 3e • Madagascar</div>
            </div>
          </button>

          <div className="flex items-center gap-2">
            {offline && <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-amber-500/10 text-[10px] font-semibold text-amber-500">Hors ligne</span>}
            {canInstall && <button onClick={install} className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-[--color-accent] text-white text-xs font-semibold cursor-pointer">Installer</button>}
            <button onClick={toggle} className="w-10 h-10 rounded-xl bg-[--color-btn-bg] hover:bg-[--color-btn-bg-hover] flex items-center justify-center cursor-pointer" title={theme==='dark'?'Mode clair':'Mode sombre'}>
              {theme==='dark' ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </button>
            <button onClick={() => setMenuOpen(v => !v)} className="h-10 px-3 rounded-xl bg-[--color-btn-bg] hover:bg-[--color-btn-bg-hover] flex items-center gap-2 cursor-pointer font-semibold text-xs" aria-expanded={menuOpen}>
              {menuOpen ? <CloseIcon className="w-4 h-4" /> : <MenuIcon className="w-4 h-4" />}
              <span>Chapitres</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-[--color-border] bg-[--color-card]/98 shadow-xl">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 max-h-[72vh] overflow-y-auto">
              <p className="text-xs font-semibold text-[--color-text-secondary] mb-3">Choisis un chapitre</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {chapters.map(ch => (
                  <button key={ch.id} onClick={() => openChapter(ch.id)} className={`p-3 rounded-xl border text-left flex items-center gap-3 cursor-pointer transition-colors ${selected===ch.id?'border-[--color-accent] bg-[--color-accent-subtle]':'border-[--color-border] bg-[--color-surface] hover:border-[--color-accent]/40'}`}>
                    <div className="w-9 h-9 rounded-lg bg-[--color-btn-bg] flex items-center justify-center flex-shrink-0"><ch.icon className="w-4 h-4 text-[--color-accent]" /></div>
                    <div className="min-w-0"><div className="text-xs font-bold">{ch.title}</div><div className="text-[10px] text-[--color-text-muted] mt-0.5">{ch.description}</div></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-7 sm:py-10">
        {!selected ? (
          <div className="animate-fade-up">
            <section className="max-w-3xl mx-auto text-center pt-3 sm:pt-8 mb-8 sm:mb-10">
              <span className="inline-flex px-3 py-1 rounded-full bg-[--color-accent-subtle] text-[--color-accent] text-[11px] font-bold">Révision BEPC • Classe de 3e</span>
              <h1 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">Quel exercice veux-tu résoudre ?</h1>
              <p className="mt-3 text-sm sm:text-base text-[--color-text-secondary]">Choisis un chapitre ou cherche un mot comme <strong>Pythagore</strong>, <strong>fractions</strong> ou <strong>moyenne</strong>.</p>
              <div className="mt-6 relative max-w-xl mx-auto">
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un chapitre…" className="w-full h-12 rounded-2xl border border-[--color-border] bg-[--color-card] px-5 pr-12 text-sm outline-none focus:ring-2 focus:ring-[--color-input-focus] focus:border-[--color-accent] shadow-sm" aria-label="Rechercher un chapitre" />
                {search && <button onClick={()=>setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[--color-btn-bg] flex items-center justify-center cursor-pointer" aria-label="Effacer la recherche"><CloseIcon className="w-3.5 h-3.5" /></button>}
              </div>
              <p className="mt-3 text-[11px] text-[--color-text-muted]">Les nombres avec virgule sont acceptés : <strong>2,5</strong> fonctionne comme <strong>2.5</strong>.</p>
            </section>

            {filtered.length === 0 ? (
              <div className="max-w-xl mx-auto p-6 text-center rounded-2xl border border-[--color-border] bg-[--color-card]">
                <p className="font-semibold">Aucun chapitre trouvé</p>
                <p className="text-xs text-[--color-text-muted] mt-1">Essaie un mot plus simple : équation, géométrie, fraction…</p>
              </div>
            ) : (
              <div className="space-y-9">
                {groups.map(group => {
                  const items = filtered.filter(ch => ch.group === group);
                  if (!items.length) return null;
                  return <section key={group}>
                    <div className="flex items-center gap-3 mb-3"><h2 className="text-sm font-extrabold">{group}</h2><div className="h-px flex-1 bg-[--color-border]" /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {items.map(ch => (
                        <button key={ch.id} onClick={()=>openChapter(ch.id)} className="group p-5 rounded-2xl bg-[--color-card] border border-[--color-border] hover:border-[--color-accent]/50 hover:shadow-[0_6px_24px_var(--color-glow)] transition-all text-left cursor-pointer">
                          <div className="flex items-start gap-4">
                            <div className="w-11 h-11 rounded-xl bg-[--color-accent-subtle] flex items-center justify-center flex-shrink-0"><ch.icon className="w-5 h-5 text-[--color-accent]" /></div>
                            <div className="min-w-0 flex-1"><h3 className="text-sm font-bold group-hover:text-[--color-accent]">{ch.title}</h3><p className="text-xs text-[--color-text-muted] mt-1 leading-relaxed">{ch.description}</p></div>
                            <ArrowRightIcon className="w-4 h-4 mt-1 text-[--color-text-muted] group-hover:text-[--color-accent]" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </section>;
                })}
              </div>
            )}

            <section className="mt-10 p-5 rounded-2xl bg-[--color-accent-subtle] border border-[--color-accent]/15">
              <h3 className="text-sm font-bold">Comment utiliser MathBEPC ?</h3>
              <div className="mt-3 grid sm:grid-cols-3 gap-3 text-xs text-[--color-text-secondary]">
                <p><strong>1.</strong> Choisis le chapitre de ton exercice.</p>
                <p><strong>2.</strong> Entre les nombres de l’énoncé.</p>
                <p><strong>3.</strong> Lis chaque étape avant le résultat final.</p>
              </div>
            </section>

            {canInstall && <button onClick={install} className="sm:hidden mt-5 w-full py-3.5 rounded-2xl bg-[--color-accent] text-white text-sm font-bold cursor-pointer">Installer MathBEPC sur ce téléphone</button>}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-fade-up">
            <div className="flex items-center justify-between gap-3 mb-5">
              <button onClick={goHome} className="inline-flex items-center gap-2 h-10 px-3 rounded-xl bg-[--color-btn-bg] hover:bg-[--color-btn-bg-hover] text-xs font-semibold cursor-pointer"><ArrowLeftIcon className="w-3.5 h-3.5" /> Accueil</button>
              <button onClick={()=>setMenuOpen(true)} className="inline-flex items-center gap-2 h-10 px-3 rounded-xl border border-[--color-border] text-xs font-semibold cursor-pointer"><MenuIcon className="w-3.5 h-3.5" /> Changer de chapitre</button>
            </div>

            <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-[--color-accent-subtle] border border-[--color-accent]/15">
              <div className="w-12 h-12 rounded-xl bg-[--color-accent] flex items-center justify-center shadow-[0_4px_18px_var(--color-accent-glow)]">{current && <current.icon className="w-5 h-5 text-white" />}</div>
              <div><div className="text-[10px] uppercase tracking-widest font-bold text-[--color-accent]">{current?.group}</div><h2 className="text-xl font-extrabold mt-0.5">{current?.title}</h2><p className="text-xs text-[--color-text-muted] mt-0.5">{current?.description}</p></div>
            </div>

            <div className="bg-[--color-card] rounded-2xl border border-[--color-border] p-4 sm:p-7 shadow-[0_4px_28px_var(--color-glow)]">{current && <current.component />}</div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button disabled={currentIndex<=0} onClick={()=>currentIndex>0&&openChapter(chapters[currentIndex-1].id)} className="min-h-12 rounded-xl border border-[--color-border] px-3 text-left disabled:opacity-30 cursor-pointer disabled:cursor-default"><span className="block text-[10px] text-[--color-text-muted]">Précédent</span><span className="text-xs font-semibold">{currentIndex>0?chapters[currentIndex-1].title:'—'}</span></button>
              <button disabled={currentIndex<0||currentIndex>=chapters.length-1} onClick={()=>currentIndex>=0&&currentIndex<chapters.length-1&&openChapter(chapters[currentIndex+1].id)} className="min-h-12 rounded-xl border border-[--color-border] px-3 text-right disabled:opacity-30 cursor-pointer disabled:cursor-default"><span className="block text-[10px] text-[--color-text-muted]">Suivant</span><span className="text-xs font-semibold">{currentIndex>=0&&currentIndex<chapters.length-1?chapters[currentIndex+1].title:'—'}</span></button>
            </div>
          </div>
        )}
      </main>

      {offline && <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50 px-4 py-3 rounded-2xl bg-[--color-card-elevated] border border-[--color-border] shadow-xl text-xs text-center">Mode hors ligne actif</div>}
      <footer className="border-t border-[--color-border] mt-10"><div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 text-center text-[10px] text-[--color-text-muted]">MathBEPC • Révision de mathématiques pour la 3e • Résolution étape par étape</div></footer>
    </div>
  );
}
