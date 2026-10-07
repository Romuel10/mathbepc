export type SolveStep = {
  title: string
  expression?: string
  detail?: string
}

export type SolveResult = {
  kind: 'number' | 'equation' | 'inequality' | 'statistics' | 'geometry' | 'fraction' | 'system'
  title: string
  answer: string
  steps: SolveStep[]
  note?: string
}

type TokenType = 'number' | 'id' | 'op' | 'lparen' | 'rparen' | 'percent'
type Token = { type: TokenType; value: string }

const EPS = 1e-9
const FUNCTIONS = new Set(['sqrt', 'abs', 'sin', 'cos', 'tan', 'ln', 'log'])
const nearZero = (n: number) => Math.abs(n) < EPS

export function formatNumber(value: number, digits = 10): string {
  if (!Number.isFinite(value)) return String(value)
  if (nearZero(value)) return '0'
  const rounded = Number(value.toFixed(digits))
  return Number.isInteger(rounded)
    ? String(rounded)
    : rounded.toLocaleString('fr-FR', { maximumFractionDigits: digits })
}

function normalizeExpression(source: string): string {
  return source
    .trim()
    .replace(/[×·]/g, '*')
    .replace(/÷/g, '/')
    .replace(/[−–—]/g, '-')
    .replace(/π/g, 'pi')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/(\d),(\d)/g, '$1.$2')
    .replace(/√\s*(\d+(?:\.\d+)?)/g, 'sqrt($1)')
    .replace(/√/g, 'sqrt')
}

function rawTokens(source: string): Token[] {
  const input = normalizeExpression(source)
  const tokens: Token[] = []
  let i = 0

  while (i < input.length) {
    const char = input[i]
    if (!char) break

    if (/\s/.test(char)) {
      i += 1
      continue
    }

    if (/[0-9.]/.test(char)) {
      let value = ''
      let dots = 0
      while (i < input.length) {
        const current = input[i]
        if (!current || !/[0-9.]/.test(current)) break
        if (current === '.') dots += 1
        value += current
        i += 1
      }
      if (dots > 1 || value === '.') throw new Error('Nombre invalide.')
      tokens.push({ type: 'number', value })
      continue
    }

    if (/[a-zA-Z]/.test(char)) {
      let value = ''
      while (i < input.length) {
        const current = input[i]
        if (!current || !/[a-zA-Z]/.test(current)) break
        value += current
        i += 1
      }
      tokens.push({ type: 'id', value: value.toLowerCase() })
      continue
    }

    if ('+-*/^'.includes(char)) {
      tokens.push({ type: 'op', value: char })
      i += 1
      continue
    }
    if (char === '(') {
      tokens.push({ type: 'lparen', value: char })
      i += 1
      continue
    }
    if (char === ')') {
      tokens.push({ type: 'rparen', value: char })
      i += 1
      continue
    }
    if (char === '%') {
      tokens.push({ type: 'percent', value: char })
      i += 1
      continue
    }

    throw new Error(`Symbole non reconnu : ${char}`)
  }

  return tokens
}

function tokenize(source: string): Token[] {
  const sourceTokens = rawTokens(source)
  const result: Token[] = []

  const endsAtom = (token: Token) =>
    token.type === 'number' || token.type === 'id' || token.type === 'rparen' || token.type === 'percent'
  const startsAtom = (token: Token) =>
    token.type === 'number' || token.type === 'id' || token.type === 'lparen'

  sourceTokens.forEach((token, index) => {
    const previous = index > 0 ? sourceTokens[index - 1] : undefined
    const functionCall =
      previous?.type === 'id' && FUNCTIONS.has(previous.value) && token.type === 'lparen'

    if (previous && endsAtom(previous) && startsAtom(token) && !functionCall) {
      result.push({ type: 'op', value: '*' })
    }
    result.push(token)
  })

  return result
}

