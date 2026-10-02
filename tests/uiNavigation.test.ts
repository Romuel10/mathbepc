import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const steps=fs.readFileSync(new URL('../src/components/StepDisplay.tsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/index.css',import.meta.url),'utf8');

test('navigation exposes an always-visible back action outside home',()=>{
  assert.match(app,/view!=='home'.*goBack/s);
  assert.match(app,/window\.history\.back\(\)/);
  assert.match(app,/popstate/);
});

test('mobile navigation keeps the four learning routes one tap away',()=>{
  for(const route of ["'home'","'smart'","'practice'","'lessons'"]) assert.match(app,new RegExp(route));
  assert.match(app,/bottom-nav/);
});

test('solutions use readable step and fraction presentation',()=>{
  assert.match(steps,/Étape/);
  assert.match(steps,/Pourquoi \?/);
  assert.match(steps,/math-frac/);
  assert.match(css,/\.math-line/);
  assert.match(css,/\.answer-box/);
});
