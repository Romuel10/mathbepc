import type { SolveResult } from '../math/engine'
import { Icon } from './Icon'

export function prettyMath(source: string): string {
  return source
    .replace(/\^2/g, '²')
    .replace(/\^3/g, '³')
    .replace(/\*/g, '×')
    .replace(/sqrt\s*\(/gi, '√(')
    .replace(/<=/g, '≤')
    .replace(/>=/g, '≥')
    .replace(/-/g, '−')
}

export function MathLine({ children, large = false }: { children: string; large?: boolean }) {
  return <div className={large ? 'math-line math-line-large' : 'math-line'}>{prettyMath(children)}</div>
}

export function ResultView({ result }: { result: SolveResult }) {
  return (
    <section className="solution-card enter">
      <div className="solution-head">
        <div>
          <span className="section-kicker">Solution</span>
          <strong>{result.title}</strong>
        </div>
        <span className="solved-badge"><Icon name="check" size={14} /> Résolu</span>
      </div>

      <div className="final-answer">
        <span>Réponse</span>
        <MathLine large>{result.answer}</MathLine>
      </div>

      <div className="steps">
        {result.steps.map((step, index) => (
          <article className="solution-step" key={index}>
            <div className="step-index">{index + 1}</div>
            <div className="step-content">
              <strong>{step.title}</strong>
              {step.expression ? <MathLine>{step.expression}</MathLine> : null}
              {step.detail ? <p>{step.detail}</p> : null}
            </div>
          </article>
        ))}
      </div>

      {result.note ? <div className="solution-note">{result.note}</div> : null}
    </section>
  )
}
