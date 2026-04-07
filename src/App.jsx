import { useState, useRef, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import ButtonPreview from './components/ButtonPreview';
import DirectEditOverlay from './components/DirectEditOverlay';
import ControlPanel from './components/ControlPanel';
import TextPanel from './components/TextPanel';
import { presets } from './data/presets';
import generateFlutter from './utils/exportFlutter';
import generateCSS from './utils/exportCSS';

import './App.css';

const STORAGE_KEY = 'button-constructor-presets';
const LIBRARY_KEY = 'button-constructor-library';
const STYLES_KEY = 'button-constructor-styles';

// Keys for style extraction
const COLOR_KEYS = [
  'bodyLayers', 'depthColor', 'ringColor', 'textColor', 'textGradTop', 'textGradBot',
  'shineColor', 'darkenColor', 'insetLightColor', 'insetDarkColor', 'textStrokeColor',
  'textGlowColor', 'textInnerGlowColor', 'frameGradTop', 'frameGradMid', 'frameGradBot',
  'frameShadowColor', 'frameInnerColor', 'frameInnerGradTop', 'frameInnerGradBot',
  'iconShadowColor', 'iconStrokeColor', 'iconGlowColor',
];
const SHAPE_KEYS = [
  'btnWidth', 'btnHeight', 'borderRadius', 'depthOffset', 'autoSize',
  'shineHeight', 'darkenHeight', 'insetLightBlur', 'insetDarkBlur',
  'frameThickness', 'frameRadius', 'autoFrameRadius', 'frameInnerThickness',
  'frameOffsetX', 'frameOffsetY', 'fontSize', 'textStrokeWidth', 'iconSize', 'iconGap',
];
const TEXT_KEYS = [
  'showText', 'text', 'textColor', 'textOpacity', 'fontSize',
  'showTextGradient', 'textGradTop', 'textGradBot', 'textGradAngle',
  'showTextStroke', 'textStrokeColor', 'textStrokeWidth', 'textStrokeOpacity', 'textStrokeMethod',
  'textDropShadows', 'textInnerShadows', 'autoPerimeterBevel',
  'showTextGlow', 'textGlowColor', 'textGlowOpacity', 'textGlowBlur', 'textGlowSpread',
  'showTextInnerGlow', 'textInnerGlowColor', 'textInnerGlowOpacity', 'textInnerGlowBlur',
];

const SECTION_KEYS = {
  button: ['showButton', 'autoSize', 'btnWidth', 'btnHeight', 'borderRadius', 'depthOffset', 'depthColor', 'ringColor', 'bodyLayers', 'showShine', 'shineColor', 'shineHeight', 'shineOpacityTop', 'shineOpacityMid', 'showDarken', 'darkenColor', 'darkenHeight', 'darkenOpacity', 'showInsetLight', 'insetLightColor', 'insetLightBlur', 'insetLightOpacity', 'showInsetDark', 'insetDarkColor', 'insetDarkBlur', 'insetDarkOpacity', 'blicks', 'showIcon', 'iconEmoji', 'iconPosition', 'iconFreePosition', 'iconSize', 'iconGap', 'iconOffsetX', 'iconOffsetY', 'iconOpacity', 'iconShadowEnabled', 'iconShadowColor', 'iconShadowBlur', 'iconShadowOffsetX', 'iconShadowOffsetY', 'iconShadowOpacity', 'iconShadowSpread', 'iconStrokeEnabled', 'iconStrokeColor', 'iconStrokeWidth', 'iconStrokeOpacity', 'iconStrokeBlur', 'iconGlowEnabled', 'iconGlowColor', 'iconGlowBlur', 'iconGlowOpacity', 'badges'],
  text: TEXT_KEYS,
  frame: ['showFrame', 'frameThickness', 'frameRadius', 'autoFrameRadius', 'frameGradTop', 'frameGradMid', 'frameGradBot', 'frameGradStops', 'frameShadowOffset', 'frameShadowColor', 'frameSoftShadowBlur', 'frameSoftShadowOpacity', 'showFrameInner', 'frameInnerThickness', 'frameInnerColor', 'frameInnerGradEnabled', 'frameInnerGradTop', 'frameInnerGradBot', 'frameInnerShadowEnabled', 'frameInnerShadowColor', 'frameInnerShadowBlur', 'frameInnerShadowOpacity', 'frameInnerShadowInset', 'frameInnerRadius', 'autoFrameInnerRadius', 'frameOffsetX', 'frameOffsetY'],
  states: ['buttonStates'],
};

const initialState = { ...presets[0] };
delete initialState.name;

function loadCustomPresets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function loadLibrary() {
  try {
    return JSON.parse(localStorage.getItem(LIBRARY_KEY)) || [];
  } catch {
    return [];
  }
}

function saveLibrary(lib) {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(lib));
}

