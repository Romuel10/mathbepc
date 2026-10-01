import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton, { ExampleButton, OpButton } from '../components/TabButton';
import { solveRadicalSimplify, solveRadicalOp, solveRadicalCompare, solveSqrtBounds, type Step } from '../utils/mathEngine';
import { parseNumberInput, parseIntegerInput, errorSteps } from '../utils/input';

export default function RadicalTopic() {
  const [tab, setTab] = useState<'simplify'|'operation'|'compare'|'bounds'>('simplify');
  const [radN, setRadN] = useState('');
  const [simpSteps, setSimpSteps] = useState<Step[]>([]); const [simpResult, setSimpResult] = useState('');
  const [aC, setAC] = useState('1'); const [aR, setAR] = useState(''); const [bC, setBC] = useState('1'); const [bR, setBR] = useState(''); const [op, setOp] = useState('+');
  const [opSteps, setOpSteps] = useState<Step[]>([]); const [opResult, setOpResult] = useState('');
  const [cAC, setCAC] = useState(''); const [cAR, setCAR] = useState(''); const [cBC, setCBC] = useState(''); const [cBR, setCBR] = useState('');
  const [boundN,setBoundN]=useState('7'); const [boundDigits,setBoundDigits]=useState('2');
  const [cmpSteps, setCmpSteps] = useState<Step[]>([]); const [cmpResult, setCmpResult] = useState('');

  const solveSimp = () => { try { const r = solveRadicalSimplify(parseIntegerInput(radN,'Radicande')); setSimpSteps(r.steps); setSimpResult(r.result); } catch(e){setSimpSteps(errorSteps(e)); setSimpResult('');} };
  const solveOp = () => { try { const r = solveRadicalOp(parseNumberInput(aC,'Coefficient A'),parseIntegerInput(aR,'Radicande A'),parseNumberInput(bC,'Coefficient B'),parseIntegerInput(bR,'Radicande B'),op); setOpSteps(r.steps); setOpResult(r.result); } catch(e){setOpSteps(errorSteps(e)); setOpResult('');} };
  const solveBounds = () => { try { const r=solveSqrtBounds(parseNumberInput(boundN,'Nombre'),parseIntegerInput(boundDigits,'Ordre')); setCmpSteps(r.steps); setCmpResult(r.result); } catch(e){setCmpSteps(errorSteps(e));setCmpResult('');} };
  const solveCmp = () => { try { const r = solveRadicalCompare(parseNumberInput(cAC,'Coefficient A'),parseIntegerInput(cAR,'Radicande A'),parseNumberInput(cBC,'Coefficient B'),parseIntegerInput(cBR,'Radicande B')); setCmpSteps(r.steps); setCmpResult(r.result); } catch(e){setCmpSteps(errorSteps(e)); setCmpResult('');} };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {([['simplify','Simplifier √n'],['operation','Opérations'],['compare','Comparer'],['bounds','Encadrer √n']] as const).map(([id,label])=>(<TabButton key={id} active={tab===id} onClick={()=>setTab(id as any)}>{label}</TabButton>))}
      </div>
      {tab==='simplify'&&<>
        <p className="text-sm text-[--color-text-secondary]">Simplifier √n en extrayant les carrés parfaits.</p>
        <div className="flex flex-wrap gap-2">{[72,128,200,450,1152].map(n=>(<ExampleButton key={n} onClick={()=>setRadN(`${n}`)}>√{n}</ExampleButton>))}</div>
        <InputField label="Radicande (n)" value={radN} onChange={setRadN} placeholder="72" />
        <SolveButton onClick={solveSimp} label="Simplifier" />
        <StepDisplay steps={simpSteps} result={simpResult} />
      </>}
      {tab==='operation'&&<>
        <p className="text-sm text-[--color-text-secondary]">Opérations : a√m ○ b√n</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InputField label="Coeff a" value={aC} onChange={setAC} placeholder="1" />
          <InputField label="√m" value={aR} onChange={setAR} placeholder="12" />
          <InputField label="Coeff b" value={bC} onChange={setBC} placeholder="1" />
          <InputField label="√n" value={bR} onChange={setBR} placeholder="27" />
        </div>
        <div className="flex gap-2 justify-center">{['+','-','×','÷'].map(o=>(<OpButton key={o} active={op===o} onClick={()=>setOp(o)}>{o}</OpButton>))}</div>
        <SolveButton onClick={solveOp} label="Calculer" />
        <StepDisplay steps={opSteps} result={opResult} />
      </>}
      {tab==='compare'&&<>
        <p className="text-sm text-[--color-text-secondary]">Comparer deux radicaux par les carrés.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InputField label="Coeff a" value={cAC} onChange={setCAC} placeholder="3" /><InputField label="√m" value={cAR} onChange={setCAR} placeholder="5" />
          <InputField label="Coeff b" value={cBC} onChange={setCBC} placeholder="2" /><InputField label="√n" value={cBR} onChange={setCBR} placeholder="11" />
        </div>
        <SolveButton onClick={solveCmp} label="Comparer" />
        <StepDisplay steps={cmpSteps} result={cmpResult} />
      </>}

      {tab==='bounds'&&<>
        <p className="text-sm text-[--color-text-secondary]">Donner un encadrement décimal d’une racine carrée, comme demandé dans le programme de 3e.</p>
        <div className="grid grid-cols-2 gap-4"><InputField label="Nombre n" value={boundN} onChange={setBoundN} placeholder="7"/><InputField label="Nombre de décimales" value={boundDigits} onChange={setBoundDigits} placeholder="2"/></div>
        <SolveButton onClick={solveBounds} label="Encadrer √n"/><StepDisplay steps={cmpSteps} result={cmpResult}/>
      </>}
    </div>
  );
}
