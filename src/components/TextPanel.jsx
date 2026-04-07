import { Group, Section, Slider, ColorInput, Toggle } from './Controls';

export default function TextPanel({
  state,
  defaults,
  update,
  updateDropShadow,
  addDropShadow,
  removeDropShadow,
  updateInnerShadow,
  addInnerShadow,
  removeInnerShadow,
  onCopyText,
  onPasteText,
  onCopyFrame,
  onPasteFrame,
}) {
  const s = state;
  const d = defaults;
  const di = d.textInnerShadows?.[0] || {};

  return (
    <div className="text-panel">
      {/* ===== TEXT GROUP ===== */}
      <Group title="Text Settings" enabled={s.showText} onToggle={(v) => update('showText', v)} onCopy={onCopyText} onPaste={onPasteText}>
        {/* Fill */}
        <Section title="Fill">
          <ColorInput label="Color" value={s.textColor} onChange={(v) => update('textColor', v)} defaultValue={d.textColor} />
          <Slider label="Opacity" value={s.textOpacity} min={0} max={1} step={0.01} onChange={(v) => update('textOpacity', v)} defaultValue={d.textOpacity} />
          <Toggle label="Gradient fill" checked={s.showTextGradient} onChange={(v) => update('showTextGradient', v)} defaultValue={d.showTextGradient} />
          {s.showTextGradient && (
            <>
              <ColorInput label="Top color" value={s.textGradTop} onChange={(v) => update('textGradTop', v)} defaultValue={d.textGradTop} />
              <ColorInput label="Bottom color" value={s.textGradBot} onChange={(v) => update('textGradBot', v)} defaultValue={d.textGradBot} />
              <Slider label="Angle" value={s.textGradAngle} min={0} max={360} onChange={(v) => update('textGradAngle', v)} suffix={'\u00b0'} defaultValue={d.textGradAngle} />
            </>
          )}
        </Section>

        {/* Label */}
        <Section title="Label">
          <div className="control-row">
            <label className="control-label">Text</label>
            <input type="text" className="text-input" value={s.text} onChange={(e) => update('text', e.target.value)} />
            <button className="btn-reset" onClick={() => update('text', d.text)} title="Reset" style={{ visibility: s.text !== d.text ? 'visible' : 'hidden' }}>{'\u21ba'}</button>
          </div>
          <Slider label="Font size" value={s.fontSize} min={10} max={48} onChange={(v) => update('fontSize', v)} suffix="px" defaultValue={d.fontSize} />
        </Section>

        {/* Stroke */}
        <Section title="Stroke" defaultOpen={s.showTextStroke}>
          <Toggle label="Enabled" checked={s.showTextStroke} onChange={(v) => update('showTextStroke', v)} defaultValue={d.showTextStroke} />
          {s.showTextStroke && (
            <>
              <ColorInput label="Color" value={s.textStrokeColor} onChange={(v) => update('textStrokeColor', v)} defaultValue={d.textStrokeColor} />
              <Slider label="Width" value={s.textStrokeWidth} min={0.5} max={5} step={0.5} onChange={(v) => update('textStrokeWidth', v)} suffix="px" defaultValue={d.textStrokeWidth} />
              <Slider label="Opacity" value={s.textStrokeOpacity} min={0} max={1} step={0.01} onChange={(v) => update('textStrokeOpacity', v)} defaultValue={d.textStrokeOpacity} />
              <div className="control-row">
                <label className="control-label">Method</label>
                <select className="method-select" value={s.textStrokeMethod} onChange={(e) => update('textStrokeMethod', e.target.value)}>
                  <option value="css">CSS stroke</option>
                  <option value="shadow">Shadow outline</option>
                </select>
              </div>
            </>
          )}
        </Section>

        {/* Drop Shadows */}
        <Section title="Drop Shadows" defaultOpen={(s.textDropShadows || []).length > 0}>
          <button className="btn btn-small" onClick={addDropShadow}>+ Add Shadow</button>
          {(s.textDropShadows || []).map((sh) => (
            <div key={sh.id} className="blick-item">
              <div className="blick-header">
                <Toggle label="Shadow" checked={sh.enabled} onChange={(v) => updateDropShadow(sh.id, 'enabled', v)} />
                <button className="btn btn-delete" onClick={() => removeDropShadow(sh.id)}>{'\u2715'}</button>
              </div>
              {sh.enabled && (
                <>
                  <ColorInput label="Color" value={sh.color} onChange={(v) => updateDropShadow(sh.id, 'color', v)} />
                  <Slider label="Opacity" value={sh.opacity} min={0} max={1} step={0.01} onChange={(v) => updateDropShadow(sh.id, 'opacity', v)} defaultValue={0.5} />
                  <Slider label="Angle" value={sh.angle} min={0} max={360} onChange={(v) => updateDropShadow(sh.id, 'angle', v)} suffix={'\u00b0'} defaultValue={135} />
                  <Slider label="Distance" value={sh.distance} min={0} max={20} step={0.5} onChange={(v) => updateDropShadow(sh.id, 'distance', v)} suffix="px" defaultValue={2} />
                  <Slider label="Blur" value={sh.blur} min={0} max={20} step={0.5} onChange={(v) => updateDropShadow(sh.id, 'blur', v)} suffix="px" defaultValue={3} />
                </>
              )}
            </div>
          ))}
        </Section>

        {/* Inner Shadows */}
        <Section title="Inner Shadows">
          <Toggle label="Auto perimeter" checked={s.autoPerimeterBevel} onChange={(v) => update('autoPerimeterBevel', v)} defaultValue={d.autoPerimeterBevel} />
          <button className="btn btn-small" onClick={addInnerShadow}>+ Add Inner Shadow</button>
          {(s.textInnerShadows || []).map((sh) => (
            <div key={sh.id} className="blick-item">
              <div className="blick-header">
                <Toggle label="Shadow" checked={sh.enabled} onChange={(v) => updateInnerShadow(sh.id, 'enabled', v)} />
                <button className="btn btn-delete" onClick={() => removeInnerShadow(sh.id)}>{'\u2715'}</button>
              </div>
              {sh.enabled && (
                <>
                  <ColorInput label="Color" value={sh.color} onChange={(v) => updateInnerShadow(sh.id, 'color', v)} defaultValue={di.color} />
                  <Slider label="Opacity" value={sh.opacity} min={0} max={1} step={0.01} onChange={(v) => updateInnerShadow(sh.id, 'opacity', v)} defaultValue={di.opacity} />
                  <Slider label="Angle" value={sh.angle} min={0} max={360} onChange={(v) => updateInnerShadow(sh.id, 'angle', v)} suffix={'\u00b0'} defaultValue={di.angle} />
                  <Slider label="Distance" value={sh.distance} min={0} max={10} step={0.5} onChange={(v) => updateInnerShadow(sh.id, 'distance', v)} suffix="px" defaultValue={di.distance} />
                  <Slider label="Blur" value={sh.blur} min={0} max={5} step={0.5} onChange={(v) => updateInnerShadow(sh.id, 'blur', v)} suffix="px" defaultValue={di.blur} />
                </>
              )}
            </div>
          ))}
        </Section>

        {/* Outer Glow */}
        <Section title="Outer Glow" defaultOpen={s.showTextGlow}>
          <Toggle label="Enabled" checked={s.showTextGlow} onChange={(v) => update('showTextGlow', v)} defaultValue={d.showTextGlow} />
          {s.showTextGlow && (
            <>
              <ColorInput label="Color" value={s.textGlowColor} onChange={(v) => update('textGlowColor', v)} defaultValue={d.textGlowColor} />
              <Slider label="Opacity" value={s.textGlowOpacity} min={0} max={1} step={0.01} onChange={(v) => update('textGlowOpacity', v)} defaultValue={d.textGlowOpacity} />
              <Slider label="Blur" value={s.textGlowBlur} min={0} max={30} onChange={(v) => update('textGlowBlur', v)} suffix="px" defaultValue={d.textGlowBlur} />
              <Slider label="Spread" value={s.textGlowSpread} min={0} max={10} onChange={(v) => update('textGlowSpread', v)} suffix="px" defaultValue={d.textGlowSpread} />
            </>
          )}
        </Section>

        {/* Inner Glow */}
        <Section title="Inner Glow" defaultOpen={s.showTextInnerGlow}>
          <Toggle label="Enabled" checked={s.showTextInnerGlow} onChange={(v) => update('showTextInnerGlow', v)} defaultValue={d.showTextInnerGlow} />
          {s.showTextInnerGlow && (
            <>
              <ColorInput label="Color" value={s.textInnerGlowColor} onChange={(v) => update('textInnerGlowColor', v)} defaultValue={d.textInnerGlowColor} />
              <Slider label="Opacity" value={s.textInnerGlowOpacity} min={0} max={1} step={0.01} onChange={(v) => update('textInnerGlowOpacity', v)} defaultValue={d.textInnerGlowOpacity} />
              <Slider label="Blur" value={s.textInnerGlowBlur} min={0} max={10} step={0.5} onChange={(v) => update('textInnerGlowBlur', v)} suffix="px" defaultValue={d.textInnerGlowBlur} />
            </>
          )}
        </Section>
      </Group>

      {/* ===== FRAME GROUP ===== */}
      <Group title="Outer Frame" defaultOpen={s.showFrame} enabled={s.showFrame} onToggle={(v) => update('showFrame', v)} onCopy={onCopyFrame} onPaste={onPasteFrame}>
        <Section title="Frame">
          {s.showFrame && (
            <>
              <Slider label="Thickness" value={s.frameThickness} min={2} max={12} onChange={(v) => update('frameThickness', v)} suffix="px" defaultValue={d.frameThickness} />
              <Slider label="Offset X" value={s.frameOffsetX || 0} min={-10} max={10} onChange={(v) => update('frameOffsetX', v)} suffix="px" defaultValue={d.frameOffsetX || 0} />
              <Slider label="Offset Y" value={s.frameOffsetY || 0} min={-10} max={10} onChange={(v) => update('frameOffsetY', v)} suffix="px" defaultValue={d.frameOffsetY || 0} />
              <Toggle label="Auto radius" checked={s.autoFrameRadius} onChange={(v) => update('autoFrameRadius', v)} defaultValue={d.autoFrameRadius} />
              {!s.autoFrameRadius && (
                <Slider label="Radius" value={s.frameRadius} min={4} max={70} onChange={(v) => update('frameRadius', v)} suffix="px" defaultValue={d.frameRadius} />
              )}
            </>
          )}
        </Section>

        {s.showFrame && (
          <>
            <Section title="Frame Gradient">
              <ColorInput label="Top" value={s.frameGradTop} onChange={(v) => update('frameGradTop', v)} defaultValue={d.frameGradTop} />
              <ColorInput label="Mid" value={s.frameGradMid} onChange={(v) => update('frameGradMid', v)} defaultValue={d.frameGradMid} />
              <ColorInput label="Bottom" value={s.frameGradBot} onChange={(v) => update('frameGradBot', v)} defaultValue={d.frameGradBot} />
              <Slider label="Stop 1" value={(s.frameGradStops || [0, 50, 100])[0]} min={0} max={100} onChange={(v) => update('frameGradStops', [v, s.frameGradStops[1], s.frameGradStops[2]])} suffix="%" defaultValue={(d.frameGradStops || [0, 50, 100])[0]} />
              <Slider label="Stop 2" value={(s.frameGradStops || [0, 50, 100])[1]} min={0} max={100} onChange={(v) => update('frameGradStops', [s.frameGradStops[0], v, s.frameGradStops[2]])} suffix="%" defaultValue={(d.frameGradStops || [0, 50, 100])[1]} />
              <Slider label="Stop 3" value={(s.frameGradStops || [0, 50, 100])[2]} min={0} max={100} onChange={(v) => update('frameGradStops', [s.frameGradStops[0], s.frameGradStops[1], v])} suffix="%" defaultValue={(d.frameGradStops || [0, 50, 100])[2]} />
            </Section>

            <Section title="Frame Shadow">
              <Slider label="Offset" value={s.frameShadowOffset} min={0} max={8} onChange={(v) => update('frameShadowOffset', v)} suffix="px" defaultValue={d.frameShadowOffset} />
              <ColorInput label="Color" value={s.frameShadowColor} onChange={(v) => update('frameShadowColor', v)} defaultValue={d.frameShadowColor} />
              <Slider label="Soft blur" value={s.frameSoftShadowBlur} min={0} max={20} onChange={(v) => update('frameSoftShadowBlur', v)} suffix="px" defaultValue={d.frameSoftShadowBlur} />
              <Slider label="Soft opacity" value={s.frameSoftShadowOpacity} min={0} max={0.5} step={0.01} onChange={(v) => update('frameSoftShadowOpacity', v)} defaultValue={d.frameSoftShadowOpacity} />
            </Section>

            <Section title="Inner Frame" defaultOpen={s.showFrameInner}>
              <Toggle label="Enabled" checked={s.showFrameInner} onChange={(v) => update('showFrameInner', v)} defaultValue={d.showFrameInner} />
              {s.showFrameInner && (
                <>
                  <Slider label="Thickness" value={s.frameInnerThickness} min={1} max={8} onChange={(v) => update('frameInnerThickness', v)} suffix="px" defaultValue={d.frameInnerThickness} />
                  <Toggle label="Auto radius" checked={s.autoFrameInnerRadius !== false} onChange={(v) => update('autoFrameInnerRadius', v)} defaultValue={d.autoFrameInnerRadius} />
                  {s.autoFrameInnerRadius === false && (
                    <Slider label="Radius" value={s.frameInnerRadius || 0} min={0} max={50} onChange={(v) => update('frameInnerRadius', v)} suffix="px" defaultValue={d.frameInnerRadius} />
                  )}
                  <ColorInput label="Color" value={s.frameInnerColor} onChange={(v) => update('frameInnerColor', v)} defaultValue={d.frameInnerColor} />
                  <Toggle label="Gradient" checked={s.frameInnerGradEnabled} onChange={(v) => update('frameInnerGradEnabled', v)} defaultValue={d.frameInnerGradEnabled} />
                  {s.frameInnerGradEnabled && (
                    <>
                      <ColorInput label="Grad top" value={s.frameInnerGradTop || '#c8a878'} onChange={(v) => update('frameInnerGradTop', v)} defaultValue={d.frameInnerGradTop} />
                      <ColorInput label="Grad bottom" value={s.frameInnerGradBot || '#a08058'} onChange={(v) => update('frameInnerGradBot', v)} defaultValue={d.frameInnerGradBot} />
                    </>
                  )}
                  <Toggle label="Shadow" checked={s.frameInnerShadowEnabled} onChange={(v) => update('frameInnerShadowEnabled', v)} defaultValue={d.frameInnerShadowEnabled} />
                  {s.frameInnerShadowEnabled && (
                    <>
                      <Toggle label="Inset" checked={s.frameInnerShadowInset !== false} onChange={(v) => update('frameInnerShadowInset', v)} defaultValue={d.frameInnerShadowInset} />
                      <ColorInput label="Shadow clr" value={s.frameInnerShadowColor || '#000000'} onChange={(v) => update('frameInnerShadowColor', v)} defaultValue={d.frameInnerShadowColor} />
                      <Slider label="Shadow blur" value={s.frameInnerShadowBlur ?? 4} min={0} max={15} onChange={(v) => update('frameInnerShadowBlur', v)} suffix="px" defaultValue={d.frameInnerShadowBlur} />
                      <Slider label="Shadow opa" value={s.frameInnerShadowOpacity ?? 0.3} min={0} max={1} step={0.01} onChange={(v) => update('frameInnerShadowOpacity', v)} defaultValue={d.frameInnerShadowOpacity} />
                    </>
                  )}
                </>
              )}
            </Section>
          </>
        )}
      </Group>
    </div>
  );
}
