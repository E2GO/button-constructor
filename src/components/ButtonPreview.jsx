import { getShapePath } from '../utils/shapeGenerators';

let filterId = 0;

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}

function buildTextShadow(s) {
  const shadows = [];

  // 1. Stroke via shadow method (16 shadows in a circle)
  if (s.showTextStroke && s.textStrokeMethod === 'shadow') {
    const steps = 16;
    for (let i = 0; i < steps; i++) {
      const a = (2 * Math.PI * i) / steps;
      const x = Math.cos(a) * s.textStrokeWidth;
      const y = Math.sin(a) * s.textStrokeWidth;
      shadows.push(
        `${x.toFixed(1)}px ${y.toFixed(1)}px 0 rgba(${hexToRgb(s.textStrokeColor)},${s.textStrokeOpacity})`
      );
    }
  }

  // 2. Drop shadows
  (s.textDropShadows || [])
    .filter((sh) => sh.enabled)
    .forEach((sh) => {
      const rad = (sh.angle * Math.PI) / 180;
      const x = Math.cos(rad) * sh.distance;
      const y = -Math.sin(rad) * sh.distance;
      shadows.push(
        `${x.toFixed(1)}px ${y.toFixed(1)}px ${sh.blur}px rgba(${hexToRgb(sh.color)},${sh.opacity})`
      );
    });

  // 3. Inner shadows + auto perimeter bevel
  (s.textInnerShadows || [])
    .filter((sh) => sh.enabled)
    .forEach((sh) => {
      const rad = (sh.angle * Math.PI) / 180;
      const x = Math.cos(rad) * sh.distance;
      const y = -Math.sin(rad) * sh.distance;
      shadows.push(
        `${x.toFixed(1)}px ${y.toFixed(1)}px ${sh.blur}px rgba(${hexToRgb(sh.color)},${sh.opacity})`
      );

      if (s.autoPerimeterBevel) {
        // Classify by shadow Y direction: negative Y (up) = dark, positive Y (down) = light
        const yDir = -Math.sin((sh.angle * Math.PI) / 180);
        const isDark = yDir < 0;
        const auxSet = isDark
          ? [[-1, -1, 0.5], [1, 0, 0.29], [0, -1, 0.29]]
          : [[1, 1, 0.63], [-1, 0, 0.38], [0, 1, 0.38]];
        auxSet.forEach(([dx, dy, f]) => {
          shadows.push(
            `${dx}px ${dy}px 0px rgba(${hexToRgb(sh.color)},${(sh.opacity * f).toFixed(2)})`
          );
        });
      }
    });

  // 4. Outer glow
  if (s.showTextGlow) {
    for (let i = 0; i < 3; i++) {
      const b = s.textGlowBlur + i * s.textGlowSpread;
      const o = s.textGlowOpacity / (i + 1);
      shadows.push(`0 0 ${b}px rgba(${hexToRgb(s.textGlowColor)},${o.toFixed(2)})`);
    }
  }

  return shadows.length > 0 ? shadows.join(', ') : 'none';
}