class Parser {
  private index = 0
  private readonly tokens: Token[]
  private readonly variables: Record<string, number>

  constructor(tokens: Token[], variables: Record<string, number>) {
    this.tokens = tokens
    this.variables = variables
  }

  parse(): number {
    if (this.tokens.length === 0) throw new Error('Saisissez un calcul.')
    const value = this.parseExpression()
    if (this.index < this.tokens.length) {
      throw new Error('Expression incomplète ou parenthèses incorrectes.')
    }
    if (!Number.isFinite(value)) throw new Error('Le résultat n’est pas un nombre fini.')
    return value
  }

  private current(): Token | undefined {
    return this.tokens[this.index]
  }

  private consume(): Token {
    const token = this.tokens[this.index]
    if (!token) throw new Error('Expression incomplète.')
    this.index += 1
    return token
  }

  private parseExpression(): number {
    let value = this.parseTerm()
    while (this.current()?.type === 'op' && ['+', '-'].includes(this.current()?.value ?? '')) {
      const op = this.consume().value
      const right = this.parseTerm()
      value = op === '+' ? value + right : value - right
    }
    return value
  }

  private parseTerm(): number {
    let value = this.parseUnary()
    while (this.current()?.type === 'op' && ['*', '/'].includes(this.current()?.value ?? '')) {
      const op = this.consume().value
      const right = this.parseUnary()
      if (op === '/' && nearZero(right)) throw new Error('Division par zéro impossible.')
      value = op === '*' ? value * right : value / right
    }
    return value
  }

  private parseUnary(): number {
    const token = this.current()
    if (token?.type === 'op' && (token.value === '+' || token.value === '-')) {
      this.consume()
      const value = this.parseUnary()
      return token.value === '-' ? -value : value
    }
    return this.parsePower()
  }

  private parsePower(): number {
    let value = this.parsePrimary()
    if (this.current()?.type === 'op' && this.current()?.value === '^') {
      this.consume()
      const exponent = this.parseUnary()
      value = value ** exponent
    }
    return value
  }

  private parsePrimary(): number {
    const token = this.consume()
    let value: number

    if (token.type === 'number') {
      value = Number(token.value)
    } else if (token.type === 'lparen') {
      value = this.parseExpression()
      if (this.current()?.type !== 'rparen') throw new Error('Parenthèse fermante manquante.')
      this.consume()
    } else if (token.type === 'id') {
      if (FUNCTIONS.has(token.value)) {
        if (this.current()?.type !== 'lparen') throw new Error(`Utilisez ${token.value}(…).`)
        this.consume()
        const argument = this.parseExpression()
        if (this.current()?.type !== 'rparen') throw new Error('Parenthèse fermante manquante.')
        this.consume()
        value = this.applyFunction(token.value, argument)
      } else if (token.value === 'pi') {
        value = Math.PI
      } else if (token.value === 'e') {
        value = Math.E
      } else if (Object.prototype.hasOwnProperty.call(this.variables, token.value)) {
        value = this.variables[token.value] ?? 0
      } else {
        throw new Error(`Variable inconnue : ${token.value}`)
      }
    } else {
      throw new Error('Nombre, variable ou parenthèse attendu.')
    }

    while (this.current()?.type === 'percent') {
      this.consume()
      value /= 100
    }
    return value
  }

  private applyFunction(name: string, value: number): number {
    switch (name) {
      case 'sqrt':
        if (value < 0) throw new Error('La racine carrée d’un nombre négatif n’est pas réelle.')
        return Math.sqrt(value)
      case 'abs':
        return Math.abs(value)
      case 'sin':
        return Math.sin((value * Math.PI) / 180)
      case 'cos':
        return Math.cos((value * Math.PI) / 180)
      case 'tan':
        return Math.tan((value * Math.PI) / 180)
      case 'ln':
        if (value <= 0) throw new Error('ln(x) exige x > 0.')
        return Math.log(value)
      case 'log':
        if (value <= 0) throw new Error('log(x) exige x > 0.')
        return Math.log10(value)
      default:
        throw new Error('Fonction non prise en charge.')
    }
  }
}

