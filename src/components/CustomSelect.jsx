import { useState, useRef, useEffect } from 'react';
import './CustomSelect.css';

export default function CustomSelect({ value, onChange, options, placeholder = 'Select...', disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const selected = options.find(o => o.value === value);

  return (
    <div ref={ref} className={`cs-wrap${disabled ? ' cs-disabled' : ''}`}>
      <button
        type="button"
        className={`cs-button${open ? ' cs-open' : ''}${!selected ? ' cs-empty' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
      >
        <span className="cs-label">{selected ? selected.label : placeholder}</span>
        <span className="cs-chevron">›</span>
      </button>
      {open && (
        <div className="cs-menu">
          {options.length === 0 && <div className="cs-empty-msg">No options available</div>}
          {options.map(o => (
            <button
              key={o.value}
              type="button"
              className={`cs-option${o.value === value ? ' cs-selected' : ''}`}
              onClick={() => { onChange(o.value); setOpen(false); }}
            >
              {o.avatar && <span className="cs-avatar">{o.avatar}</span>}
              <span className="cs-option-label">{o.label}</span>
              {o.hint && <span className="cs-option-hint">{o.hint}</span>}
              {o.value === value && <span className="cs-check">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
