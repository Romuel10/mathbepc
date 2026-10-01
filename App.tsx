import { useState, useEffect, useCallback } from 'react';
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

interface Chapter { id: string; title: string; icon: React.ComponentType<{className?:string}>; description: string; component: React.ComponentType; }

const chapters: Chapter[] = [
  { id: 'fractions', title: 'Nombres Rationnels', icon: FractionIcon, description: 'Fractions, expressions complexes, rationalisation', component: FractionTopic },
  { id: 'radicals', title: 'Nombres Radicaux', icon: RadicalIcon, description: 'Simplification, opérations, comparaisons', component: RadicalTopic },
  { id: 'absolute', title: 'Valeur Absolue', icon: AbsoluteIcon, description: 'Distances, équations et inéquations', component: AbsoluteValueTopic },
  { id: 'development', title: 'Développement', icon: ExpandIcon, description: 'Identités remarquables, double distribution', component: DevelopmentTopic },
  { id: 'factorization', title: 'Factorisation', icon: CompressIcon, description: 'Facteur commun, groupement, identités', component: FactorizationTopic },
  { id: 'equations', title: 'Équations & Systèmes', icon: EqualsIcon, description: '1er/2nd degré, systèmes, inéquations', component: EquationTopic },
  { id: 'vectors', title: 'Vecteurs & Analytique', icon: VectorIcon, description: 'Coordonnées, norme, milieu', component: VectorTopic },
  { id: 'geometry', title: 'Géométrie Plane', icon: TriangleIcon, description: 'Pythagore, Thalès, trigo, aires', component: GeometryTopic },
  { id: 'space', title: 'Géométrie de l\'Espace', icon: BoxIcon, description: 'Volumes, aires, solides composés', component: SpaceTopic },
  { id: 'stats', title: 'Statistiques', icon: ChartIcon, description: 'Moyenne, quartiles, histogrammes', component: StatsTopic },
  { id: 'powers', title: 'Puissances', icon: PowerIcon, description: 'Calculs et règles des puissances', component: PowersTopic },
];

function useTheme() {
  const [theme, setTheme] = useState<'dark'|'light'>(() => {
    if (typeof window !== 'undefined') { const s = localStorage.getItem('mathbepc-theme'); if (s === 'light' || s === 'dark') return s; }
    return 'dark';
  });
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mathbepc-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#14171f' : '#ffffff');
  }, [theme]);
  return { theme, toggle: () => setTheme(t => t === 'dark' ? 'light' : 'dark') };
}

function usePWA() {
  const [ip, setIp] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);
  useEffect(() => {
    const b = (e: Event) => { e.preventDefault(); setIp(e); };
    const i = () => setInstalled(true);
    const off = () => setOffline(true);
    const on = () => setOffline(false);
    window.addEventListener('beforeinstallprompt', b);
    window.addEventListener('appinstalled', i);
    window.addEventListener('offline', off);
    window.addEventListener('online', on);
    if (window.matchMedia('(display-mode: standalone)').matches) setInstalled(true);
    return () => { window.removeEventListener('beforeinstallprompt', b); window.removeEventListener('appinstalled', i); window.removeEventListener('offline', off); window.removeEventListener('online', on); };
  }, []);
  const install = useCallback(async () => { if (!ip) return; ip.prompt(); const r = await ip.userChoice; if (r.outcome === 'accepted') setInstalled(true); setIp(null); }, [ip]);
  return { canInstall: !!ip && !installed, offline, install };
}

