import test from 'node:test'
import assert from 'node:assert/strict'
import { expandPolynomial, factorPolynomial, solveWithMode } from '../src/math/algebra.ts'

test('développe et réduit un polynôme de niveau collège', () => {
  assert.equal(expandPolynomial('(x + 3)(x - 2) + 2x').answer, 'x² + 3x − 6')
})

test('factorise une différence de deux carrés', () => {
  assert.equal(factorPolynomial('x^2 - 9').answer, '(x − 3)(x + 3)')
})

test('factorise un trinôme simple', () => {
  assert.equal(factorPolynomial('x^2 + 5x + 6').answer, '(x + 3)(x + 2)')
})

test('le mode résoudre utilise les équations et inéquations', () => {
  assert.equal(solveWithMode('5x - 7 = 18', 'solve').answer, 'x = 5')
  assert.equal(solveWithMode('-2x > 8', 'solve').answer, 'x < -4')
})

test('le mode calculer respecte les priorités', () => {
  assert.equal(solveWithMode('3 + 5 * 2^2', 'calculate').answer, '23')
})
