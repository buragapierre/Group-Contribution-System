import { useState, useRef, useEffect } from 'react';
import './CustomDateInput.css';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toStr(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function parseStr(value) {
  if (!value) return null;
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export default function CustomDateInput({ value, onChange, min, placeholder = 'Select a date...', disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const initial = parseStr(value) || new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  useEffect(() => {
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const minDate = parseStr(min);

  const shift = (delta) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const label = value
    ? parseStr(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : placeholder;

  return (
    <div ref={ref} className={`cd-wrap${disabled ? ' cd-disabled' : ''}`}>
      <button
        type="button"
        className={`cd-button${open ? ' cd-open' : ''}${!value ? ' cd-empty' : ''}`}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
      >
        <span className="cd-label">{label}</span>
        <span className="cd-cal-icon">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </span>
      </button>
      {open && (
        <div className="cd-menu">
          <div className="cd-head">
            <button type="button" className="cd-nav" onClick={() => shift(-1)}>‹</button>
            <strong>{MONTHS[viewMonth]} {viewYear}</strong>
            <button type="button" className="cd-nav" onClick={() => shift(1)}>›</button>
          </div>
          <div className="cd-grid cd-dow">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <span key={i}>{d}</span>)}
          </div>
          <div className="cd-grid">
            {Array.from({ length: firstDow }).map((_, i) => <span key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(viewYear, viewMonth, day);
              const str = toStr(viewYear, viewMonth, day);
              const isPast = minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());
              const isSel = value === str;
              const isToday = toStr(date.getFullYear(), date.getMonth(), day) === toStr(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  className={`cd-day${isSel ? ' cd-sel' : ''}${isToday && !isSel ? ' cd-today' : ''}`}
                  onClick={() => { onChange(str); setOpen(false); }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
