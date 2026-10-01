import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton from '../components/TabButton';
import { solveInscribedAngle, solveLineCirclePosition, type Step } from '../utils/mathEngine';
import { errorSteps, parseNumberInput } from '../utils/input';

export default function CircleTopic(){
  const [tab,setTab]=useState<'angles'|'position'>('angles');
  const [mode,setMode]=useState<'centerToInscribed'|'inscribedToCenter'|'semicircle'|'sameArc'>('centerToInscribed');
  const [angle,setAngle]=useState('120'); const [distance,setDistance]=useState('3'); const [radius,setRadius]=useState('5');
  const [steps,setSteps]=useState<Step[]>([]); const [result,setResult]=useState('');
  const runAngles=()=>{try{const a=mode==='semicircle'?undefined:parseNumberInput(angle,'angle');const r=solveInscribedAngle(mode,a);setSteps(r.steps);setResult(r.result);}catch(e){setSteps(errorSteps(e));setResult('');}};
  const runPosition=()=>{try{const r=solveLineCirclePosition(parseNumberInput(distance,'distance'),parseNumberInput(radius,'rayon'));setSteps(r.steps);setResult(r.result);}catch(e){setSteps(errorSteps(e));setResult('');}};
  return <div className="space-y-6">
    <div className="flex gap-2 flex-wrap"><TabButton active={tab==='angles'} onClick={()=>setTab('angles')}>Angles inscrits</TabButton><TabButton active={tab==='position'} onClick={()=>setTab('position')}>Droite & cercle</TabButton></div>
    {tab==='angles'&&<>
      <div className="flex gap-2 flex-wrap">
        <TabButton active={mode==='centerToInscribed'} onClick={()=>setMode('centerToInscribed')}>Centre → inscrit</TabButton>
        <TabButton active={mode==='inscribedToCenter'} onClick={()=>setMode('inscribedToCenter')}>Inscrit → centre</TabButton>
        <TabButton active={mode==='sameArc'} onClick={()=>setMode('sameArc')}>Même arc</TabButton>
        <TabButton active={mode==='semicircle'} onClick={()=>setMode('semicircle')}>Demi-cercle</TabButton>
      </div>
      {mode!=='semicircle'&&<InputField label="Angle connu (°)" value={angle} onChange={setAngle} placeholder="120"/>}
      <div className="rounded-xl bg-[--color-inset] p-3 text-xs text-[--color-text-secondary]">Rappel : un angle inscrit vaut la moitié de l'angle au centre associé ; deux angles inscrits interceptant le même arc ont la même mesure.</div>
      <SolveButton onClick={runAngles} label="Calculer l'angle"/><StepDisplay steps={steps} result={result}/>
    </>}
    {tab==='position'&&<><p className="text-sm text-[--color-text-secondary]">Compare la distance du centre O à la droite avec le rayon du cercle.</p><div className="grid grid-cols-2 gap-3"><InputField label="Distance d(O,D)" value={distance} onChange={setDistance} placeholder="3"/><InputField label="Rayon r" value={radius} onChange={setRadius} placeholder="5"/></div><SolveButton onClick={runPosition} label="Déterminer la position"/><StepDisplay steps={steps} result={result}/></>}
  </div>;
}
