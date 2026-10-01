import test from 'node:test';
import assert from 'node:assert/strict';
import { fracToDecimal, parseFrac, solveLinearEquation, solvePythagoras, solvePercentage } from '../src/utils/mathEngine.ts';

// 60 decimal/fraction parsing regressions.
for (let i=1;i<=60;i++) {
  test(`fraction decimal exacte #${i}`, () => {
    const value = i / 10;
    const parsed = parseFrac(String(value).replace('.', ','));
    assert.ok(Math.abs(fracToDecimal(parsed) - value) < 1e-12);
  });
}

// 60 first-degree equations with known integer roots.
for (let i=1;i<=60;i++) {
  test(`équation linéaire générée #${i}`, () => {
    const x = (i % 17) - 8;
    const a = (i % 9) + 1;
    const b = (i % 13) - 6;
    const d = a*x + b;
    assert.equal(solveLinearEquation(a,b,0,d).result, `x = ${x}`);
  });
}

// 50 Pythagorean triples, including scaled triples.
const triples = [[3,4,5],[5,12,13],[8,15,17],[7,24,25],[9,40,41]];
for (let i=1;i<=50;i++) {
  test(`Pythagore généré #${i}`, () => {
    const [a,b,c] = triples[(i-1)%triples.length];
    const k = Math.floor((i-1)/triples.length)+1;
    assert.equal(solvePythagoras(a*k,b*k,true).result, `c = ${c*k}`);
  });
}

// 50 percentage calculations.
for (let i=1;i<=50;i++) {
  test(`pourcentage généré #${i}`, () => {
    const p = (i%20)+1;
    const base = i*20;
    const expected = p/100*base;
    assert.equal(Number(solvePercentage('of',base,p).result), expected);
  });
}
