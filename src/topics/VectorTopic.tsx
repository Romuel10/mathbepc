import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton from '../components/TabButton';
import { solveVectorCoords, solveVectorNorm, solveMidpoint, type Step } from '../utils/mathEngine';
import { parseNumberInput, errorSteps } from '../utils/input';

export default function VectorTopic() {
  const [tab, setTab] = useState<'coords'|'mid'|'norm'>('coords');
  const [xA, setXA] = useState(''); const [yA, setYA] = useState(''); const [xB, setXB] = useState(''); const [yB, setYB] = useState('');
  const [cSteps, setCSteps] = useState<Step[]>([]); const [cResult, setCResult] = useState('');
  const [vx, setVx] = useState(''); const [vy, setVy] = useState('');
  const [nSteps, setNSteps] = useState<Step[]>([]); const [nResult, setNResult] = useState('');

  const solveC = () => { try { const r = solveVectorCoords(parseNumberInput(xA,'xA'),parseNumberInput(yA,'yA'),parseNumberInput(xB,'xB'),parseNumberInput(yB,'yB')); setCSteps(r.steps); setCResult(r.result); } catch(e){setCSteps(errorSteps(e)); setCResult('');} };
  const solveM = () => { try { const r = solveMidpoint(parseNumberInput(xA,'xA'),parseNumberInput(yA,'yA'),parseNumberInput(xB,'xB'),parseNumberInput(yB,'yB')); setCSteps(r.steps); setCResult(r.result); } catch(e){setCSteps(errorSteps(e)); setCResult('');} };
  const solveN = () => { try { const r = solveVectorNorm(parseNumberInput(vx,'x'),parseNumberInput(vy,'y')); setNSteps(r.steps); setNResult(r.result); } catch(e){setNSteps(errorSteps(e)); setNResult('');} };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {([['coords','Coordonnées AB'],['mid','Milieu [AB]'],['norm','Norme']] as const).map(([id,label])=>(<TabButton key={id} active={tab===id} onClick={()=>setTab(id as any)}>{label}</TabButton>))}
      </div>
      {(tab==='coords'||tab==='mid')&&<>
        <p className="text-sm text-[--color-text-secondary]">Calculer les coordonnées du {tab==='coords'?'vecteur AB':'milieu de [AB]'}</p>
        <div className="grid grid-cols-2 gap-4 p-4 bg-[--color-inset] rounded-lg border border-[--color-border]">
          <div className="space-y-3"><span className="text-[10px] font-bold uppercase text-[--color-text-muted]">Point A</span><InputField label="x_A" value={xA} onChange={setXA} placeholder="2" /><InputField label="y_A" value={yA} onChange={setYA} placeholder="3" /></div>
          <div className="space-y-3"><span className="text-[10px] font-bold uppercase text-[--color-text-muted]">Point B</span><InputField label="x_B" value={xB} onChange={setXB} placeholder="5" /><InputField label="y_B" value={yB} onChange={setYB} placeholder="-1" /></div>
        </div>
        <SolveButton onClick={tab==='coords'?solveC:solveM} label={tab==='coords'?'Calculer AB':'Calculer Milieu'} />
        <StepDisplay steps={cSteps} result={cResult} />
      </>}
      {tab==='norm'&&<>
        <p className="text-sm text-[--color-text-secondary]">||v|| = √(x² + y²)</p>
        <div className="grid grid-cols-2 gap-4"><InputField label="x" value={vx} onChange={setVx} placeholder="3" /><InputField label="y" value={vy} onChange={setVy} placeholder="4" /></div>
        <SolveButton onClick={solveN} label="Calculer la norme" /><StepDisplay steps={nSteps} result={nResult} />
      </>}
    </div>
  );
}
