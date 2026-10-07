import { useState } from 'react'
import {
  computeStatistics,
  coordinateDistance,
  simplifyFraction,
  simplifyRadical,
  solveLinearSystem,
  solvePythagoras,
  solveThales,
  type SolveResult
} from '../math/engine'
import { Icon, type IconName } from '../ui/Icon'
import { ResultView } from '../ui/MathView'

type Tool = 'fraction' | 'stats' | 'pythagore' | 'thales' | 'distance' | 'radical' | 'system'

const tools: Array<{ id: Tool; label: string; description: string; icon: IconName }> = [
  { id: 'fraction', label: 'Fractions', description: 'Réduire une fraction et afficher le PGCD.', icon: 'fraction' },
  { id: 'stats', label: 'Statistiques', description: 'Moyenne, médiane, mode et étendue.', icon: 'chart' },
  { id: 'pythagore', label: 'Pythagore', description: 'Calculer un côté d’un triangle rectangle.', icon: 'geometry' },
  { id: 'thales', label: 'Thalès', description: 'Résoudre une proportion de longueurs.', icon: 'geometry' },
  { id: 'distance', label: 'Coordonnées', description: 'Distance entre deux points du plan.', icon: 'geometry' },
  { id: 'radical', label: 'Racines', description: 'Simplifier une racine carrée.', icon: 'fraction' },
  { id: 'system', label: 'Systèmes', description: 'Résoudre deux équations à deux inconnues.', icon: 'tools' }
]

function NumberInput({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="number-field">
      <span>{label}</span>
      <input inputMode="decimal" value={value} onChange={event => onChange(event.target.value)} />
    </label>
  )
}

