import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton, { ExampleButton, SignButton } from '../components/TabButton';
import { NumberLineViz, TwoVarInequalityViz } from '../components/InequalityViz';
import { solveLinearEquation, solveQuadraticEquation, solveSystem2x2, solveLinearInequation, solveIneqSystem2x2, solveProductQuotientIneq, simplifyFrac, fracToDecimal, type Step } from '../utils/mathEngine';
import { parseNumberInput, errorSteps } from '../utils/input';

export default function EquationTopic() {
  const [tab, setTab] = useState<'linear'|'quadratic'|'system'|'inequation'|'prodineq'|'ineqsys'>('linear');
  const [lA, setLA] = useState(''); const [lB, setLB] = useState(''); const [lC, setLC] = useState('0'); const [lD, setLD] = useState('');
  const [lSteps, setLSteps] = useState<Step[]>([]); const [lResult, setLResult] = useState('');
  const [qA, setQA] = useState(''); const [qB, setQB] = useState(''); const [qC, setQC] = useState('');
  const [qSteps, setQSteps] = useState<Step[]>([]); const [qResult, setQResult] = useState('');
  const [s1a, setS1a] = useState(''); const [s1b, setS1b] = useState(''); const [s1c, setS1c] = useState('');
  const [s2a, setS2a] = useState(''); const [s2b, setS2b] = useState(''); const [s2c, setS2c] = useState('');
  const [sSteps, setSSteps] = useState<Step[]>([]); const [sResult, setSResult] = useState('');
  const [iA, setIA] = useState(''); const [iB, setIB] = useState(''); const [iSign, setISign] = useState('<'); const [iC, setIC] = useState('0'); const [iD, setID] = useState('');
  const [iSteps, setISteps] = useState<Step[]>([]); const [iResult, setIResult] = useState('');
  const [iBound, setIBound] = useState<number|null>(null); const [iFinalSign, setIFinalSign] = useState('');
  const [is1a, setIs1a] = useState(''); const [is1b, setIs1b] = useState(''); const [is1sign, setIs1sign] = useState('<'); const [is1c, setIs1c] = useState('');
  const [is2a, setIs2a] = useState(''); const [is2b, setIs2b] = useState(''); const [is2sign, setIs2sign] = useState('<'); const [is2c, setIs2c] = useState('');
  const [isSteps, setIsSteps] = useState<Step[]>([]); const [isResult, setIsResult] = useState('');
  const [isVizData, setIsVizData] = useState<{a1:number;b1:number;c1:number;s1:string;a2:number;b2:number;c2:number;s2:string}|null>(null);

  // Product/Quotient ineq
  const [pqA, setPqA] = useState(''); const [pqB, setPqB] = useState(''); const [pqC, setPqC] = useState(''); const [pqD, setPqD] = useState('');
  const [pqSign, setPqSign] = useState('>'); const [pqIsQ, setPqIsQ] = useState(false);
  const [pqSteps, setPqSteps] = useState<Step[]>([]); const [pqResult, setPqResult] = useState('');

  const solvePQ = () => { try { const r = solveProductQuotientIneq(parseNumberInput(pqA,'a'),parseNumberInput(pqB,'b'),parseNumberInput(pqC,'c'),parseNumberInput(pqD,'d'),pqSign,pqIsQ); setPqSteps(r.steps); setPqResult(r.result); } catch(e){setPqSteps(errorSteps(e)); setPqResult('');} };

  const solveL = () => { try { const r = solveLinearEquation(parseNumberInput(lA,'a'),parseNumberInput(lB,'b'),parseNumberInput(lC,'c'),parseNumberInput(lD,'d')); setLSteps(r.steps); setLResult(r.result); } catch(e){setLSteps(errorSteps(e)); setLResult('');} };
  const solveQ = () => { try { const r = solveQuadraticEquation(parseNumberInput(qA,'a'),parseNumberInput(qB,'b'),parseNumberInput(qC,'c')); setQSteps(r.steps); setQResult(r.result); } catch(e){setQSteps(errorSteps(e)); setQResult('');} };
  const solveS = () => { try { const r = solveSystem2x2(parseNumberInput(s1a,'a₁'),parseNumberInput(s1b,'b₁'),parseNumberInput(s1c,'c₁'),parseNumberInput(s2a,'a₂'),parseNumberInput(s2b,'b₂'),parseNumberInput(s2c,'c₂')); setSSteps(r.steps); setSResult(r.result); } catch(e){setSSteps(errorSteps(e)); setSResult('');} };

  const solveI = () => {
    try {
      const a = parseNumberInput(iA,'a'), b = parseNumberInput(iB,'b'), c = parseNumberInput(iC,'c'), d = parseNumberInput(iD,'d');
      const r = solveLinearInequation(a, b, iSign, c, d);
      setISteps(r.steps); setIResult(r.result);
      // Extract bound for visualization
      const coeff = a - c, ct = d - b;
      if (coeff !== 0) {
        const sol = simplifyFrac(ct, coeff);
        const bound = fracToDecimal(sol);
        let finalSign = iSign;
        if (coeff < 0) {
          if (iSign==='<') finalSign='>'; else if (iSign==='>') finalSign='<';
          else if (iSign==='≤') finalSign='≥'; else finalSign='≤';
        }
        setIBound(bound);
        setIFinalSign(finalSign);
      } else {
        setIBound(null); setIFinalSign('');
      }
    } catch(e) { setISteps(errorSteps(e)); setIResult(''); setIBound(null); setIFinalSign(''); }
  };

  const solveIS = () => {
    try {
      const a1=parseNumberInput(is1a,'a₁'), b1=parseNumberInput(is1b,'b₁'), c1=parseNumberInput(is1c,'c₁');
      const a2=parseNumberInput(is2a,'a₂'), b2=parseNumberInput(is2b,'b₂'), c2=parseNumberInput(is2c,'c₂');
      const r = solveIneqSystem2x2(a1,b1,is1sign,c1,a2,b2,is2sign,c2);
      setIsSteps(r.steps); setIsResult(r.result);
      setIsVizData({ a1,b1,c1,s1:is1sign, a2,b2,c2,s2:is2sign });
    } catch(e) { setIsSteps(errorSteps(e)); setIsResult(''); setIsVizData(null); }
  };

  const signBtns = (cur: string, set: (s:string)=>void) => (
    <div className="flex gap-1.5 justify-center">{['<','≤','>','≥'].map(s=>(<SignButton key={s} active={cur===s} onClick={()=>set(s)}>{s}</SignButton>))}</div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {([['linear','1er degré'],['quadratic','2nd degré (Bonus)'],['system','Système 2×2'],['inequation','Inéq. 1 var'],['prodineq','Inéq. produit'],['ineqsys','Inéq. 2 var']] as const).map(([id,label])=>(
          <TabButton key={id} active={tab===id} onClick={()=>setTab(id as any)}>{label}</TabButton>
        ))}
      </div>

      {tab==='linear'&&<>
        <p className="text-sm text-[--color-text-secondary]">ax + b = cx + d</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><InputField label="a" value={lA} onChange={setLA} placeholder="3" /><InputField label="b" value={lB} onChange={setLB} placeholder="-5" /><InputField label="c" value={lC} onChange={setLC} placeholder="0" /><InputField label="d" value={lD} onChange={setLD} placeholder="7" /></div>
        <SolveButton onClick={solveL} /><StepDisplay steps={lSteps} result={lResult} />
      </>}
      {tab==='quadratic'&&<>
        <p className="text-sm text-[--color-text-secondary]">ax² + bx + c = 0</p>
        <div className="grid grid-cols-3 gap-4"><InputField label="a" value={qA} onChange={setQA} placeholder="1" /><InputField label="b" value={qB} onChange={setQB} placeholder="-5" /><InputField label="c" value={qC} onChange={setQC} placeholder="6" /></div>
        <SolveButton onClick={solveQ} /><StepDisplay steps={qSteps} result={qResult} />
      </>}
      {tab==='system'&&<>
        <p className="text-sm text-[--color-text-secondary]">Système 2 équations / 2 inconnues (Cramer)</p>
        <div className="space-y-3 p-4 rounded-lg bg-[--color-inset] border border-[--color-border]">
          <div className="grid grid-cols-3 gap-3"><InputField label="a₁" value={s1a} onChange={setS1a} placeholder="2" /><InputField label="b₁" value={s1b} onChange={setS1b} placeholder="3" /><InputField label="= c₁" value={s1c} onChange={setS1c} placeholder="8" /></div>
          <div className="grid grid-cols-3 gap-3"><InputField label="a₂" value={s2a} onChange={setS2a} placeholder="3" /><InputField label="b₂" value={s2b} onChange={setS2b} placeholder="-2" /><InputField label="= c₂" value={s2c} onChange={setS2c} placeholder="1" /></div>
        </div>
        <SolveButton onClick={solveS} /><StepDisplay steps={sSteps} result={sResult} />
      </>}

      {tab==='inequation'&&<>
        <p className="text-sm text-[--color-text-secondary]">ax + b ○ cx + d (une variable)</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4"><InputField label="a" value={iA} onChange={setIA} placeholder="2" /><InputField label="b" value={iB} onChange={setIB} placeholder="3" /><InputField label="c" value={iC} onChange={setIC} placeholder="0" /><InputField label="d" value={iD} onChange={setID} placeholder="7" /></div>
        {signBtns(iSign, setISign)}
        <SolveButton onClick={solveI} />

        {/* Number line visualization */}
        {iBound !== null && iFinalSign && (
          <NumberLineViz solution={iResult} bound={iBound} sign={iFinalSign} />
        )}

        <StepDisplay steps={iSteps} result={iResult} />
      </>}

      {tab==='prodineq'&&<>
        <p className="text-sm text-[--color-text-secondary]">Résoudre (ax+b)(cx+d) ○ 0 ou (ax+b)/(cx+d) ○ 0 avec tableau de signes.</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] text-[--color-text-muted] self-center">Exemples :</span>
          {[
            {a:'1',b:'-2',c:'1',d:'3',s:'>',q:false,l:'(x-2)(x+3)>0'},
            {a:'2',b:'1',c:'1',d:'-4',s:'≤',q:false,l:'(2x+1)(x-4)≤0'},
            {a:'1',b:'-3',c:'1',d:'2',s:'>',q:true,l:'(x-3)/(x+2)>0'},
            {a:'3',b:'-6',c:'2',d:'1',s:'<',q:true,l:'(3x-6)/(2x+1)<0'},
          ].map((ex,i)=>(
            <ExampleButton key={i} onClick={()=>{setPqA(ex.a);setPqB(ex.b);setPqC(ex.c);setPqD(ex.d);setPqSign(ex.s);setPqIsQ(ex.q);}}>{ex.l}</ExampleButton>
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          <TabButton active={!pqIsQ} onClick={()=>setPqIsQ(false)}>Produit (ax+b)(cx+d)</TabButton>
          <TabButton active={pqIsQ} onClick={()=>setPqIsQ(true)}>Quotient (ax+b)/(cx+d)</TabButton>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InputField label="a" value={pqA} onChange={setPqA} placeholder="1" />
          <InputField label="b" value={pqB} onChange={setPqB} placeholder="-2" />
          <InputField label="c" value={pqC} onChange={setPqC} placeholder="1" />
          <InputField label="d" value={pqD} onChange={setPqD} placeholder="3" />
        </div>
        {signBtns(pqSign, setPqSign)}
        <SolveButton onClick={solvePQ} label="Résoudre" />
        <StepDisplay steps={pqSteps} result={pqResult} />
      </>}

      {tab==='ineqsys'&&<>
        <p className="text-sm text-[--color-text-secondary]">Système d'inéquations à deux inconnues</p>
        <div className="flex flex-wrap gap-2"><span className="text-[11px] text-[--color-text-muted] self-center">Exemples :</span>
          {[{a1:'1',b1:'2',s1:'≤',c1:'10',a2:'3',b2:'1',s2:'≤',c2:'15',l:'x+2y≤10, 3x+y≤15'},{a1:'2',b1:'-1',s1:'<',c1:'4',a2:'1',b2:'3',s2:'>',c2:'6',l:'2x−y<4, x+3y>6'}].map((ex,i)=>(
            <ExampleButton key={i} onClick={()=>{setIs1a(ex.a1);setIs1b(ex.b1);setIs1sign(ex.s1);setIs1c(ex.c1);setIs2a(ex.a2);setIs2b(ex.b2);setIs2sign(ex.s2);setIs2c(ex.c2);}}>{ex.l}</ExampleButton>
          ))}
        </div>
        <div className="space-y-4 p-4 rounded-lg bg-[--color-inset] border border-[--color-border]">
          <div><span className="text-[10px] font-bold uppercase text-[--color-text-muted]">Inéquation (1)</span>
            <div className="grid grid-cols-3 gap-3 mt-2"><InputField label="a₁" value={is1a} onChange={setIs1a} placeholder="1" /><InputField label="b₁" value={is1b} onChange={setIs1b} placeholder="2" /><InputField label="c₁" value={is1c} onChange={setIs1c} placeholder="10" /></div>
            <div className="mt-2">{signBtns(is1sign, setIs1sign)}</div>
          </div>
          <div className="border-t border-[--color-border] pt-4"><span className="text-[10px] font-bold uppercase text-[--color-text-muted]">Inéquation (2)</span>
            <div className="grid grid-cols-3 gap-3 mt-2"><InputField label="a₂" value={is2a} onChange={setIs2a} placeholder="3" /><InputField label="b₂" value={is2b} onChange={setIs2b} placeholder="1" /><InputField label="c₂" value={is2c} onChange={setIs2c} placeholder="15" /></div>
            <div className="mt-2">{signBtns(is2sign, setIs2sign)}</div>
          </div>
        </div>
        <SolveButton onClick={solveIS} label="Résoudre le système" />

        {/* 2D inequality graph */}
        {isVizData && (
          <TwoVarInequalityViz
            a1={isVizData.a1} b1={isVizData.b1} c1={isVizData.c1} sign1={isVizData.s1}
            a2={isVizData.a2} b2={isVizData.b2} c2={isVizData.c2} sign2={isVizData.s2}
          />
        )}

        <StepDisplay steps={isSteps} result={isResult} />
      </>}
    </div>
  );
}
