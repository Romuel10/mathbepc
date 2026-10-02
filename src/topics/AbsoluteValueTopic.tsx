import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton, { SignButton } from '../components/TabButton';
import { solveAbsoluteDistance, solveAbsoluteEquation, solveAbsoluteInequation, type Step } from '../utils/mathEngine';
import { parseNumberInput, errorSteps } from '../utils/input';

export default function AbsoluteValueTopic() {
  const [tab, setTab] = useState<'distance'|'equation'|'inequation'>('distance');
  const [x1, setX1] = useState(''); const [x2, setX2] = useState('');
  const [distSteps, setDistSteps] = useState<Step[]>([]); const [distResult, setDistResult] = useState('');
  const [eqA, setEqA] = useState('1'); const [eqB, setEqB] = useState(''); const [eqC, setEqC] = useState('');
  const [eqSteps, setEqSteps] = useState<Step[]>([]); const [eqResult, setEqResult] = useState('');
  const [ineqA, setIneqA] = useState('1'); const [ineqB, setIneqB] = useState(''); const [ineqC, setIneqC] = useState(''); const [ineqSign, setIneqSign] = useState('<');
  const [ineqSteps, setIneqSteps] = useState<Step[]>([]); const [ineqResult, setIneqResult] = useState('');

  const solveDist = () => { try { const r = solveAbsoluteDistance(parseNumberInput(x1,'x₁'),parseNumberInput(x2,'x₂')); setDistSteps(r.steps); setDistResult(r.result); } catch(e){setDistSteps(errorSteps(e)); setDistResult('');} };
  const solveEq = () => { try { const r = solveAbsoluteEquation(parseNumberInput(eqA,'a'),parseNumberInput(eqB,'b'),parseNumberInput(eqC,'c')); setEqSteps(r.steps); setEqResult(r.result); } catch(e){setEqSteps(errorSteps(e)); setEqResult('');} };
  const solveIneq = () => { try { const r = solveAbsoluteInequation(parseNumberInput(ineqA,'a'),parseNumberInput(ineqB,'b'),parseNumberInput(ineqC,'c'),ineqSign); setIneqSteps(r.steps); setIneqResult(r.result); } catch(e){setIneqSteps(errorSteps(e)); setIneqResult('');} };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {([['distance','Distance'],['equation','Équation'],['inequation','Inéquation']] as const).map(([id,label])=>(<TabButton key={id} active={tab===id} onClick={()=>setTab(id as any)}>{label}</TabButton>))}
      </div>
      {tab==='distance'&&<>
        <p className="text-sm text-[--color-text-secondary]">d(A,B) = |x₂ - x₁|</p>
        <div className="grid grid-cols-2 gap-4"><InputField label="x₁" value={x1} onChange={setX1} placeholder="-3" /><InputField label="x₂" value={x2} onChange={setX2} placeholder="5" /></div>
        <SolveButton onClick={solveDist} label="Calculer" />
        <StepDisplay steps={distSteps} result={distResult} />
      </>}
      {tab==='equation'&&<>
        <p className="text-sm text-[--color-text-secondary]">Résoudre |ax + b| = c</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><InputField label="a" value={eqA} onChange={setEqA} placeholder="1" /><InputField label="b" value={eqB} onChange={setEqB} placeholder="-3" /><InputField label="c" value={eqC} onChange={setEqC} placeholder="5" /></div>
        <SolveButton onClick={solveEq} label="Résoudre" />
        <StepDisplay steps={eqSteps} result={eqResult} />
      </>}
      {tab==='inequation'&&<>
        <p className="text-sm text-[--color-text-secondary]">Résoudre |ax + b| ○ c</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><InputField label="a" value={ineqA} onChange={setIneqA} placeholder="1" /><InputField label="b" value={ineqB} onChange={setIneqB} placeholder="-2" /><InputField label="c" value={ineqC} onChange={setIneqC} placeholder="4" /></div>
        <div className="flex gap-1.5 justify-center">{['<','≤','>','≥'].map(s=>(<SignButton key={s} active={ineqSign===s} onClick={()=>setIneqSign(s)}>{s}</SignButton>))}</div>
        <SolveButton onClick={solveIneq} label="Résoudre" />
        <StepDisplay steps={ineqSteps} result={ineqResult} />
      </>}
    </div>
  );
}
