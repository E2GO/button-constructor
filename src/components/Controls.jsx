import { useState } from 'react';

function getStepOptions(defaultStep) {
  if (defaultStep >= 1) return [1, 2, 5, 10];
  if (defaultStep >= 0.5) return [0.05, 0.1, 0.25, 0.5, 1];
  return [0.01, 0.02, 0.05, 0.1, 0.25];
}

function ResetBtn({ show, onClick }) {
  return (
    <button
      className="btn-reset"
      onClick={onClick}
      title="Reset to default"
      style={{ visibility: show ? 'visible' : 'hidden' }}
    >
      ↺
    </button>
  );
}

export function Group({ title, children, defaultOpen = true, enabled, onToggle, onCopy, onPaste }) {
  const [open, setOpen] = useState(defaultOpen);
  const hasToggle = onToggle !== undefined;
  return (
    <div className="group">
      <div className="group-header" onClick={() => setOpen(!open)}>
        <span className="group-arrow">{open ? '\u25bc' : '\u25b6'}</span>
        <span className="group-title">{title}</span>
        {(onCopy || onPaste) && (
          <div className="group-actions" onClick={(e) => e.stopPropagation()}>
            {onCopy && <button className="btn-group-action" onClick={onCopy} title={`Copy ${title}`}>Copy</button>}
            {onPaste && <button className="btn-group-action" onClick={onPaste} title={`Paste ${title}`}>Paste</button>}
          </div>
        )}
        {hasToggle && (
          <div
            className={`toggle toggle-sm ${enabled ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggle(!enabled); }}
          >
            <div className="toggle-thumb" />
          </div>
        )}
      </div>
      {open && <div className="group-body">{children}</div>}
    </div>
  );
}

export function Section({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section">
      <div className="section-header" onClick={() => setOpen(!open)}>
        <span className="section-arrow">{open ? '\u25be' : '\u25b8'}</span>
        <span>{title}</span>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, suffix = '', defaultValue }) {
  const [currentStep, setCurrentStep] = useState(step);
  const stepOptions = getStepOptions(step);

  const handleNumber = (e) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) onChange(v);
  };

  const displayVal = currentStep < 1 ? parseFloat(Number(value).toFixed(4)) : value;
  const modified = defaultValue !== undefined && value !== defaultValue;

  return (
    <div className="control-row">
      <label className="control-label">{label}</label>
      <input
        type="range"
        min={min}
        max={max}
        step={currentStep}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      <select
        className="step-select"
        value={currentStep}
        title="Step size"
        onChange={(e) => setCurrentStep(parseFloat(e.target.value))}
      >
        {stepOptions.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <input
        type="number"
        className="value-input"
        min={min}
        max={max}
        step={currentStep}
        value={displayVal}
        onChange={handleNumber}
      />
      {suffix && <span className="value-suffix">{suffix}</span>}
      <ResetBtn show={modified} onClick={() => onChange(defaultValue)} />
    </div>
  );
}

export function ColorInput({ label, value, onChange, defaultValue }) {
  const modified = defaultValue !== undefined && value !== defaultValue;
  return (
    <div className="control-row">
      <label className="control-label">{label}</label>
      <div className="color-wrapper">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <span className="control-value">{value}</span>
      </div>
      <ResetBtn show={modified} onClick={() => onChange(defaultValue)} />
    </div>
  );
}

export function Toggle({ label, checked, onChange, defaultValue }) {
  const modified = defaultValue !== undefined && checked !== defaultValue;
  return (
    <div className="control-row">
      <label className="control-label">{label}</label>
      <div className={`toggle ${checked ? 'active' : ''}`} onClick={() => onChange(!checked)}>
        <div className="toggle-thumb" />
      </div>
      <ResetBtn show={modified} onClick={() => onChange(defaultValue)} />
    </div>
  );
}
