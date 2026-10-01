import test from 'node:test';
import assert from 'node:assert/strict';
import { analyseExercise } from '../src/utils/smartDetect.ts';

const cases:[string,string][] = [
  ['3x + 5 = 20','equations'],
  ['x² - 5x + 6 = 0','equations'],
  ['25% de 240','stats'],
  ['3/4 + 2/5','fractions'],
  ['Pythagore dans un triangle rectangle','geometry'],
  ['Simplifier √72','radicals'],
  ['Calculer une puissance 2^5','powers'],
  ['factoriser x²+5x+6','factorization'],
  ['développer (x+2)(x+3)','development'],
  ['moyenne médiane quartiles','stats'],
  ['vecteur AB coordonnées','vectors'],
  ['volume d’un cylindre','space'],
];
for (const [input,chapter] of cases) {
  test(`détection: ${input}`,()=>assert.equal(analyseExercise(input,'fr')?.chapterId,chapter));
}

test('résolution intelligente équation linéaire',()=>assert.equal(analyseExercise('0,5x = 1','fr')?.result,'x = 2'));
test('résolution intelligente pourcentage',()=>assert.equal(analyseExercise('25% de 240','fr')?.result,'60'));

test('détection: application affine f(x)=2x+3, image de 4', () => {
  const r = analyseExercise('Soit f(x)=2x+3. Calculer l’image de 4', 'fr');
  assert.equal(r?.chapterId, 'functions');
  assert.match(r?.result ?? '', /11/);
});

test('détection: applications affines', () => {
  const r = analyseExercise('Étudier une application affine et son coefficient directeur', 'fr');
  assert.equal(r?.chapterId, 'functions');
});

test('détection: angle inscrit', () => {
  const r = analyseExercise('Calculer un angle inscrit dans un cercle', 'fr');
  assert.equal(r?.chapterId, 'circle');
});

test('détection: statistiques groupées', () => {
  const r = analyseExercise('Construire histogramme pour des classes de même amplitude', 'fr');
  assert.equal(r?.chapterId, 'stats');
});
