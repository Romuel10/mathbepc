import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton from '../components/TabButton';
import { solveDevelopment, solveGeneralDevelopment, type Step } from '../utils/mathEngine';
import { parseNumberInput, errorSteps } from '../utils/input';

export default function DevelopmentTopic() {
  const [tab, setTab] = useState<'identity'|'general'>('identity');
  const [idType, setIdType] = useState('(a+b)^2');
  const [idA, setIdA] = useState(''); const [idB, setIdB] = useState('');
  const [idSteps, setIdSteps] = useState<Step[]>([]); const [idResult, setIdResult] = useState('');
  const [gA, setGA] = useState(''); const [gB, setGB] = useState(''); const [gC, setGC] = useState(''); const [gD, setGD] = useState('');
  const [gSteps, setGSteps] = useState<Step[]>([]); const [gResult, setGResult] = useState('');

  const solveId = () => { try { const r = solveDevelopment(idType,parseNumberInput(idA,'a'),parseNumberInput(idB,'b')); setIdSteps(r.steps); setIdResult(r.result); } catch(e){setIdSteps(errorSteps(e)); setIdResult('');} };
  const solveGen = () => { try { const r = solveGeneralDevelopment(parseNumberInput(gA,'a'),parseNumberInput(gB,'b'),parseNumberInput(gC,'c'),parseNumberInput(gD,'d')); setGSteps(r.steps); setGResult(r.result); } catch(e){setGSteps(errorSteps(e)); setGResult('');} };

  const identities = [{id:'(a+b)^2',label:'(a + b)²',formula:'a² + 2ab + b²'},{id:'(a-b)^2',label:'(a - b)²',formula:'a² - 2ab + b²'},{id:'(a+b)(a-b)',label:'(a+b)(a-b)',formula:'a² - b²'}];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap"><TabButton active={tab==='identity'} onClick={()=>setTab('identity')}>Identités remarquables</TabButton><TabButton active={tab==='general'} onClick={()=>setTab('general')}>(ax+b)(cx+d)</TabButton></div>
      {tab==='identity'&&<>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {identities.map(id=>(
            <button key={id.id} onClick={()=>setIdType(id.id)} className={`p-4 rounded-xl text-left transition-all duration-150 cursor-pointer border ${idType===id.id ? 'border-[--color-accent] bg-[--color-accent-subtle] shadow-sm shadow-[--color-accent]/10' : 'border-[--color-border] hover:border-[--color-btn-bg-hover] bg-[--color-btn-bg]'}`}>
              <div className="font-bold text-lg text-[--color-text]">{id.label}</div>
              <div className="text-xs font-mono mt-1 text-[--color-text-muted]">{id.formula}</div>
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4"><InputField label="a (coeff de x)" value={idA} onChange={setIdA} placeholder="3" /><InputField label="b (constante)" value={idB} onChange={setIdB} placeholder="5" /></div>
        <SolveButton onClick={solveId} label="Développer" /><StepDisplay steps={idSteps} result={idResult} />
      </>}
      {tab==='general'&&<>
        <p className="text-sm text-[--color-text-secondary]">Développer (ax + b)(cx + d) par double distribution</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><InputField label="a" value={gA} onChange={setGA} placeholder="2" /><InputField label="b" value={gB} onChange={setGB} placeholder="3" /><InputField label="c" value={gC} onChange={setGC} placeholder="1" /><InputField label="d" value={gD} onChange={setGD} placeholder="-4" /></div>
        <SolveButton onClick={solveGen} label="Développer" /><StepDisplay steps={gSteps} result={gResult} />
      </>}
    </div>
  );
}
