import { useState } from 'react'
import { SolverPage } from './pages/SolverPage'
import { ToolsPage } from './pages/ToolsPage'
import { LessonsPage } from './pages/LessonsPage'
import { ExamPage } from './pages/ExamPage'
import { Icon, type IconName } from './ui/Icon'

type View = 'solve' | 'tools' | 'lessons' | 'exam'

type HistoryItem = {
  id: string
  input: string
  answer: string
  createdAt: number
}

function useStoredState<T>(key: string, initialValue: T): [T, (next: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) as T : initialValue
    } catch {
      return initialValue
    }
  })

  const update = (next: T) => {
    setValue(next)
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // Le stockage local est facultatif.
    }
  }

  return [value, update]
}

const navigation: Array<{ id: View; label: string; shortLabel: string; icon: IconName }> = [
  { id: 'solve', label: 'Résoudre', shortLabel: 'Résoudre', icon: 'solve' },
  { id: 'tools', label: 'Calculatrices', shortLabel: 'Outils', icon: 'tools' },
  { id: 'lessons', label: 'Cours', shortLabel: 'Cours', icon: 'book' },
  { id: 'exam', label: 'Sujets BEPC', shortLabel: 'BEPC', icon: 'exam' }
]

function Brand() {
  return (
    <div className="brand">
      <div className="brand-symbol">M</div>
      <div>
        <strong>MathBEPC</strong>
        <span>Madagascar</span>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>('solve')
  const [history, setHistory] = useStoredState<HistoryItem[]>('mathbepc-history-v21', [])
  const [completed, setCompleted] = useStoredState<string[]>('mathbepc-exam-v21', [])

  const addHistory = (item: HistoryItem) => {
    const filtered = history.filter(previous => previous.input !== item.input)
    setHistory([item, ...filtered].slice(0, 30))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Brand />

        <div className="sidebar-caption">Espace de travail</div>
        <nav className="desktop-nav" aria-label="Navigation principale">
          {navigation.map(item => (
            <button
              key={item.id}
              className={view === item.id ? 'active' : ''}
              onClick={() => setView(item.id)}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-progress">
          <span>Préparation BEPC</span>
          <strong>{completed.length} exercices corrigés</strong>
          <div><i style={{ width: Math.min(100, completed.length * 8) + '%' }} /></div>
        </div>

        <footer className="sidebar-footer">
          <strong>MathBEPC 2.1</strong>
          <span>Calcul local · Fonctionne hors connexion</span>
        </footer>
      </aside>

      <main className="main">
        <header className="mobile-header">
          <Brand />
          <span className="mobile-version">2.1</span>
        </header>

        {view === 'solve' ? <SolverPage history={history} onHistory={addHistory} /> : null}
        {view === 'tools' ? <ToolsPage /> : null}
        {view === 'lessons' ? <LessonsPage /> : null}
        {view === 'exam' ? <ExamPage completed={completed} onCompleted={setCompleted} /> : null}
      </main>

      <nav className="mobile-nav" aria-label="Navigation mobile">
        {navigation.map(item => (
          <button
            key={item.id}
            className={view === item.id ? 'active' : ''}
            onClick={() => setView(item.id)}
          >
            <Icon name={item.icon} size={19} />
            <span>{item.shortLabel}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
