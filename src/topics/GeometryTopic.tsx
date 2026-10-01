import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton from '../components/TabButton';
import TriangleViz from '../components/TriangleViz';
import { solvePythagoras, solveThales, solveTrig, solvePlaneArea, type Step } from '../utils/mathEngine';
import { parseNumberInput, parseOptionalNumber, errorSteps } from '../utils/input';

export default function GeometryTopic() {
  const [tab, setTab] = useState<'pythagoras'|'thales'|'trig'|'areas'>('pythagoras');
  const [pA, setPA] = useState(''); const [pB, setPB] = useState(''); const [pFind, setPFind] = useState(true);
  const [pSteps, setPSteps] = useState<Step[]>([]); const [pResult, setPResult] = useState('');
  const [pSolved, setPSolved] = useState<{a:number;b:number;c:number}|null>(null);
  const [tA, setTA] = useState(''); const [tB, setTB] = useState(''); const [tC, setTC] = useState('');
  const [tSteps, setTSteps] = useState<Step[]>([]); const [tResult, setTResult] = useState('');
  const [trigType, setTrigType] = useState('sin');
  const [trigAngle, setTrigAngle] = useState(''); const [trigOpp, setTrigOpp] = useState(''); const [trigAdj, setTrigAdj] = useState(''); const [trigHyp, setTrigHyp] = useState('');
  const [trigSteps, setTrigSteps] = useState<Step[]>([]); const [trigResult, setTrigResult] = useState('');
  const [trigSolved, setTrigSolved] = useState<{opp:number;adj:number;hyp:number;angle:number}|null>(null);

  // Areas
  const [aShape, setAShape] = useState('triangle');
  const [aParams, setAParams] = useState<{[k:string]:string}>({});
  const [aSteps, setASteps] = useState<Step[]>([]); const [aResult, setAResult] = useState('');
  const updateAP = (k: string, v: string) => setAParams(p => ({...p, [k]: v}));
  const areaFields: Record<string, string[]> = {
    triangle:['base','height'], triangle3:['a','b','c'], rectangle:['l','w'], carre:['c'], cercle:['r'],
    trapeze:['b1','b2','h'], parallelogramme:['base','height'], losange:['d1','d2'], disque_secteur:['r','angle'],
  };
  const solveA = () => { try { const np: {[k:string]:number}={}; for (const k of areaFields[aShape] || []) np[k]=parseNumberInput(aParams[k]||'', k); const r = solvePlaneArea(aShape, np); setASteps(r.steps); setAResult(r.result); } catch(e){setASteps(errorSteps(e)); setAResult('');} };

  const solveP = () => {
    try {
      const a = parseNumberInput(pA,pFind?'Côté a':'Hypoténuse c'), b = parseNumberInput(pB,'Côté b');
      const r = solvePythagoras(a, b, pFind);
      setPSteps(r.steps); setPResult(r.result);
      if (pFind) {
        const c = Math.sqrt(a*a+b*b);
        setPSolved({ a, b, c });
      } else {
        const side = Math.sqrt(a*a-b*b);
        setPSolved({ a: side, b, c: a });
      }
    } catch(e) { setPSteps(errorSteps(e)); setPResult(''); setPSolved(null); }
  };

  const solveT = () => { try { const r = solveThales(parseNumberInput(tA,'a'),parseNumberInput(tB,'b'),parseNumberInput(tC,'c')); setTSteps(r.steps); setTResult(r.result); } catch(e){setTSteps(errorSteps(e)); setTResult('');} };

  const solveTr = () => {
    try {
      const ang = parseOptionalNumber(trigAngle,'Angle');
      const opp = parseOptionalNumber(trigOpp,'Côté opposé');
      const adj = parseOptionalNumber(trigAdj,'Côté adjacent');
      const hyp = parseOptionalNumber(trigHyp,'Hypoténuse');
      const r = solveTrig(trigType, ang, opp, adj, hyp);
      setTrigSteps(r.steps); setTrigResult(r.result);

      // Reconstruct triangle from known + computed values
      let fOpp = opp, fAdj = adj, fHyp = hyp, fAng = ang;
      const toRad = (d: number) => d * Math.PI / 180;
      // Fill in what we can
      if (fAng !== null && fHyp !== null) {
        if (!fOpp) fOpp = fHyp * Math.sin(toRad(fAng));
        if (!fAdj) fAdj = fHyp * Math.cos(toRad(fAng));
      }
      if (fAng !== null && fOpp !== null && !fHyp) fHyp = fOpp / Math.sin(toRad(fAng));
      if (fAng !== null && fAdj !== null && !fHyp) fHyp = fAdj / Math.cos(toRad(fAng));
      if (fOpp !== null && fAdj !== null && !fAng) fAng = Math.atan(fOpp / fAdj) * 180 / Math.PI;
      if (fOpp !== null && fHyp !== null && !fAdj) fAdj = Math.sqrt(fHyp * fHyp - fOpp * fOpp);
      if (fAdj !== null && fHyp !== null && !fOpp) fOpp = Math.sqrt(fHyp * fHyp - fAdj * fAdj);
      if (fOpp !== null && fAdj !== null && !fHyp) fHyp = Math.sqrt(fOpp * fOpp + fAdj * fAdj);
      if (!fAng && fOpp && fHyp) fAng = Math.asin(fOpp / fHyp) * 180 / Math.PI;

      if (fOpp && fAdj && fHyp && fAng) {
        setTrigSolved({ opp: fOpp, adj: fAdj, hyp: fHyp, angle: fAng });
      } else {
        setTrigSolved(null);
      }
    } catch(e) { setTrigSteps(errorSteps(e)); setTrigResult(''); setTrigSolved(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {([['pythagoras','Pythagore'],['thales','Thalès'],['trig','Trigonométrie'],['areas','Aires & Périmètres']] as const).map(([id,label])=>(
          <TabButton key={id} active={tab===id} onClick={()=>setTab(id as any)}>{label}</TabButton>
        ))}
      </div>

      {tab==='pythagoras'&&<>
        <p className="text-sm text-[--color-text-secondary]">c² = a² + b²</p>
        <div className="flex gap-3 justify-center">
          <TabButton active={pFind} onClick={()=>setPFind(true)}>Trouver hypoténuse</TabButton>
          <TabButton active={!pFind} onClick={()=>setPFind(false)}>Trouver un côté</TabButton>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField label={pFind?"Côté a":"Hypoténuse c"} value={pA} onChange={setPA} placeholder={pFind?"3":"13"} />
          <InputField label={pFind?"Côté b":"Côté b"} value={pB} onChange={setPB} placeholder={pFind?"4":"5"} />
        </div>
        <SolveButton onClick={solveP} label="Calculer" />

        {/* Triangle visualization */}
        {pSolved && (
          <TriangleViz
            sideA={pSolved.a}
            sideB={pSolved.b}
            hypotenuse={pSolved.c}
            labels={{
              a: pSolved.a.toFixed(Number.isInteger(pSolved.a)?0:2),
              b: pSolved.b.toFixed(Number.isInteger(pSolved.b)?0:2),
              c: pSolved.c.toFixed(Number.isInteger(pSolved.c)?0:2),
            }}
          />
        )}

        <StepDisplay steps={pSteps} result={pResult} />
      </>}

      {tab==='thales'&&<>
        <p className="text-sm text-[--color-text-secondary]">a/b = c/x</p>
        <div className="grid grid-cols-3 gap-4">
          <InputField label="a" value={tA} onChange={setTA} placeholder="4" />
          <InputField label="b" value={tB} onChange={setTB} placeholder="6" />
          <InputField label="c" value={tC} onChange={setTC} placeholder="5" />
        </div>
        <SolveButton onClick={solveT} label="Trouver x" />
        <StepDisplay steps={tSteps} result={tResult} />
      </>}

      {tab==='trig'&&<>
        <p className="text-sm text-[--color-text-secondary]">sin, cos, tan — remplissez les valeurs connues</p>
        <div className="flex gap-2 justify-center">
          {['sin','cos','tan'].map(t=>(
            <TabButton key={t} active={trigType===t} onClick={()=>setTrigType(t)}>{t}</TabButton>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Angle (°)" value={trigAngle} onChange={setTrigAngle} placeholder="30" />
          <InputField label="Opposé" value={trigOpp} onChange={setTrigOpp} placeholder="" />
          <InputField label="Adjacent" value={trigAdj} onChange={setTrigAdj} placeholder="" />
          <InputField label="Hypoténuse" value={trigHyp} onChange={setTrigHyp} placeholder="" />
        </div>
        <SolveButton onClick={solveTr} label="Calculer" />

        {/* Triangle visualization with trig values */}
        {trigSolved && (
          <TriangleViz
            sideA={trigSolved.opp}
            sideB={trigSolved.adj}
            hypotenuse={trigSolved.hyp}
            angle={trigSolved.angle}
            labels={{
              a: trigSolved.opp.toFixed(2),
              b: trigSolved.adj.toFixed(2),
              c: trigSolved.hyp.toFixed(2),
              angle: `${trigSolved.angle.toFixed(1)}°`,
            }}
          />
        )}

        <StepDisplay steps={trigSteps} result={trigResult} />
      </>}

      {tab==='areas'&&<>
        <p className="text-sm text-[--color-text-secondary]">Calcul d'aires et périmètres des figures planes.</p>
        <div className="flex gap-2 flex-wrap">
          {[['triangle','Triangle (b,h)'],['triangle3','Triangle (3 côtés)'],['rectangle','Rectangle'],['carre','Carré'],['cercle','Cercle'],['trapeze','Trapèze'],['parallelogramme','Parallélogramme'],['losange','Losange']].map(([id,label])=>(
            <TabButton key={id} active={aShape===id} onClick={()=>{setAShape(id);setAParams({});setASteps([]);}}>{label}</TabButton>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {aShape==='triangle'&&<><InputField label="Base" value={aParams.base||''} onChange={v=>updateAP('base',v)} placeholder="6" /><InputField label="Hauteur" value={aParams.height||''} onChange={v=>updateAP('height',v)} placeholder="4" /></>}
          {aShape==='triangle3'&&<><InputField label="Côté a" value={aParams.a||''} onChange={v=>updateAP('a',v)} placeholder="3" /><InputField label="Côté b" value={aParams.b||''} onChange={v=>updateAP('b',v)} placeholder="4" /><InputField label="Côté c" value={aParams.c||''} onChange={v=>updateAP('c',v)} placeholder="5" /></>}
          {aShape==='rectangle'&&<><InputField label="Longueur" value={aParams.l||''} onChange={v=>updateAP('l',v)} placeholder="8" /><InputField label="Largeur" value={aParams.w||''} onChange={v=>updateAP('w',v)} placeholder="5" /></>}
          {aShape==='carre'&&<InputField label="Côté" value={aParams.c||''} onChange={v=>updateAP('c',v)} placeholder="6" />}
          {aShape==='cercle'&&<InputField label="Rayon" value={aParams.r||''} onChange={v=>updateAP('r',v)} placeholder="5" />}
          {aShape==='trapeze'&&<><InputField label="Grande base B" value={aParams.b1||''} onChange={v=>updateAP('b1',v)} placeholder="10" /><InputField label="Petite base b" value={aParams.b2||''} onChange={v=>updateAP('b2',v)} placeholder="6" /><InputField label="Hauteur h" value={aParams.h||''} onChange={v=>updateAP('h',v)} placeholder="4" /></>}
          {aShape==='parallelogramme'&&<><InputField label="Base" value={aParams.base||''} onChange={v=>updateAP('base',v)} placeholder="8" /><InputField label="Hauteur" value={aParams.height||''} onChange={v=>updateAP('height',v)} placeholder="5" /></>}
          {aShape==='losange'&&<><InputField label="Diagonale D" value={aParams.d1||''} onChange={v=>updateAP('d1',v)} placeholder="10" /><InputField label="Diagonale d" value={aParams.d2||''} onChange={v=>updateAP('d2',v)} placeholder="8" /></>}
        </div>
        <SolveButton onClick={solveA} label="Calculer" />
        <StepDisplay steps={aSteps} result={aResult} />
      </>}
    </div>
  );
}
