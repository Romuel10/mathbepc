import { useState } from 'react';
import InputField from '../components/InputField';
import SolveButton from '../components/SolveButton';
import StepDisplay from '../components/StepDisplay';
import TabButton, { ExampleButton } from '../components/TabButton';
import BarChartViz, { FrequencyTable } from '../components/BarChartViz';
import { solveStatistics, solveProportionality, solvePercentage, type Step, type StatsResult } from '../utils/mathEngine';
import { parseNumberInput, parseOptionalNumber, parseNumberList, errorSteps } from '../utils/input';

export default function StatsTopic() {
  const [tab, setTab] = useState<'stats'|'proportion'|'percent'>('stats');
  const [values, setValues] = useState(''); const [freqs, setFreqs] = useState('');
  const [stSteps, setStSteps] = useState<Step[]>([]); const [stResult, setStResult] = useState('');
  const [statsData, setStatsData] = useState<StatsResult | null>(null);
  const [px1, setPx1] = useState(''); const [py1, setPy1] = useState(''); const [px2, setPx2] = useState(''); const [py2, setPy2] = useState('');
  const [prSteps, setPrSteps] = useState<Step[]>([]); const [prResult, setPrResult] = useState('');
  const [pType, setPType] = useState('of'); const [pVal, setPVal] = useState(''); const [pPer, setPPer] = useState('');
  const [peSteps, setPeSteps] = useState<Step[]>([]); const [peResult, setPeResult] = useState('');

  const solveSt = () => {
    try {
      const vals = parseNumberList(values,'Valeurs');
      const fqs = freqs.trim() ? parseNumberList(freqs,'Effectifs') : undefined;
      const r = solveStatistics(vals, fqs);
      setStSteps(r.steps); setStResult(r.result); setStatsData(r);
    } catch (e) { setStSteps(errorSteps(e)); setStResult(''); setStatsData(null); }
  };
  const solvePr = () => { try { const r = solveProportionality(parseNumberInput(px1,'x₁'), parseNumberInput(py1,'y₁'), parseNumberInput(px2,'x₂'), parseOptionalNumber(py2,'y₂')); setPrSteps(r.steps); setPrResult(r.result); } catch (e) { setPrSteps(errorSteps(e)); setPrResult(''); } };
  const solvePe = () => { try { const r = solvePercentage(pType, parseNumberInput(pVal,pType==='whatPercent'?'Total':'Valeur'), parseNumberInput(pPer,pType==='whatPercent'?'Partie':'Pourcentage')); setPeSteps(r.steps); setPeResult(r.result); } catch (e) { setPeSteps(errorSteps(e)); setPeResult(''); } };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        {([['stats', 'Statistiques'], ['proportion', 'Proportionnalité'], ['percent', 'Pourcentages']] as const).map(([id, label]) => (<TabButton key={id} active={tab === id} onClick={() => setTab(id as any)}>{label}</TabButton>))}
      </div>

      {tab === 'stats' && <>
        <p className="text-sm text-[--color-text-secondary]">
          Calcul complet : moyenne, médiane, écart-type, quartiles, coefficient de variation, tableau de fréquences et histogramme.
        </p>

        <div className="flex flex-wrap gap-2">
          <span className="text-[11px] text-[--color-text-muted] self-center">Exemples :</span>
          <ExampleButton onClick={() => { setValues('10, 15, 20, 25, 30'); setFreqs(''); }}>Série simple</ExampleButton>
          <ExampleButton onClick={() => { setValues('5, 10, 15, 20'); setFreqs('2, 5, 8, 3'); }}>Avec effectifs</ExampleButton>
          <ExampleButton onClick={() => { setValues('12, 14, 14, 16, 16, 16, 18, 20'); setFreqs(''); }}>Notes</ExampleButton>
          <ExampleButton onClick={() => { setValues('2, 4, 6, 8, 10, 12'); setFreqs('3, 7, 12, 9, 5, 2'); }}>Grande série</ExampleButton>
        </div>

        <InputField label="Valeurs (virgules ou ; pour décimales)" value={values} onChange={setValues} placeholder="10, 15, 20, 25, 30" />
        <InputField label="Effectifs (optionnel)" value={freqs} onChange={setFreqs} placeholder="3, 5, 8, 4, 2" />
        <SolveButton onClick={solveSt} label="Calculer les statistiques" />

        {/* Results display */}
        {statsData && <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Moyenne', value: statsData.mean.toFixed(2), sub: 'x̄' },
              { label: 'Médiane', value: `${statsData.median}`, sub: 'Q₂' },
              { label: 'Écart-type', value: statsData.stdDev.toFixed(2), sub: 'σ' },
              { label: 'CV', value: `${statsData.cv.toFixed(1)}%`, sub: 'σ/x̄' },
            ].map(c => (
              <div key={c.label} className="p-3 rounded-lg bg-[--color-inset] border border-[--color-border] text-center">
                <p className="text-lg font-bold font-mono text-[--color-accent]">{c.value}</p>
                <p className="text-[10px] text-[--color-text-muted] uppercase tracking-wider mt-0.5">{c.label} ({c.sub})</p>
              </div>
            ))}
          </div>

          {/* Quartiles bar */}
          <div className="p-4 rounded-lg bg-[--color-inset] border border-[--color-border]">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[--color-text-muted] mb-3">Quartiles et dispersion</p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div><p className="text-sm font-bold font-mono text-[--color-text]">{statsData.table[0]?.value}</p><p className="text-[10px] text-[--color-text-muted]">Min</p></div>
              <div><p className="text-sm font-bold font-mono text-[--color-accent]">{statsData.q1}</p><p className="text-[10px] text-[--color-text-muted]">Q₁ (25%)</p></div>
              <div><p className="text-sm font-bold font-mono text-[--color-ok-text]">{statsData.median}</p><p className="text-[10px] text-[--color-text-muted]">Médiane (50%)</p></div>
              <div><p className="text-sm font-bold font-mono text-[--color-accent]">{statsData.q3}</p><p className="text-[10px] text-[--color-text-muted]">Q₃ (75%)</p></div>
              <div><p className="text-sm font-bold font-mono text-[--color-text]">{statsData.table[statsData.table.length - 1]?.value}</p><p className="text-[10px] text-[--color-text-muted]">Max</p></div>
            </div>
            <div className="mt-3 flex items-center gap-3 text-xs text-[--color-text-secondary]">
              <span>IQR = Q₃ − Q₁ = <strong className="text-[--color-text]">{statsData.iqr}</strong></span>
              <span>Étendue = <strong className="text-[--color-text]">{statsData.range}</strong></span>
              <span>Mode = <strong className="text-[--color-text]">{statsData.mode.length ? statsData.mode.join(', ') : 'aucun'}</strong></span>
            </div>
          </div>

          {/* Frequency Table */}
          <FrequencyTable data={statsData.table} />

          {/* Bar Chart */}
          <BarChartViz
            data={statsData.table.map(r => ({ value: r.value, freq: r.freq }))}
            mean={statsData.mean}
            median={statsData.median}
            q1={statsData.q1}
            q3={statsData.q3}
            title="Diagramme en barres"
          />
        </>}

        <StepDisplay steps={stSteps} result={stResult} />
      </>}

      {tab === 'proportion' && <>
        <p className="text-sm text-[--color-text-secondary]">Vérifier ou calculer proportionnalité. Laissez y₂ vide pour le calculer.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <InputField label="x₁" value={px1} onChange={setPx1} placeholder="3" />
          <InputField label="y₁" value={py1} onChange={setPy1} placeholder="12" />
          <InputField label="x₂" value={px2} onChange={setPx2} placeholder="5" />
          <InputField label="y₂ (vide=chercher)" value={py2} onChange={setPy2} placeholder="" />
        </div>
        <SolveButton onClick={solvePr} label="Calculer" /><StepDisplay steps={prSteps} result={prResult} />
      </>}

      {tab === 'percent' && <>
        <p className="text-sm text-[--color-text-secondary]">Calculs de pourcentages</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[{ id: 'of', l: '% de…' }, { id: 'increase', l: 'Augmentation' }, { id: 'decrease', l: 'Diminution' }, { id: 'whatPercent', l: 'Quel %?' }].map(t => (
            <TabButton key={t.id} active={pType === t.id} onClick={() => setPType(t.id)}>{t.l}</TabButton>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <InputField label={pType === 'whatPercent' ? 'Total' : 'Valeur'} value={pVal} onChange={setPVal} placeholder="200" />
          <InputField label={pType === 'whatPercent' ? 'Partie' : '%'} value={pPer} onChange={setPPer} placeholder="15" />
        </div>
        <SolveButton onClick={solvePe} label="Calculer" /><StepDisplay steps={peSteps} result={peResult} />
      </>}
    </div>
  );
}
