interface SolveButtonProps {
  onClick: () => void;
  label?: string;
}

export default function SolveButton({ onClick, label = 'Résoudre' }: SolveButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-full py-3 px-6 rounded-xl overflow-hidden
                 bg-[--color-accent] text-[--color-accent-text] text-sm font-semibold
                 hover:bg-[--color-accent-hover]
                 active:scale-[0.98] transition-all duration-200 cursor-pointer
                 shadow-[0_2px_20px_var(--color-accent-glow)]"
    >
      {label}
    </button>
  );
}
