interface MathKeyboardProps {
  onInsert: (value: string) => void;
  onBackspace?: () => void;
  onClear?: () => void;
}

const rows = [
  ['7','8','9','(',')'],
  ['4','5','6','+','−'],
  ['1','2','3','×','÷'],
  ['0',',','x','x²','√'],
  ['=','≤','≥','π','%'],
];

export default function MathKeyboard({ onInsert, onBackspace, onClear }: MathKeyboardProps) {
  return (
    <div className="rounded-2xl border border-[--color-border] bg-[--color-inset] p-3" aria-label="Clavier mathématique">
      <div className="grid grid-cols-5 gap-2">
        {rows.flat().map(key => (
          <button key={key} type="button" onClick={() => onInsert(key)}
            className="min-h-11 rounded-xl bg-[--color-card] border border-[--color-border] text-sm font-bold font-mono hover:border-[--color-accent]/40 active:scale-95 transition-all cursor-pointer">
            {key}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mt-2">
        <button type="button" onClick={onBackspace} className="min-h-10 rounded-xl bg-[--color-btn-bg] text-xs font-semibold cursor-pointer">⌫ Effacer</button>
        <button type="button" onClick={onClear} className="min-h-10 rounded-xl bg-[--color-btn-bg] text-xs font-semibold cursor-pointer">Tout vider</button>
      </div>
    </div>
  );
}
