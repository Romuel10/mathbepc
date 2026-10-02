import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton, { ExampleButton } from '../components/TabButton';
import { solveFactorization, solveFactorCommon, solveFactorGroupingExpr, type Step } from '../utils/mathEngine';
import { parseNumberInput, errorSteps } from '../utils/input';

export default function FactorizationTopic() {
  const [tab, setTab] = useState<'trinome'|'common'|'grouping'>('trinome');
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [c, setC] = useState('');
  const [steps, setSteps] = useState<Step[]>([]); const [result, setResult] = useState('');
  const [expr, setExpr] = useState('');
  const [commonSteps, setCommonSteps] = useState<Step[]>([]); const [commonResult, setCommonResult] = useState('');
  const [grpExpr, setGrpExpr] = useState('');
  const [grpSteps, setGrpSteps] = useState<Step[]>([]); const [grpResult, setGrpResult] = useState('');

  const solve = () => { try { const r = solveFactorization(parseNumberInput(a,'a'),parseNumberInput(b,'b'),parseNumberInput(c,'c')); setSteps(r.steps); setResult(r.result); } catch(e){setSteps(errorSteps(e)); setResult('');} };
  const solveCommon = () => { try { const r = solveFactorCommon(expr); setCommonSteps(r.steps); setCommonResult(r.result); } catch(e){setCommonSteps(errorSteps(e)); setCommonResult('');} };
  const solveGrp = () => { try { const r = solveFactorGroupingExpr(grpExpr); setGrpSteps(r.steps); setGrpResult(r.result); } catch(e){setGrpSteps(errorSteps(e)); setGrpResult('');} };

  const trinomeExamples = [
    {label:'x²+6x+9',a:'1',b:'6',c:'9'},{label:'x²-25',a:'1',b:'0',c:'-25'},{label:'4x²-12x+9',a:'4',b:'-12',c:'9'},
    {label:'2x²+10x+8',a:'2',b:'10',c:'8'},{label:'3x²-27',a:'3',b:'0',c:'-27'},
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        <TabButton active={tab==='trinome'} onClick={()=>setTab('trinome')}>Trinôme ax²+bx+c</TabButton>
        <TabButton active={tab==='common'} onClick={()=>setTab('common')}>Facteur commun</TabButton>
        <TabButton active={tab==='grouping'} onClick={()=>setTab('grouping')}>Par groupement</TabButton>
      </div>

      {tab==='trinome'&&<>
        <p className="text-sm text-[--color-text-secondary]">Détecte : facteur commun, identités remarquables, ou combinaison.</p>
        <div className="p-3 rounded-lg border border-[--color-border] bg-[--color-inset]">
          <p className="text-[11px] font-semibold text-[--color-text-muted] mb-1.5">Identités remarquables</p>
          <div className="grid grid-cols-3 gap-2 text-xs font-mono text-[--color-text-secondary]">
            <span>(a+b)² = a²+2ab+b²</span><span>(a-b)² = a²-2ab+b²</span><span>a²-b² = (a+b)(a-b)</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2"><span className="text-[11px] text-[--color-text-muted] self-center">Exemples :</span>{trinomeExamples.map((ex,i)=>(<ExampleButton key={i} onClick={()=>{setA(ex.a);setB(ex.b);setC(ex.c);}}>{ex.label}</ExampleButton>))}</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"><InputField label="a (x²)" value={a} onChange={setA} placeholder="1" /><InputField label="b (x)" value={b} onChange={setB} placeholder="6" /><InputField label="c" value={c} onChange={setC} placeholder="9" /></div>
        <SolveButton onClick={solve} label="Factoriser" /><StepDisplay steps={steps} result={result} />
      </>}

      {tab==='common'&&<>
        <p className="text-sm text-[--color-text-secondary]">Factoriser par facteur commun une expression.</p>
        <div className="flex flex-wrap gap-2">{['6x²+9x','4x³-8x²+12x','15x²+10x'].map((ex,i)=>(<ExampleButton key={i} onClick={()=>setExpr(ex)}>{ex}</ExampleButton>))}</div>
        <InputField label="Expression" value={expr} onChange={setExpr} placeholder="6x²+9x" />
        <SolveButton onClick={solveCommon} label="Factoriser" /><StepDisplay steps={commonSteps} result={commonResult} />
      </>}

      {tab==='grouping'&&<>
        <p className="text-sm text-[--color-text-secondary]">Factoriser par groupement de termes (4 termes minimum). On regroupe les termes par paires et on cherche un facteur commun entre les groupes.</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] text-[--color-text-muted] self-center">Exemples :</span>
          {['ax+ay+bx+by','2x+2y+3x+3y','x²+3x+2x+6','ab+ac+db+dc'].map((ex,i)=>(<ExampleButton key={i} onClick={()=>setGrpExpr(ex)}>{ex}</ExampleButton>))}
        </div>
        <InputField label="Expression (4 termes)" value={grpExpr} onChange={setGrpExpr} placeholder="ax+ay+bx+by" />
        <SolveButton onClick={solveGrp} label="Factoriser par groupement" /><StepDisplay steps={grpSteps} result={grpResult} />
      </>}
    </div>
  );
}