export function evaluateExpression(expression: string, variables: Record<string, number> = {}): number {
  return new Parser(tokenize(expression), variables).parse()
}

type Polynomial = { a: number; b: number; c: number }

function polynomialDifference(left: string, right: string): Polynomial {
  const f = (x: number) =>
    evaluateExpression(left, { x }) - evaluateExpression(right, { x })

  const f0 = f(0)
  const f1 = f(1)
  const f2 = f(2)
  const a = (f2 - 2 * f1 + f0) / 2
  const b = f1 - f0 - a
  const c = f0
  const f3 = f(3)
  const expected3 = 9 * a + 3 * b + c
  const tolerance = 1e-7 * Math.max(1, Math.abs(f3), Math.abs(expected3))

  if (Math.abs(f3 - expected3) > tolerance) {
    throw new Error('Cette équation dépasse actuellement le degré 2.')
  }
  return { a: nearZero(a) ? 0 : a, b: nearZero(b) ? 0 : b, c: nearZero(c) ? 0 : c }
}

function splitRelation(source: string): { left: string; relation: string; right: string } {
  const normalized = source.replace(/≤/g, '<=').replace(/≥/g, '>=')
  const match = normalized.match(/<=|>=|=|<|>/)
  if (!match || match.index === undefined) throw new Error('Ajoutez =, <, >, <= ou >=.')
  const relation = match[0]
  const left = normalized.slice(0, match.index).trim()
  const right = normalized.slice(match.index + relation.length).trim()
  if (!left || !right) throw new Error('Les deux membres doivent être renseignés.')
  return { left, relation, right }
}

function flipRelation(relation: string): string {
  if (relation === '<') return '>'
  if (relation === '>') return '<'
  if (relation === '<=') return '>='
  if (relation === '>=') return '<='
  return relation
}

