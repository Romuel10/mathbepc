interface SolveButtonProps { onClick:()=>void; label?:string; }

export default function SolveButton({onClick,label='Résoudre'}:SolveButtonProps){
  return <button type="button" onClick={onClick} className="primary-button w-full">
    <span>{label}</span>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4" aria-hidden="true"><path d="M5 12h14"/><path d="m14 7 5 5-5 5"/></svg>
  </button>;
}
