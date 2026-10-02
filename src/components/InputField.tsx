interface InputFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

export default function InputField({label,value,onChange,placeholder,type='text'}:InputFieldProps){
  return <label className="field">
    <span className="field-label">{label}</span>
    <input
      type={type}
      inputMode={type==='text'?'decimal':undefined}
      autoComplete="off"
      aria-label={label}
      value={value}
      onChange={e=>onChange(e.target.value)}
      placeholder={placeholder||label}
      className="field-input math-input"
    />
  </label>;
}
