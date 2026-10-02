import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const app=fs.readFileSync(new URL('../src/App.tsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/index.css',import.meta.url),'utf8');
const smart=fs.readFileSync(new URL('../src/components/SmartSolve.tsx',import.meta.url),'utf8');
const steps=fs.readFileSync(new URL('../src/components/StepDisplay.tsx',import.meta.url),'utf8');

test('professional UI exposes stable navigation',()=>{
  assert.match(app,/className="bottom-nav/);
  assert.match(app,/className="back-button/);
  assert.match(app,/className="nav-panel/);
  assert.match(app,/window\.history\.back\(\)/);
});

test('home uses product-oriented actions instead of numbered template cards',()=>{
  assert.match(app,/home-primary-card/);
  assert.match(app,/home-secondary-card/);
  assert.doesNotMatch(app,/n:'01'|n:'02'|n:'03'/);
});

test('solver avoids AI-confidence presentation',()=>{
  assert.doesNotMatch(smart,/confidence\s*\*/);
  assert.doesNotMatch(smart,/Chapitre reconnu/);
  assert.match(smart,/Méthode utilisée/);
});

test('math solution typography is explicit and readable',()=>{
  assert.match(steps,/math-frac/);
  assert.match(steps,/Pourquoi \?/);
  assert.match(css,/\.solution-sheet/);
  assert.match(css,/\.math-line/);
  assert.match(css,/\.answer-box/);
});

test('shared design primitives exist',()=>{
  for(const cls of ['primary-button','secondary-button','field-input','page-heading','topic-workspace','segmented-control']){
    assert.match(css,new RegExp('\\.'+cls));
  }
});
