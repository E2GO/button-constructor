import { useRef, useEffect } from 'react';

function getEditables(state) {
  const items = [];
  (state.blicks || []).forEach((b) => {
    if (!b.enabled) return;
    items.push({ type: 'blick', id: b.id, label: `Blick`, topPct: b.topPct, leftPct: b.leftPct, rotation: b.rotation || 0, scale: b.scale ?? 1 });
  });
  (state.badges || []).forEach((b) => {
    if (!b.enabled) return;
    items.push({ type: 'badge', id: b.id, label: `Badge: ${b.text}`, offsetX: b.offsetX ?? -8, offsetY: b.offsetY ?? -8, rotation: b.rotation ?? -15, position: b.position || 'top-left' });
  });
  if (state.showIcon && state.iconFreePosition) {
    items.push({ type: 'icon', id: 'icon', label: 'Icon', offsetX: state.iconOffsetX || 0, offsetY: state.iconOffsetY || 0 });
  }
  if (state.showFrame) {
    items.push({ type: 'frame-offset', id: 'frame-offset', label: 'Button in Frame', offsetX: state.frameOffsetX || 0, offsetY: state.frameOffsetY || 0 });
  }
  return items;
}

export default function DirectEditOverlay({ state, target, onUpdate, containerRef }) {
  const dragRef = useRef({ active: false, mode: null, item: null, sx: 0, sy: 0, rect: null });

  const allEditables = getEditables(state);
  // Only show the targeted element
  const editables = target ? allEditables.filter((e) => e.type === target.type && e.id === target.id) : [];

  const getBodyRect = () => {
    if (!containerRef?.current) return null;
    const body = containerRef.current.querySelector('[data-body]');
    return body ? body.getBoundingClientRect() : containerRef.current.getBoundingClientRect();
  };

  const onPointerDown = (e, item, mode) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = getBodyRect();
    dragRef.current = { active: true, mode, item: { ...item }, sx: e.clientX, sy: e.clientY, rect };
  };

  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d.active || !d.rect) return;
      const dx = e.clientX - d.sx;
      const dy = e.clientY - d.sy;
      const { item, rect, mode } = d;

      if (mode === 'move') {
        if (item.type === 'blick') {
          onUpdate('blick', item.id, {
            leftPct: Math.round((item.leftPct + (dx / rect.width) * 100) * 10) / 10,
            topPct: Math.round((item.topPct + (dy / rect.height) * 100) * 10) / 10,
          });
        } else if (item.type === 'badge') {
          onUpdate('badge', item.id, { offsetX: Math.round(item.offsetX + dx), offsetY: Math.round(item.offsetY + dy) });
        } else if (item.type === 'icon') {
          onUpdate('icon', 'icon', {
            iconOffsetX: Math.round((item.offsetX + (dx / rect.width) * 100) * 10) / 10,
            iconOffsetY: Math.round((item.offsetY + (dy / rect.height) * 100) * 10) / 10,
          });
        } else if (item.type === 'frame-offset') {
          onUpdate('frame-offset', 'frame-offset', {
            frameOffsetX: Math.round(item.offsetX + dx),
            frameOffsetY: Math.round(item.offsetY + dy),
          });
        }
      } else if (mode === 'rotate') {
        onUpdate(item.type, item.id, { rotation: Math.round(item.rotation + dx * 0.5) });
      } else if (mode === 'scale') {
        const newScale = Math.max(0.1, Math.min(5, (item.scale || 1) + (dx + dy) * 0.01));
        onUpdate(item.type, item.id, { scale: Math.round(newScale * 10) / 10 });
      }
    };
    const onUp = () => { dragRef.current.active = false; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
  }, [onUpdate]);


  if (editables.length === 0) return null;

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 100, userSelect: 'none' }}>
      {editables.map((item) => {
        let style = { position: 'absolute', cursor: 'move', pointerEvents: 'auto', boxSizing: 'border-box' };

        if (item.type === 'blick') {
          Object.assign(style, { left: `${item.leftPct}%`, top: `${item.topPct}%`, transform: 'translate(-50%, -50%)', width: 28, height: 28 });
        } else if (item.type === 'badge') {
          const isT = item.position.includes('top'), isL = item.position.includes('left');
          Object.assign(style, { [isT ? 'top' : 'bottom']: item.offsetY, [isL ? 'left' : 'right']: item.offsetX, width: 40, height: 24 });
        } else if (item.type === 'icon') {
          Object.assign(style, { left: `${50 + item.offsetX}%`, top: `${50 + item.offsetY}%`, transform: 'translate(-50%, -50%)', width: 32, height: 32 });
        } else if (item.type === 'frame-offset') {
          Object.assign(style, { left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: 40, height: 40, borderRadius: 20 });
        }

        return (
          <div
            key={`${item.type}-${item.id}`}
            style={{ ...style, border: '2px solid #60a0ff', borderRadius: style.borderRadius || 4 }}
            onPointerDown={(e) => onPointerDown(e, item, 'move')}
          >
            {/* Scale handle */}
            {(item.type === 'blick') && (
              <div
                style={{ position: 'absolute', right: -6, bottom: -6, width: 10, height: 10, background: '#60a0ff', borderRadius: 2, cursor: 'nwse-resize', border: '1px solid #fff' }}
                onPointerDown={(e) => onPointerDown(e, item, 'scale')}
              />
            )}
            {/* Rotate handle */}
            {(item.type === 'blick' || item.type === 'badge') && (
              <div style={{ position: 'absolute', left: '50%', top: -22, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <div
                  style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff8040', border: '2px solid #fff', cursor: 'grab' }}
                  onPointerDown={(e) => onPointerDown(e, item, 'rotate')}
                />
                <div style={{ width: 1, height: 8, background: '#ff8040' }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
