import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton, { ExampleButton, OpButton } from '../components/TabButton';
import { solveFractionOp, solveGCDLCM, solveComplexFractionExpr, solveRationalize, solveSimplifyRational, type Step } from '../utils/mathEngine';
import { parseNumberOrZero, parseIntegerInput, errorSteps } from '../utils/input';

export default function FractionTopic() {
  const [tab, setTab] = useState<'op'|'expr'|'simplify'|'rationalize'|'gcd'>('op');
  const [a, setA] = useState(''); const [b, setB] = useState(''); const [op, setOp] = useState('+');
  const [steps, setSteps] = useState<Step[]>([]); const [result, setResult] = useState('');
  const [expr, setExpr] = useState('');
  const [exprSteps, setExprSteps] = useState<Step[]>([]); const [exprResult, setExprResult] = useState('');

  // Simplify A(x)/B(x)
  const [sna, setSna] = useState(''); const [snb, setSnb] = useState(''); const [snc, setSnc] = useState('');
  const [sda, setSda] = useState(''); const [sdb, setSdb] = useState(''); const [sdc, setSdc] = useState('');
  const [simpSteps, setSimpSteps] = useState<Step[]>([]); const [simpResult, setSimpResult] = useState('');

  // Rationalize
  const [rNumA, setRNumA] = useState(''); const [rNumB, setRNumB] = useState('0'); const [rNumRad, setRNumRad] = useState('0');
  const [rDenA, setRDenA] = useState('0'); const [rDenB, setRDenB] = useState(''); const [rDenRad, setRDenRad] = useState('');
  const [ratSteps, setRatSteps] = useState<Step[]>([]); const [ratResult, setRatResult] = useState('');

  // PGCD
  const [gcdA, setGcdA] = useState(''); const [gcdB, setGcdB] = useState('');
  const [gcdSteps, setGcdSteps] = useState<Step[]>([]); const [gcdResult, setGcdResult] = useState('');

  const solve = () => { try { const r = solveFractionOp(a, b, op); setSteps(r.steps); setResult(r.result); } catch (e) { setSteps(errorSteps(e)); setResult(''); } };
  const solveExpr = () => { try { const r = solveComplexFractionExpr(expr); setExprSteps(r.steps); setExprResult(r.result); } catch (e) { setExprSteps(errorSteps(e)); setExprResult(''); } };
  const solveSimp = () => { try { const r = solveSimplifyRational(parseNumberOrZero(sna,'a numérateur'),parseNumberOrZero(snb,'b numérateur'),parseNumberOrZero(snc,'c numérateur'),parseNumberOrZero(sda,'a dénominateur'),parseNumberOrZero(sdb,'b dénominateur'),parseNumberOrZero(sdc,'c dénominateur')); setSimpSteps(r.steps); setSimpResult(r.result); } catch (e) { setSimpSteps(errorSteps(e)); setSimpResult(''); } };
  const solveRat = () => { try { const r = solveRationalize(parseNumberOrZero(rNumA,'a'),parseNumberOrZero(rNumB,'b'),rNumRad.trim()?parseIntegerInput(rNumRad,'n'):0,parseNumberOrZero(rDenA,'c'),parseNumberOrZero(rDenB,'d'),rDenRad.trim()?parseIntegerInput(rDenRad,'m'):0); setRatSteps(r.steps); setRatResult(r.result); } catch (e) { setRatSteps(errorSteps(e)); setRatResult(''); } };
  const solveGcd = () => { try { const r = solveGCDLCM(parseIntegerInput(gcdA,'Nombre A'), parseIntegerInput(gcdB,'Nombre B')); setGcdSteps(r.steps); setGcdResult(r.result); } catch (e) { setGcdSteps(errorSteps(e)); setGcdResult(''); } };

  const plusIfNonNegative = (value: string) => value.trim().startsWith('-') ? '' : '+';

  const tabs: {id: typeof tab; label: string}[] = [
    {id:'op', label:'Opérations'},
    {id:'expr', label:'Expression'},
    {id:'simplify', label:'A(x)/B(x)'},
    {id:'rationalize', label:'Rationaliser'},
    {id:'gcd', label:'PGCD/PPCM'},
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {tabs.map(t => (<TabButton key={t.id} active={tab===t.id} onClick={()=>setTab(t.id)}>{t.label}</TabButton>))}
      </div>

      {tab==='op' && <>
        <p className="text-sm text-[--color-text-secondary]">Opération simple entre deux fractions.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <InputField label="Fraction A" value={a} onChange={setA} placeholder="3/4" />
          <div className="flex gap-2 justify-center">{['+','-','×','÷'].map(o=>(<OpButton key={o} active={op===o} onClick={()=>setOp(o)}>{o}</OpButton>))}</div>
          <InputField label="Fraction B" value={b} onChange={setB} placeholder="2/5" />
        </div>
        <SolveButton onClick={solve} label="Calculer" />
        <StepDisplay steps={steps} result={result} />
      </>}

      {tab==='expr' && <>
        <p className="text-sm text-[--color-text-secondary]">
          Expression fractionnaire avec parenthèses :
          <code className="bg-[--color-btn-bg] px-1.5 py-0.5 rounded text-[11px] font-mono ml-1">/</code> fractions,
          <code className="bg-[--color-btn-bg] px-1.5 py-0.5 rounded text-[11px] font-mono mx-1">*</code> multiplication,
          <code className="bg-[--color-btn-bg] px-1.5 py-0.5 rounded text-[11px] font-mono">( )</code> grouper.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] text-[--color-text-muted] self-center">Exemples :</span>
          {['(3/4-4)/(5/2+1)','(1/2+1/3)/(1/4-1/6)','1/(1+1/(1+1/2))'].map((ex,i)=>(
            <ExampleButton key={i} onClick={()=>setExpr(ex)}>{ex}</ExampleButton>
          ))}
        </div>
        <InputField label="Expression" value={expr} onChange={setExpr} placeholder="(3/4-4)/(5/2+1)" />
        {expr && <div className="p-3 rounded-xl bg-[--color-inset] border border-[--color-border] text-center font-mono text-[--color-accent]">{expr}</div>}
        <SolveButton onClick={solveExpr} label="Calculer" />
        <StepDisplay steps={exprSteps} result={exprResult} />
      </>}

      {tab==='simplify' && <>
        <p className="text-sm text-[--color-text-secondary]">
          Simplifier une fraction de polynômes A(x) / B(x). On factorise numérateur et dénominateur, puis on simplifie les facteurs communs.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] text-[--color-text-muted] self-center">Exemples :</span>
          {[
            {na:'1',nb:'-1',nc:'-6',da:'1',db:'3',dc:'2',l:'(x²-x-6)/(x²+3x+2)'},
            {na:'1',nb:'-4',nc:'0',da:'1',db:'-8',dc:'16',l:'(x²-4x)/(x²-8x+16)'},
            {na:'2',nb:'6',nc:'0',da:'1',db:'3',dc:'0',l:'(2x²+6x)/(x²+3x)'},
            {na:'1',nb:'0',nc:'-9',da:'1',db:'-3',dc:'0',l:'(x²-9)/(x²-3x)'},
            {na:'1',nb:'-5',nc:'6',da:'1',db:'-4',dc:'3',l:'(x²-5x+6)/(x²-4x+3)'},
            {na:'3',nb:'6',nc:'-9',da:'1',db:'1',dc:'-2',l:'(3x²+6x-9)/(x²+x-2)'},
          ].map((ex,i)=>(
            <ExampleButton key={i} onClick={()=>{setSna(ex.na);setSnb(ex.nb);setSnc(ex.nc);setSda(ex.da);setSdb(ex.db);setSdc(ex.dc);}}>{ex.l}</ExampleButton>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[--color-inset] rounded-xl border border-[--color-border] space-y-3">
            <span className="text-[10px] font-bold uppercase text-[--color-text-muted]">Numérateur A(x) = ax² + bx + c</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InputField label="a" value={sna} onChange={setSna} placeholder="1" />
              <InputField label="b" value={snb} onChange={setSnb} placeholder="-1" />
              <InputField label="c" value={snc} onChange={setSnc} placeholder="-6" />
            </div>
          </div>
          <div className="p-4 bg-[--color-inset] rounded-xl border border-[--color-border] space-y-3">
            <span className="text-[10px] font-bold uppercase text-[--color-text-muted]">Dénominateur B(x) = ax² + bx + c</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InputField label="a" value={sda} onChange={setSda} placeholder="1" />
              <InputField label="b" value={sdb} onChange={setSdb} placeholder="3" />
              <InputField label="c" value={sdc} onChange={setSdc} placeholder="2" />
            </div>
          </div>
        </div>
        {(sna||snb||snc||sda||sdb||sdc) && (
          <div className="p-3 rounded-xl bg-[--color-inset] border border-[--color-border] text-center font-mono text-sm">
            <span className="text-[--color-text]">({sna||'0'}x² {plusIfNonNegative(snb||'0')} {snb||'0'}x {plusIfNonNegative(snc||'0')} {snc||'0'})</span>
            <span className="text-[--color-text-muted] mx-2">/</span>
            <span className="text-[--color-text]">({sda||'0'}x² {plusIfNonNegative(sdb||'0')} {sdb||'0'}x {plusIfNonNegative(sdc||'0')} {sdc||'0'})</span>
          </div>
        )}
        <SolveButton onClick={solveSimp} label="Simplifier A(x)/B(x)" />
        <StepDisplay steps={simpSteps} result={simpResult} />
      </>}

      {tab==='rationalize' && <>
        <p className="text-sm text-[--color-text-secondary]">Rendre rationnel le dénominateur. Forme (a + b√n) / (c + d√m).</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] text-[--color-text-muted] self-center">Exemples :</span>
          {[{nA:'6',nB:'0',nR:'0',dA:'0',dB:'3',dR:'2',l:'6/(3√2)'},{nA:'1',nB:'0',nR:'0',dA:'2',dB:'1',dR:'3',l:'1/(2+√3)'},{nA:'3',nB:'0',nR:'0',dA:'5',dB:'-2',dR:'7',l:'3/(5−2√7)'}].map((ex,i)=>(
            <ExampleButton key={i} onClick={()=>{setRNumA(ex.nA);setRNumB(ex.nB);setRNumRad(ex.nR);setRDenA(ex.dA);setRDenB(ex.dB);setRDenRad(ex.dR);}}>{ex.l}</ExampleButton>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-[--color-inset] rounded-xl border border-[--color-border] space-y-3">
            <span className="text-[10px] font-bold uppercase text-[--color-text-muted]">Numérateur : a + b√n</span>
            <InputField label="a" value={rNumA} onChange={setRNumA} placeholder="6" />
            <div className="grid grid-cols-2 gap-3"><InputField label="b" value={rNumB} onChange={setRNumB} placeholder="0" /><InputField label="n" value={rNumRad} onChange={setRNumRad} placeholder="0" /></div>
          </div>
          <div className="p-4 bg-[--color-inset] rounded-xl border border-[--color-border] space-y-3">
            <span className="text-[10px] font-bold uppercase text-[--color-text-muted]">Dénominateur : c + d√m</span>
            <InputField label="c" value={rDenA} onChange={setRDenA} placeholder="0" />
            <div className="grid grid-cols-2 gap-3"><InputField label="d" value={rDenB} onChange={setRDenB} placeholder="3" /><InputField label="m" value={rDenRad} onChange={setRDenRad} placeholder="2" /></div>
          </div>
        </div>
        <SolveButton onClick={solveRat} label="Rationaliser" />
        <StepDisplay steps={ratSteps} result={ratResult} />
      </>}

      {tab==='gcd' && <>
        <p className="text-sm text-[--color-text-secondary]">PGCD et PPCM par l'algorithme d'Euclide.</p>
        <div className="grid grid-cols-2 gap-4">
          <InputField label="Nombre A" value={gcdA} onChange={setGcdA} placeholder="48" />
          <InputField label="Nombre B" value={gcdB} onChange={setGcdB} placeholder="36" />
        </div>
        <SolveButton onClick={solveGcd} label="Calculer PGCD/PPCM" />
        <StepDisplay steps={gcdSteps} result={gcdResult} />
      </>}
    </div>
  );
}
