import { evaluateExpression, formatNumber, solveRelation, type SolveResult } from './engine'

export type SolverMode = 'auto' | 'calculate' | 'solve' | 'expand' | 'factor'

const EPS = 1e-8
const clean = (n: number) => Math.abs(n) < EPS ? 0 : n

function coefficients(source: string): [number, number, number, number] {
  const f = (x: number) => evaluateExpression(source, { x })
  const f0 = f(0)
  const f1 = f(1)
  const f2 = f(2)
  const f3 = f(3)
  const d1 = f1 - f0
  const d2 = f2 - 2 * f1 + f0
  const d3 = f3 - 3 * f2 + 3 * f1 - f0

  const a3 = clean(d3 / 6)
  const a2 = clean(d2 / 2 - d3 / 2)
  const a1 = clean(d1 - d2 / 2 + d3 / 3)
  const a0 = clean(f0)

  const f4 = f(4)
  const expected = 64 * a3 + 16 * a2 + 4 * a1 + a0
  if (Math.abs(f4 - expected) > 1e-6 * Math.max(1, Math.abs(f4))) {
    throw new Error('Cette expression dépasse le degré 3 pris en charge pour le développement.')
  }
  return [a3, a2, a1, a0]
}

function term(coefficient: number, degree: number, first: boolean): string {
  if (Math.abs(coefficient) < EPS) return ''
  const sign = coefficient < 0 ? '−' : first ? '' : '+'
  const absolute = Math.abs(coefficient)
  const coeff = degree > 0 && Math.abs(absolute - 1) < EPS ? '' : formatNumber(absolute)
  const variable = degree === 0 ? '' : degree === 1 ? 'x' : degree === 2 ? 'x²' : 'x³'
  return `${sign}${first ? '' : ' '}${coeff}${variable}`
}

function polynomialText([a3, a2, a1, a0]: [number, number, number, number]): string {
  const values: Array<[number, number]> = [[a3, 3], [a2, 2], [a1, 1], [a0, 0]]
  let output = ''
  let first = true
  for (const [value, degree] of values) {
    if (Math.abs(value) < EPS) continue
    output += term(value, degree, first)
    first = false
  }
  return output || '0'
}

export function expandPolynomial(source: string): SolveResult {
  const coeffs = coefficients(source)
  const answer = polynomialText(coeffs)
  return {
    kind: 'number',
    title: 'Développement et réduction',
    answer,
    steps: [
      { title: 'Expression de départ', expression: source },
      { title: 'Appliquer la distributivité et les identités remarquables', detail: 'Chaque produit est développé puis les termes de même degré sont regroupés.' },
      { title: 'Réduire', expression: answer }
    ]
  }
}

function rootText(root: number): string {
  if (Math.abs(root) < EPS) return 'x'
  return root > 0 ? `(x − ${formatNumber(root)})` : `(x + ${formatNumber(Math.abs(root))})`
}

export function factorPolynomial(source: string): SolveResult {
  const [a3, a2, a1, a0] = coefficients(source)
  if (Math.abs(a3) > EPS) {
    throw new Error('La factorisation automatique est limitée ici aux polynômes de degré 2, conformément aux besoins courants du BEPC.')
  }

  if (Math.abs(a2) < EPS) {
    if (Math.abs(a1) < EPS) {
      return { kind: 'number', title: 'Factorisation', answer: formatNumber(a0), steps: [{ title: 'Expression constante', expression: formatNumber(a0) }] }
    }
    const root = -a0 / a1
    const factor = rootText(root)
    const prefix = Math.abs(a1 - 1) < EPS ? '' : Math.abs(a1 + 1) < EPS ? '−' : formatNumber(a1)
    const answer = `${prefix}${factor}`
    return {
      kind: 'number',
      title: 'Factorisation',
      answer,
      steps: [
        { title: 'Mettre le coefficient en facteur', expression: answer },
        { title: 'Contrôle', detail: 'En développant la forme factorisée, on retrouve l’expression initiale.' }
      ]
    }
  }

  const delta = a1 * a1 - 4 * a2 * a0
  if (delta < -EPS) {
    return {
      kind: 'number',
      title: 'Factorisation',
      answer: 'Non factorisable dans ℝ',
      steps: [
        { title: 'Calculer le discriminant', expression: `Δ = ${formatNumber(delta)}` },
        { title: 'Conclure', detail: 'Le discriminant est négatif : aucune racine réelle.' }
      ]
    }
  }

  const sqrt = Math.sqrt(Math.max(0, delta))
  const r1 = (-a1 - sqrt) / (2 * a2)
  const r2 = (-a1 + sqrt) / (2 * a2)
  const prefix = Math.abs(a2 - 1) < EPS ? '' : Math.abs(a2 + 1) < EPS ? '−' : formatNumber(a2)
  const answer = Math.abs(r1 - r2) < EPS
    ? `${prefix}${rootText(r1)}²`
    : `${prefix}${rootText(r1)}${rootText(r2)}`

  return {
    kind: 'number',
    title: 'Factorisation',
    answer,
    steps: [
      { title: 'Réduire le polynôme', expression: polynomialText([0, a2, a1, a0]) },
      { title: 'Calculer le discriminant', expression: `Δ = ${formatNumber(delta)}` },
      { title: 'Déterminer les racines', expression: Math.abs(r1 - r2) < EPS ? `x₀ = ${formatNumber(r1)}` : `x₁ = ${formatNumber(r1)} ; x₂ = ${formatNumber(r2)}` },
      { title: 'Écrire la forme factorisée', expression: answer }
    ]
  }
}

export function solveWithMode(source: string, mode: SolverMode): SolveResult {
  const input = source.trim()
  if (!input) throw new Error('Saisissez une expression.')

  if (mode === 'expand') return expandPolynomial(input)
  if (mode === 'factor') return factorPolynomial(input)
  if (mode === 'solve') return solveRelation(input)

  if (mode === 'calculate') {
    const value = evaluateExpression(input)
    return {
      kind: 'number',
      title: 'Calcul numérique',
      answer: formatNumber(value),
      steps: [
        { title: 'Expression', expression: input },
        { title: 'Appliquer les priorités opératoires', detail: 'Parenthèses, puissances et racines, multiplications et divisions, puis additions et soustractions.' },
        { title: 'Résultat', expression: formatNumber(value) }
      ]
    }
  }

  if (/[=<>≤≥]/.test(input) && /x/i.test(input)) return solveRelation(input)
  if (/dévelop|develop/i.test(input)) return expandPolynomial(input.replace(/développer|developper|développe|developpe/gi, '').trim())
  if (/factor/i.test(input)) return factorPolynomial(input.replace(/factoriser|factorise/gi, '').trim())

  const value = evaluateExpression(input)
  return {
    kind: 'number',
    title: 'Calcul numérique',
    answer: formatNumber(value),
    steps: [
      { title: 'Expression', expression: input },
      { title: 'Résultat', expression: formatNumber(value) }
    ]
  }
}
