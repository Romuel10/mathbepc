interface MathKeyboardProps {
  onInsert:(value:string)=>void;
  onBackspace?:()=>void;
  onClear?:()=>void;
}

const rows=[
  ['7','8','9','(',')'],
  ['4','5','6','+','−'],
  ['1','2','3','×','÷'],
  ['0',',','x','x²','√'],
  ['=','≤','≥','π','%'],
];

const operators=new Set(['+','−','×','÷','=','≤','≥','√','x²','π','%']);

export default function MathKeyboard({onInsert,onBackspace,onClear}:MathKeyboardProps){
  return <div className="math-keyboard" aria-label="Clavier mathématique">
    <div className="math-key-grid">
      {rows.flat().map(key=><button key={key} type="button" onClick={()=>onInsert(key)} className={`math-key ${operators.has(key)?'math-key-operator':''}`}>{key}</button>)}
    </div>
    <div className="math-key-actions">
      <button type="button" onClick={onBackspace} className="secondary-button">⌫ Effacer</button>
      <button type="button" onClick={onClear} className="secondary-button">Tout vider</button>
    </div>
  </div>;
}
