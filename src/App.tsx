import { useMemo, useState } from 'react'
import {
  computeStatistics,
  coordinateDistance,
  evaluateExpression,
  formatNumber,
  simplifyFraction,
  simplifyRadical,
  solveLinearSystem,
  solvePythagoras,
  solveRelation,
  solveSmart,
  solveThales,
  type SolveResult
} from './math/engine'
import { lessons, type Lesson } from './data/lessons'
import { practiceQuestions } from './data/practice'

type View = 'home' | 'solver' | 'calculator' | 'lessons' | 'practice'
type IconName = 'home' | 'solve' | 'calculator' | 'book' | 'practice' | 'arrow' | 'check' | 'history' | 'spark' | 'chart' | 'geometry'

type HistoryItem = {
  id: string
  input: string
  answer: string
  createdAt: number
}

const iconPaths: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z',
  solve: 'M4 5h16M4 12h6m4 0h6M4 19h16M8 2v6m8 8v6',
  calculator: 'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm2 4h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h4',
  book: 'M4 4.5A2.5 2.5 0 0 1 6.5 2H11a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H6.5A2.5 2.5 0 0 0 4 19.5v-15Zm16 0A2.5 2.5 0 0 0 17.5 2H14v18a3 3 0 0 1 3-3h.5a2.5 2.5 0 0 1 2.5 2.5v-15Z',
  practice: 'M8 3h8l2 3v15H6V6l2-3Zm1 7h6m-6 4h6m-6 4h4',
  arrow: 'm9 18 6-6-6-6',
  check: 'm5 12 4 4L19 6',
  history: 'M3 12a9 9 0 1 0 3-6.7L3 8m0-5v5h5m4-2v6l4 2',
  spark: 'm12 2 1.7 5.3L19 9l-5.3 1.7L12 16l-1.7-5.3L5 9l5.3-1.7L12 2Zm7 13 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z',
  chart: 'M4 20V10m6 10V4m6 16v-7m4 7H2',
  geometry: 'M12 3 3 20h18L12 3Zm0 6v5m0 3h.01'
}

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  )
}

function useStoredState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const update = (next: T) => {
    setValue(next)
    try {
      localStorage.setItem(key, JSON.stringify(next))
    } catch {
      // Le stockage local est optionnel.
    }
  }

  return [value, update]
}

function AppLogo() {
  return (
    <div className="brand">
      <div className="brand-mark" aria-hidden="true">
        <span>∑</span>
      </div>
      <div>
        <strong>MathBEPC</strong>
        <small>Madagascar</small>
      </div>
    </div>
  )
}

const navigation: Array<{ id: View; label: string; icon: IconName }> = [
  { id: 'home', label: 'Accueil', icon: 'home' },
  { id: 'solver', label: 'Résoudre', icon: 'solve' },
  { id: 'calculator', label: 'Calculs', icon: 'calculator' },
  { id: 'lessons', label: 'Cours', icon: 'book' },
  { id: 'practice', label: 'Exercices', icon: 'practice' }
]

function ResultCard({ result }: { result: SolveResult }) {
  return (
    <section className="result-card animate-in" aria-live="polite">
      <div className="result-topline">
        <span className="result-label">{result.title}</span>
        <span className="result-status">Résolu</span>
      </div>
      <div className="result-answer">{result.answer}</div>
      <div className="step-list">
        {result.steps.map((step, index) => (
          <div className="step" key={index}>
            <span className="step-number">{index + 1}</span>
            <div>
              <strong>{step.title}</strong>
              {step.expression ? <div className="math-line">{step.expression}</div> : null}
              {step.detail ? <p>{step.detail}</p> : null}
            </div>
          </div>
        ))}
      </div>
      {result.note ? <div className="note">{result.note}</div> : null}
    </section>
  )
}

function PageTitle({
  eyebrow,
  title,
  description
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <header className="page-title">
      <span>{eyebrow}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </header>
  )
}