export function ToolsPage() {
  const [tool, setTool] = useState<Tool>('fraction')
  const [values, setValues] = useState<string[]>(['84', '126', '', '', '', ''])
  const [series, setSeries] = useState('8 ; 10 ; 10 ; 12 ; 15')
  const [result, setResult] = useState<SolveResult | null>(null)
  const [error, setError] = useState('')

  const number = (index: number, optional = false): number | undefined => {
    const raw = values[index]?.trim() ?? ''
    if (!raw && optional) return undefined
    const parsed = Number(raw.replace(',', '.'))
    if (!Number.isFinite(parsed)) throw new Error('Vérifiez les valeurs numériques.')
    return parsed
  }

  const update = (index: number, value: string) => {
    const next = [...values]
    next[index] = value
    setValues(next)
  }

  const execute = () => {
    try {
      let solved: SolveResult
      if (tool === 'fraction') {
        solved = simplifyFraction(number(0) ?? 0, number(1) ?? 0)
      } else if (tool === 'stats') {
        const parsed = (series.match(/-?\d+(?:[.,]\d+)?/g) ?? []).map(value => Number(value.replace(',', '.')))
        solved = computeStatistics(parsed)
      } else if (tool === 'pythagore') {
        solved = solvePythagoras(number(0, true), number(1, true), number(2, true))
      } else if (tool === 'thales') {
        solved = solveThales(number(0) ?? 0, number(1) ?? 0, number(2) ?? 0)
      } else if (tool === 'distance') {
        solved = coordinateDistance(number(0) ?? 0, number(1) ?? 0, number(2) ?? 0, number(3) ?? 0)
      } else if (tool === 'radical') {
        solved = simplifyRadical(number(0) ?? 0)
      } else {
        solved = solveLinearSystem(
          number(0) ?? 0,
          number(1) ?? 0,
          number(2) ?? 0,
          number(3) ?? 0,
          number(4) ?? 0,
          number(5) ?? 0
        )
      }
      setResult(solved)
      setError('')
    } catch (reason) {
      setResult(null)
      setError(reason instanceof Error ? reason.message : 'Calcul impossible.')
    }
  }

  const choose = (id: Tool) => {
    setTool(id)
    setResult(null)
    setError('')
    if (id === 'fraction') setValues(['84', '126', '', '', '', ''])
    if (id === 'pythagore') setValues(['3', '4', '', '', '', ''])
    if (id === 'thales') setValues(['4', '10', '15', '', '', ''])
    if (id === 'distance') setValues(['1', '2', '4', '6', '', ''])
    if (id === 'radical') setValues(['108', '', '', '', '', ''])
    if (id === 'system') setValues(['2', '1', '7', '1', '-1', '2'])
  }

  return (
    <div className="page">
      <header className="workspace-header">
        <div>
          <span className="section-kicker">Calculatrices</span>
          <h1>Outils adaptés au programme de 3e.</h1>
          <p>Chaque outil affiche la formule utilisée et les étapes, pas seulement un résultat brut.</p>
        </div>
      </header>

      <div className="tool-layout">
        <aside className="tool-menu">
          {tools.map(item => (
            <button className={tool === item.id ? 'active' : ''} key={item.id} onClick={() => choose(item.id)}>
              <span className="tool-menu-icon"><Icon name={item.icon} size={18} /></span>
              <span><strong>{item.label}</strong><small>{item.description}</small></span>
            </button>
          ))}
        </aside>

        <div>
          <section className="tool-panel">
            <div className="tool-panel-head">
              <span className="section-kicker">Outil sélectionné</span>
              <h2>{tools.find(item => item.id === tool)?.label}</h2>
            </div>

            {tool === 'fraction' ? (
              <div className="fields-grid two">
                <NumberInput label="Numérateur" value={values[0] ?? ''} onChange={value => update(0, value)} />
                <NumberInput label="Dénominateur" value={values[1] ?? ''} onChange={value => update(1, value)} />
              </div>
            ) : null}

            {tool === 'stats' ? (
              <label className="number-field">
                <span>Série de valeurs</span>
                <textarea rows={4} value={series} onChange={event => setSeries(event.target.value)} />
                <small>Séparez les valeurs par des espaces, virgules ou points-virgules.</small>
              </label>
            ) : null}

            {tool === 'pythagore' ? (
              <>
                <div className="geometry-preview">
                  <svg viewBox="0 0 260 160" aria-label="Triangle rectangle">
                    <path d="M35 130 L35 25 L225 130 Z" fill="none" stroke="currentColor" strokeWidth="2" />
                    <path d="M35 112 L53 112 L53 130" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <text x="8" y="80">a</text>
                    <text x="125" y="150">b</text>
                    <text x="137" y="66">c</text>
                  </svg>
                  <p>Renseignez exactement deux longueurs. c désigne l’hypoténuse.</p>
                </div>
                <div className="fields-grid three">
                  <NumberInput label="a" value={values[0] ?? ''} onChange={value => update(0, value)} />
                  <NumberInput label="b" value={values[1] ?? ''} onChange={value => update(1, value)} />
                  <NumberInput label="c" value={values[2] ?? ''} onChange={value => update(2, value)} />
                </div>
              </>
            ) : null}

            {tool === 'thales' ? (
              <>
                <p className="tool-help">Résolution de la proportion a / b = c / x.</p>
                <div className="fields-grid three">
                  <NumberInput label="a" value={values[0] ?? ''} onChange={value => update(0, value)} />
                  <NumberInput label="b" value={values[1] ?? ''} onChange={value => update(1, value)} />
                  <NumberInput label="c" value={values[2] ?? ''} onChange={value => update(2, value)} />
                </div>
              </>
            ) : null}

            {tool === 'distance' ? (
              <div className="fields-grid four">
                <NumberInput label="xA" value={values[0] ?? ''} onChange={value => update(0, value)} />
                <NumberInput label="yA" value={values[1] ?? ''} onChange={value => update(1, value)} />
                <NumberInput label="xB" value={values[2] ?? ''} onChange={value => update(2, value)} />
                <NumberInput label="yB" value={values[3] ?? ''} onChange={value => update(3, value)} />
              </div>
            ) : null}

            {tool === 'radical' ? (
              <div className="fields-grid">
                <NumberInput label="Nombre sous la racine" value={values[0] ?? ''} onChange={value => update(0, value)} />
              </div>
            ) : null}

            {tool === 'system' ? (
              <>
                <p className="tool-help">Forme : a₁x + b₁y = c₁ et a₂x + b₂y = c₂.</p>
                <div className="fields-grid three">
                  {['a₁', 'b₁', 'c₁', 'a₂', 'b₂', 'c₂'].map((label, index) => (
                    <NumberInput key={label} label={label} value={values[index] ?? ''} onChange={value => update(index, value)} />
                  ))}
                </div>
              </>
            ) : null}

            {error ? <div className="input-error">{error}</div> : null}
            <button className="solve-button tool-submit" onClick={execute}>Calculer <Icon name="arrow" size={18} /></button>
          </section>

          {result ? <ResultView result={result} /> : null}
        </div>
      </div>
    </div>
  )
}