export function solveRelation(source: string): SolveResult {
  const { left, relation, right } = splitRelation(source)
  const { a, b, c } = polynomialDifference(left, right)
  const steps: SolveStep[] = [
    { title: 'Mettre tout dans le même membre', expression: `(${left}) - (${right}) ${relation} 0` }
  ]

  if (relation !== '=') {
    if (!nearZero(a)) throw new Error('Les inéquations du second degré ne sont pas au programme de ce moteur.')
    if (nearZero(b)) {
      const ok =
        relation === '<' ? c < 0 :
        relation === '>' ? c > 0 :
        relation === '<=' ? c <= 0 :
        c >= 0
      return {
        kind: 'inequality',
        title: 'Inéquation',
        answer: ok ? 'Tous les réels' : 'Aucune solution',
        steps: [...steps, { title: 'Comparer les constantes', expression: `${formatNumber(c)} ${relation} 0` }]
      }
    }

    const boundary = -c / b
    const finalRelation = b < 0 ? flipRelation(relation) : relation
    steps.push({
      title: 'Isoler x',
      expression: `${formatNumber(b)}x ${relation} ${formatNumber(-c)}`,
      detail: b < 0 ? 'Le sens de l’inégalité s’inverse car on divise par un nombre négatif.' : undefined
    })
    return {
      kind: 'inequality',
      title: 'Inéquation du premier degré',
      answer: `x ${finalRelation} ${formatNumber(boundary)}`,
      steps
    }
  }

  if (!nearZero(a)) {
    const delta = b * b - 4 * a * c
    steps.push({
      title: 'Identifier les coefficients',
      expression: `a = ${formatNumber(a)}, b = ${formatNumber(b)}, c = ${formatNumber(c)}`
    })
    steps.push({ title: 'Calculer le discriminant', expression: `Δ = b² - 4ac = ${formatNumber(delta)}` })

    if (delta < -EPS) {
      return {
        kind: 'equation',
        title: 'Équation du second degré',
        answer: 'Aucune solution réelle',
        steps
      }
    }

    if (nearZero(delta)) {
      const x = -b / (2 * a)
      steps.push({ title: 'Solution double', expression: `x = -b / (2a) = ${formatNumber(x)}` })
      return { kind: 'equation', title: 'Équation du second degré', answer: `x = ${formatNumber(x)}`, steps }
    }

    const root = Math.sqrt(delta)
    const x1 = (-b - root) / (2 * a)
    const x2 = (-b + root) / (2 * a)
    steps.push({
      title: 'Calculer les deux solutions',
      expression: `x₁ = ${formatNumber(x1)} ; x₂ = ${formatNumber(x2)}`
    })
    return {
      kind: 'equation',
      title: 'Équation du second degré',
      answer: `x₁ = ${formatNumber(x1)} ; x₂ = ${formatNumber(x2)}`,
      steps,
      note: 'Le second degré est proposé comme outil complémentaire ; pour le BEPC, privilégiez surtout les méthodes du premier degré.'
    }
  }

  if (nearZero(b)) {
    return {
      kind: 'equation',
      title: 'Équation',
      answer: nearZero(c) ? 'Tous les réels' : 'Aucune solution',
      steps: [...steps, { title: 'Réduire', expression: `${formatNumber(c)} = 0` }]
    }
  }

  const x = -c / b
  steps.push({ title: 'Réduire', expression: `${formatNumber(b)}x + ${formatNumber(c)} = 0` })
  steps.push({ title: 'Isoler x', expression: `x = ${formatNumber(-c)} / ${formatNumber(b)}` })
  return {
    kind: 'equation',
    title: 'Équation du premier degré',
    answer: `x = ${formatNumber(x)}`,
    steps
  }
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a))
  let y = Math.abs(Math.trunc(b))
  while (y !== 0) {
    const temp = y
    y = x % y
    x = temp
  }
  return x || 1
}

export function simplifyFraction(numerator: number, denominator: number): SolveResult {
  if (!Number.isInteger(numerator) || !Number.isInteger(denominator)) {
    throw new Error('Utilisez des entiers pour simplifier une fraction.')
  }
  if (denominator === 0) throw new Error('Le dénominateur ne peut pas être nul.')
  const sign = denominator < 0 ? -1 : 1
  const n = numerator * sign
  const d = Math.abs(denominator)
  const divisor = gcd(n, d)
  const rn = n / divisor
  const rd = d / divisor
  return {
    kind: 'fraction',
    title: 'Fraction irréductible',
    answer: rd === 1 ? String(rn) : `${rn}/${rd}`,
    steps: [
      { title: 'Chercher le PGCD', expression: `PGCD(${Math.abs(n)}, ${d}) = ${divisor}` },
      { title: 'Diviser le numérateur et le dénominateur', expression: `${n}/${d} = ${rn}/${rd}` }
    ]
  }
}

export function simplifyRadical(value: number): SolveResult {
  if (!Number.isInteger(value) || value < 0) throw new Error('Entrez un entier positif ou nul.')
  if (value === 0) return { kind: 'number', title: 'Racine carrée', answer: '0', steps: [{ title: 'Résultat', expression: '√0 = 0' }] }

  let outside = 1
  let inside = value
  for (let factor = 2; factor * factor <= inside; factor += 1) {
    const square = factor * factor
    while (inside % square === 0) {
      outside *= factor
      inside /= square
    }
  }
  const answer = inside === 1 ? String(outside) : outside === 1 ? `√${inside}` : `${outside}√${inside}`
  return {
    kind: 'number',
    title: 'Simplification d’une racine',
    answer,
    steps: [
      { title: 'Extraire les facteurs carrés parfaits', expression: `√${value} = ${answer}` },
      { title: 'Contrôle décimal', expression: `√${value} ≈ ${formatNumber(Math.sqrt(value), 6)}` }
    ]
  }
}

