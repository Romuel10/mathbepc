import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton from '../components/TabButton';
import FunctionPlot from '../components/FunctionPlot';
import { solveAffineAntecedent, solveAffineImage, solveAffineIntersection, solveAffineStudy, type Step } from '../utils/mathEngine';
import { errorSteps, parseNumberInput } from '../utils/input';

export default function FunctionsTopic(){
  const [tab,setTab]=useState<'study'|'image'|'antecedent'|'intersection'>('study');
  const [a,setA]=useState('2'); const [b,setB]=useState('1');
  const [x,setX]=useState('3'); const [y,setY]=useState('7');
  const [c,setC]=useState('-1'); const [d,setD]=useState('5');
  const [steps,setSteps]=useState<Step[]>([]); const [result,setResult]=useState('');
  const [plot,setPlot]=useState<{m:number;p:number}|null>({m:2,p:1});

  const run=(fn:()=>{steps:Step[];result:string})=>{try{const r=fn();setSteps(r.steps);setResult(r.result);}catch(e){setSteps(errorSteps(e));setResult('');}};
  const study=()=>{try{const av=parseNumberInput(a,'a'),bv=parseNumberInput(b,'b');const r=solveAffineStudy(av,bv);setSteps(r.steps);setResult(r.result);setPlot({m:av,p:bv});}catch(e){setSteps(errorSteps(e));setResult('');setPlot(null);}};

  return <div className="space-y-6">
    <div className="flex gap-2 flex-wrap">
      <TabButton active={tab==='study'} onClick={()=>setTab('study')}>Étudier f(x)=ax+b</TabButton>
      <TabButton active={tab==='image'} onClick={()=>setTab('image')}>Image</TabButton>
      <TabButton active={tab==='antecedent'} onClick={()=>setTab('antecedent')}>Antécédent</TabButton>
      <TabButton active={tab==='intersection'} onClick={()=>setTab('intersection')}>Deux droites</TabButton>
    </div>

    <div className="grid grid-cols-2 gap-3"><InputField label="a" value={a} onChange={setA} placeholder="2"/><InputField label="b" value={b} onChange={setB} placeholder="1"/></div>

    {tab==='study'&&<>
      <div className="rounded-xl bg-[--color-inset] p-3 text-xs text-[--color-text-secondary]">Détermine le coefficient directeur, le sens de variation, l'ordonnée à l'origine et le zéro de l'application affine.</div>
      <SolveButton onClick={study} label="Étudier la fonction"/>
      {plot&&<FunctionPlot a={0} b={plot.m} c={plot.p} label={`f(x)=${plot.m}x${plot.p>=0?'+':''}${plot.p}`}/>}<StepDisplay steps={steps} result={result}/>
    </>}

    {tab==='image'&&<><InputField label="x" value={x} onChange={setX} placeholder="3"/><SolveButton onClick={()=>run(()=>solveAffineImage(parseNumberInput(a,'a'),parseNumberInput(b,'b'),parseNumberInput(x,'x')))} label="Calculer f(x)"/><StepDisplay steps={steps} result={result}/></>}

    {tab==='antecedent'&&<><InputField label="Valeur y recherchée" value={y} onChange={setY} placeholder="7"/><SolveButton onClick={()=>run(()=>solveAffineAntecedent(parseNumberInput(a,'a'),parseNumberInput(b,'b'),parseNumberInput(y,'y')))} label="Trouver l'antécédent"/><StepDisplay steps={steps} result={result}/></>}

    {tab==='intersection'&&<>
      <p className="text-sm text-[--color-text-secondary]">Comparer f(x)=ax+b et g(x)=cx+d et trouver leur point d'intersection.</p>
      <div className="grid grid-cols-2 gap-3"><InputField label="c" value={c} onChange={setC} placeholder="-1"/><InputField label="d" value={d} onChange={setD} placeholder="5"/></div>
      <SolveButton onClick={()=>run(()=>solveAffineIntersection(parseNumberInput(a,'a'),parseNumberInput(b,'b'),parseNumberInput(c,'c'),parseNumberInput(d,'d')))} label="Trouver l'intersection"/>
      <StepDisplay steps={steps} result={result}/>
    </>}
  </div>;
}
