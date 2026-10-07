import { useState } from 'react'
import { solveWithMode, type SolverMode } from '../math/algebra'
import type { SolveResult } from '../math/engine'
import { Icon } from '../ui/Icon'
import { ResultView } from '../ui/MathView'

type HistoryItem = {
  id: string
  input: string
  answer: string
  createdAt: number
}

const modes: Array<{ id: SolverMode; label: string }> = [
  { id: 'auto', label: 'Automatique' },
  { id: 'calculate', label: 'Calculer' },
  { id: 'solve', label: 'Résoudre' },
  { id: 'expand', label: 'Développer' },
  { id: 'factor', label: 'Factoriser' }
]

const examples = [
  '3x + 7 = 19',
  '3(x - 2) <= 12',
  '(x + 3)(x - 2) + 2x',
  'x^2 - 9',
  'sqrt(108)'
]

export function SolverPage({
  history,
  onHistory
}: {
  history: HistoryItem[]
  onHistory: (item: HistoryItem) => void
}) {
  const [mode, setMode] = useState<SolverMode>('auto')
  const [input, setInput] = useState('3x + 7 = 19')
  const [result, setResult] = useState<SolveResult | null>(null)
  const [error, setError] = useState('')

  const run = () => {
    try {
      const solved = solveWithMode(input, mode)
      setResult(solved)
      setError('')
      onHistory({
        id: String(Date.now()),
        input: input.trim(),
        answer: solved.answer,
        createdAt: Date.now()
      })
    } catch (reason) {
      setResult(null)
      setError(reason instanceof Error ? reason.message : 'Impossible de traiter cette expression.')
    }
  }

  const insert = (symbol: string) => setInput(current => current + symbol)

  return (
    <div className="page page-solver">
      <header className="workspace-header">
        <div>
          <span className="section-kicker">Résolution</span>
          <h1>Écrivez le problème. Suivez la méthode.</h1>
          <p>Le moteur traite les écritures de collège et présente chaque transformation dans l’ordre.</p>
        </div>
        <div className="level-chip">3e · BEPC</div>
      </header>

      <div className="mode-tabs" role="tablist" aria-label="Mode de résolution">
        {modes.map(item => (
          <button
            key={item.id}
            className={mode === item.id ? 'active' : ''}
            onClick={() => {
              setMode(item.id)
              setResult(null)
              setError('')
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      <section className="solver-composer">
        <label htmlFor="math-problem">Expression mathématique</label>
        <textarea
          id="math-problem"
          value={input}
          onChange={event => setInput(event.target.value)}
          rows={4}
          spellCheck={false}
          placeholder="Exemple : 3x + 7 = 19"
        />

        <div className="symbol-bar" aria-label="Clavier mathématique">
          {['(', ')', 'x', '²', '√', '×', '÷', '≤', '≥', 'π', '%'].map(symbol => (
            <button key={symbol} onClick={() => insert(symbol)}>{symbol}</button>
          ))}
        </div>

        <div className="composer-bottom">
          <div className="example-chips">
            {examples.map(example => (
              <button key={example} onClick={() => setInput(example)}>{example}</button>
            ))}
          </div>
          <button className="solve-button" onClick={run}>
            Résoudre
            <Icon name="arrow" size={18} />
          </button>
        </div>

        {error ? <div className="input-error">{error}</div> : null}
      </section>

      {result ? <ResultView result={result} /> : (
        <section className="empty-guidance">
          <div className="guidance-grid">
            <article>
              <span>01</span>
              <strong>Écrivez comme sur le cahier</strong>
              <p>Utilisez x, les parenthèses, les fractions avec /, les puissances et les racines.</p>
            </article>
            <article>
              <span>02</span>
              <strong>Choisissez la méthode</strong>
              <p>Automatique convient à la plupart des calculs. Les modes dédiés imposent l’opération souhaitée.</p>
            </article>
            <article>
              <span>03</span>
              <strong>Vérifiez chaque étape</strong>
              <p>La réponse finale est séparée du raisonnement pour faciliter la lecture et la révision.</p>
            </article>
          </div>
        </section>
      )}

      {history.length > 0 ? (
        <section className="recent-section">
          <div className="section-title-row">
            <div>
              <span className="section-kicker">Historique</span>
              <h2>Calculs récents</h2>
            </div>
          </div>
          <div className="recent-list">
            {history.slice(0, 5).map(item => (
              <button key={item.id} onClick={() => setInput(item.input)}>
                <span className="recent-icon"><Icon name="history" size={17} /></span>
                <span className="recent-main">
                  <strong>{item.input}</strong>
                  <small>{item.answer}</small>
                </span>
                <time>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</time>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
