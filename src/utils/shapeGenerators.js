// SVG path generators for preset shapes

// Helper: round corners on a polygon by inserting quadratic curves
function roundPolygon(points, r) {
  if (r <= 0) {
    return 'M' + points.map(p => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' L') + ' Z';
  }
  let d = '';
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const prev = points[(i - 1 + n) % n];
    const cur = points[i];
    const next = points[(i + 1) % n];
    // Vectors from cur to prev and next
    const dx1 = prev[0] - cur[0], dy1 = prev[1] - cur[1];
    const dx2 = next[0] - cur[0], dy2 = next[1] - cur[1];
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const maxR = Math.min(r, len1 / 2, len2 / 2);
    const p1x = cur[0] + (dx1 / len1) * maxR;
    const p1y = cur[1] + (dy1 / len1) * maxR;
    const p2x = cur[0] + (dx2 / len2) * maxR;
    const p2y = cur[1] + (dy2 / len2) * maxR;
    if (i === 0) d += `M${p1x.toFixed(1)},${p1y.toFixed(1)}`;
    else d += ` L${p1x.toFixed(1)},${p1y.toFixed(1)}`;
    d += ` Q${cur[0].toFixed(1)},${cur[1].toFixed(1)} ${p2x.toFixed(1)},${p2y.toFixed(1)}`;
  }
  return d + ' Z';
}

export function roundRectPath(w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  return `M${r},0 H${w - r} A${r},${r} 0 0 1 ${w},${r} V${h - r} A${r},${r} 0 0 1 ${w - r},${h} H${r} A${r},${r} 0 0 1 0,${h - r} V${r} A${r},${r} 0 0 1 ${r},0 Z`;
}

export function pillPath(w, h, squeeze = 1) {
  const r = (h / 2) * squeeze;
  const clamped = Math.min(r, w / 2, h / 2);
  return roundRectPath(w, h, clamped);
}

export function squirclePath(w, h, n = 4.5) {
  const a = w / 2, b = h / 2;
  const pts = 120;
  let d = '';
  for (let i = 0; i <= pts; i++) {
    const t = (2 * Math.PI * i) / pts;
    const ct = Math.cos(t), st = Math.sin(t);
    const x = a + a * Math.sign(ct) * Math.pow(Math.abs(ct), 2 / n);
    const y = b + b * Math.sign(st) * Math.pow(Math.abs(st), 2 / n);
    d += (i === 0 ? 'M' : 'L') + `${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d + 'Z';
}

export function diamondPath(w, h, r = 0) {
  const pts = [[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]];
  return roundPolygon(pts, r);
}

export function polygonPath(w, h, sides = 6, r = 0, rotation = 0) {
  const cx = w / 2, cy = h / 2;
  const rx = w / 2, ry = h / 2;
  const rotRad = (rotation * Math.PI) / 180;
  const pts = [];
  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI * i) / sides - Math.PI / 2 + rotRad;
    pts.push([cx + rx * Math.cos(angle), cy + ry * Math.sin(angle)]);
  }
  return roundPolygon(pts, r);
}

export function hexagonPath(w, h, r = 0, rotation = 0) {
  return polygonPath(w, h, 6, r, rotation);
}

export function starPath(w, h, points = 5, innerRatio = 0.4, r = 0, rotation = 0) {
  const cx = w / 2, cy = h / 2;
  const outerR = Math.min(w, h) / 2;
  const innerR = outerR * innerRatio;
  const rotRad = (rotation * Math.PI) / 180;
  const pts = [];
  for (let i = 0; i < points * 2; i++) {
    const angle = (Math.PI * i) / points - Math.PI / 2 + rotRad;
    const rad = i % 2 === 0 ? outerR : innerR;
    pts.push([cx + rad * Math.cos(angle), cy + rad * Math.sin(angle)]);
  }
  return roundPolygon(pts, r);
}

export function shieldPath(w, h, topWidth = 1, pointDepth = 1) {
  const tw = w * 0.5 * topWidth;
  const pd = h * pointDepth;
  return `M${w / 2 - tw},0 H${w / 2 + tw} L${w},${h * 0.15} V${h * 0.55} Q${w},${h * 0.7 + pd * 0.15} ${w / 2},${Math.min(pd, h)} Q0,${h * 0.7 + pd * 0.15} 0,${h * 0.55} V${h * 0.15} Z`;
}

export function heartPath(w, h, fatness = 0.5) {
  const cx = w / 2;
  const bw = w * fatness;
  return `M${cx},${h * 0.3} C${cx - bw},${-h * 0.15} ${-w * 0.05},${h * 0.25} ${cx},${h} C${w * 1.05},${h * 0.25} ${cx + bw},${-h * 0.15} ${cx},${h * 0.3} Z`;
}

export function cloudPath(w, h, bumps = 4) {
  // Generate cloud bumps along the top
  let d = `M${w * 0.15},${h * 0.65}`;
  const step = (w * 0.7) / bumps;
  for (let i = 0; i < bumps; i++) {
    const x1 = w * 0.15 + step * i;
    const x2 = x1 + step;
    const cx1 = (x1 + x2) / 2;
    const rh = h * (0.25 + Math.sin((i / bumps) * Math.PI) * 0.2);
    d += ` A${step / 2},${rh} 0 1 1 ${x2.toFixed(1)},${(h * 0.65).toFixed(1)}`;
  }
  d += ` A${w * 0.12},${h * 0.15} 0 1 1 ${(w * 0.85).toFixed(1)},${(h * 0.8).toFixed(1)}`;
  d += ` L${w * 0.15},${h * 0.8}`;
  d += ` A${w * 0.1},${h * 0.15} 0 1 1 ${(w * 0.15).toFixed(1)},${(h * 0.65).toFixed(1)}`;
  d += ' Z';
  return d;
}

export function getShapePath(shape, w, h, params = {}) {
  switch (shape) {
    case 'pill': return pillPath(w, h, params.pillSqueeze ?? 1);
    case 'squircle': return squirclePath(w, h, params.squircleN || 4.5);
    case 'diamond': return diamondPath(w, h, params.diamondRadius || 0);
    case 'hexagon': return hexagonPath(w, h, params.hexRadius || 0, params.hexRotation || 0);
    case 'star': return starPath(w, h, params.starPoints || 5, params.starInnerRatio || 0.4, params.starRadius || 0, params.starRotation || 0);
    case 'shield': return shieldPath(w, h, params.shieldTopWidth ?? 1, params.shieldPointDepth ?? 1);
    case 'heart': return heartPath(w, h, params.heartFatness ?? 0.5);
    case 'cloud': return cloudPath(w, h, params.cloudBumps ?? 4);
    default: return roundRectPath(w, h, params.borderRadius || 12);
  }
}