const MAX_HISTORY = 50;

function useHistory(initial) {
  const ref = useRef({ stack: [initial], idx: 0 });
  const [, forceUpdate] = useState(0);

  const current = ref.current.stack[ref.current.idx];

  const push = useCallback((stateOrFn) => {
    const { stack, idx } = ref.current;
    const cur = stack[idx];
    const next = typeof stateOrFn === 'function' ? stateOrFn(cur) : stateOrFn;
    const trimmed = stack.slice(Math.max(0, idx + 1 - MAX_HISTORY), idx + 1);
    trimmed.push(next);
    ref.current = { stack: trimmed, idx: trimmed.length - 1 };
    forceUpdate((n) => n + 1);
  }, []);

  const replace = useCallback((stateOrFn) => {
    const { stack, idx } = ref.current;
    const cur = stack[idx];
    const next = typeof stateOrFn === 'function' ? stateOrFn(cur) : stateOrFn;
    const copy = [...stack];
    copy[idx] = next;
    ref.current = { stack: copy, idx };
    forceUpdate((n) => n + 1);
  }, []);

  const undo = useCallback(() => {
    if (ref.current.idx > 0) {
      ref.current = { ...ref.current, idx: ref.current.idx - 1 };
      forceUpdate((n) => n + 1);
    }
  }, []);

  const redo = useCallback(() => {
    const { stack, idx } = ref.current;
    if (idx < stack.length - 1) {
      ref.current = { ...ref.current, idx: idx + 1 };
      forceUpdate((n) => n + 1);
    }
  }, []);

  const canUndo = ref.current.idx > 0;
  const canRedo = ref.current.idx < ref.current.stack.length - 1;

  return { current, push, replace, undo, redo, canUndo, canRedo };
}

