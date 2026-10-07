import test from 'node:test'
import assert from 'node:assert/strict'
import {
  computeStatistics,
  coordinateDistance,
  evaluateExpression,
  simplifyFraction,
  simplifyRadical,
  solveLinearSystem,
  solvePythagoras,
  solveRelation,
  solveSmart,
  solveThales
} from '../src/math/engine.ts'

test('respecte les priorités opératoires et les puissances', () => {
  assert.equal(evaluateExpression('3 + 5 * 2^2'), 23)
  assert.equal(evaluateExpression('2(3 + 4)'), 14)
})

test('accepte la notation française et les fonctions scientifiques', () => {
  assert.equal(evaluateExpression('1,5 + 2,5'), 4)
  assert.ok(Math.abs(evaluateExpression('sin(30)') - 0.5) < 1e-10)
  assert.equal(evaluateExpression('sqrt(49)'), 7)
})

test('résout une équation du premier degré', () => {
  const result = solveRelation('3x + 7 = 19')
  assert.equal(result.answer, 'x = 4')
})

test('résout une inéquation et inverse le sens si nécessaire', () => {
  assert.equal(solveRelation('3(x - 2) <= 12').answer, 'x <= 6')
  assert.equal(solveRelation('-2x > 8').answer, 'x < -4')
})

test('résout un second degré simple comme outil complémentaire', () => {
  const result = solveRelation('x^2 - 5x + 6 = 0')
  assert.match(result.answer, /x₁ = 2/)
  assert.match(result.answer, /x₂ = 3/)
})

test('simplifie les fractions et les racines', () => {
  assert.equal(simplifyFraction(84, 126).answer, '2/3')
  assert.equal(simplifyRadical(108).answer, '6√3')
})

test('calcule les statistiques usuelles', () => {
  const result = computeStatistics([8, 10, 10, 12, 15])
  assert.equal(result.metrics.mean, 11)
  assert.equal(result.metrics.median, 10)
  assert.deepEqual(result.metrics.modes, [10])
  assert.equal(result.metrics.range, 7)
})

test('résout les outils géométriques du collège', () => {
  assert.equal(solvePythagoras(3, 4).answer, 'Hypoténuse = 5')
  assert.equal(solveThales(4, 10, 15).answer, 'x = 37,5')
  assert.equal(coordinateDistance(2, 1, 5, 5).answer, 'AB = 5')
})

test('résout un système linéaire 2x2', () => {
  assert.equal(solveLinearSystem(2, 1, 7, 1, -1, 2).answer, 'x = 3 ; y = 1')
})

test('détecte automatiquement calcul, équation et statistiques', () => {
  assert.equal(solveSmart('5x - 7 = 18').answer, 'x = 5')
  assert.equal(solveSmart('3 + 5 * 2^2').answer, '23')
  assert.match(solveSmart('moyenne : 8 ; 10 ; 12').answer, /Moyenne = 10/)
})

test('refuse la division par zéro', () => {
  assert.throws(() => evaluateExpression('8 / 0'), /Division par zéro/)
})
