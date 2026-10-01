interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

export default function InputField({ label, value, onChange, placeholder, type = 'text' }: InputFieldProps) {
  return (
    <div className="group">
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-[--color-text-muted] mb-1.5 group-focus-within:text-[--color-accent] transition-colors">{label}</label>
      <input
        type={type}
        inputMode={type === 'text' ? 'decimal' : undefined}
        autoComplete="off"
        aria-label={label}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || label}
        className="w-full px-3.5 py-2.5 rounded-xl
                   border border-[--color-input-border]
                   bg-[--color-input-bg]
                   text-[--color-text] font-mono text-sm
                   focus:outline-none focus:ring-2 focus:ring-[--color-input-focus] focus:border-[--color-accent]/50
                   placeholder:text-[--color-text-muted]/60
                   transition-all duration-200"
      />
    </div>
  );
}