export default function App() {
  const [sel, setSel] = useState<string | null>(null);
  const [mob, setMob] = useState(false);
  const { theme, toggle } = useTheme();
  const { canInstall, offline, install } = usePWA();
  const cur = chapters.find(c => c.id === sel);
  const idx = chapters.findIndex(c => c.id === sel);

  return (
    <div className="min-h-screen bg-[--color-surface] text-[--color-text] transition-colors duration-300">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-50 border-b border-[--color-border]/80 bg-[--color-surface]/70 backdrop-blur-2xl backdrop-saturate-150 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-[52px]">
          <button onClick={() => setSel(null)} className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-7 h-7 rounded-lg bg-[--color-accent] flex items-center justify-center shadow-[0_0_12px_var(--color-accent-glow)]">
              <span className="text-white text-xs font-extrabold font-mono">M</span>
            </div>
            <span className="text-[13px] font-bold text-[--color-text] tracking-tight">MathBEPC</span>
          </button>

          <nav className="hidden lg:flex items-center gap-0.5 bg-[--color-btn-bg]/60 p-1 rounded-xl">
            {chapters.map(ch => (
              <button key={ch.id} onClick={() => setSel(ch.id)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 cursor-pointer ${
                  sel === ch.id ? 'bg-[--color-accent] text-white shadow-[0_2px_8px_var(--color-accent-glow)]' : 'text-[--color-text-muted] hover:text-[--color-text]'
                }`}>
                {ch.title.split(' ')[0]}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            {offline && <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 text-[10px] font-semibold text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" style={{animation:'glow-pulse 2s infinite'}} />Hors ligne</span>}
            {canInstall && <button onClick={install} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[--color-accent] text-white text-[11px] font-semibold cursor-pointer hover:bg-[--color-accent-hover] transition-all shadow-[0_2px_8px_var(--color-accent-glow)]">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Installer</button>}
            <button onClick={toggle} className="w-8 h-8 rounded-xl bg-[--color-btn-bg] hover:bg-[--color-btn-bg-hover] flex items-center justify-center cursor-pointer transition-colors" title={theme==='dark'?'Mode jour':'Mode nuit'}>
              {theme==='dark' ? <SunIcon className="w-3.5 h-3.5 text-[--color-btn-text]" /> : <MoonIcon className="w-3.5 h-3.5 text-[--color-btn-text]" />}
            </button>
            <button onClick={()=>setMob(!mob)} className="lg:hidden w-8 h-8 rounded-xl bg-[--color-btn-bg] hover:bg-[--color-btn-bg-hover] flex items-center justify-center cursor-pointer transition-colors">
              {mob ? <CloseIcon className="w-3.5 h-3.5 text-[--color-btn-text]" /> : <MenuIcon className="w-3.5 h-3.5 text-[--color-btn-text]" />}
            </button>
          </div>
        </div>

        {mob && (
          <div className="lg:hidden border-t border-[--color-border]/60 bg-[--color-card]/95 backdrop-blur-xl">
            <div className="p-2 max-h-[75vh] overflow-y-auto space-y-0.5">
              {chapters.map(ch => (
                <button key={ch.id} onClick={() => { setSel(ch.id); setMob(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left cursor-pointer transition-all duration-150 ${
                    sel === ch.id ? 'bg-[--color-accent-subtle]' : 'hover:bg-[--color-btn-bg]'
                  }`}>
                  <ch.icon className={`w-4 h-4 flex-shrink-0 ${sel === ch.id ? 'text-[--color-accent]' : 'text-[--color-text-muted]'}`} />
                  <div>
                    <div className={`text-[13px] font-medium ${sel === ch.id ? 'text-[--color-accent]' : 'text-[--color-text]'}`}>{ch.title}</div>
                    <div className="text-[11px] text-[--color-text-muted] leading-tight">{ch.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ===== MAIN ===== */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        {!sel ? (
          <div className="animate-fade-up">
            {/* Hero */}
            <div className="relative max-w-2xl mx-auto text-center mb-16">
              {/* Decorative glow */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-[--color-accent] rounded-full opacity-[0.03] blur-[100px] pointer-events-none" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[--color-accent-subtle] border border-[--color-accent]/15 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[--color-accent]" />
                  <span className="text-[11px] font-semibold text-[--color-accent]">Programme BEPC Madagascar</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-extrabold text-[--color-text] leading-[1.15] tracking-tight">
                  Résolvez vos maths,<br />
                  <span className="bg-gradient-to-r from-[--color-accent] to-[#a78bfa] bg-clip-text text-transparent">étape par étape.</span>
                </h1>
                <p className="mt-5 text-[--color-text-secondary] text-[15px] leading-relaxed max-w-lg mx-auto">
                  11 chapitres couvrant l'intégralité du programme de 3ème.
                  Saisissez vos données, obtenez la résolution détaillée.
                </p>
              </div>
            </div>

            {/* Chapter Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {chapters.map((ch, i) => (
                <button key={ch.id} onClick={() => setSel(ch.id)}
                  className="group relative bg-[--color-card] rounded-2xl border border-[--color-border]/80 p-5
                             hover:border-[--color-accent]/30 hover:shadow-[0_4px_24px_var(--color-glow)]
                             transition-all duration-300 cursor-pointer text-left overflow-hidden"
                  style={{ animationDelay: `${i * 30}ms` }}>
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[--color-accent]/0 to-[--color-accent]/0 group-hover:from-[--color-accent]/[0.03] group-hover:to-transparent transition-all duration-500" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[--color-btn-bg] flex items-center justify-center flex-shrink-0
                                    group-hover:bg-[--color-accent] group-hover:shadow-[0_0_16px_var(--color-accent-glow)] transition-all duration-300">
                      <ch.icon className="w-[18px] h-[18px] text-[--color-btn-text] group-hover:text-white transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-[13px] font-semibold text-[--color-text] group-hover:text-[--color-accent] transition-colors">{ch.title}</h3>
                      <p className="text-[11px] text-[--color-text-muted] mt-0.5 leading-relaxed">{ch.description}</p>
                    </div>
                    <ArrowRightIcon className="w-3.5 h-3.5 text-[--color-text-muted] group-hover:text-[--color-accent] transition-all flex-shrink-0 mt-1 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0" />
                  </div>
                </button>
              ))}
            </div>

            {/* Features */}
            <div className="mt-20 border-t border-[--color-border]/60 pt-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
                {[
                  { title: 'Résolution détaillée', desc: 'Chaque calcul décomposé étape par étape pour une compréhension totale.' },
                  { title: 'Conforme au BEPC', desc: 'L\'intégralité du programme officiel de mathématiques de 3ème.' },
                  { title: 'Disponible hors ligne', desc: 'Installez l\'app et révisez partout, même sans connexion.' },
                ].map(f => (
                  <div key={f.title} className="text-center">
                    <h4 className="text-[13px] font-semibold text-[--color-text]">{f.title}</h4>
                    <p className="text-[12px] text-[--color-text-muted] mt-1.5 leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {canInstall && (
              <div className="mt-8 sm:hidden">
                <button onClick={install} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[--color-accent] text-white text-sm font-semibold cursor-pointer hover:bg-[--color-accent-hover] transition-all shadow-[0_4px_20px_var(--color-accent-glow)]">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Installer l'application
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-3xl mx-auto animate-fade-up">
            <button onClick={() => setSel(null)} className="inline-flex items-center gap-1.5 text-[11px] text-[--color-text-muted] hover:text-[--color-accent] transition-colors cursor-pointer mb-8 group">
              <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> Tous les chapitres
            </button>

            {/* Chapter Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-[--color-accent] flex items-center justify-center shadow-[0_4px_20px_var(--color-accent-glow)]">
                {cur && <cur.icon className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-[--color-text] leading-tight tracking-tight">{cur?.title}</h2>
                <p className="text-[12px] text-[--color-text-muted] mt-0.5">{cur?.description}</p>
              </div>
            </div>

            {/* Content Card */}
            <div className="bg-[--color-card] rounded-2xl border border-[--color-border]/80 p-5 sm:p-8 shadow-[0_4px_32px_var(--color-glow)] transition-colors duration-300">
              {cur && <cur.component />}
            </div>

            {/* Prev / Next */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-[--color-border]/60">
              {idx > 0 ? (
                <button onClick={() => setSel(chapters[idx-1].id)} className="group flex items-center gap-2 text-[11px] text-[--color-text-muted] hover:text-[--color-accent] transition-colors cursor-pointer">
                  <ArrowLeftIcon className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> <span className="hidden sm:inline">{chapters[idx-1].title}</span><span className="sm:hidden">Précédent</span>
                </button>
              ) : <div />}
              {idx < chapters.length-1 ? (
                <button onClick={() => setSel(chapters[idx+1].id)} className="group flex items-center gap-2 text-[11px] text-[--color-text-muted] hover:text-[--color-accent] transition-colors cursor-pointer">
                  <span className="hidden sm:inline">{chapters[idx+1].title}</span><span className="sm:hidden">Suivant</span> <ArrowRightIcon className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ) : <div />}
            </div>
          </div>
        )}
      </main>

      {/* Offline toast */}
      {offline && (
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-[--color-card-elevated] border border-[--color-border] shadow-xl backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" style={{animation:'glow-pulse 2s infinite'}} />
          <span className="text-[11px] text-[--color-text-secondary]">Hors ligne — toutes les fonctionnalités disponibles</span>
        </div>
      )}

      <footer className="border-t border-[--color-border]/40 mt-12 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <p className="text-[11px] text-[--color-text-muted]">MathBEPC — Programme BEPC Madagascar</p>
          <p className="text-[10px] text-[--color-text-muted]/50">11 chapitres · Résolution étape par étape</p>
        </div>
      </footer>
    </div>
  );
}
