import { getShapePath } from '../utils/shapeGenerators';

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

let fid = 0;

export default function SvgButtonPreview({ state, scale = 1, activeState = 'normal' }) {
  const s = state;
  const w = s.btnWidth || 180;
  const h = s.btnHeight || 58;
  const prefix = `svf${++fid}`;

  // Shape path
  const shapeName = s.svgShape || 'roundrect';
  const pathData = (shapeName === 'custom' && s.svgCustomPath) ? s.svgCustomPath : getShapePath(shapeName, w, h, {
    borderRadius: s.borderRadius || 12,
    squircleN: s.squircleN || 4.5,
    starPoints: s.starPoints || 5,
    starInnerRatio: s.starInnerRatio || 0.4,
    starRadius: s.starRadius || 0,
    starRotation: s.starRotation || 0,
    diamondRadius: s.diamondRadius || 0,
    hexRadius: s.hexRadius || 0,
    hexRotation: s.hexRotation || 0,
    pillSqueeze: s.pillSqueeze ?? 1,
    shieldTopWidth: s.shieldTopWidth ?? 1,
    shieldPointDepth: s.shieldPointDepth ?? 1,
    heartFatness: s.heartFatness ?? 0.5,
    cloudBumps: s.cloudBumps ?? 4,
  });

  // Gradient from first body layer
  const baseLayer = (s.bodyLayers || [])[0];
  const gradColors = baseLayer?.gradColors || ['#a8e85a', '#7ecc35', '#62b52a', '#4a9a20'];
  const gradStops = baseLayer?.gradStops || [0, 25, 60, 100];

  // SVG filter effects
  const svgEffects = s.svgEffects || {};
  const showInnerShadow = svgEffects.innerShadowEnabled !== false;
  const showHighlight = svgEffects.highlightEnabled !== false;

  // Depth
  const depthOff = s.depthOffset || 5;

  // Light source
  const lightX = (svgEffects.lightX ?? 30) * w / 100;
  const lightY = (svgEffects.lightY ?? 20) * h / 100;
  const lightZ = svgEffects.lightZ ?? 200;

  // Button state delta
  const stDelta = activeState !== 'normal' && s.buttonStates?.[activeState];
  const stEnabled = stDelta && stDelta.enabled;

  const pad = 20;
  const vw = w + pad * 2;
  const vh = h + depthOff + pad * 2;

  return (
    <div style={{
      display: 'inline-flex',
      transform: scale !== 1 ? `scale(${scale})` : undefined,
      transformOrigin: 'top left',
      ...(stEnabled ? {
        filter: `brightness(${100 + (stDelta.brightnessShift || 0)}%) saturate(${100 + (stDelta.saturationShift || 0)}%)`,
        opacity: stDelta.opacityOverride ?? undefined,
      } : {}),
    }}>
      <svg width={vw} height={vh} viewBox={`0 0 ${vw} ${vh}`} xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Body gradient */}
          <linearGradient id={`${prefix}-grad`} x1="0" y1="0" x2="0" y2="1">
            {gradColors.map((c, i) => (
              <stop key={i} offset={`${gradStops[i] || 0}%`} stopColor={c} />
            ))}
          </linearGradient>

          {/* Shape-aware effects filter */}
          <filter id={`${prefix}-fx`} x="-20%" y="-20%" width="140%" height="140%">
            {/* Inner shadow (bottom darken) */}
            {showInnerShadow && (
              <>
                <feFlood floodColor={svgEffects.innerShadowColor || '#000000'} floodOpacity={svgEffects.innerShadowOpacity ?? 0.4} result="isColor" />
                <feComposite in="isColor" in2="SourceAlpha" operator="in" result="isShape" />
                <feGaussianBlur in="isShape" stdDeviation={svgEffects.innerShadowBlur ?? 8} result="isBlur" />
                <feOffset in="isBlur" dx={0} dy={svgEffects.innerShadowDistance ?? 5} result="isOff" />
                <feComposite in="isOff" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="innerShadow" />
              </>
            )}

            {/* Inner highlight (top shine) */}
            {showHighlight && (
              <>
                <feFlood floodColor={svgEffects.highlightColor || '#ffffff'} floodOpacity={svgEffects.highlightOpacity ?? 0.4} result="hlColor" />
                <feComposite in="hlColor" in2="SourceAlpha" operator="in" result="hlShape" />
                <feGaussianBlur in="hlShape" stdDeviation={svgEffects.highlightBlur ?? 10} result="hlBlur" />
                <feOffset in="hlBlur" dx={0} dy={-(svgEffects.highlightDistance ?? 5)} result="hlOff" />
                <feComposite in="hlOff" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="innerHighlight" />
              </>
            )}

            {/* Specular lighting */}
            {svgEffects.specularEnabled && (
              <>
                <feSpecularLighting
                  in="SourceAlpha"
                  surfaceScale={svgEffects.specSurfaceScale ?? 5}
                  specularConstant={svgEffects.specConstant ?? 0.8}
                  specularExponent={svgEffects.specExponent ?? 30}
                  result="specRaw"
                >
                  <fePointLight x={lightX} y={lightY} z={lightZ} />
                </feSpecularLighting>
                <feComposite in="specRaw" in2="SourceAlpha" operator="in" result="specClip" />
              </>
            )}

            {/* Merge */}
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              {showInnerShadow && <feMergeNode in="innerShadow" />}
              {showHighlight && <feMergeNode in="innerHighlight" />}
              {svgEffects.specularEnabled && <feMergeNode in="specClip" />}
            </feMerge>
          </filter>

          {/* Drop shadow filter */}
          <filter id={`${prefix}-drop`} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx={0} dy={2} stdDeviation={3} floodColor="rgba(0,0,0,0.25)" />
          </filter>

          <clipPath id={`${prefix}-clip`}>
            <path d={pathData} transform={`translate(${pad},${pad})`} />
          </clipPath>
        </defs>

        {/* Depth shadow — slightly larger, offset down */}
        {s.showButton !== false && depthOff > 0 && (() => {
          const ds = 1 + 8 / Math.max(w, h); // scale up ~4px each side
          const dx = pad - (w * (ds - 1)) / 2;
          const dy = pad + depthOff - (h * (ds - 1)) / 2;
          return (
            <path
              d={pathData}
              fill={s.depthColor || '#3a6e13'}
              transform={`translate(${dx},${dy}) scale(${ds})`}
              filter={`url(#${prefix}-drop)`}
            />
          );
        })()}

        {/* Ring — slightly larger, offset 1px down */}
        {s.showButton !== false && (() => {
          const rs = 1 + 4 / Math.max(w, h); // scale up ~2px each side
          const rx = pad - (w * (rs - 1)) / 2;
          const ry = pad + 1 - (h * (rs - 1)) / 2;
          return (
            <path
              d={pathData}
              fill={s.ringColor || '#4a8a1c'}
              transform={`translate(${rx},${ry}) scale(${rs})`}
            />
          );
        })()}

        {/* Main shape with effects */}
        {s.showButton !== false && (
          <path
            d={pathData}
            fill={`url(#${prefix}-grad)`}
            filter={`url(#${prefix}-fx)`}
            transform={`translate(${pad},${pad})`}
          />
        )}

        {/* Text */}
        {s.showText && s.text && (
          <text
            x={pad + w / 2}
            y={pad + h / 2}
            textAnchor="middle"
            dominantBaseline="central"
            clipPath={`url(#${prefix}-clip)`}
            style={{
              fontFamily: '"Nunito", sans-serif',
              fontWeight: 900,
              fontSize: s.fontSize || 30,
              fill: s.textColor || '#f0e8d8',
              opacity: s.textOpacity ?? 1,
            }}
          >
            {s.text}
          </text>
        )}
      </svg>
    </div>
  );
}
