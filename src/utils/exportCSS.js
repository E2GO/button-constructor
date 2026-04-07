function hexToRgba(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

export default function generateCSS(s) {
  const lines = [];
  const name = (s.text || 'button').toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

  lines.push(`.btn-${name} {`);
  lines.push(`  position: relative;`);
  lines.push(`  width: ${s.btnWidth}px;`);
  lines.push(`  height: ${s.btnHeight}px;`);
  lines.push(`  border-radius: ${s.borderRadius}px;`);
  lines.push(`  border: none;`);
  lines.push(`  cursor: pointer;`);
  lines.push(`  overflow: hidden;`);
  lines.push(`  display: flex;`);
  lines.push(`  align-items: center;`);
  lines.push(`  justify-content: center;`);

  // Background from first body layer
  const baseLayer = (s.bodyLayers || [])[0];
  if (baseLayer) {
    if (baseLayer.type === 'solid') {
      lines.push(`  background: ${baseLayer.color};`);
    } else {
      const stops = (baseLayer.gradColors || []).map((c, i) => `${c} ${(baseLayer.gradStops || [])[i] || 0}%`).join(', ');
      lines.push(`  background: linear-gradient(${baseLayer.gradAngle || 180}deg, ${stops});`);
    }
  }

  // Box shadow (inset + depth)
  const shadows = [];
  if (s.showInsetLight) {
    shadows.push(`inset 0 2px ${s.insetLightBlur}px ${hexToRgba(s.insetLightColor, s.insetLightOpacity)}`);
  }
  if (s.showInsetDark) {
    shadows.push(`inset 0 -2px ${s.insetDarkBlur}px ${hexToRgba(s.insetDarkColor, s.insetDarkOpacity)}`);
  }
  if (shadows.length > 0) {
    lines.push(`  box-shadow: ${shadows.join(',\\n    ')};`);
  }

  // Text
  if (s.showText) {
    lines.push(`  font-family: 'Nunito', sans-serif;`);
    lines.push(`  font-weight: 900;`);
    lines.push(`  font-size: ${s.fontSize}px;`);
    lines.push(`  color: ${s.textColor};`);
  }

  lines.push(`}`);

  // Depth pseudo-element
  if (s.depthOffset > 0) {
    lines.push('');
    lines.push(`.btn-${name}::after {`);
    lines.push(`  content: '';`);
    lines.push(`  position: absolute;`);
    lines.push(`  inset: -2px;`);
    lines.push(`  top: ${s.depthOffset}px;`);
    lines.push(`  bottom: -${s.depthOffset + 2}px;`);
    lines.push(`  background: ${s.depthColor};`);
    lines.push(`  border-radius: ${s.borderRadius + 4}px;`);
    lines.push(`  z-index: -1;`);
    lines.push(`  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25);`);
    lines.push(`}`);
  }

  return lines.join('\n');
}