export type StatisticsResult = SolveResult & {
  metrics: { count: number; mean: number; median: number; modes: number[]; range: number }
}

export function computeStatistics(values: number[]): StatisticsResult {
  if (values.length === 0) throw new Error('Ajoutez au moins une valeur.')
  if (values.some(value => !Number.isFinite(value))) throw new Error('La série contient une valeur invalide.')

  const sorted = [...values].sort((a, b) => a - b)
  const sum = values.reduce((acc, value) => acc + value, 0)
  const mean = sum / values.length
  const middle = Math.floor(sorted.length / 2)
  const median = sorted.length % 2 === 0
    ? ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2
    : (sorted[middle] ?? 0)

  const counts = new Map<number, number>()
  sorted.forEach(value => counts.set(value, (counts.get(value) ?? 0) + 1))
  const maxCount = Math.max(...counts.values())
  const modes = maxCount <= 1
    ? []
    : [...counts.entries()].filter(([, count]) => count === maxCount).map(([value]) => value)
  const min = sorted[0] ?? 0
  const max = sorted[sorted.length - 1] ?? 0
  const range = max - min

  return {
    kind: 'statistics',
    title: 'Étude statistique',
    answer: `Moyenne = ${formatNumber(mean)} ; médiane = ${formatNumber(median)}`,
    metrics: { count: values.length, mean, median, modes, range },
    steps: [
      { title: 'Effectif', expression: `n = ${values.length}` },
      { title: 'Moyenne', expression: `${formatNumber(sum)} / ${values.length} = ${formatNumber(mean)}` },
      { title: 'Médiane', expression: formatNumber(median), detail: `Série ordonnée : ${sorted.map(formatNumber).join(' ; ')}` },
      { title: 'Mode', expression: modes.length ? modes.map(formatNumber).join(' ; ') : 'Pas de mode unique' },
      { title: 'Étendue', expression: `${formatNumber(max)} - ${formatNumber(min)} = ${formatNumber(range)}` }
    ]
  }
}

export function solvePythagoras(a?: number, b?: number, c?: number): SolveResult {
  const values = [a, b, c].filter(value => value !== undefined)
  if (values.length !== 2) throw new Error('Renseignez exactement deux longueurs.')
  if (values.some(value => (value ?? 0) <= 0)) throw new Error('Les longueurs doivent être positives.')

  if (c === undefined) {
    if (a === undefined || b === undefined) throw new Error('Deux côtés sont nécessaires.')
    const hypotenuse = Math.sqrt(a * a + b * b)
    return {
      kind: 'geometry',
      title: 'Théorème de Pythagore',
      answer: `Hypoténuse = ${formatNumber(hypotenuse, 6)}`,
      steps: [
        { title: 'Écrire la relation', expression: 'c² = a² + b²' },
        { title: 'Remplacer', expression: `c² = ${formatNumber(a)}² + ${formatNumber(b)}² = ${formatNumber(a * a + b * b)}` },
        { title: 'Prendre la racine carrée', expression: `c = ${formatNumber(hypotenuse, 6)}` }
      ]
    }
  }

  const knownLeg = a ?? b
  if (knownLeg === undefined) throw new Error('Indiquez un côté de l’angle droit.')
  if (c <= knownLeg) throw new Error('L’hypoténuse doit être le plus grand côté.')
  const missing = Math.sqrt(c * c - knownLeg * knownLeg)
  return {
    kind: 'geometry',
    title: 'Théorème de Pythagore',
    answer: `Côté manquant = ${formatNumber(missing, 6)}`,
    steps: [
      { title: 'Écrire la relation', expression: 'c² = a² + b²' },
      { title: 'Isoler le côté inconnu', expression: `x² = ${formatNumber(c)}² - ${formatNumber(knownLeg)}²` },
      { title: 'Prendre la racine carrée', expression: `x = ${formatNumber(missing, 6)}` }
    ]
  }
}