function Home({
  onNavigate,
  history,
  completed
}: {
  onNavigate: (view: View) => void
  history: HistoryItem[]
  completed: string[]
}) {
  const progress = Math.round((completed.length / practiceQuestions.length) * 100)

  return (
    <div className="page animate-page">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Préparation 3e et BEPC</span>
          <h1>Comprendre la méthode, puis réussir le calcul.</h1>
          <p>
            Un espace de travail conçu pour les notions réellement étudiées au collège à Madagascar :
            calcul littéral, équations, statistiques, Thalès, trigonométrie, vecteurs et géométrie.
          </p>
          <div className="hero-actions">
            <button className="button primary" onClick={() => onNavigate('solver')}>
              Commencer une résolution
              <Icon name="arrow" />
            </button>
            <button className="button secondary" onClick={() => onNavigate('practice')}>
              S’entraîner au BEPC
            </button>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="formula-card formula-card-a">3x + 7 = 19</div>
          <div className="formula-card formula-card-b">AB² = AC² + BC²</div>
          <div className="formula-card formula-card-c">AM / AB = AN / AC</div>
          <div className="orb orb-one" />
          <div className="orb orb-two" />
        </div>
      </section>

      <section className="metrics-grid">
        <article className="metric-card">
          <div className="metric-icon"><Icon name="book" /></div>
          <div><strong>{lessons.length}</strong><span>chapitres essentiels</span></div>
        </article>
        <article className="metric-card">
          <div className="metric-icon"><Icon name="practice" /></div>
          <div><strong>{practiceQuestions.length}</strong><span>exercices guidés</span></div>
        </article>
        <article className="metric-card">
          <div className="metric-icon"><Icon name="chart" /></div>
          <div><strong>{progress}%</strong><span>progression exercices</span></div>
        </article>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Accès rapide</span>
            <h2>Choisir le bon outil</h2>
          </div>
        </div>
        <div className="feature-grid">
          <button className="feature-card" onClick={() => onNavigate('solver')}>
            <span className="feature-icon"><Icon name="solve" /></span>
            <strong>Résolution pas à pas</strong>
            <p>Saisir une expression, une équation ou une inéquation et suivre les étapes.</p>
            <span className="card-link">Ouvrir <Icon name="arrow" size={16} /></span>
          </button>
          <button className="feature-card" onClick={() => onNavigate('calculator')}>
            <span className="feature-icon"><Icon name="calculator" /></span>
            <strong>Outils de calcul</strong>
            <p>Fractions, statistiques, Pythagore, Thalès, coordonnées et systèmes.</p>
            <span className="card-link">Ouvrir <Icon name="arrow" size={16} /></span>
          </button>
          <button className="feature-card" onClick={() => onNavigate('lessons')}>
            <span className="feature-icon"><Icon name="book" /></span>
            <strong>Fiches de cours</strong>
            <p>Formules, méthode et exemple corrigé pour chaque chapitre important.</p>
            <span className="card-link">Consulter <Icon name="arrow" size={16} /></span>
          </button>
        </div>
      </section>

      {history.length > 0 ? (
        <section className="section-block">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Historique</span>
              <h2>Derniers calculs</h2>
            </div>
            <button className="text-button" onClick={() => onNavigate('solver')}>Voir le résolveur</button>
          </div>
          <div className="history-list">
            {history.slice(0, 3).map(item => (
              <article className="history-row" key={item.id}>
                <span className="history-icon"><Icon name="history" size={18} /></span>
                <div>
                  <strong>{item.input}</strong>
                  <span>{item.answer}</span>
                </div>
                <time>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</time>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function Solver({
  history,
  onHistory
}: {
  history: HistoryItem[]
  onHistory: (item: HistoryItem) => void
}) {
  const [input, setInput] = useState('3x + 7 = 19')
  const [result, setResult] = useState<SolveResult | null>(null)
  const [error, setError] = useState('')
  const examples = ['5x - 7 = 18', '3(x - 2) <= 12', 'sqrt(108)', 'moyenne : 8 ; 10 ; 10 ; 12']

  const run = () => {
    try {
      const solved = solveSmart(input)
      setResult(solved)
      setError('')
      onHistory({
        id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
        input: input.trim(),
        answer: solved.answer,
        createdAt: Date.now()
      })
    } catch (reason) {
      setResult(null)
      setError(reason instanceof Error ? reason.message : 'Le calcul n’a pas pu être interprété.')
    }
  }

  const insert = (value: string) => setInput(current => current + value)

  return (
    <div className="page animate-page">
      <PageTitle
        eyebrow="Moteur de résolution"
        title="Résoudre pas à pas"
        description="Entrez votre calcul comme sur votre cahier. Le moteur applique les priorités et détaille les étapes utiles."
      />

      <div className="workspace-grid">
        <section className="panel solver-panel">
          <label className="field-label" htmlFor="problem">Calcul ou équation</label>
          <textarea
            id="problem"
            className="problem-input"
            value={input}
            onChange={event => setInput(event.target.value)}
            placeholder="Exemple : 3x + 7 = 19"
            rows={4}
            spellCheck={false}
          />
          <div className="math-keyboard">
            {['(', ')', '²', '√', '×', '÷', 'π', '%'].map(key => (
              <button type="button" key={key} onClick={() => insert(key)}>{key}</button>
            ))}
          </div>
          <div className="example-row">
            {examples.map(example => (
              <button key={example} type="button" onClick={() => setInput(example)}>{example}</button>
            ))}
          </div>
          {error ? <div className="error-box">{error}</div> : null}
          <button className="button primary full" onClick={run}>
            Calculer et expliquer
            <Icon name="arrow" />
          </button>
        </section>

        <aside className="panel guidance-panel">
          <div className="guidance-title">
            <span className="feature-icon compact"><Icon name="spark" /></span>
            <div>
              <strong>Formats reconnus</strong>
              <span>Écriture naturelle de collège</span>
            </div>
          </div>
          <ul className="clean-list">
            <li><span>Calcul</span><code>3 + 5 × 2²</code></li>
            <li><span>Équation</span><code>4x - 3 = 13</code></li>
            <li><span>Inéquation</span><code>2x + 1 &lt; 9</code></li>
            <li><span>Racine</span><code>√108</code></li>
            <li><span>Statistiques</span><code>moyenne : 8 ; 10 ; 12</code></li>
          </ul>
          <p className="muted">
            Les fonctions trigonométriques sin, cos et tan utilisent les degrés, comme en classe.
          </p>
        </aside>
      </div>

      {result ? <ResultCard result={result} /> : null}

      {history.length > 0 ? (
        <section className="section-block compact-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Historique local</span>
              <h2>Résolutions récentes</h2>
            </div>
          </div>
          <div className="history-list">
            {history.slice(0, 5).map(item => (
              <button className="history-row interactive" key={item.id} onClick={() => setInput(item.input)}>
                <span className="history-icon"><Icon name="history" size={18} /></span>
                <div><strong>{item.input}</strong><span>{item.answer}</span></div>
                <time>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</time>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

type CalculatorTab = 'scientific' | 'fraction' | 'statistics' | 'geometry' | 'system'

function Calculator() {
  const [tab, setTab] = useState<CalculatorTab>('scientific')
  const [result, setResult] = useState<SolveResult | null>(null)
  const [error, setError] = useState('')
  const [expression, setExpression] = useState('sin(30) + sqrt(49)')
  const [numerator, setNumerator] = useState('84')
  const [denominator, setDenominator] = useState('126')
  const [series, setSeries] = useState('8; 10; 10; 12; 15')
  const [geometryTool, setGeometryTool] = useState<'pythagore' | 'thales' | 'distance' | 'radical'>('pythagore')
  const [geometryValues, setGeometryValues] = useState(['3', '4', '', ''])
  const [systemValues, setSystemValues] = useState(['2', '1', '7', '1', '-1', '2'])

  const execute = (operation: () => SolveResult) => {
    try {
      setResult(operation())
      setError('')
    } catch (reason) {
      setResult(null)
      setError(reason instanceof Error ? reason.message : 'Valeurs invalides.')
    }
  }

  const numberValue = (value: string) => {
    if (value.trim() === '') return undefined
    const parsed = Number(value.replace(',', '.'))
    if (!Number.isFinite(parsed)) throw new Error('Une valeur numérique est invalide.')
    return parsed
  }

  const runScientific = () => execute(() => {
    const value = evaluateExpression(expression)
    return {
      kind: 'number',
      title: 'Calcul scientifique',
      answer: formatNumber(value),
      steps: [
        { title: 'Expression', expression },
        { title: 'Résultat', expression: formatNumber(value), detail: 'Les angles trigonométriques sont interprétés en degrés.' }
      ]
    }
  })

  const runGeometry = () => execute(() => {
    const v = geometryValues.map(numberValue)
    if (geometryTool === 'pythagore') {
      return solvePythagoras(v[0], v[1], v[2])
    }
    if (geometryTool === 'thales') {
      if (v[0] === undefined || v[1] === undefined || v[2] === undefined) throw new Error('Renseignez les trois valeurs connues.')
      return solveThales(v[0], v[1], v[2])
    }
    if (geometryTool === 'distance') {
      if (v[0] === undefined || v[1] === undefined || v[2] === undefined || v[3] === undefined) throw new Error('Renseignez les quatre coordonnées.')
      return coordinateDistance(v[0], v[1], v[2], v[3])
    }
    if (v[0] === undefined) throw new Error('Entrez le nombre sous la racine.')
    return simplifyRadical(v[0])
  })

  const tabs: Array<{ id: CalculatorTab; label: string }> = [
    { id: 'scientific', label: 'Scientifique' },
    { id: 'fraction', label: 'Fractions' },
    { id: 'statistics', label: 'Statistiques' },
    { id: 'geometry', label: 'Géométrie' },
    { id: 'system', label: 'Systèmes' }
  ]

  return (
    <div className="page animate-page">
      <PageTitle
        eyebrow="Boîte à outils"
        title="Calculs avancés"
        description="Des outils spécialisés pour les calculs les plus fréquents des sujets de 3e et du BEPC."
      />

      <div className="tab-strip" role="tablist">
        {tabs.map(item => (
          <button
            key={item.id}
            className={tab === item.id ? 'active' : ''}
            onClick={() => { setTab(item.id); setResult(null); setError('') }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="panel calculator-panel">
        {tab === 'scientific' ? (
          <div className="tool-form">
            <div>
              <label className="field-label" htmlFor="scientific-expression">Expression</label>
              <input
                id="scientific-expression"
                className="text-input large"
                value={expression}
                onChange={event => setExpression(event.target.value)}
              />
            </div>
            <div className="helper-grid">
              <button onClick={() => setExpression('sqrt(72)')}>Racine carrée</button>
              <button onClick={() => setExpression('sin(30)')}>Trigonométrie</button>
              <button onClick={() => setExpression('(3 + 5) * 2^3')}>Priorités</button>
              <button onClick={() => setExpression('15% * 240')}>Pourcentage</button>
            </div>
            <button className="button primary" onClick={runScientific}>Calculer</button>
          </div>
        ) : null}

        {tab === 'fraction' ? (
          <div className="tool-form">
            <div className="two-columns">
              <div>
                <label className="field-label" htmlFor="numerator">Numérateur</label>
                <input id="numerator" className="text-input" inputMode="numeric" value={numerator} onChange={event => setNumerator(event.target.value)} />
              </div>
              <div>
                <label className="field-label" htmlFor="denominator">Dénominateur</label>
                <input id="denominator" className="text-input" inputMode="numeric" value={denominator} onChange={event => setDenominator(event.target.value)} />
              </div>
            </div>
            <button className="button primary" onClick={() => execute(() => simplifyFraction(Number(numerator), Number(denominator)))}>
              Simplifier la fraction
            </button>
          </div>
        ) : null}

        {tab === 'statistics' ? (
          <div className="tool-form">
            <div>
              <label className="field-label" htmlFor="series">Série de valeurs</label>
              <textarea id="series" className="problem-input compact" rows={3} value={series} onChange={event => setSeries(event.target.value)} />
              <span className="field-help">Séparez les valeurs par des espaces, virgules ou points-virgules.</span>
            </div>
            <button className="button primary" onClick={() => execute(() => {
              const values = (series.match(/-?\d+(?:[.,]\d+)?/g) ?? []).map(value => Number(value.replace(',', '.')))
              return computeStatistics(values)
            })}>
              Analyser la série
            </button>
          </div>
        ) : null}

        {tab === 'geometry' ? (
          <div className="tool-form">
            <div className="segmented">
              {([
                ['pythagore', 'Pythagore'],
                ['thales', 'Thalès'],
                ['distance', 'Coordonnées'],
                ['radical', 'Racines']
              ] as const).map(([id, label]) => (
                <button key={id} className={geometryTool === id ? 'active' : ''} onClick={() => { setGeometryTool(id); setResult(null) }}>
                  {label}
                </button>
              ))}
            </div>

            {geometryTool === 'pythagore' ? (
              <>
                <p className="tool-explainer">Renseignez exactement deux longueurs parmi a, b et l’hypoténuse c.</p>
                <div className="three-columns">
                  {['a', 'b', 'c (hypoténuse)'].map((label, index) => (
                    <div key={label}>
                      <label className="field-label">{label}</label>
                      <input className="text-input" inputMode="decimal" value={geometryValues[index] ?? ''} onChange={event => {
                        const next = [...geometryValues]
                        next[index] = event.target.value
                        setGeometryValues(next)
                      }} />
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {geometryTool === 'thales' ? (
              <>
                <p className="tool-explainer">Pour la proportion a / b = c / x, indiquez a, b et c.</p>
                <div className="three-columns">
                  {['a', 'b', 'c'].map((label, index) => (
                    <div key={label}>
                      <label className="field-label">{label}</label>
                      <input className="text-input" inputMode="decimal" value={geometryValues[index] ?? ''} onChange={event => {
                        const next = [...geometryValues]
                        next[index] = event.target.value
                        setGeometryValues(next)
                      }} />
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {geometryTool === 'distance' ? (
              <>
                <p className="tool-explainer">Coordonnées de A(xA ; yA) et B(xB ; yB).</p>
                <div className="four-columns">
                  {['xA', 'yA', 'xB', 'yB'].map((label, index) => (
                    <div key={label}>
                      <label className="field-label">{label}</label>
                      <input className="text-input" inputMode="decimal" value={geometryValues[index] ?? ''} onChange={event => {
                        const next = [...geometryValues]
                        next[index] = event.target.value
                        setGeometryValues(next)
                      }} />
                    </div>
                  ))}
                </div>
              </>
            ) : null}

            {geometryTool === 'radical' ? (
              <div>
                <label className="field-label">Entier sous la racine</label>
                <input className="text-input" inputMode="numeric" value={geometryValues[0] ?? ''} onChange={event => {
                  const next = [...geometryValues]
                  next[0] = event.target.value
                  setGeometryValues(next)
                }} />
              </div>
            ) : null}
            <button className="button primary" onClick={runGeometry}>Résoudre</button>
          </div>
        ) : null}

        {tab === 'system' ? (
          <div className="tool-form">
            <p className="tool-explainer">Forme : a₁x + b₁y = c₁ et a₂x + b₂y = c₂.</p>
            <div className="system-grid">
              {['a₁', 'b₁', 'c₁', 'a₂', 'b₂', 'c₂'].map((label, index) => (
                <div key={label}>
                  <label className="field-label">{label}</label>
                  <input className="text-input" inputMode="decimal" value={systemValues[index] ?? ''} onChange={event => {
                    const next = [...systemValues]
                    next[index] = event.target.value
                    setSystemValues(next)
                  }} />
                </div>
              ))}
            </div>
            <button className="button primary" onClick={() => execute(() => {
              const values = systemValues.map(value => Number(value.replace(',', '.')))
              if (values.some(value => !Number.isFinite(value))) throw new Error('Tous les coefficients doivent être numériques.')
              return solveLinearSystem(
                values[0] ?? 0,
                values[1] ?? 0,
                values[2] ?? 0,
                values[3] ?? 0,
                values[4] ?? 0,
                values[5] ?? 0
              )
            })}>
              Résoudre le système
            </button>
          </div>
        ) : null}

        {error ? <div className="error-box">{error}</div> : null}
      </section>

      {result ? <ResultCard result={result} /> : null}
    </div>
  )
}

function Lessons() {
  const [selected, setSelected] = useState<Lesson | null>(null)
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return lessons
    return lessons.filter(lesson =>
      `${lesson.title} ${lesson.description} ${lesson.area}`.toLowerCase().includes(term)
    )
  }, [query])

  if (selected) {
    return (
      <div className="page animate-page">
        <button className="back-button" onClick={() => setSelected(null)}>
          <span className="back-arrow">←</span> Tous les cours
        </button>
        <article className="lesson-detail">
          <span className="lesson-area">{selected.area}</span>
          <h1>{selected.title}</h1>
          <p className="lesson-lead">{selected.description}</p>

          <div className="lesson-columns">
            <section className="lesson-box">
              <span className="box-index">01</span>
              <h2>À retenir</h2>
              <ul>{selected.essentials.map(item => <li key={item}>{item}</li>)}</ul>
            </section>
            <section className="lesson-box">
              <span className="box-index">02</span>
              <h2>Méthode</h2>
              <ol>{selected.method.map(item => <li key={item}>{item}</li>)}</ol>
            </section>
          </div>

          <section className="worked-example">
            <div>
              <span className="eyebrow">Exemple corrigé</span>
              <h2>{selected.example.question}</h2>
            </div>
            <div className="step-list">
              {selected.example.solution.map((line, index) => (
                <div className="step" key={line}>
                  <span className="step-number">{index + 1}</span>
                  <div className="math-line">{line}</div>
                </div>
              ))}
            </div>
          </section>
        </article>
      </div>
    )
  }

  return (
    <div className="page animate-page">
      <PageTitle
        eyebrow="Programme de 3e"
        title="Cours et méthodes"
        description="Des fiches courtes qui privilégient les formules, la méthode de rédaction et les exercices types."
      />
      <div className="search-wrap">
        <input className="text-input search-input" value={query} onChange={event => setQuery(event.target.value)} placeholder="Rechercher un chapitre..." />
      </div>
      <div className="lesson-grid">
        {filtered.map((lesson, index) => (
          <button className="lesson-card" key={lesson.id} onClick={() => setSelected(lesson)}>
            <span className="lesson-number">{String(index + 1).padStart(2, '0')}</span>
            <span className="lesson-area">{lesson.area}</span>
            <strong>{lesson.title}</strong>
            <p>{lesson.description}</p>
            <span className="card-link">Ouvrir la fiche <Icon name="arrow" size={16} /></span>
          </button>
        ))}
      </div>
    </div>
  )
}

function Practice({
  completed,
  onCompleted
}: {
  completed: string[]
  onCompleted: (ids: string[]) => void
}) {
  const [index, setIndex] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const question = practiceQuestions[index] ?? practiceQuestions[0]
  const percent = Math.round((completed.length / practiceQuestions.length) * 100)

  if (!question) return null

  const goTo = (next: number) => {
    setIndex((next + practiceQuestions.length) % practiceQuestions.length)
    setShowHint(false)
    setShowSolution(false)
  }

  const markDone = () => {
    if (!completed.includes(question.id)) onCompleted([...completed, question.id])
    setShowSolution(true)
  }

  return (
    <div className="page animate-page">
      <PageTitle
        eyebrow="Entraînement BEPC"
        title="Exercices guidés"
        description="Travaillez une question à la fois, demandez un indice si nécessaire, puis comparez votre démarche au corrigé."
      />

      <section className="practice-progress">
        <div>
          <strong>{completed.length}/{practiceQuestions.length}</strong>
          <span>exercices terminés</span>
        </div>
        <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
        <span>{percent}%</span>
      </section>

      <section className="practice-card">
        <div className="practice-meta">
          <span>{question.area}</span>
          <span>Niveau {question.level}/3</span>
          <span>Question {index + 1}/{practiceQuestions.length}</span>
        </div>
        <h2>{question.prompt}</h2>

        <div className="practice-actions">
          <button className="button secondary" onClick={() => setShowHint(value => !value)}>
            {showHint ? 'Masquer l’indice' : 'Afficher un indice'}
          </button>
          <button className="button primary" onClick={markDone}>Voir la correction</button>
        </div>

        {showHint ? <div className="hint-box"><strong>Indice</strong><span>{question.hint}</span></div> : null}

        {showSolution ? (
          <div className="solution-box animate-in">
            <div className="solution-answer">
              <span className="status-check"><Icon name="check" size={18} /></span>
              <div><span>Réponse</span><strong>{question.answer}</strong></div>
            </div>
            <div className="step-list">
              {question.solution.map((line, stepIndex) => (
                <div className="step" key={line}>
                  <span className="step-number">{stepIndex + 1}</span>
                  <div className="math-line">{line}</div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>

      <div className="practice-nav">
        <button className="button secondary" onClick={() => goTo(index - 1)}>Question précédente</button>
        <button className="button secondary" onClick={() => goTo(index + 1)}>Question suivante</button>
      </div>
    </div>
  )
}

export default function App() {
  const [view, setView] = useState<View>('home')
  const [history, setHistory] = useStoredState<HistoryItem[]>('mathbepc-history-v2', [])
  const [completed, setCompleted] = useStoredState<string[]>('mathbepc-completed-v2', [])

  const addHistory = (item: HistoryItem) => {
    const withoutDuplicate = history.filter(previous => previous.input !== item.input)
    setHistory([item, ...withoutDuplicate].slice(0, 20))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <AppLogo />
        <nav className="side-nav" aria-label="Navigation principale">
          {navigation.map(item => (
            <button
              key={item.id}
              className={view === item.id ? 'active' : ''}
              onClick={() => setView(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-foot">
          <span>Version 2.0</span>
          <strong>Conçu pour travailler hors ligne</strong>
        </div>
      </aside>

      <main className="main-content">
        <div className="mobile-topbar">
          <AppLogo />
          <span className="offline-pill">Hors ligne</span>
        </div>

        {view === 'home' ? <Home onNavigate={setView} history={history} completed={completed} /> : null}
        {view === 'solver' ? <Solver history={history} onHistory={addHistory} /> : null}
        {view === 'calculator' ? <Calculator /> : null}
        {view === 'lessons' ? <Lessons /> : null}
        {view === 'practice' ? <Practice completed={completed} onCompleted={setCompleted} /> : null}
      </main>

      <nav className="bottom-nav" aria-label="Navigation mobile">
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
    </div>
  )
}
