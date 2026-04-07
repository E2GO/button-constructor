import { Group, Section, Slider, ColorInput, Toggle } from './Controls';

const BLEND_MODES = ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard-light', 'color-dodge', 'color-burn'];

export default function ControlPanel({
  state,
  defaults,
  update,
  updateBodyLayer,
  updateBodyLayerGradColor,
  updateBodyLayerGradStop,
  addBodyLayer,
  removeBodyLayer,
  moveBodyLayer,
  updateBlick,
  addBlick,
  removeBlick,
  updateBadge,
  addBadge,
  removeBadge,
  onCopyButton,
  onPasteButton,
  onCopyStates,
  onPasteStates,
  directEditTarget,
  setDirectEditTarget,
}) {
  const isEditing = (type, id) => directEditTarget?.type === type && directEditTarget?.id === id;
  const s = state;
  const d = defaults;
  const db = d.blicks[0] || {};
  const dl = (d.bodyLayers || [])[0] || {};

  const svgMode = s.renderMode === 'svg';
  const eff = s.svgEffects || {};
  const updateEff = (key, val) => update('svgEffects', { ...eff, [key]: val });

  return (
    <div className="control-panel">
      <Group title="Button Settings" enabled={s.showButton !== false} onToggle={(v) => update('showButton', v)} onCopy={onCopyButton} onPaste={onPasteButton}>
      {/* 1. Button Shape */}
      <Section title="Button Shape">
        <Toggle label="Auto size" checked={s.autoSize} onChange={(v) => update('autoSize', v)} defaultValue={d.autoSize} />
        {/* SVG Shape selector (inline, right here with size controls) */}
        {svgMode && (
          <>
            <div className="control-row">
              <label className="control-label">Shape</label>
              <select className="method-select" value={s.svgShape || 'roundrect'} onChange={(e) => update('svgShape', e.target.value)}>
                <option value="roundrect">Rounded Rect</option>
                <option value="pill">Pill</option>
                <option value="squircle">Squircle</option>
                <option value="diamond">Diamond</option>
                <option value="hexagon">Hexagon</option>
                <option value="star">Star</option>
                <option value="shield">Shield</option>
                <option value="heart">Heart</option>
                <option value="cloud">Cloud</option>
                <option value="custom">Custom Path</option>
              </select>
            </div>
            {s.svgShape === 'pill' && <Slider label="Squeeze" value={s.pillSqueeze ?? 1} min={0.2} max={1} step={0.05} onChange={(v) => update('pillSqueeze', v)} defaultValue={1} />}
            {s.svgShape === 'squircle' && <Slider label="Roundness" value={s.squircleN || 4.5} min={2} max={10} step={0.5} onChange={(v) => update('squircleN', v)} defaultValue={4.5} />}
            {s.svgShape === 'diamond' && <Slider label="Corner R" value={s.diamondRadius || 0} min={0} max={30} onChange={(v) => update('diamondRadius', v)} suffix="px" defaultValue={0} />}
            {s.svgShape === 'hexagon' && (<><Slider label="Corner R" value={s.hexRadius || 0} min={0} max={20} onChange={(v) => update('hexRadius', v)} suffix="px" defaultValue={0} /><Slider label="Rotation" value={s.hexRotation || 0} min={0} max={60} onChange={(v) => update('hexRotation', v)} suffix={'\u00b0'} defaultValue={0} /></>)}
            {s.svgShape === 'star' && (<><Slider label="Points" value={s.starPoints || 5} min={3} max={12} onChange={(v) => update('starPoints', v)} defaultValue={5} /><Slider label="Inner ratio" value={s.starInnerRatio || 0.4} min={0.1} max={0.9} step={0.05} onChange={(v) => update('starInnerRatio', v)} defaultValue={0.4} /><Slider label="Corner R" value={s.starRadius || 0} min={0} max={15} onChange={(v) => update('starRadius', v)} suffix="px" defaultValue={0} /><Slider label="Rotation" value={s.starRotation || 0} min={-180} max={180} onChange={(v) => update('starRotation', v)} suffix={'\u00b0'} defaultValue={0} /></>)}
            {s.svgShape === 'shield' && (<><Slider label="Top width" value={s.shieldTopWidth ?? 1} min={0.5} max={1.5} step={0.05} onChange={(v) => update('shieldTopWidth', v)} defaultValue={1} /><Slider label="Point depth" value={s.shieldPointDepth ?? 1} min={0.5} max={1.5} step={0.05} onChange={(v) => update('shieldPointDepth', v)} defaultValue={1} /></>)}
            {s.svgShape === 'heart' && <Slider label="Fatness" value={s.heartFatness ?? 0.5} min={0.3} max={0.8} step={0.05} onChange={(v) => update('heartFatness', v)} defaultValue={0.5} />}
            {s.svgShape === 'cloud' && <Slider label="Bumps" value={s.cloudBumps ?? 4} min={2} max={8} onChange={(v) => update('cloudBumps', v)} defaultValue={4} />}
            {s.svgShape === 'custom' && (
              <div className="control-row" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <label className="control-label">SVG Path (d=)</label>
                <textarea className="text-input" rows={3} style={{ fontSize: 10, fontFamily: 'monospace', resize: 'vertical' }} value={s.svgCustomPath || ''} onChange={(e) => update('svgCustomPath', e.target.value)} placeholder="M10,20 L30,40..." />
              </div>
            )}
          </>
        )}
        {!s.autoSize && (
          <>
            <Slider label="Width" value={s.btnWidth} min={60} max={400} onChange={(v) => update('btnWidth', v)} suffix="px" defaultValue={d.btnWidth} />
            <Slider label="Height" value={s.btnHeight} min={30} max={120} onChange={(v) => update('btnHeight', v)} suffix="px" defaultValue={d.btnHeight} />
          </>
        )}
        <Slider label="Border radius" value={s.borderRadius} min={2} max={60} onChange={(v) => update('borderRadius', v)} suffix="px" defaultValue={d.borderRadius} />
        <Slider label="3D depth" value={s.depthOffset} min={0} max={12} onChange={(v) => update('depthOffset', v)} suffix="px" defaultValue={d.depthOffset} />
        <ColorInput label="Depth color" value={s.depthColor} onChange={(v) => update('depthColor', v)} defaultValue={d.depthColor} />
        <ColorInput label="Ring color" value={s.ringColor} onChange={(v) => update('ringColor', v)} defaultValue={d.ringColor} />
      </Section>

      {/* 2. Body Layers */}
      <Section title="Body Layers">
        <button className="btn btn-small" onClick={addBodyLayer}>+ Add Layer</button>
        {(s.bodyLayers || []).map((layer, idx) => (
          <div key={layer.id} className="blick-item">
            <div className="blick-header">
              <Toggle label={layer.name || `Layer ${idx + 1}`} checked={layer.enabled} onChange={(v) => updateBodyLayer(layer.id, 'enabled', v)} />
              <div className="layer-actions">
                <button className="btn btn-tiny" onClick={() => moveBodyLayer(layer.id, -1)} title="Move down">{'\u2193'}</button>
                <button className="btn btn-tiny" onClick={() => moveBodyLayer(layer.id, 1)} title="Move up">{'\u2191'}</button>
                {(s.bodyLayers || []).length > 1 && (
                  <button className="btn btn-delete" onClick={() => removeBodyLayer(layer.id)}>{'\u2715'}</button>
                )}
              </div>
            </div>
            {layer.enabled && (
              <>
                <div className="control-row">
                  <label className="control-label">Type</label>
                  <select className="method-select" value={layer.type} onChange={(e) => updateBodyLayer(layer.id, 'type', e.target.value)}>
                    <option value="gradient">Gradient</option>
                    <option value="solid">Solid</option>
                    <option value="pattern">Pattern</option>
                  </select>
                </div>
                {layer.type === 'solid' ? (
                  <ColorInput label="Color" value={layer.color || '#ffffff'} onChange={(v) => updateBodyLayer(layer.id, 'color', v)} />
                ) : layer.type === 'pattern' ? (
                  <>
                    <div className="control-row">
                      <label className="control-label">Pattern</label>
                      <select className="method-select" value={layer.pattern || 'stripes'} onChange={(e) => updateBodyLayer(layer.id, 'pattern', e.target.value)}>
                        <option value="stripes">Stripes</option>
                        <option value="dots">Dots</option>
                        <option value="grid">Grid</option>
                        <option value="zigzag">Zigzag</option>
                        <option value="checker">Checker</option>
                        <option value="diamonds">Diamonds</option>
                      </select>
                    </div>
                    <ColorInput label="Color 1" value={layer.patternColor1 || '#ffffff'} onChange={(v) => updateBodyLayer(layer.id, 'patternColor1', v)} />
                    <ColorInput label="Color 2" value={layer.patternColor2 || '#000000'} onChange={(v) => updateBodyLayer(layer.id, 'patternColor2', v)} />
                    <Slider label="Scale" value={layer.patternScale ?? 10} min={2} max={60} onChange={(v) => updateBodyLayer(layer.id, 'patternScale', v)} suffix="px" defaultValue={10} />
                    <Slider label="Rotation" value={layer.patternRotation ?? 0} min={-180} max={180} onChange={(v) => updateBodyLayer(layer.id, 'patternRotation', v)} suffix={'\u00b0'} defaultValue={0} />
                  </>
                ) : (
                  <>
                    {(layer.gradColors || []).map((color, i) => (
                      <div key={i} className="gradient-row">
                        <ColorInput label={`Color ${i + 1}`} value={color} onChange={(c) => updateBodyLayerGradColor(layer.id, i, c)} />
                        <Slider label="Pos" value={(layer.gradStops || [])[i] || 0} min={0} max={100} onChange={(v) => updateBodyLayerGradStop(layer.id, i, v)} suffix="%" defaultValue={(dl.gradStops || [])[i]} />
                      </div>
                    ))}
                    <Slider label="Angle" value={layer.gradAngle ?? 180} min={0} max={360} onChange={(v) => updateBodyLayer(layer.id, 'gradAngle', v)} suffix={'\u00b0'} defaultValue={180} />
                  </>
                )}
                <Slider label="Opacity" value={layer.opacity ?? 1} min={0} max={1} step={0.01} onChange={(v) => updateBodyLayer(layer.id, 'opacity', v)} defaultValue={1} />
                <div className="control-row">
                  <label className="control-label">Blend</label>
                  <select className="method-select" value={layer.blendMode || 'normal'} onChange={(e) => updateBodyLayer(layer.id, 'blendMode', e.target.value)}>
                    {BLEND_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        ))}
      </Section>

      {/* 3. Top Shine */}
      <Section title="Top Shine">
        <Toggle label="Enabled" checked={s.showShine} onChange={(v) => update('showShine', v)} defaultValue={d.showShine} />
        {s.showShine && (
          <>
            <ColorInput label="Color" value={s.shineColor} onChange={(v) => update('shineColor', v)} defaultValue={d.shineColor} />
            <Slider label="Height" value={s.shineHeight} min={10} max={70} onChange={(v) => update('shineHeight', v)} suffix="%" defaultValue={d.shineHeight} />
            <Slider label="Top opacity" value={s.shineOpacityTop} min={0} max={1} step={0.01} onChange={(v) => update('shineOpacityTop', v)} defaultValue={d.shineOpacityTop} />
            <Slider label="Mid opacity" value={s.shineOpacityMid} min={0} max={0.5} step={0.01} onChange={(v) => update('shineOpacityMid', v)} defaultValue={d.shineOpacityMid} />
            <Slider label="Blur" value={s.shineBlur || 0} min={0} max={20} onChange={(v) => update('shineBlur', v)} suffix="px" defaultValue={d.shineBlur || 0} />
            <Slider label="Rotation" value={s.shineRotation || 0} min={-180} max={180} onChange={(v) => update('shineRotation', v)} suffix={'\u00b0'} defaultValue={d.shineRotation || 0} />
          </>
        )}
      </Section>

      {/* 4. Bottom Darken */}
      <Section title="Bottom Darken">
        <Toggle label="Enabled" checked={s.showDarken} onChange={(v) => update('showDarken', v)} defaultValue={d.showDarken} />
        {s.showDarken && (
          <>
            <ColorInput label="Color" value={s.darkenColor} onChange={(v) => update('darkenColor', v)} defaultValue={d.darkenColor} />
            <Slider label="Height" value={s.darkenHeight} min={0} max={60} onChange={(v) => update('darkenHeight', v)} suffix="%" defaultValue={d.darkenHeight} />
            <Slider label="Opacity" value={s.darkenOpacity} min={0} max={0.4} step={0.01} onChange={(v) => update('darkenOpacity', v)} defaultValue={d.darkenOpacity} />
            <Slider label="Blur" value={s.darkenBlur || 0} min={0} max={20} onChange={(v) => update('darkenBlur', v)} suffix="px" defaultValue={d.darkenBlur || 0} />
            <Slider label="Rotation" value={s.darkenRotation || 0} min={-180} max={180} onChange={(v) => update('darkenRotation', v)} suffix={'\u00b0'} defaultValue={d.darkenRotation || 0} />
          </>
        )}
      </Section>

      {/* 5. Inset Light */}
      <Section title="Inset Light">
        <Toggle label="Enabled" checked={s.showInsetLight} onChange={(v) => update('showInsetLight', v)} defaultValue={d.showInsetLight} />
        {s.showInsetLight && (
          <>
            <ColorInput label="Color" value={s.insetLightColor} onChange={(v) => update('insetLightColor', v)} defaultValue={d.insetLightColor} />
            <Slider label="Blur" value={s.insetLightBlur} min={0} max={30} onChange={(v) => update('insetLightBlur', v)} suffix="px" defaultValue={d.insetLightBlur} />
            <Slider label="Opacity" value={s.insetLightOpacity} min={0} max={0.6} step={0.01} onChange={(v) => update('insetLightOpacity', v)} defaultValue={d.insetLightOpacity} />
            <Slider label="Rotation" value={s.insetLightRotation || 0} min={-180} max={180} onChange={(v) => update('insetLightRotation', v)} suffix={'\u00b0'} defaultValue={d.insetLightRotation || 0} />
          </>
        )}
      </Section>

      {/* 6. Inset Dark */}
      <Section title="Inset Dark">
        <Toggle label="Enabled" checked={s.showInsetDark} onChange={(v) => update('showInsetDark', v)} defaultValue={d.showInsetDark} />
        {s.showInsetDark && (
          <>
            <ColorInput label="Color" value={s.insetDarkColor} onChange={(v) => update('insetDarkColor', v)} defaultValue={d.insetDarkColor} />
            <Slider label="Blur" value={s.insetDarkBlur} min={0} max={30} onChange={(v) => update('insetDarkBlur', v)} suffix="px" defaultValue={d.insetDarkBlur} />
            <Slider label="Opacity" value={s.insetDarkOpacity} min={0} max={0.6} step={0.01} onChange={(v) => update('insetDarkOpacity', v)} defaultValue={d.insetDarkOpacity} />
            <Slider label="Rotation" value={s.insetDarkRotation || 0} min={-180} max={180} onChange={(v) => update('insetDarkRotation', v)} suffix={'\u00b0'} defaultValue={d.insetDarkRotation || 0} />
          </>
        )}
      </Section>

      {/* 7. Specular Blicks */}
      <Section title="Specular Blicks">
        <button className="btn btn-small" onClick={addBlick}>+ Add Blick</button>
        {s.blicks.map((blick) => (
          <div key={blick.id} className={`blick-item ${isEditing('blick', blick.id) ? 'blick-editing' : ''}`}>
            <div className="blick-header">
              <Toggle label="Blick" checked={blick.enabled} onChange={(v) => updateBlick(blick.id, 'enabled', v)} defaultValue={db.enabled} />
              <button
                className={`btn-edit ${isEditing('blick', blick.id) ? 'active' : ''}`}
                onClick={() => setDirectEditTarget(isEditing('blick', blick.id) ? null : { type: 'blick', id: blick.id, label: 'Blick' })}
                title="Edit on preview"
              >{isEditing('blick', blick.id) ? '\u270e ON' : '\u270e'}</button>
              <button className="btn btn-delete" onClick={() => removeBlick(blick.id)}>{'\u2715'}</button>
            </div>
            {blick.enabled && (
              <>
                <div className="control-row">
                  <label className="control-label">Shape</label>
                  <div className="pos-picker">
                    {['circle', 'ellipse', 'rect', 'diamond', 'star', 'line'].map((sh) => (
                      <button key={sh} className={`btn btn-tiny ${(blick.shape || 'circle') === sh ? 'active' : ''}`} onClick={() => {
                        updateBlick(blick.id, 'shape', sh);
                        if (sh === 'circle') updateBlick(blick.id, 'height', blick.width || blick.size || 12);
                      }}>
                        {sh === 'circle' ? '\u25cf' : sh === 'ellipse' ? '\u2b2d' : sh === 'rect' ? '\u25a0' : sh === 'diamond' ? '\u25c6' : sh === 'star' ? '\u2605' : '\u2014'}
                      </button>
                    ))}
                  </div>
                </div>
                <ColorInput label="Color" value={blick.color} onChange={(v) => updateBlick(blick.id, 'color', v)} defaultValue={db.color} />
                <Slider label="Scale" value={blick.scale ?? 1} min={0.1} max={5} step={0.1} onChange={(v) => updateBlick(blick.id, 'scale', v)} suffix="x" defaultValue={1} />
                {(blick.shape || 'circle') === 'circle' ? (
                  <Slider label="Size" value={blick.width || blick.size || 12} min={1} max={300} step={0.5} onChange={(v) => { updateBlick(blick.id, 'width', v); updateBlick(blick.id, 'height', v); }} suffix="px" defaultValue={db.width || 12} />
                ) : (
                  <>
                    <Slider label="Width" value={blick.width || blick.size || 12} min={1} max={300} step={0.5} onChange={(v) => updateBlick(blick.id, 'width', v)} suffix="px" defaultValue={db.width || 12} />
                    <Slider label="Height" value={blick.height || blick.size || 12} min={1} max={300} step={0.5} onChange={(v) => updateBlick(blick.id, 'height', v)} suffix="px" defaultValue={db.height || 12} />
                  </>
                )}
                <Slider label="Blur" value={blick.blur} min={0} max={20} step={0.5} onChange={(v) => updateBlick(blick.id, 'blur', v)} suffix="px" defaultValue={db.blur} />
                <Slider label="Opacity" value={blick.opacity} min={0} max={1} step={0.01} onChange={(v) => updateBlick(blick.id, 'opacity', v)} defaultValue={db.opacity} />
                <Slider label="Rotation" value={blick.rotation || 0} min={-180} max={180} onChange={(v) => updateBlick(blick.id, 'rotation', v)} suffix={'\u00b0'} defaultValue={0} />
                <Slider label="Top" value={blick.topPct} min={0} max={100} onChange={(v) => updateBlick(blick.id, 'topPct', v)} suffix="%" defaultValue={db.topPct} />
                <Slider label="Left" value={blick.leftPct} min={0} max={100} onChange={(v) => updateBlick(blick.id, 'leftPct', v)} suffix="%" defaultValue={db.leftPct} />
              </>
            )}
          </div>
        ))}
      </Section>

      {/* 8. Icon */}
      <Section title="Icon" defaultOpen={s.showIcon}>
        <Toggle label="Show icon" checked={s.showIcon} onChange={(v) => update('showIcon', v)} defaultValue={d.showIcon} />
        {s.showIcon && (
          <div className={`icon-edit-area ${isEditing('icon', 'icon') ? 'blick-editing' : ''}`}>
            <div className="control-row">
              <label className="control-label">Quick pick</label>
              <div className="emoji-picker">
                {['\u2b50', '\ud83e\ude99', '\ud83d\udc8e', '\ud83d\udd12', '\u25b6\ufe0f', '\u26a1', '\ud83c\udf81', '\ud83d\uded2', '\u2764\ufe0f', '\ud83c\udfc6', '\ud83d\udca1', '\ud83d\udcd6'].map((e) => (
                  <button key={e} className={`emoji-btn ${s.iconEmoji === e ? 'active' : ''}`} onClick={() => update('iconEmoji', e)}>{e}</button>
                ))}
              </div>
            </div>
            <div className="control-row">
              <label className="control-label">Custom</label>
              <input type="text" className="text-input" value={s.iconEmoji} onChange={(e) => update('iconEmoji', e.target.value)} style={{ width: 60 }} />
            </div>
            <Toggle label="Free position" checked={s.iconFreePosition} onChange={(v) => update('iconFreePosition', v)} defaultValue={d.iconFreePosition} />
            {s.iconFreePosition ? (
              <>
                <button
                  className={`btn-edit ${isEditing('icon', 'icon') ? 'active' : ''}`}
                  onClick={() => setDirectEditTarget(isEditing('icon', 'icon') ? null : { type: 'icon', id: 'icon', label: 'Icon' })}
                  title="Edit on preview"
                  style={{ marginBottom: 4 }}
                >{isEditing('icon', 'icon') ? '\u270e Editing...' : '\u270e Edit on preview'}</button>
                <Slider label="X offset" value={s.iconOffsetX || 0} min={-50} max={50} onChange={(v) => update('iconOffsetX', v)} suffix="%" defaultValue={d.iconOffsetX || 0} />
                <Slider label="Y offset" value={s.iconOffsetY || 0} min={-50} max={50} onChange={(v) => update('iconOffsetY', v)} suffix="%" defaultValue={d.iconOffsetY || 0} />
              </>
            ) : (
              <>
                <div className="control-row">
                  <label className="control-label">Position</label>
                  <div className="pos-picker">
                    {['left', 'right', 'top', 'bottom'].map((p) => (
                      <button key={p} className={`btn btn-tiny ${s.iconPosition === p ? 'active' : ''}`} onClick={() => update('iconPosition', p)}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
                    ))}
                  </div>
                </div>
                <Slider label="Gap" value={s.iconGap} min={0} max={20} onChange={(v) => update('iconGap', v)} suffix="px" defaultValue={d.iconGap} />
              </>
            )}
            <Slider label="Size" value={s.iconSize} min={12} max={48} onChange={(v) => update('iconSize', v)} suffix="px" defaultValue={d.iconSize} />
            <Slider label="Opacity" value={s.iconOpacity} min={0} max={1} step={0.01} onChange={(v) => update('iconOpacity', v)} defaultValue={d.iconOpacity} />
            <Toggle label="Shadow" checked={s.iconShadowEnabled} onChange={(v) => update('iconShadowEnabled', v)} defaultValue={d.iconShadowEnabled} />
            {s.iconShadowEnabled && (
              <>
                <ColorInput label="Shadow color" value={s.iconShadowColor} onChange={(v) => update('iconShadowColor', v)} defaultValue={d.iconShadowColor} />
                <Slider label="Shadow blur" value={s.iconShadowBlur} min={0} max={20} onChange={(v) => update('iconShadowBlur', v)} suffix="px" defaultValue={d.iconShadowBlur} />
                <Slider label="Shadow size" value={s.iconShadowSpread ?? 0} min={0} max={10} onChange={(v) => update('iconShadowSpread', v)} suffix="px" defaultValue={d.iconShadowSpread ?? 0} />
                <Slider label="Shadow X" value={s.iconShadowOffsetX} min={-10} max={10} onChange={(v) => update('iconShadowOffsetX', v)} suffix="px" defaultValue={d.iconShadowOffsetX} />
                <Slider label="Shadow Y" value={s.iconShadowOffsetY} min={-10} max={10} onChange={(v) => update('iconShadowOffsetY', v)} suffix="px" defaultValue={d.iconShadowOffsetY} />
                <Slider label="Shadow opacity" value={s.iconShadowOpacity} min={0} max={1} step={0.01} onChange={(v) => update('iconShadowOpacity', v)} defaultValue={d.iconShadowOpacity} />
              </>
            )}
            <Toggle label="Stroke" checked={s.iconStrokeEnabled} onChange={(v) => update('iconStrokeEnabled', v)} defaultValue={d.iconStrokeEnabled} />
            {s.iconStrokeEnabled && (
              <>
                <ColorInput label="Stroke color" value={s.iconStrokeColor} onChange={(v) => update('iconStrokeColor', v)} defaultValue={d.iconStrokeColor} />
                <Slider label="Stroke width" value={s.iconStrokeWidth} min={0.5} max={4} step={0.5} onChange={(v) => update('iconStrokeWidth', v)} suffix="px" defaultValue={d.iconStrokeWidth} />
                <Slider label="Stroke opacity" value={s.iconStrokeOpacity ?? 1} min={0} max={1} step={0.01} onChange={(v) => update('iconStrokeOpacity', v)} defaultValue={1} />
                <Slider label="Stroke blur" value={s.iconStrokeBlur ?? 0} min={0} max={5} step={0.5} onChange={(v) => update('iconStrokeBlur', v)} suffix="px" defaultValue={0} />
              </>
            )}
            <Toggle label="Glow" checked={s.iconGlowEnabled} onChange={(v) => update('iconGlowEnabled', v)} defaultValue={d.iconGlowEnabled} />
            {s.iconGlowEnabled && (
              <>
                <ColorInput label="Glow color" value={s.iconGlowColor} onChange={(v) => update('iconGlowColor', v)} defaultValue={d.iconGlowColor} />
                <Slider label="Glow blur" value={s.iconGlowBlur} min={0} max={20} onChange={(v) => update('iconGlowBlur', v)} suffix="px" defaultValue={d.iconGlowBlur} />
                <Slider label="Glow opacity" value={s.iconGlowOpacity} min={0} max={1} step={0.01} onChange={(v) => update('iconGlowOpacity', v)} defaultValue={d.iconGlowOpacity} />
              </>
            )}
          </div>
        )}
      </Section>

      {/* 9. Badges */}
      <Section title="Badges" defaultOpen={(s.badges || []).length > 0}>
        <button className="btn btn-small" onClick={addBadge}>+ Add Badge</button>
        {(s.badges || []).map((badge) => (
          <div key={badge.id} className={`blick-item ${isEditing('badge', badge.id) ? 'blick-editing' : ''}`}>
            <div className="blick-header">
              <Toggle label="Badge" checked={badge.enabled} onChange={(v) => updateBadge(badge.id, 'enabled', v)} />
              <button
                className={`btn-edit ${isEditing('badge', badge.id) ? 'active' : ''}`}
                onClick={() => setDirectEditTarget(isEditing('badge', badge.id) ? null : { type: 'badge', id: badge.id, label: `Badge: ${badge.text}` })}
                title="Edit on preview"
              >{isEditing('badge', badge.id) ? '\u270e ON' : '\u270e'}</button>
              <button className="btn btn-delete" onClick={() => removeBadge(badge.id)}>{'\u2715'}</button>
            </div>
            {badge.enabled && (
              <>
                <div className="control-row">
                  <label className="control-label">Text</label>
                  <input type="text" className="text-input" value={badge.text} onChange={(e) => updateBadge(badge.id, 'text', e.target.value)} />
                </div>
                <div className="control-row">
                  <label className="control-label">Position</label>
                  <div className="pos-picker">
                    {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map((p) => (
                      <button key={p} className={`btn btn-tiny ${badge.position === p ? 'active' : ''}`} onClick={() => updateBadge(badge.id, 'position', p)}>
                        {p === 'top-left' ? 'TL' : p === 'top-right' ? 'TR' : p === 'bottom-left' ? 'BL' : 'BR'}
                      </button>
                    ))}
                  </div>
                </div>
                <ColorInput label="BG" value={badge.bgColor} onChange={(v) => updateBadge(badge.id, 'bgColor', v)} />
                <ColorInput label="Text" value={badge.fontColor} onChange={(v) => updateBadge(badge.id, 'fontColor', v)} />
                <ColorInput label="Border" value={badge.borderColor} onChange={(v) => updateBadge(badge.id, 'borderColor', v)} />
                <Slider label="Font size" value={badge.fontSize} min={6} max={16} onChange={(v) => updateBadge(badge.id, 'fontSize', v)} suffix="px" defaultValue={9} />
                <Slider label="Rotation" value={badge.rotation} min={-45} max={45} onChange={(v) => updateBadge(badge.id, 'rotation', v)} suffix={'\u00b0'} defaultValue={-15} />
                <Slider label="Offset X" value={badge.offsetX} min={-100} max={100} onChange={(v) => updateBadge(badge.id, 'offsetX', v)} suffix="px" defaultValue={-8} />
                <Slider label="Offset Y" value={badge.offsetY} min={-100} max={100} onChange={(v) => updateBadge(badge.id, 'offsetY', v)} suffix="px" defaultValue={-8} />
                <Slider label="Radius" value={badge.borderRadius} min={0} max={20} onChange={(v) => updateBadge(badge.id, 'borderRadius', v)} suffix="px" defaultValue={6} />
                <Slider label="Border W" value={badge.borderWidth} min={0} max={4} onChange={(v) => updateBadge(badge.id, 'borderWidth', v)} suffix="px" defaultValue={2} />
                <Slider label="Border opa" value={badge.borderOpacity ?? 1} min={0} max={1} step={0.01} onChange={(v) => updateBadge(badge.id, 'borderOpacity', v)} defaultValue={1} />
                <Toggle label="Shadow" checked={badge.shadow} onChange={(v) => updateBadge(badge.id, 'shadow', v)} />
                {badge.shadow && (
                  <>
                    <ColorInput label="Shadow clr" value={badge.shadowColor || '#000000'} onChange={(v) => updateBadge(badge.id, 'shadowColor', v)} />
                    <Slider label="Shadow blur" value={badge.shadowBlur ?? 6} min={0} max={20} onChange={(v) => updateBadge(badge.id, 'shadowBlur', v)} suffix="px" defaultValue={6} />
                    <Slider label="Shadow size" value={badge.shadowSpread ?? 0} min={0} max={10} onChange={(v) => updateBadge(badge.id, 'shadowSpread', v)} suffix="px" defaultValue={0} />
                    <Slider label="Shadow X" value={badge.shadowOffsetX ?? 0} min={-10} max={10} onChange={(v) => updateBadge(badge.id, 'shadowOffsetX', v)} suffix="px" defaultValue={0} />
                    <Slider label="Shadow Y" value={badge.shadowOffsetY ?? 2} min={-10} max={10} onChange={(v) => updateBadge(badge.id, 'shadowOffsetY', v)} suffix="px" defaultValue={2} />
                    <Slider label="Shadow opa" value={badge.shadowOpacity ?? 0.4} min={0} max={1} step={0.01} onChange={(v) => updateBadge(badge.id, 'shadowOpacity', v)} defaultValue={0.4} />
                  </>
                )}
                <Toggle label="Glow" checked={badge.glowEnabled} onChange={(v) => updateBadge(badge.id, 'glowEnabled', v)} />
                {badge.glowEnabled && (
                  <>
                    <ColorInput label="Glow color" value={badge.glowColor || '#ff5252'} onChange={(v) => updateBadge(badge.id, 'glowColor', v)} />
                    <Slider label="Glow blur" value={badge.glowBlur ?? 10} min={0} max={30} onChange={(v) => updateBadge(badge.id, 'glowBlur', v)} suffix="px" defaultValue={10} />
                    <Slider label="Glow opacity" value={badge.glowOpacity ?? 0.5} min={0} max={1} step={0.01} onChange={(v) => updateBadge(badge.id, 'glowOpacity', v)} defaultValue={0.5} />
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </Section>
      </Group>

      {/* Button States */}
      {/* SVG Effects (only in SVG mode) */}
      {svgMode && (
        <Group title="SVG Effects" defaultOpen={true}>
          <Section title="Shape Inner Shadow" defaultOpen={true}>
            <Toggle label="Enabled" checked={eff.innerShadowEnabled !== false} onChange={(v) => updateEff('innerShadowEnabled', v)} />
            {eff.innerShadowEnabled !== false && (<>
              <ColorInput label="Color" value={eff.innerShadowColor || '#000000'} onChange={(v) => updateEff('innerShadowColor', v)} />
              <Slider label="Opacity" value={eff.innerShadowOpacity ?? 0.4} min={0} max={1} step={0.01} onChange={(v) => updateEff('innerShadowOpacity', v)} defaultValue={0.4} />
              <Slider label="Blur" value={eff.innerShadowBlur ?? 8} min={0} max={20} onChange={(v) => updateEff('innerShadowBlur', v)} suffix="px" defaultValue={8} />
              <Slider label="Distance" value={eff.innerShadowDistance ?? 5} min={0} max={20} onChange={(v) => updateEff('innerShadowDistance', v)} suffix="px" defaultValue={5} />
            </>)}
          </Section>
          <Section title="Shape Highlight" defaultOpen={true}>
            <Toggle label="Enabled" checked={eff.highlightEnabled !== false} onChange={(v) => updateEff('highlightEnabled', v)} />
            {eff.highlightEnabled !== false && (<>
              <ColorInput label="Color" value={eff.highlightColor || '#ffffff'} onChange={(v) => updateEff('highlightColor', v)} />
              <Slider label="Opacity" value={eff.highlightOpacity ?? 0.4} min={0} max={1} step={0.01} onChange={(v) => updateEff('highlightOpacity', v)} defaultValue={0.4} />
              <Slider label="Blur" value={eff.highlightBlur ?? 10} min={0} max={20} onChange={(v) => updateEff('highlightBlur', v)} suffix="px" defaultValue={10} />
              <Slider label="Distance" value={eff.highlightDistance ?? 5} min={0} max={15} onChange={(v) => updateEff('highlightDistance', v)} suffix="px" defaultValue={5} />
            </>)}
          </Section>
          <Section title="Specular Light" defaultOpen={false}>
            <Toggle label="Enabled" checked={eff.specularEnabled} onChange={(v) => updateEff('specularEnabled', v)} />
            {eff.specularEnabled && (<>
              <Slider label="Light X" value={eff.lightX ?? 30} min={0} max={100} onChange={(v) => updateEff('lightX', v)} suffix="%" defaultValue={30} />
              <Slider label="Light Y" value={eff.lightY ?? 20} min={0} max={100} onChange={(v) => updateEff('lightY', v)} suffix="%" defaultValue={20} />
              <Slider label="Light Z" value={eff.lightZ ?? 200} min={50} max={500} onChange={(v) => updateEff('lightZ', v)} defaultValue={200} />
              <Slider label="Surface" value={eff.specSurfaceScale ?? 5} min={1} max={20} onChange={(v) => updateEff('specSurfaceScale', v)} defaultValue={5} />
              <Slider label="Intensity" value={eff.specConstant ?? 0.8} min={0} max={3} step={0.1} onChange={(v) => updateEff('specConstant', v)} defaultValue={0.8} />
              <Slider label="Focus" value={eff.specExponent ?? 30} min={1} max={100} onChange={(v) => updateEff('specExponent', v)} defaultValue={30} />
            </>)}
          </Section>
        </Group>
      )}

      <Group title="Button States" defaultOpen={false} onCopy={onCopyStates} onPaste={onPasteStates}>
        {['hover', 'pressed', 'disabled'].map((st) => {
          const bs = s.buttonStates?.[st] || {};
          const ds = d.buttonStates?.[st] || {};
          const updateSt = (key, val) => {
            update('buttonStates', {
              ...s.buttonStates,
              [st]: { ...s.buttonStates?.[st], [key]: val },
            });
          };
          return (
            <Section key={st} title={st.charAt(0).toUpperCase() + st.slice(1)} defaultOpen={false}>
              <Toggle label="Enabled" checked={bs.enabled !== false} onChange={(v) => updateSt('enabled', v)} defaultValue={ds.enabled} />
              {bs.enabled !== false && (
                <>
                  <Slider label="Translate Y" value={bs.translateY ?? 0} min={-10} max={10} onChange={(v) => updateSt('translateY', v)} suffix="px" defaultValue={ds.translateY} />
                  <Slider label="Scale" value={bs.scale ?? 1} min={0.9} max={1.1} step={0.01} onChange={(v) => updateSt('scale', v)} defaultValue={ds.scale} />
                  <Slider label="Brightness" value={bs.brightnessShift ?? 0} min={-30} max={30} onChange={(v) => updateSt('brightnessShift', v)} suffix="%" defaultValue={ds.brightnessShift} />
                  <Slider label="Saturation" value={bs.saturationShift ?? 0} min={-50} max={50} onChange={(v) => updateSt('saturationShift', v)} suffix="%" defaultValue={ds.saturationShift} />
                  <Slider label="Opacity" value={bs.opacityOverride ?? 1} min={0} max={1} step={0.01} onChange={(v) => updateSt('opacityOverride', v === 1 ? null : v)} defaultValue={ds.opacityOverride ?? 1} />
                </>
              )}
            </Section>
          );
        })}
      </Group>
    </div>
  );
}