export default function ButtonPreview({ state, scale = 1, activeState = 'normal' }) {
  const s = state;
  const br = s.borderRadius;
  const svgMode = s.renderMode === 'svg';
  const bw = s.btnWidth || 180;
  const bh = s.btnHeight || 58;

  // SVG shape path for clip-path (only with fixed size — autoSize can't use path clipping)
  const shapePath = (svgMode && !s.autoSize) ? getShapePath(s.svgShape || 'roundrect', bw, bh, {
    borderRadius: br || 12,
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
  }) : null;
  const clipStyle = shapePath ? { clipPath: `path('${shapePath}')`, borderRadius: 0 } : {};

  // Normalize bodyLayers (backward compat with old bodyGrad format)
  const bodyLayers = s.bodyLayers || (s.bodyGrad ? [{
    id: 1, enabled: true, type: 'gradient',
    gradColors: s.bodyGrad, gradStops: s.bodyStops || [0, 25, 60, 100],
    gradAngle: 180, opacity: 1.0, blendMode: 'normal',
  }] : []);

  // Button state delta
  const stDelta = activeState !== 'normal' && s.buttonStates?.[activeState];
  const stEnabled = stDelta && stDelta.enabled;
  const stTransform = stEnabled
    ? `translateY(${stDelta.translateY || 0}px) scale(${stDelta.scale || 1})`
    : undefined;
  const stFilter = stEnabled
    ? `brightness(${100 + (stDelta.brightnessShift || 0)}%) saturate(${100 + (stDelta.saturationShift || 0)}%)`
    : undefined;
  const stOpacity = stEnabled && stDelta.opacityOverride != null ? stDelta.opacityOverride : undefined;

  // Build layer backgrounds
  function layerBg(layer) {
    if (layer.type === 'solid') return layer.color || '#ffffff';
    if (layer.type === 'pattern') return patternBg(layer);
    const c = layer.gradColors || [];
    const st = layer.gradStops || [];
    const stops = c.map((col, i) => `${col} ${st[i] ?? 0}%`).join(', ');
    return `linear-gradient(${layer.gradAngle ?? 180}deg, ${stops})`;
  }

  function patternBg(layer) {
    const c1 = layer.patternColor1 || '#ffffff';
    const c2 = layer.patternColor2 || '#000000';
    const sz = layer.patternScale || 10;
    const p = layer.pattern || 'stripes';
    if (p === 'stripes') return `repeating-linear-gradient(45deg, ${c1}, ${c1} ${sz / 2}px, ${c2} ${sz / 2}px, ${c2} ${sz}px)`;
    if (p === 'dots') return `radial-gradient(circle ${sz / 3}px, ${c2} 100%, ${c1} 100%)`;
    if (p === 'grid') return `linear-gradient(${c2} 1px, transparent 1px), linear-gradient(90deg, ${c2} 1px, ${c1} 1px)`;
    if (p === 'zigzag') return `linear-gradient(135deg, ${c1} 25%, transparent 25%) -${sz}px 0, linear-gradient(225deg, ${c1} 25%, transparent 25%) -${sz}px 0, linear-gradient(315deg, ${c1} 25%, transparent 25%), linear-gradient(45deg, ${c1} 25%, ${c2} 25%)`;
    if (p === 'checker') return `repeating-conic-gradient(${c1} 0% 25%, ${c2} 0% 50%)`;
    if (p === 'diamonds') return `linear-gradient(45deg, ${c2} 25%, transparent 25%, transparent 75%, ${c2} 75%), linear-gradient(45deg, ${c2} 25%, ${c1} 25%, ${c1} 75%, ${c2} 75%)`;
    return c1;
  }


  // Text styles
  const textVisible = s.showText;
  const textShadow = textVisible ? buildTextShadow(s) : 'none';

  const textStyle = {
    position: 'relative',
    fontFamily: '"Nunito", sans-serif',
    fontWeight: 900,
    fontSize: s.fontSize,
    zIndex: 1,
    userSelect: 'none',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    textShadow,
  };

  if (!textVisible) {
    textStyle.color = 'transparent';
  } else if (s.showTextGradient) {
    textStyle.background = `linear-gradient(${s.textGradAngle}deg, ${s.textGradTop}, ${s.textGradBot})`;
    textStyle.WebkitBackgroundClip = 'text';
    textStyle.WebkitTextFillColor = 'transparent';
    textStyle.opacity = s.textOpacity;
  } else {
    textStyle.color = s.textColor;
    textStyle.opacity = s.textOpacity;
  }

  // Stroke via CSS method
  if (textVisible && s.showTextStroke && s.textStrokeMethod === 'css') {
    textStyle.WebkitTextStroke = `${s.textStrokeWidth}px rgba(${hexToRgb(s.textStrokeColor)},${s.textStrokeOpacity})`;
    textStyle.paintOrder = 'stroke fill';
  }

  // Inner glow via SVG filter
  const innerGlowId = `ig-${++filterId}`;
  const useInnerGlow = textVisible && s.showTextInnerGlow;
  if (useInnerGlow) {
    textStyle.filter = `url(#${innerGlowId})`;
  }

  // Frame
  const effectiveFrameRadius = s.showFrame
    ? s.autoFrameRadius
      ? br + (s.frameThickness || 4) + 2 + (s.showFrameInner ? (s.frameInnerThickness || 2) : 0)
      : s.frameRadius
    : 0;

  const hideBtn = s.showButton === false;

  const ofsX = s.showFrame ? (s.frameOffsetX || 0) : 0;
  const ofsY = s.showFrame ? (s.frameOffsetY || 0) : 0;

  const buttonLayers = (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        marginBottom: hideBtn ? 0 : s.depthOffset + 4,
        transform: (ofsX || ofsY) ? `translate(${ofsX}px, ${ofsY}px)` : undefined,
      }}
    >
      {/* Layer 1: Depth shadow */}
      {!hideBtn && (
        <div
          style={{
            position: 'absolute',
            left: -2,
            right: -2,
            top: s.depthOffset,
            bottom: -(s.depthOffset + 2),
            background: s.depthColor,
            borderRadius: svgMode ? 0 : br + 4,
            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
            ...(shapePath ? { clipPath: `path('${getShapePath(s.svgShape || 'roundrect', bw + 4, bh + 4, { borderRadius: br + 4, squircleN: s.squircleN || 4.5, starPoints: s.starPoints || 5, starInnerRatio: s.starInnerRatio || 0.4, starRadius: s.starRadius || 0, starRotation: s.starRotation || 0, diamondRadius: s.diamondRadius || 0, hexRadius: s.hexRadius || 0, hexRotation: s.hexRotation || 0, pillSqueeze: s.pillSqueeze ?? 1, shieldTopWidth: s.shieldTopWidth ?? 1, shieldPointDepth: s.shieldPointDepth ?? 1, heartFatness: s.heartFatness ?? 0.5, cloudBumps: s.cloudBumps ?? 4 })}')` } : {}),
          }}
        />
      )}

      {/* Layer 2: Border ring */}
      {!hideBtn && (
        <div
          style={{
            position: 'absolute',
            left: -2,
            right: -2,
            top: 1,
            bottom: -3,
            background: s.ringColor,
            borderRadius: svgMode ? 0 : br + 2,
            ...(shapePath ? { clipPath: `path('${getShapePath(s.svgShape || 'roundrect', bw + 4, bh + 4, { borderRadius: br + 2, squircleN: s.squircleN || 4.5, starPoints: s.starPoints || 5, starInnerRatio: s.starInnerRatio || 0.4, starRadius: s.starRadius || 0, starRotation: s.starRotation || 0, diamondRadius: s.diamondRadius || 0, hexRadius: s.hexRadius || 0, hexRotation: s.hexRotation || 0, pillSqueeze: s.pillSqueeze ?? 1, shieldTopWidth: s.shieldTopWidth ?? 1, shieldPointDepth: s.shieldPointDepth ?? 1, heartFatness: s.heartFatness ?? 0.5, cloudBumps: s.cloudBumps ?? 4 })}')` } : {}),
          }}
        />
      )}

      {/* Layer 3: Body (transparent placeholder when hidden) */}
      <div
        data-body="true"
        style={{
          position: 'relative',
          width: s.autoSize ? undefined : s.btnWidth,
          height: s.autoSize ? undefined : s.btnHeight,
          padding: s.autoSize ? '12px 40px' : undefined,
          borderRadius: svgMode ? 0 : br,
          overflow: 'hidden',
          ...clipStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
        }}
      >
        {/* Body layers */}
        {!hideBtn && bodyLayers.filter(l => l.enabled).map((layer) => (
          <div key={layer.id} style={{
            position: 'absolute', inset: 0,
            background: layerBg(layer),
            backgroundSize: layer.type === 'pattern' ? `${layer.patternScale || 10}px ${layer.patternScale || 10}px` : undefined,
            transform: layer.type === 'pattern' && layer.patternRotation ? `rotate(${layer.patternRotation}deg)` : undefined,
            opacity: layer.opacity ?? 1,
            mixBlendMode: layer.blendMode || 'normal',
            pointerEvents: 'none',
          }} />
        ))}

        {/* SVG shape-aware effects overlay */}
        {!hideBtn && svgMode && shapePath && (() => {
          const eff = s.svgEffects || {};
          const showIS = eff.innerShadowEnabled !== false;
          const showHL = eff.highlightEnabled !== false;
          const showSpec = eff.specularEnabled;
          if (!showIS && !showHL && !showSpec) return null;
          const sfid = `svgfx${++filterId}`;
          const lx = (eff.lightX ?? 30) * bw / 100;
          const ly = (eff.lightY ?? 20) * bh / 100;
          return (
            <svg
              style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2, overflow: 'visible' }}
              width={bw} height={bh} viewBox={`0 0 ${bw} ${bh}`}
            >
              <defs>
                <filter id={sfid} x="-20%" y="-20%" width="140%" height="140%">
                  {showIS && (
                    <>
                      <feFlood floodColor={eff.innerShadowColor || '#000000'} floodOpacity={eff.innerShadowOpacity ?? 0.4} result="isC" />
                      <feComposite in="isC" in2="SourceAlpha" operator="in" result="isS" />
                      <feGaussianBlur in="isS" stdDeviation={eff.innerShadowBlur ?? 8} result="isB" />
                      <feOffset in="isB" dx={0} dy={eff.innerShadowDistance ?? 5} result="isO" />
                      <feComposite in="isO" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="iShadow" />
                    </>
                  )}
                  {showHL && (
                    <>
                      <feFlood floodColor={eff.highlightColor || '#ffffff'} floodOpacity={eff.highlightOpacity ?? 0.4} result="hlC" />
                      <feComposite in="hlC" in2="SourceAlpha" operator="in" result="hlS" />
                      <feGaussianBlur in="hlS" stdDeviation={eff.highlightBlur ?? 10} result="hlB" />
                      <feOffset in="hlB" dx={0} dy={-(eff.highlightDistance ?? 5)} result="hlO" />
                      <feComposite in="hlO" in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" result="iHighlight" />
                    </>
                  )}
                  {showSpec && (
                    <>
                      <feSpecularLighting in="SourceAlpha" surfaceScale={eff.specSurfaceScale ?? 5} specularConstant={eff.specConstant ?? 0.8} specularExponent={eff.specExponent ?? 30} result="specR">
                        <fePointLight x={lx} y={ly} z={eff.lightZ ?? 200} />
                      </feSpecularLighting>
                      <feComposite in="specR" in2="SourceAlpha" operator="in" result="specC" />
                    </>
                  )}
                  <feMerge>
                    <feMergeNode in="SourceGraphic" />
                    {showIS && <feMergeNode in="iShadow" />}
                    {showHL && <feMergeNode in="iHighlight" />}
                    {showSpec && <feMergeNode in="specC" />}
                  </feMerge>
                </filter>
              </defs>
              <path d={shapePath} fill="transparent" filter={`url(#${sfid})`} />
            </svg>
          );
        })()}

        {/* Inset Light */}
        {!hideBtn && s.showInsetLight && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: svgMode ? 0 : br, pointerEvents: 'none', zIndex: 1,
            boxShadow: `inset 0 2px ${s.insetLightBlur}px rgba(${hexToRgb(s.insetLightColor)},${s.insetLightOpacity})`,
            transform: s.insetLightRotation ? `rotate(${s.insetLightRotation}deg)` : undefined,
          }} />
        )}
        {/* Inset Dark */}
        {!hideBtn && s.showInsetDark && (
          <div style={{
            position: 'absolute', inset: 0, borderRadius: svgMode ? 0 : br, pointerEvents: 'none', zIndex: 1,
            boxShadow: `inset 0 -2px ${s.insetDarkBlur}px rgba(${hexToRgb(s.insetDarkColor)},${s.insetDarkOpacity})`,
            transform: s.insetDarkRotation ? `rotate(${s.insetDarkRotation}deg)` : undefined,
          }} />
        )}

        {!hideBtn && s.showShine && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 4,
              right: 4,
              height: `${s.shineHeight}%`,
              background: `linear-gradient(to bottom, rgba(${hexToRgb(s.shineColor)},${s.shineOpacityTop}), rgba(${hexToRgb(s.shineColor)},${s.shineOpacityMid}) 50%, transparent)`,
              borderRadius: '4px 4px 50% 50%',
              pointerEvents: 'none',
              transform: s.shineRotation ? `rotate(${s.shineRotation}deg)` : undefined,
              filter: s.shineBlur ? `blur(${s.shineBlur}px)` : undefined,
            }}
          />
        )}

        {!hideBtn && s.showDarken && (
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 4,
              right: 4,
              height: `${s.darkenHeight}%`,
              background: `linear-gradient(to top, rgba(${hexToRgb(s.darkenColor)},${s.darkenOpacity}), transparent)`,
              borderRadius: '50% 50% 4px 4px',
              pointerEvents: 'none',
              transform: s.darkenRotation ? `rotate(${s.darkenRotation}deg)` : undefined,
              filter: s.darkenBlur ? `blur(${s.darkenBlur}px)` : undefined,
            }}
          />
        )}

        {!hideBtn &&
          s.blicks
            .filter((b) => b.enabled)
            .map((blick) => {
              const sc = blick.scale ?? 1;
              let w = (blick.width || blick.size || 12) * sc;
              let h = (blick.height || blick.size || 12) * sc;
              const shape = blick.shape || 'circle';
              const rot = blick.rotation || 0;
              const bl = blick.blur || 0;
              let borderRadius, clipPath;
              // Circle: force equal w/h
              if (shape === 'circle') {
                const sz = Math.max(w, h);
                w = sz; h = sz;
                borderRadius = '50%';
              }
              else if (shape === 'ellipse') { borderRadius = '50%'; }
              else if (shape === 'rect') { borderRadius = Math.min(w, h) * 0.15 + 'px'; }
              else if (shape === 'diamond') { clipPath = 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)'; }
              else if (shape === 'star') { clipPath = 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'; }
              else if (shape === 'line') {
                borderRadius = `${Math.min(w, h) / 2}px`;
              }
              // Wrapper: position + blur + opacity; Inner: shape + color
              return (
                <div
                  key={blick.id}
                  style={{
                    position: 'absolute',
                    top: `${blick.topPct}%`,
                    left: `${blick.leftPct}%`,
                    width: w + bl * 2,
                    height: h + bl * 2,
                    pointerEvents: 'none',
                    filter: bl ? `blur(${bl}px)` : undefined,
                    opacity: blick.opacity,
                    transform: `translate(-50%, -50%)${rot ? ` rotate(${rot}deg)` : ''}`,
                  }}
                >
                  <div style={{
                    width: w,
                    height: h,
                    margin: bl,
                    borderRadius: borderRadius || undefined,
                    clipPath: clipPath || undefined,
                    background: blick.color,
                  }} />
                </div>
              );
            })}

        {useInnerGlow && (
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <filter id={innerGlowId}>
              <feFlood floodColor={s.textInnerGlowColor} floodOpacity={s.textInnerGlowOpacity} />
              <feComposite in2="SourceAlpha" operator="in" />
              <feGaussianBlur stdDeviation={s.textInnerGlowBlur} />
              <feComposite in2="SourceAlpha" operator="arithmetic" k2="-1" k3="1" />
              <feBlend mode="screen" in2="SourceGraphic" />
            </filter>
          </svg>
        )}
        {/* Content: icon + text */}
        {(() => {
          // Build icon element with effects
          let iconEl = null;
          if (s.showIcon) {
            const iconShadows = [];
            if (s.iconShadowEnabled) {
              iconShadows.push(`${s.iconShadowOffsetX}px ${s.iconShadowOffsetY}px ${s.iconShadowBlur}px rgba(${hexToRgb(s.iconShadowColor)},${s.iconShadowOpacity})`);
              const sp = s.iconShadowSpread || 0;
              for (let i = 1; i <= sp; i++) {
                iconShadows.push(`${s.iconShadowOffsetX}px ${s.iconShadowOffsetY}px ${s.iconShadowBlur + i}px rgba(${hexToRgb(s.iconShadowColor)},${(s.iconShadowOpacity * 0.5).toFixed(2)})`);
              }
            }
            if (s.iconGlowEnabled) {
              for (let i = 0; i < 3; i++) {
                iconShadows.push(`0 0 ${s.iconGlowBlur + i * 3}px rgba(${hexToRgb(s.iconGlowColor)},${(s.iconGlowOpacity / (i + 1)).toFixed(2)})`);
              }
            }
            if (s.iconStrokeEnabled) {
              const sBlur = s.iconStrokeBlur || 0;
              const sOpa = s.iconStrokeOpacity ?? 1;
              for (let i = 0; i < 12; i++) {
                const a = (2 * Math.PI * i) / 12;
                iconShadows.push(`${(Math.cos(a) * s.iconStrokeWidth).toFixed(1)}px ${(Math.sin(a) * s.iconStrokeWidth).toFixed(1)}px ${sBlur}px rgba(${hexToRgb(s.iconStrokeColor)},${sOpa})`);
              }
            }
            const iconStyle = {
              fontSize: s.iconSize, opacity: s.iconOpacity, lineHeight: 1, pointerEvents: 'none',
              filter: iconShadows.length ? `drop-shadow(${iconShadows[0]})` : undefined,
              textShadow: iconShadows.length ? iconShadows.join(', ') : undefined,
            };
            if (s.iconFreePosition) {
              iconStyle.position = 'absolute';
              iconStyle.left = `${50 + (s.iconOffsetX || 0)}%`;
              iconStyle.top = `${50 + (s.iconOffsetY || 0)}%`;
              iconStyle.transform = 'translate(-50%, -50%)';
              iconStyle.zIndex = 3;
            }
            iconEl = <span style={iconStyle}>{s.iconEmoji}</span>;
          }

          if (s.showIcon && s.iconFreePosition) {
            // Free mode: icon absolute, text centered independently
            return (
              <>
                {iconEl}
                <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={textStyle}>{s.text}</span>
                </div>
              </>
            );
          }
          // Flex mode: icon + text in a row/column
          return (
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: s.showIcon ? s.iconGap : 0,
              flexDirection: s.iconPosition === 'top' ? 'column' : s.iconPosition === 'bottom' ? 'column-reverse' : s.iconPosition === 'right' ? 'row-reverse' : 'row',
              zIndex: 2,
            }}>
              {iconEl}
              <span style={textStyle}>{s.text}</span>
            </div>
          );
        })()}
      </div>
    </div>
  );

  const wrapStyle = {
    position: 'relative',
    display: 'inline-flex',
    transform: [scale !== 1 ? `scale(${scale})` : '', stTransform || ''].filter(Boolean).join(' ') || undefined,
    transformOrigin: 'top left',
    filter: stFilter,
    opacity: stOpacity,
    transition: 'transform 160ms ease, filter 160ms ease, opacity 160ms ease',
  };

  const badgeElements = (s.badges || []).filter((b) => b.enabled).map((b) => {
    const isTop = b.position?.includes('top');
    const isLeft = b.position?.includes('left');
    return (
      <div key={b.id} style={{
        position: 'absolute',
        [isTop ? 'top' : 'bottom']: b.offsetY ?? -8,
        [isLeft ? 'left' : 'right']: b.offsetX ?? -8,
        transform: `rotate(${b.rotation ?? 0}deg)`,
        background: b.bgColor,
        border: `${b.borderWidth}px solid rgba(${hexToRgb(b.borderColor)},${b.borderOpacity ?? 1})`,
        borderRadius: b.borderRadius,
        padding: `${b.paddingV}px ${b.paddingH}px`,
        boxShadow: [
          b.shadow && `${b.shadowOffsetX || 0}px ${b.shadowOffsetY || 2}px ${b.shadowBlur || 6}px ${b.shadowSpread || 0}px rgba(${hexToRgb(b.shadowColor || '#000000')},${b.shadowOpacity ?? 0.4})`,
          b.glowEnabled && `0 0 ${b.glowBlur || 10}px rgba(${hexToRgb(b.glowColor || '#ff5252')},${b.glowOpacity ?? 0.5})`,
          b.glowEnabled && `0 0 ${(b.glowBlur || 10) * 2}px rgba(${hexToRgb(b.glowColor || '#ff5252')},${((b.glowOpacity ?? 0.5) * 0.4).toFixed(2)})`,
        ].filter(Boolean).join(', ') || 'none',
        fontSize: b.fontSize,
        color: b.fontColor,
        fontFamily: '"Nunito", sans-serif',
        fontWeight: 900,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        zIndex: 20,
        pointerEvents: 'none',
      }}>
        {b.text}
      </div>
    );
  });

  if (!s.showFrame) {
    return <div style={wrapStyle}>{buttonLayers}{badgeElements}</div>;
  }

  const frameGrad = `linear-gradient(180deg, ${s.frameGradTop} ${(s.frameGradStops || [0, 50, 100])[0]}%, ${s.frameGradMid} ${(s.frameGradStops || [0, 50, 100])[1]}%, ${s.frameGradBot} ${(s.frameGradStops || [0, 50, 100])[2]}%)`;
  const frameShadow = `0 ${s.frameShadowOffset}px 0 ${s.frameShadowColor}, 0 ${s.frameShadowOffset + 2}px ${s.frameSoftShadowBlur}px rgba(0,0,0,${s.frameSoftShadowOpacity})`;

  let innerContent = buttonLayers;
  if (s.showFrameInner) {
    const innerRadius = s.autoFrameInnerRadius !== false
      ? Math.max(effectiveFrameRadius - s.frameThickness, 0)
      : (s.frameInnerRadius || 0);
    const innerBg = s.frameInnerGradEnabled
      ? `linear-gradient(180deg, ${s.frameInnerGradTop || '#c8a878'}, ${s.frameInnerGradBot || '#a08058'})`
      : s.frameInnerColor;
    const innerShadow = s.frameInnerShadowEnabled
      ? `${s.frameInnerShadowInset ? 'inset ' : ''}0 2px ${s.frameInnerShadowBlur || 4}px rgba(${hexToRgb(s.frameInnerShadowColor || '#000000')},${s.frameInnerShadowOpacity ?? 0.3})`
      : undefined;
    innerContent = (
      <div style={{
        background: innerBg,
        borderRadius: Math.max(innerRadius, 0),
        padding: s.frameInnerThickness,
        boxShadow: innerShadow,
      }}>
        {buttonLayers}
      </div>
    );
  }

  return (
    <div style={wrapStyle}>
      <div style={{
        display: 'inline-flex',
        background: frameGrad,
        borderRadius: effectiveFrameRadius,
        padding: s.frameThickness,
        boxShadow: frameShadow,
      }}>
        {innerContent}
      </div>
      {badgeElements}
    </div>
  );
}
