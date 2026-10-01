import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton from '../components/TabButton';
import { solveSpaceVolume, solveCompoundSolid, type Step } from '../utils/mathEngine';
import { parseNumberInput, errorSteps } from '../utils/input';

type Shape = 'cube'|'pave'|'cylindre'|'cone'|'pyramide'|'sphere';

export default function SpaceTopic() {
  const [tab, setTab] = useState<'simple'|'compound'>('simple');
  const [shape, setShape] = useState<Shape>('cube');
  const [params, setParams] = useState<{[k:string]:string}>({});
  const [steps, setSteps] = useState<Step[]>([]); const [result, setResult] = useState('');

  // Compound
  const [compParts, setCompParts] = useState<{shape:Shape;params:{[k:string]:string}}[]>([
    {shape:'cylindre',params:{}}, {shape:'cone',params:{}}
  ]);
  const [compSteps, setCompSteps] = useState<Step[]>([]); const [compResult, setCompResult] = useState('');

  const updateParam = (key: string, val: string) => setParams(p => ({...p, [key]: val}));
  const shapeFields: Record<Shape, string[]> = { cube:['c'], pave:['l','w','h'], cylindre:['r','h'], cone:['r','h'], pyramide:['base','h'], sphere:['r'] };
  const parseShapeParams = (sh: Shape, source: {[k:string]:string}) => {
    const out: {[k:string]:number} = {};
    for (const key of shapeFields[sh]) out[key] = parseNumberInput(source[key]||'', key);
    return out;
  };
  const solve = () => { try { const r = solveSpaceVolume(shape,parseShapeParams(shape,params)); setSteps(r.steps); setResult(r.result); } catch(e){setSteps(errorSteps(e)); setResult('');} };

  const updateCompPart = (idx: number, key: string, val: string) => {
    setCompParts(p => p.map((part, i) => i === idx ? {...part, params: {...part.params, [key]: val}} : part));
  };
  const setCompShape = (idx: number, s: Shape) => {
    setCompParts(p => p.map((part, i) => i === idx ? {shape: s, params: {}} : part));
  };
  const addPart = () => setCompParts(p => [...p, {shape: 'cylindre', params: {}}]);
  const removePart = (idx: number) => setCompParts(p => p.filter((_, i) => i !== idx));

  const solveComp = () => {
    try {
      const parts = compParts.map(p => ({ shape: p.shape, params: parseShapeParams(p.shape, p.params) }));
      const r = solveCompoundSolid(parts);
      setCompSteps(r.steps); setCompResult(r.result);
    } catch(e) { setCompSteps(errorSteps(e)); setCompResult(''); }
  };

  const shapes: {id:Shape;label:string}[] = [
    {id:'cube',label:'Cube'},{id:'pave',label:'Pavé'},{id:'cylindre',label:'Cylindre'},
    {id:'cone',label:'Cône'},{id:'pyramide',label:'Pyramide'},{id:'sphere',label:'Sphère'},
  ];

  const renderShapeInputs = (sh: Shape, p: {[k:string]:string}, update: (k:string,v:string)=>void) => (
    <div className="grid grid-cols-2 gap-3">
      {sh==='cube'&&<InputField label="Arête (c)" value={p.c||''} onChange={v=>update('c',v)} placeholder="5" />}
      {sh==='pave'&&<><InputField label="L" value={p.l||''} onChange={v=>update('l',v)} placeholder="10" /><InputField label="l" value={p.w||''} onChange={v=>update('w',v)} placeholder="5" /><InputField label="h" value={p.h||''} onChange={v=>update('h',v)} placeholder="4" /></>}
      {(sh==='cylindre'||sh==='cone')&&<><InputField label="Rayon (r)" value={p.r||''} onChange={v=>update('r',v)} placeholder="3" /><InputField label="Hauteur (h)" value={p.h||''} onChange={v=>update('h',v)} placeholder="7" /></>}
      {sh==='pyramide'&&<><InputField label="Aire base (B)" value={p.base||''} onChange={v=>update('base',v)} placeholder="25" /><InputField label="Hauteur (h)" value={p.h||''} onChange={v=>update('h',v)} placeholder="6" /></>}
      {sh==='sphere'&&<InputField label="Rayon (r)" value={p.r||''} onChange={v=>update('r',v)} placeholder="4" />}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <TabButton active={tab==='simple'} onClick={()=>setTab('simple')}>Solide simple</TabButton>
        <TabButton active={tab==='compound'} onClick={()=>setTab('compound')}>Solide composé</TabButton>
      </div>

      {tab==='simple'&&<>
        <div className="flex gap-2 flex-wrap">
          {shapes.map(s=>(<TabButton key={s.id} active={shape===s.id} onClick={()=>{setShape(s.id);setParams({});setSteps([]);}}>{s.label}</TabButton>))}
        </div>
        {renderShapeInputs(shape, params, updateParam)}
        <SolveButton onClick={solve} label="Calculer" /><StepDisplay steps={steps} result={result} />
      </>}

      {tab==='compound'&&<>
        <p className="text-sm text-[--color-text-secondary]">Calculer le volume total d'un solide composé de plusieurs parties (ex: cylindre surmonté d'un cône).</p>
        <div className="space-y-4">
          {compParts.map((part, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-[--color-inset] border border-[--color-border] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase text-[--color-text-muted]">Partie {idx+1}</span>
                {compParts.length > 1 && (
                  <button onClick={()=>removePart(idx)} className="text-[11px] text-[--color-warn-text] cursor-pointer hover:underline">Supprimer</button>
                )}
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {shapes.map(s=>(<TabButton key={s.id} active={part.shape===s.id} onClick={()=>setCompShape(idx,s.id)}>{s.label}</TabButton>))}
              </div>
              {renderShapeInputs(part.shape, part.params, (k,v)=>updateCompPart(idx,k,v))}
            </div>
          ))}
          <button onClick={addPart} className="w-full py-2.5 rounded-lg border-2 border-dashed border-[--color-border] text-sm text-[--color-text-muted] hover:border-[--color-accent] hover:text-[--color-accent] transition-colors cursor-pointer">
            + Ajouter une partie
          </button>
        </div>
        <SolveButton onClick={solveComp} label="Calculer le volume total" /><StepDisplay steps={compSteps} result={compResult} />
      </>}
    </div>
  );
}
