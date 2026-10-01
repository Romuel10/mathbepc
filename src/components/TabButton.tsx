export default function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-[--color-accent] text-[--color-accent-text] shadow-[0_2px_12px_var(--color-accent-glow)]'
          : 'bg-[--color-btn-bg] text-[--color-btn-text] hover:bg-[--color-btn-bg-hover] hover:text-[--color-text]'
      }`}
    >
      {children}
    </button>
  );
}

export function ExampleButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-lg
                 bg-[--color-btn-bg] border border-transparent
                 text-[11px] font-mono text-[--color-btn-text]
                 hover:bg-[--color-accent-subtle] hover:text-[--color-accent] hover:border-[--color-accent]/20
                 transition-all duration-200 cursor-pointer"
    >
      {children}
    </button>
  );
}

export function OpButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-11 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-[--color-accent] text-[--color-accent-text] shadow-[0_2px_12px_var(--color-accent-glow)]'
          : 'bg-[--color-btn-bg] text-[--color-btn-text] hover:bg-[--color-btn-bg-hover] hover:text-[--color-text]'
      }`}
    >
      {children}
    </button>
  );
}

export function SignButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer ${
        active
          ? 'bg-[--color-accent] text-[--color-accent-text] shadow-[0_2px_12px_var(--color-accent-glow)]'
          : 'bg-[--color-btn-bg] text-[--color-btn-text] hover:bg-[--color-btn-bg-hover] hover:text-[--color-text]'
      }`}
    >
      {children}
    </button>
  );
}
