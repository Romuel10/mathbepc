import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton, { ExampleButton, OpButton } from '../components/TabButton';
import { solvePowers, solvePowerRules, type Step } from '../utils/mathEngine';
import { parseNumberInput, parseIntegerInput, errorSteps } from '../utils/input';

export default function PowersTopic() {
  const [tab, setTab] = useState<'calc'|'rules'>('calc');
  const [base, setBase] = useState(''); const [exp, setExp] = useState('');
  const [cSteps, setCSteps] = useState<Step[]>([]); const [cResult, setCResult] = useState('');
  const [rA, setRA] = useState(''); const [rM, setRM] = useState(''); const [rB, setRB] = useState(''); const [rN, setRN] = useState(''); const [rOp, setROp] = useState('×');
  const [rSteps, setRSteps] = useState<Step[]>([]); const [rResult, setRResult] = useState('');

  const solveC = () => { try { const r = solvePowers(parseNumberInput(base,'Base'),parseIntegerInput(exp,'Exposant')); setCSteps(r.steps); setCResult(r.result); } catch(e){setCSteps(errorSteps(e)); setCResult('');} };
  const solveR = () => { try { const r = solvePowerRules(parseNumberInput(rA,'a'),parseIntegerInput(rM,'m'),parseIntegerInput(rN,'n'),parseNumberInput(rB,'b'),rOp); setRSteps(r.steps); setRResult(r.result); } catch(e){setRSteps(errorSteps(e)); setRResult('');} };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap"><TabButton active={tab==='calc'} onClick={()=>setTab('calc')}>Calculer</TabButton><TabButton active={tab==='rules'} onClick={()=>setTab('rules')}>Règles</TabButton></div>
      {tab==='calc'&&<>
        <p className="text-sm text-[--color-text-secondary]">Calculer une puissance.</p>
        <div className="flex flex-wrap gap-2">{[{b:'2',e:'10'},{b:'3',e:'5'},{b:'5',e:'-2'},{b:'7',e:'0'}].map((ex,i)=>(<ExampleButton key={i} onClick={()=>{setBase(ex.b);setExp(ex.e);}}>{ex.b}^{ex.e}</ExampleButton>))}</div>
        <div className="grid grid-cols-2 gap-4"><InputField label="Base" value={base} onChange={setBase} placeholder="3" /><InputField label="Exposant" value={exp} onChange={setExp} placeholder="4" /></div>
        <SolveButton onClick={solveC} label="Calculer" /><StepDisplay steps={cSteps} result={cResult} />
      </>}
      {tab==='rules'&&<>
        <p className="text-sm text-[--color-text-secondary]">Appliquer les règles des puissances.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><InputField label="Base a" value={rA} onChange={setRA} placeholder="2" /><InputField label="Exp m" value={rM} onChange={setRM} placeholder="3" /><InputField label="Base b" value={rB} onChange={setRB} placeholder="2" /><InputField label="Exp n" value={rN} onChange={setRN} placeholder="5" /></div>
        <div className="flex gap-2 justify-center">{[{op:'×',l:'×'},{op:'÷',l:'÷'},{op:'^',l:'( )ⁿ'}].map(o=>(<OpButton key={o.op} active={rOp===o.op} onClick={()=>setROp(o.op)}>{o.l}</OpButton>))}</div>
        <SolveButton onClick={solveR} label="Appliquer" /><StepDisplay steps={rSteps} result={rResult} />
      </>}
    </div>
  );
}
