import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const css=fs.readFileSync(new URL('../src/index.css',import.meta.url),'utf8');
const topicFiles=[
  'FractionTopic.tsx','AbsoluteValueTopic.tsx','FactorizationTopic.tsx','EquationTopic.tsx',
  'GeometryTopic.tsx','VectorTopic.tsx','SpaceTopic.tsx','StatsTopic.tsx'
];

test('dense three-column calculator inputs collapse on phones',()=>{
  for(const name of topicFiles){
    const source=fs.readFileSync(new URL('../src/topics/'+name,import.meta.url),'utf8');
    assert.doesNotMatch(source,/className="grid grid-cols-3 gap-(?:2|3|4)"/,name+' still forces three columns on mobile');
  }
});

test('mobile shell reserves safe space for bottom navigation',()=>{
  assert.match(css,/padding-bottom:\s*calc\(92px \+ env\(safe-area-inset-bottom/);
  assert.match(css,/\.bottom-nav span[\s\S]*text-overflow:\s*ellipsis/);
});

test('long math and scrollable data cannot force viewport overflow',()=>{
  assert.match(css,/\.math-line,[\s\S]*overflow-x:\s*auto/);
  assert.match(css,/\[class\*="overflow-x-auto"\][\s\S]*overscroll-behavior-x:\s*contain/);
  assert.match(css,/\.topic-workspace[\s\S]*min-width:\s*0/);
});

test('very narrow phones switch two-column calculator grids to one column',()=>{
  assert.match(css,/@media \(max-width: 390px\)[\s\S]*\.topic-workspace \.grid-cols-2[\s\S]*grid-template-columns:\s*minmax\(0, 1fr\)/);
});