export default function App() {
  const { current: state, push: setState, replace: replaceState, undo, redo, canUndo, canRedo } = useHistory(initialState);
  const [defaults, setDefaults] = useState(initialState);
  const [saved, setSaved] = useState(loadLibrary);
  const [exportMsg, setExportMsg] = useState('');
  const [customPresets, setCustomPresets] = useState(loadCustomPresets);
  const [previewBg, setPreviewBg] = useState('#0c0c14');
  const [previewZoom, setPreviewZoom] = useState(100);
  const [activeState, setActiveState] = useState('normal');
  const [libraryTag, setLibraryTag] = useState('All');
  const [librarySearch, setLibrarySearch] = useState('');
  const [showVariants, setShowVariants] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [directEditTarget, setDirectEditTarget] = useState(null); // { type, id, label } or null
  const bodyRef = useRef(null);
  const previewRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);
  const [pngScale, setPngScale] = useState(2);
  const [exportSize, setExportSize] = useState('normal');
  const [customExportW, setCustomExportW] = useState(512);
  const [styles, setStyles] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STYLES_KEY)) || []; } catch { return []; }
  });

  const update = (key, value) => setState((prev) => ({ ...prev, [key]: value }));

  const handleDirectUpdate = useCallback((type, id, changes) => {
    if (type === 'blick') {
      setState((prev) => ({
        ...prev,
        blicks: prev.blicks.map((b) => (b.id === id ? { ...b, ...changes } : b)),
      }));
    } else if (type === 'badge') {
      setState((prev) => ({
        ...prev,
        badges: (prev.badges || []).map((b) => (b.id === id ? { ...b, ...changes } : b)),
      }));
    } else if (type === 'icon' || type === 'frame-offset') {
      setState((prev) => ({ ...prev, ...changes }));
    }
  }, [setState]);

  const copySection = (section) => {
    const keys = SECTION_KEYS[section];
    if (!keys) return;
    const data = {};
    keys.forEach((k) => { if (state[k] !== undefined) data[k] = state[k]; });
    navigator.clipboard.writeText(JSON.stringify({ _section: section, ...data }));
    setExportMsg(`${section} copied`);
    setTimeout(() => setExportMsg(''), 1500);
  };

  const pasteSection = async (section) => {
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      const keys = SECTION_KEYS[data._section || section];
      if (!keys) return;
      const patch = {};
      keys.forEach((k) => { if (data[k] !== undefined) patch[k] = data[k]; });
      setState((prev) => ({ ...prev, ...patch }));
      setExportMsg(`${section} pasted`);
    } catch {
      setExportMsg('Paste failed');
    }
    setTimeout(() => setExportMsg(''), 1500);
  };

  // Body layer handlers
  const updateBodyLayer = (id, key, value) =>
    setState((prev) => ({
      ...prev,
      bodyLayers: prev.bodyLayers.map((l) => (l.id === id ? { ...l, [key]: value } : l)),
    }));

  const updateBodyLayerGradColor = (layerId, index, color) =>
    setState((prev) => ({
      ...prev,
      bodyLayers: prev.bodyLayers.map((l) => {
        if (l.id !== layerId) return l;
        const gradColors = [...l.gradColors];
        gradColors[index] = color;
        return { ...l, gradColors };
      }),
    }));

  const updateBodyLayerGradStop = (layerId, index, value) =>
    setState((prev) => ({
      ...prev,
      bodyLayers: prev.bodyLayers.map((l) => {
        if (l.id !== layerId) return l;
        const gradStops = [...l.gradStops];
        gradStops[index] = value;
        return { ...l, gradStops };
      }),
    }));

  const addBodyLayer = () =>
    setState((prev) => ({
      ...prev,
      bodyLayers: [
        ...prev.bodyLayers,
        {
          id: Date.now(),
          enabled: true,
          name: `Layer ${prev.bodyLayers.length + 1}`,
          type: 'gradient',
          gradColors: ['#ffffff', '#cccccc'],
          gradStops: [0, 100],
          gradAngle: 180,
          opacity: 1.0,
          blendMode: 'normal',
        },
      ],
    }));

  const removeBodyLayer = (id) =>
    setState((prev) => ({
      ...prev,
      bodyLayers: prev.bodyLayers.length > 1 ? prev.bodyLayers.filter((l) => l.id !== id) : prev.bodyLayers,
    }));

  const moveBodyLayer = (id, dir) =>
    setState((prev) => {
      const layers = [...prev.bodyLayers];
      const idx = layers.findIndex((l) => l.id === id);
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= layers.length) return prev;
      [layers[idx], layers[newIdx]] = [layers[newIdx], layers[idx]];
      return { ...prev, bodyLayers: layers };
    });

  // Badge handlers
  const updateBadge = (id, key, value) =>
    setState((prev) => ({
      ...prev,
      badges: (prev.badges || []).map((b) => (b.id === id ? { ...b, [key]: value } : b)),
    }));

  const addBadge = () =>
    setState((prev) => ({
      ...prev,
      badges: [
        ...(prev.badges || []),
        {
          id: Date.now(),
          enabled: true,
          text: 'SALE',
          fontSize: 9,
          fontColor: '#ffffff',
          bgColor: '#ff5252',
          borderColor: '#ffffff',
          borderWidth: 2,
          rotation: -15,
          position: 'top-left',
          offsetX: -8,
          offsetY: -8,
          paddingH: 10,
          paddingV: 3,
          borderRadius: 6,
          shadow: true,
          shadowColor: '#000000',
          shadowBlur: 6,
          shadowOffsetX: 0,
          shadowOffsetY: 2,
          shadowOpacity: 0.4,
          glowEnabled: false,
          glowColor: '#ff5252',
          glowBlur: 10,
          glowOpacity: 0.5,
        },
      ],
    }));

  const removeBadge = (id) =>
    setState((prev) => ({
      ...prev,
      badges: (prev.badges || []).filter((b) => b.id !== id),
    }));

  const updateBlick = (id, key, value) =>
    setState((prev) => ({
      ...prev,
      blicks: prev.blicks.map((b) => (b.id === id ? { ...b, [key]: value } : b)),
    }));

  const addBlick = () =>
    setState((prev) => ({
      ...prev,
      blicks: [
        ...prev.blicks,
        {
          id: Date.now(),
          enabled: true,
          color: '#ffffff',
          shape: 'circle',
          width: 8,
          height: 8,
          blur: 3,
          opacity: 0.6,
          rotation: 0,
          topPct: 50,
          leftPct: 50,
        },
      ],
    }));

  const removeBlick = (id) =>
    setState((prev) => ({
      ...prev,
      blicks: prev.blicks.filter((b) => b.id !== id),
    }));

  // Drop shadow handlers
  const updateDropShadow = (id, key, value) =>
    setState((prev) => ({
      ...prev,
      textDropShadows: prev.textDropShadows.map((s) => (s.id === id ? { ...s, [key]: value } : s)),
    }));

  const addDropShadow = () =>
    setState((prev) => ({
      ...prev,
      textDropShadows: [
        ...prev.textDropShadows,
        { id: Date.now(), enabled: true, color: '#1a4a08', opacity: 0.5, angle: 135, distance: 2, blur: 3 },
      ],
    }));

  const removeDropShadow = (id) =>
    setState((prev) => ({
      ...prev,
      textDropShadows: prev.textDropShadows.filter((s) => s.id !== id),
    }));

  // Inner shadow handlers
  const updateInnerShadow = (id, key, value) =>
    setState((prev) => ({
      ...prev,
      textInnerShadows: prev.textInnerShadows.map((s) => (s.id === id ? { ...s, [key]: value } : s)),
    }));

  const addInnerShadow = () =>
    setState((prev) => ({
      ...prev,
      textInnerShadows: [
        ...prev.textInnerShadows,
        { id: Date.now(), enabled: true, color: '#000000', opacity: 0.5, angle: 63, distance: 2.2, blur: 1 },
      ],
    }));

  const removeInnerShadow = (id) =>
    setState((prev) => ({
      ...prev,
      textInnerShadows: prev.textInnerShadows.filter((s) => s.id !== id),
    }));

  const loadPreset = (preset) => {
    const { name, ...rest } = preset;
    const newState = {
      ...rest,
      blicks: rest.blicks.map((b) => ({ ...b, id: Date.now() + Math.random() })),
      bodyLayers: (rest.bodyLayers || []).map((l) => ({ ...l, id: Date.now() + Math.random() })),
      badges: (rest.badges || []).map((b) => ({ ...b, id: Date.now() + Math.random() })),
      textInnerShadows: rest.textInnerShadows.map((s) => ({ ...s, id: Date.now() + Math.random() })),
      textDropShadows: (rest.textDropShadows || []).map((s) => ({ ...s, id: Date.now() + Math.random() })),
    };
    setState(newState);
    setDefaults(newState);
    setDirectEditTarget(null);
  };

  const handleSave = () => {
    const defaultName = `${state.text || 'Button'} variant`;
    const name = prompt('Variant name:', defaultName);
    if (!name) return;
    const entry = { _id: Date.now(), _name: name.trim(), _tag: 'General', state: { ...state } };
    setSaved((prev) => {
      const next = [...prev, entry];
      saveLibrary(next);
      return next;
    });
  };

  const handleLoad = (variant) => {
    setState(variant.state);
  };

  const updateVariantTag = (id, tag) => {
    setSaved((prev) => {
      const next = prev.map((v) => (v._id === id ? { ...v, _tag: tag } : v));
      saveLibrary(next);
      return next;
    });
  };

  const handleDeleteVariant = (id) => {
    setSaved((prev) => {
      const next = prev.filter((v) => v._id !== id);
      saveLibrary(next);
      return next;
    });
  };

  const handleExport = () => {
    const json = JSON.stringify(state, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      setExportMsg('JSON copied!');
      setTimeout(() => setExportMsg(''), 2000);
    });
  };

  const handleImportJSON = () => {
    const input = prompt('Paste JSON:');
    if (!input) return;
    try {
      const parsed = JSON.parse(input);
      setState(parsed);
      setExportMsg('Imported!');
    } catch {
      setExportMsg('Invalid JSON');
    }
    setTimeout(() => setExportMsg(''), 2000);
  };

  const handleImportFile = () => {
    const el = document.createElement('input');
    el.type = 'file';
    el.accept = '.json';
    el.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          setState(parsed);
          setExportMsg('Imported!');
        } catch {
          setExportMsg('Invalid JSON');
        }
        setTimeout(() => setExportMsg(''), 2000);
      };
      reader.readAsText(file);
    };
    el.click();
  };

  const handleExportCSS = () => {
    const code = generateCSS(state);
    navigator.clipboard.writeText(code).then(() => {
      setExportMsg('CSS copied!');
      setTimeout(() => setExportMsg(''), 2000);
    });
  };

  const handleExportFlutter = () => {
    const code = generateFlutter(state);
    navigator.clipboard.writeText(code).then(() => {
      setExportMsg('Flutter copied!');
      setTimeout(() => setExportMsg(''), 2000);
    });
  };

  const getButtonNaturalWidth = () => {
    // Effective button width from state (button + frame + padding around)
    let w = state.btnWidth || 180;
    if (state.showFrame) {
      w += ((state.frameThickness || 4) + 2) * 2;
      if (state.showFrameInner) w += (state.frameInnerThickness || 2) * 2;
    }
    return w;
  };

  const getExportScale = () => {
    const natural = getButtonNaturalWidth();
    const sizes = { small: 128, normal: 256, high: 512 };
    const target = exportSize === 'custom' ? customExportW : sizes[exportSize] || 256;
    return Math.max(0.5, target / natural);
  };

  const handleExportPNG = async () => {
    if (!previewRef.current) return;
    setExportMsg('Rendering...');
    const sc = getExportScale();
    const pixelRatio = sc;
    try {
      const dataUrl = await toPng(previewRef.current, {
        pixelRatio,
        backgroundColor: 'transparent',
        style: { margin: 0 },
      });
      // Get dimensions from the image
      const img = new Image();
      img.onload = () => {
        setExportMsg(`PNG ${img.width}x${img.height}`);
        const link = document.createElement('a');
        link.download = `${state.text || 'button'}_${img.width}x${img.height}.png`;
        link.href = dataUrl;
        link.click();
        setTimeout(() => setExportMsg(''), 2000);
      };
      img.src = dataUrl;
    } catch (e) {
      console.error(e);
      setExportMsg('PNG failed');
      setTimeout(() => setExportMsg(''), 2000);
    }
  };


  const handleClearSaved = () => {
    if (!confirm('Clear all saved variants?')) return;
    setSaved([]);
    saveLibrary([]);
  };

  const handleResetAll = () => {
    loadPreset(presets[0]);
  };

  // Style library
  const saveStyle = (mode) => {
    const labels = { colors: 'Colors', shape: 'Shape', text: 'Text', full: 'Full' };
    const name = prompt(`Style name (${labels[mode]}):`, `${state.text || 'Button'} ${labels[mode]}`);
    if (!name) return;
    let data = {};
    if (mode === 'colors') {
      COLOR_KEYS.forEach((k) => { if (state[k] !== undefined) data[k] = state[k]; });
    } else if (mode === 'shape') {
      SHAPE_KEYS.forEach((k) => { if (state[k] !== undefined) data[k] = state[k]; });
    } else if (mode === 'text') {
      TEXT_KEYS.forEach((k) => { if (state[k] !== undefined) data[k] = state[k]; });
    } else {
      data = { ...state };
    }
    const entry = { _id: Date.now(), _name: name.trim(), _mode: mode, data };
    const next = [...styles, entry];
    setStyles(next);
    localStorage.setItem(STYLES_KEY, JSON.stringify(next));
  };

  const applyStyle = (style) => {
    setState((prev) => ({ ...prev, ...style.data }));
  };

  const deleteStyle = (id) => {
    const next = styles.filter((s) => s._id !== id);
    setStyles(next);
    localStorage.setItem(STYLES_KEY, JSON.stringify(next));
  };

  const saveCustomPreset = () => {
    const name = prompt('Preset name:');
    if (!name || !name.trim()) return;
    const preset = { ...state, name: name.trim() };
    const updated = [...customPresets.filter((p) => p.name !== name.trim()), preset];
    setCustomPresets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const deleteCustomPreset = (name, e) => {
    e.stopPropagation();
    const updated = customPresets.filter((p) => p.name !== name);
    setCustomPresets(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1 className="header-title">Button Constructor</h1>
        <div className="undo-redo">
          <button className="btn btn-tiny" onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)">&#x21A9;</button>
          <button className="btn btn-tiny" onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Shift+Z)">&#x21AA;</button>
        </div>
        <div className="preset-bar">
          {presets.map((p) => (
            <button
              key={p.name}
              className="preset-btn"
              style={{ background: p.bodyLayers?.[0]?.gradColors?.[1] || '#888' }}
              onClick={() => loadPreset(p)}
            >
              {p.name}
            </button>
          ))}
          {customPresets.length > 0 && <span className="preset-divider" />}
          {customPresets.map((p) => (
            <button
              key={p.name}
              className="preset-btn preset-custom"
              style={{ background: p.bodyLayers?.[0]?.gradColors?.[1] || '#888' }}
              onClick={() => loadPreset(p)}
            >
              {p.name}
              <span
                className="preset-delete"
                onClick={(e) => deleteCustomPreset(p.name, e)}
              >
                ✕
              </span>
            </button>
          ))}
        </div>
      </header>

      {/* Body */}
      <div className="app-body">
        {/* Left: Controls */}
        <ControlPanel
          state={state}
          defaults={defaults}
          update={update}
          updateBodyLayer={updateBodyLayer}
          updateBodyLayerGradColor={updateBodyLayerGradColor}
          updateBodyLayerGradStop={updateBodyLayerGradStop}
          addBodyLayer={addBodyLayer}
          removeBodyLayer={removeBodyLayer}
          moveBodyLayer={moveBodyLayer}
          updateBlick={updateBlick}
          addBlick={addBlick}
          removeBlick={removeBlick}
          updateBadge={updateBadge}
          addBadge={addBadge}
          removeBadge={removeBadge}
          onCopyButton={() => copySection('button')}
          onPasteButton={() => pasteSection('button')}
          onCopyStates={() => copySection('states')}
          onPasteStates={() => pasteSection('states')}
          directEditTarget={directEditTarget}
          setDirectEditTarget={setDirectEditTarget}
        />

        {/* Center: Preview */}
        <div className="preview-panel">
          {/* Toolbar */}
          <div className="preview-toolbar">
            <div className="toolbar-group">
              <span className="toolbar-label">Mode</span>
              <button className={`btn btn-tiny ${state.renderMode !== 'svg' ? 'active' : ''}`} onClick={() => update('renderMode', 'css')}>CSS</button>
              <button className={`btn btn-tiny ${state.renderMode === 'svg' ? 'active' : ''}`} onClick={() => update('renderMode', 'svg')}>SVG</button>
            </div>
            <div className="toolbar-group">
              <span className="toolbar-label">BG</span>
              {[
                { c: '#0c0c14', t: 'Dark' },
                { c: '#2a2a3a', t: 'Medium' },
                { c: '#e8e8e8', t: 'Light' },
                { c: '#ffffff', t: 'White' },
                { c: 'linear-gradient(180deg, #1a3a5c 0%, #2a1a4a 100%)', t: 'Game' },
                { c: 'checker', t: 'Checker' },
              ].map((bg) => (
                <button
                  key={bg.c}
                  className={`bg-btn ${previewBg === bg.c ? 'active' : ''} ${bg.c === 'checker' ? 'checker-bg' : ''}`}
                  style={bg.c !== 'checker' ? { background: bg.c } : undefined}
                  title={bg.t}
                  onClick={() => setPreviewBg(bg.c)}
                />
              ))}
              <input
                type="color"
                className="bg-custom"
                value={previewBg.startsWith('#') ? previewBg : '#0c0c14'}
                title="Custom"
                onChange={(e) => setPreviewBg(e.target.value)}
              />
            </div>
            <div className="toolbar-group">
              <span className="toolbar-label">Zoom</span>
              <input
                type="range"
                className="zoom-slider"
                min={50}
                max={200}
                value={previewZoom}
                onChange={(e) => setPreviewZoom(parseInt(e.target.value))}
              />
              <span className="zoom-value">{previewZoom}%</span>
              <button className="btn btn-tiny" onClick={() => setPreviewZoom(100)}>1:1</button>
              <button
                className={`btn btn-tiny ${showGrid && previewZoom >= 150 ? 'active' : ''}`}
                onClick={() => setShowGrid(!showGrid)}
                title="Show pixel grid (visible at zoom 150%+)"
              >Grid</button>
            </div>
          </div>

          {directEditTarget && (
            <div className="direct-edit-info">
              <span className="dei-dot" />Editing: <strong>{directEditTarget.label}</strong> — drag to move, orange = rotate, blue = scale
              <button className="btn btn-tiny" style={{ marginLeft: 'auto' }} onClick={() => setDirectEditTarget(null)}>Done</button>
            </div>
          )}

          <div className="state-tabs">
            {['normal', 'hover', 'pressed', 'disabled'].map((st) => (
              <button
                key={st}
                className={`state-tab ${activeState === st ? 'active' : ''}`}
                onClick={() => setActiveState(st)}
              >
                {st.charAt(0).toUpperCase() + st.slice(1)}
              </button>
            ))}
          </div>

          <div
            className={`preview-area ${previewBg === 'checker' ? 'checker-bg' : ''}`}
            style={previewBg !== 'checker' ? { background: previewBg } : undefined}
          >
            <div style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'center' }}>
              <div ref={previewRef} style={{ display: 'inline-flex', padding: 40, overflow: 'visible' }}>
                <div ref={bodyRef} style={{ position: 'relative', display: 'inline-flex' }}>
                  <ButtonPreview state={state} activeState={activeState} />
                  {showGrid && previewZoom >= 150 && (
                    <div className="pixel-grid-overlay" />
                  )}
                  {directEditTarget && (
                    <DirectEditOverlay
                      state={state}
                      target={directEditTarget}
                      onUpdate={handleDirectUpdate}
                      containerRef={bodyRef}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Size variants */}
          <div className="variants-bar">
            <button className={`btn btn-tiny ${showVariants ? 'active' : ''}`} onClick={() => setShowVariants(!showVariants)}>
              Size Variants
            </button>
          </div>
          {showVariants && (
            <div className="variants-row">
              {[
                { label: 'Large', wMult: 2.0, hMult: 1.2, fMult: 1.2 },
                { label: 'Medium', wMult: 1.0, hMult: 1.0, fMult: 1.0 },
                { label: 'Small', wMult: 0.6, hMult: 0.85, fMult: 0.8 },
                { label: 'Icon', wMult: 0.35, hMult: 1.0, fMult: 1.0, iconOnly: true },
              ].map((v) => {
                const variant = {
                  ...state,
                  btnWidth: Math.round((state.btnWidth || 180) * v.wMult),
                  btnHeight: Math.round((state.btnHeight || 58) * v.hMult),
                  fontSize: Math.round((state.fontSize || 30) * v.fMult),
                  autoSize: false,
                };
                if (v.iconOnly) {
                  variant.btnWidth = variant.btnHeight;
                  variant.showText = false;
                  variant.showIcon = true;
                  variant.iconFreePosition = true;
                  variant.iconOffsetX = 0;
                  variant.iconOffsetY = 0;
                }
                return (
                  <div key={v.label} className="variant-item">
                    <ButtonPreview state={variant} scale={0.4} />
                    <span className="variant-label">{v.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="action-groups">
            <div className="action-group">
              <span className="action-group-label">Save</span>
              <div className="action-group-btns">
                <button className="btn btn-action" onClick={handleSave} title="Save current button to the library with a name">Variant</button>
                <button className="btn btn-action btn-accent" onClick={saveCustomPreset} title="Save as a reusable preset in the header bar">Preset</button>
              </div>
            </div>

            <div className="action-group">
              <span className="action-group-label">Style</span>
              <div className="action-group-btns">
                <button className="btn btn-tiny" onClick={() => saveStyle('colors')} title="Save only color settings to apply to other buttons">Colors</button>
                <button className="btn btn-tiny" onClick={() => saveStyle('shape')} title="Save only size and shape settings">Shape</button>
                <button className="btn btn-tiny" onClick={() => saveStyle('text')} title="Save all text effects to apply on another button">Text</button>
                <button className="btn btn-tiny" onClick={() => saveStyle('full')} title="Save all settings as a reusable style">Full</button>
              </div>
            </div>

            <div className="action-group">
              <span className="action-group-label">Export</span>
              <div className="action-group-btns">
                <button className="btn btn-action" onClick={handleExport} title="Copy full button state as JSON to clipboard">JSON</button>
                <button className="btn btn-tiny" onClick={handleImportJSON} title="Paste JSON from clipboard to load button">Paste</button>
                <button className="btn btn-tiny" onClick={handleImportFile} title="Load button from a .json file">File</button>
                <button className="btn btn-action" onClick={handleExportCSS} title="Copy CSS class code to clipboard">CSS</button>
                <button className="btn btn-action" onClick={handleExportFlutter} title="Copy Flutter/Dart BoxDecoration code to clipboard">Flutter</button>
              </div>
            </div>

            <div className="action-group">
              <span className="action-group-label">Download</span>
              <div className="action-group-btns">
                <select className="method-select export-size-select" value={exportSize} onChange={(e) => setExportSize(e.target.value)} title="Export size">
                  <option value="small">Small (128px)</option>
                  <option value="normal">Normal (256px)</option>
                  <option value="high">High (512px)</option>
                  <option value="custom">Custom</option>
                </select>
                {exportSize === 'custom' && (
                  <input type="number" className="value-input" style={{ width: 52 }} value={customExportW} min={32} max={4096} onChange={(e) => setCustomExportW(parseInt(e.target.value) || 256)} title="Width in pixels" />
                )}
                <button className="btn btn-action" onClick={handleExportPNG} title="Download button as PNG image">PNG</button>
              </div>
            </div>

            <div className="action-group">
              <span className="action-group-label">Reset</span>
              <div className="action-group-btns">
                <button className="btn btn-action" onClick={handleResetAll} title="Reset all parameters to the default Green preset">All Settings</button>
                <button className="btn btn-action btn-danger" onClick={handleClearSaved} title="Delete all saved variants from the library">Saved</button>
              </div>
            </div>

            {exportMsg && <span className="export-msg">{exportMsg}</span>}
          </div>

          {saved.length > 0 && (
            <div className="library-section">
              <div className="library-toolbar">
                <div className="tag-filter">
                  {['All', 'Play', 'Shop', 'Settings', 'General'].map((t) => (
                    <button key={t} className={`btn btn-tiny ${libraryTag === t ? 'active' : ''}`} onClick={() => setLibraryTag(t)}>{t}</button>
                  ))}
                </div>
                <input
                  type="text"
                  className="text-input library-search"
                  placeholder="Search..."
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                />
              </div>
              <div className="saved-gallery">
                {saved
                  .filter((v) => libraryTag === 'All' || v._tag === libraryTag)
                  .filter((v) => !librarySearch || v._name?.toLowerCase().includes(librarySearch.toLowerCase()))
                  .map((variant) => (
                    <div key={variant._id} className="saved-item">
                      <div className="saved-preview" onClick={() => handleLoad(variant)} title="Click to load">
                        <ButtonPreview state={variant.state} scale={0.5} />
                      </div>
                      <div className="saved-info">
                        <span className="saved-name">{variant._name}</span>
                        <select className="tag-select" value={variant._tag || 'General'} onChange={(e) => updateVariantTag(variant._id, e.target.value)}>
                          {['General', 'Play', 'Shop', 'Settings'].map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <button className="btn btn-delete" onClick={() => handleDeleteVariant(variant._id)}>✕</button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
          {styles.length > 0 && (
            <div className="library-section">
              <div className="library-toolbar">
                <span className="toolbar-label">Styles</span>
              </div>
              <div className="styles-gallery">
                {styles.map((st) => (
                  <div key={st._id} className="style-item" onClick={() => applyStyle(st)} title={`Apply: ${st._name}`}>
                    <span className={`style-badge style-${st._mode}`}>{st._mode === 'colors' ? 'C' : st._mode === 'shape' ? 'S' : st._mode === 'text' ? 'T' : 'F'}</span>
                    <span className="style-name">{st._name}</span>
                    <button className="btn btn-delete" onClick={(e) => { e.stopPropagation(); deleteStyle(st._id); }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Text controls */}
        <TextPanel
          state={state}
          defaults={defaults}
          update={update}
          updateDropShadow={updateDropShadow}
          addDropShadow={addDropShadow}
          removeDropShadow={removeDropShadow}
          updateInnerShadow={updateInnerShadow}
          addInnerShadow={addInnerShadow}
          removeInnerShadow={removeInnerShadow}
          onCopyText={() => copySection('text')}
          onPasteText={() => pasteSection('text')}
          onCopyFrame={() => copySection('frame')}
          onPasteFrame={() => pasteSection('frame')}
        />
      </div>
    </div>
  );
}