export function solveThales(first: number, second: number, third: number): SolveResult {
  if ([first, second, third].some(value => !Number.isFinite(value) || value <= 0)) {
    throw new Error('Les trois longueurs doivent être positives.')
  }
  const x = (second * third) / first
  return {
    kind: 'geometry',
    title: 'Proportion de Thalès',
    answer: `x = ${formatNumber(x, 6)}`,
    steps: [
      { title: 'Écrire la proportion', expression: `${formatNumber(first)} / ${formatNumber(second)} = ${formatNumber(third)} / x` },
      { title: 'Produit en croix', expression: `${formatNumber(first)}x = ${formatNumber(second)} × ${formatNumber(third)}` },
      { title: 'Isoler x', expression: `x = ${formatNumber(x, 6)}` }
    ]
  }
}

export function coordinateDistance(x1: number, y1: number, x2: number, y2: number): SolveResult {
  const dx = x2 - x1
  const dy = y2 - y1
  const distance = Math.sqrt(dx * dx + dy * dy)
  return {
    kind: 'geometry',
    title: 'Distance dans le plan',
    answer: `AB = ${formatNumber(distance, 6)}`,
    steps: [
      { title: 'Formule', expression: 'AB = √((xB - xA)² + (yB - yA)²)' },
      { title: 'Différences', expression: `Δx = ${formatNumber(dx)} ; Δy = ${formatNumber(dy)}` },
      { title: 'Calcul', expression: `AB = √(${formatNumber(dx * dx + dy * dy)}) = ${formatNumber(distance, 6)}` }
    ]
  }
}

export function solveLinearSystem(a1: number, b1: number, c1: number, a2: number, b2: number, c2: number): SolveResult {
  const determinant = a1 * b2 - a2 * b1
  if (nearZero(determinant)) {
    return {
      kind: 'system',
      title: 'Système linéaire',
      answer: 'Pas de solution unique',
      steps: [{ title: 'Déterminant', expression: `D = ${formatNumber(determinant)}`, detail: 'Les deux équations ne déterminent pas un couple unique.' }]
    }
  }
  const x = (c1 * b2 - c2 * b1) / determinant
  const y = (a1 * c2 - a2 * c1) / determinant
  return {
    kind: 'system',
    title: 'Système de deux équations',
    answer: `x = ${formatNumber(x)} ; y = ${formatNumber(y)}`,
    steps: [
      { title: 'Déterminant', expression: `D = a₁b₂ - a₂b₁ = ${formatNumber(determinant)}` },
      { title: 'Calculer x', expression: `x = ${formatNumber(x)}` },
      { title: 'Calculer y', expression: `y = ${formatNumber(y)}` }
    ]
  }
}

function parseStatisticsText(source: string): number[] {
  const cleaned = source
    .replace(/moyenne|médiane|mediane|statistiques?|série|serie/gi, ' ')
    .replace(/:/g, ' ')
  const matches = cleaned.match(/-?\d+(?:[.,]\d+)?/g) ?? []
  return matches.map(value => Number(value.replace(',', '.')))
}

export function solveSmart(source: string): SolveResult {
  const input = source.trim()
  if (!input) throw new Error('Saisissez un calcul ou une équation.')

  if (/moyenne|médiane|mediane|statistique|série|serie/i.test(input)) {
    return computeStatistics(parseStatisticsText(input))
  }

  if (/[=<>≤≥]/.test(input) && /x/i.test(input)) {
    return solveRelation(input)
  }

  const value = evaluateExpression(input)
  return {
    kind: 'number',
    title: 'Calcul numérique',
    answer: formatNumber(value),
    steps: [
      { title: 'Expression', expression: input },
      { title: 'Résultat', expression: formatNumber(value), detail: 'Priorités opératoires appliquées automatiquement.' }
    ]
  }
}
