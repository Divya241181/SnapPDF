import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RefreshCw, Crop, Move, Info, RotateCcw, RotateCw, FlipHorizontal2, FlipVertical2 } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────
const HANDLE_RADIUS = 12;       // larger = easier to grab on touch
const HIT_RADIUS    = 18;       // extra invisible hit area around handles
const MIN_CROP_SIZE = 30;
const OVERLAY_COLOR = 'rgba(0,0,0,0.62)';
const BORDER_COLOR  = '#3b82f6';
const HANDLE_COLOR  = '#ffffff';
const GRID_COLOR    = 'rgba(255,255,255,0.25)';

const HANDLE_DEF = [
  { id: 'tl', xFrac: 0,   yFrac: 0   },
  { id: 'tm', xFrac: 0.5, yFrac: 0   },
  { id: 'tr', xFrac: 1,   yFrac: 0   },
  { id: 'ml', xFrac: 0,   yFrac: 0.5 },
  { id: 'mr', xFrac: 1,   yFrac: 0.5 },
  { id: 'bl', xFrac: 0,   yFrac: 1   },
  { id: 'bm', xFrac: 0.5, yFrac: 1   },
  { id: 'br', xFrac: 1,   yFrac: 1   },
];

const CURSORS = {
  tl: 'nw-resize', tm: 'n-resize',  tr: 'ne-resize',
  ml: 'w-resize',  mr: 'e-resize',
  bl: 'sw-resize', bm: 's-resize',  br: 'se-resize',
  move: 'move', default: 'crosshair',
};

// ─── Helpers ──────────────────────────────────────────────
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

// ─── Main Component ───────────────────────────────────────
const ManualCropModal = ({ isOpen, image, onCropComplete, onClose }) => {
  const canvasRef  = useRef(null);
  const imgRef     = useRef(null);
  const imgRectRef = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const boxRef     = useRef(null);
  const rafRef     = useRef(null);
  const showGridRef = useRef(true);

  // Per-frame delta tracking — eliminates "accumulator drift" at image edges
  const prevPosRef = useRef({ x: 0, y: 0 });

  // All drag state lives in a ref — no stale closures, no re-renders on move
  const dragRef = useRef({ active: false, type: null, handleId: null });

  // React state only for UI displays (cursor, info strip, processing)
  const [box,          setBox]          = useState(null);
  const [cursor,       setCursor]       = useState('crosshair');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGrid,     setShowGrid]     = useState(true);

  // Keep showGridRef in sync with toggle state
  useEffect(() => { showGridRef.current = showGrid; }, [showGrid]);

  // ─── Pure imperative draw (reads refs, zero React dependency) ──────────
  const drawCanvas = useCallback(() => {
    const b      = boxRef.current;
    const img    = imgRef.current;
    const canvas = canvasRef.current;
    if (!b || !img || !canvas) return;

    const ctx = canvas.getContext('2d');
    const ir  = imgRectRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Image
    ctx.drawImage(img, ir.x, ir.y, ir.w, ir.h);

    // Dimmed overlay (4 rects around the crop box)
    ctx.fillStyle = OVERLAY_COLOR;
    ctx.fillRect(0,         0,         canvas.width, b.y);
    ctx.fillRect(0,         b.y + b.h, canvas.width, canvas.height - (b.y + b.h));
    ctx.fillRect(0,         b.y,       b.x,          b.h);
    ctx.fillRect(b.x + b.w, b.y,       canvas.width - (b.x + b.w), b.h);

    // Rule-of-thirds grid
    if (showGridRef.current) {
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth   = 0.8;
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(b.x + (b.w / 3) * i, b.y);
        ctx.lineTo(b.x + (b.w / 3) * i, b.y + b.h);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(b.x,        b.y + (b.h / 3) * i);
        ctx.lineTo(b.x + b.w,  b.y + (b.h / 3) * i);
        ctx.stroke();
      }
    }

    // Crop border
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth   = 2;
    ctx.strokeRect(b.x, b.y, b.w, b.h);

    // Corner L-brackets
    const bl = 16;
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth   = 3;
    ctx.lineCap     = 'round';
    [
      { cx: b.x,       cy: b.y,       dx:  1, dy:  1 },
      { cx: b.x + b.w, cy: b.y,       dx: -1, dy:  1 },
      { cx: b.x,       cy: b.y + b.h, dx:  1, dy: -1 },
      { cx: b.x + b.w, cy: b.y + b.h, dx: -1, dy: -1 },
    ].forEach(({ cx, cy, dx, dy }) => {
      ctx.beginPath();
      ctx.moveTo(cx + dx * bl, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * bl);
      ctx.stroke();
    });

    // Drag handles
    HANDLE_DEF.forEach(({ xFrac, yFrac }) => {
      const hx = b.x + b.w * xFrac;
      const hy = b.y + b.h * yFrac;

      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.4)';
      ctx.shadowBlur  = 6;
      ctx.beginPath();
      ctx.arc(hx, hy, HANDLE_RADIUS, 0, Math.PI * 2);
      ctx.fillStyle = HANDLE_COLOR;
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(hx, hy, HANDLE_RADIUS, 0, Math.PI * 2);
      ctx.strokeStyle = BORDER_COLOR;
      ctx.lineWidth   = 2.5;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(hx, hy, 3, 0, Math.PI * 2);
      ctx.fillStyle = BORDER_COLOR;
      ctx.fill();
    });

    // Size readout label
    const scaleX = img.naturalWidth  / ir.w;
    const scaleY = img.naturalHeight / ir.h;
    const realW  = Math.round(b.w * scaleX);
    const realH  = Math.round(b.h * scaleY);
    const label  = `${realW} × ${realH} px`;
    ctx.font      = 'bold 11px ui-monospace, monospace';
    const tw      = ctx.measureText(label).width;
    const lx      = clamp(b.x + b.w / 2 - tw / 2 - 6, 4, canvas.width - tw - 16);
    const ly      = b.y - 14 > 4 ? b.y - 10 : b.y + b.h + 22;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.beginPath();
    ctx.roundRect(lx - 2, ly - 13, tw + 16, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(label, lx + 6, ly);
  }, []); // stable — reads only refs

  // ─── RAF-deduplicated redraw scheduler ────────────────────────────────
  const scheduleRedraw = useCallback(() => {
    if (rafRef.current) return; // already scheduled this frame
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      drawCanvas();
    });
  }, [drawCanvas]);

  // ─── Load image ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !image) return;
    loadImage(image).then((img) => {
      imgRef.current = img;
      const canvas    = canvasRef.current;
      if (!canvas) return;
      const cw = canvas.parentElement.clientWidth;
      const ch = canvas.parentElement.clientHeight;
      canvas.width  = cw;
      canvas.height = ch;

      const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight, 1);
      const iw = img.naturalWidth  * scale;
      const ih = img.naturalHeight * scale;
      const ix = (cw - iw) / 2;
      const iy = (ch - ih) / 2;
      imgRectRef.current = { x: ix, y: iy, w: iw, h: ih };

      const pad     = 0.1;
      const initBox = { x: ix + iw * pad, y: iy + ih * pad, w: iw * (1 - 2 * pad), h: ih * (1 - 2 * pad) };
      boxRef.current = initBox;
      setBox({ ...initBox });
      drawCanvas();
    });
  }, [isOpen, image, drawCanvas]);

  // Redraw when grid toggle changes (outside drag — safe to call directly)
  useEffect(() => { if (boxRef.current) drawCanvas(); }, [showGrid, drawCanvas]);

  // Cleanup dangling RAF on unmount
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  // ─── Constraint: keep box inside image, enforce MIN_CROP_SIZE ─────────
  const constrainBox = (b) => {
    const ir = imgRectRef.current;
    let { x, y, w, h } = b;

    // Enforce minimum dimensions first
    w = Math.max(w, MIN_CROP_SIZE);
    h = Math.max(h, MIN_CROP_SIZE);

    // Clamp right/bottom edges, then adjust left/top if needed
    if (x + w > ir.x + ir.w) x = ir.x + ir.w - w;
    if (y + h > ir.y + ir.h) y = ir.y + ir.h - h;
    if (x < ir.x) { w = Math.max(MIN_CROP_SIZE, w - (ir.x - x)); x = ir.x; }
    if (y < ir.y) { h = Math.max(MIN_CROP_SIZE, h - (ir.y - y)); y = ir.y; }

    // Final clamp to guarantee in-bounds
    x = clamp(x, ir.x, ir.x + ir.w - MIN_CROP_SIZE);
    y = clamp(y, ir.y, ir.y + ir.h - MIN_CROP_SIZE);
    w = clamp(w, MIN_CROP_SIZE, ir.x + ir.w - x);
    h = clamp(h, MIN_CROP_SIZE, ir.y + ir.h - y);

    return { x, y, w, h };
  };

  // ─── Coordinate helpers ───────────────────────────────────────────────
  // Correct for CSS-scaled canvas (canvas.width may differ from rect.width)
  const getEventXY = (e) => {
    const canvas = canvasRef.current;
    const rect   = canvas.getBoundingClientRect();
    const sx     = canvas.width  / rect.width;
    const sy     = canvas.height / rect.height;
    const src    = e.touches ? e.touches[0] : e;
    return {
      px: (src.clientX - rect.left) * sx,
      py: (src.clientY - rect.top)  * sy,
    };
  };

  const getHandleAt = (px, py) => {
    const b = boxRef.current;
    if (!b) return null;
    for (const h of HANDLE_DEF) {
      const hx = b.x + b.w * h.xFrac;
      const hy = b.y + b.h * h.yFrac;
      if (Math.hypot(px - hx, py - hy) <= HIT_RADIUS) return h.id;
    }
    return null;
  };

  const isInsideBox = (px, py) => {
    const b = boxRef.current;
    if (!b) return false;
    return px > b.x && px < b.x + b.w && py > b.y && py < b.y + b.h;
  };

  // ─── Pointer Down ─────────────────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    const { px, py } = getEventXY(e);
    const handle = getHandleAt(px, py);
    if (handle) {
      dragRef.current = { active: true, type: 'handle', handleId: handle };
      prevPosRef.current = { x: px, y: py };
    } else if (isInsideBox(px, py)) {
      dragRef.current = { active: true, type: 'move', handleId: null };
      prevPosRef.current = { x: px, y: py };
    }
  }, []); // stable — reads only refs

  // ─── Pointer Move ─────────────────────────────────────────────────────
  // KEY: uses FRAME-DELTA (current − prev) not total-delta (current − start).
  // This means hitting an edge never "winds up" the delta — movement resumes
  // the instant you drag back, with zero perceivable lag.
  const onPointerMove = useCallback((e) => {
    const { px, py } = getEventXY(e);

    // Cursor update (cheap, always runs even when not dragging)
    if (!dragRef.current.active) {
      const hid = getHandleAt(px, py);
      setCursor(hid ? CURSORS[hid] : isInsideBox(px, py) ? CURSORS.move : CURSORS.default);
      return;
    }

    e.preventDefault();

    // Frame delta
    const dx = px - prevPosRef.current.x;
    const dy = py - prevPosRef.current.y;
    prevPosRef.current = { x: px, y: py };

    let { x, y, w, h } = boxRef.current;
    const { type, handleId } = dragRef.current;

    if (type === 'move') {
      x += dx;
      y += dy;
    } else {
      // Resize — each handle adjusts its own edges only
      switch (handleId) {
        case 'tl': x += dx; y += dy; w -= dx; h -= dy; break;
        case 'tm':           y += dy;           h -= dy; break;
        case 'tr':           y += dy; w += dx; h -= dy; break;
        case 'ml': x += dx;           w -= dx;           break;
        case 'mr':                     w += dx;           break;
        case 'bl': x += dx;           w -= dx; h += dy;  break;
        case 'bm':                              h += dy;  break;
        case 'br':                     w += dx; h += dy;  break;
        default: break;
      }
    }

    const nb = constrainBox({ x, y, w, h });
    boxRef.current = nb;
    scheduleRedraw(); // batched into next animation frame
  }, [scheduleRedraw]);

  // ─── Pointer Up ───────────────────────────────────────────────────────
  const onPointerUp = useCallback(() => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    // Sync React state once at the END of drag (for the info strip)
    if (boxRef.current) setBox({ ...boxRef.current });
  }, []);

  // ─── Attach touch events imperatively (passive:false required for preventDefault) ─
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;
    canvas.addEventListener('touchstart',  onPointerDown, { passive: false });
    canvas.addEventListener('touchmove',   onPointerMove, { passive: false });
    canvas.addEventListener('touchend',    onPointerUp,   { passive: true  });
    canvas.addEventListener('touchcancel', onPointerUp,   { passive: true  });
    return () => {
      canvas.removeEventListener('touchstart',  onPointerDown);
      canvas.removeEventListener('touchmove',   onPointerMove);
      canvas.removeEventListener('touchend',    onPointerUp);
      canvas.removeEventListener('touchcancel', onPointerUp);
    };
  }, [isOpen, onPointerDown, onPointerMove, onPointerUp]);

  // ─── Apply crop ───────────────────────────────────────────────────────
  const handleApply = async () => {
    const b = boxRef.current;
    if (!b || !imgRef.current) return;
    setIsProcessing(true);
    try {
      const ir    = imgRectRef.current;
      const img   = imgRef.current;
      const sxR   = img.naturalWidth  / ir.w;
      const syR   = img.naturalHeight / ir.h;
      const cropX = (b.x - ir.x) * sxR;
      const cropY = (b.y - ir.y) * syR;
      const cropW = b.w * sxR;
      const cropH = b.h * syR;

      const off   = document.createElement('canvas');
      off.width   = cropW;
      off.height  = cropH;
      const ctx   = off.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      const blobUrl = await new Promise((res) =>
        off.toBlob((blob) => res(URL.createObjectURL(blob)), 'image/jpeg', 0.95)
      );
      onCropComplete(blobUrl);
    } catch (err) {
      console.error('Crop failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Reset / Select-all ───────────────────────────────────────────────
  const handleReset = () => {
    const ir  = imgRectRef.current;
    const pad = 0.1;
    const nb  = constrainBox({ x: ir.x + ir.w * pad, y: ir.y + ir.h * pad, w: ir.w * (1 - 2 * pad), h: ir.h * (1 - 2 * pad) });
    boxRef.current = nb;
    setBox({ ...nb });
    drawCanvas();
  };

  const handleSelectAll = () => {
    const { x, y, w, h } = imgRectRef.current;
    boxRef.current = { x, y, w, h };
    setBox({ x, y, w, h });
    drawCanvas();
  };

  // ─── Transform helpers (rotate / flip) ────────────────────────────────
  // Bakes the transform into a new off-screen canvas then reloads imgRef so
  // every downstream operation (drag, resize, Apply Crop) sees the correct source.
  const transformImage = useCallback((rotateDeg, flipX, flipY) => {
    const src = imgRef.current;
    if (!src) return;

    const rad  = (rotateDeg * Math.PI) / 180;
    const cos  = Math.abs(Math.cos(rad));
    const sin  = Math.abs(Math.sin(rad));
    const srcW = src.naturalWidth;
    const srcH = src.naturalHeight;
    // 90° rotations swap width ↔ height
    const outW = Math.round(srcW * cos + srcH * sin);
    const outH = Math.round(srcW * sin + srcH * cos);

    const off = document.createElement('canvas');
    off.width  = outW;
    off.height = outH;
    const ctx  = off.getContext('2d');
    ctx.save();
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate(rad);
    if (flipX) ctx.scale(-1,  1);
    if (flipY) ctx.scale( 1, -1);
    ctx.drawImage(src, -srcW / 2, -srcH / 2);
    ctx.restore();

    off.toBlob((blob) => {
      const url    = URL.createObjectURL(blob);
      const newImg = new Image();
      newImg.crossOrigin = 'anonymous';
      newImg.onload = () => {
        imgRef.current = newImg;
        URL.revokeObjectURL(url);

        const canvas = canvasRef.current;
        if (!canvas) return;
        const cw    = canvas.width;
        const ch    = canvas.height;
        const scale = Math.min(cw / newImg.naturalWidth, ch / newImg.naturalHeight, 1);
        const iw    = newImg.naturalWidth  * scale;
        const ih    = newImg.naturalHeight * scale;
        const ix    = (cw - iw) / 2;
        const iy    = (ch - ih) / 2;
        imgRectRef.current = { x: ix, y: iy, w: iw, h: ih };

        const pad = 0.08;
        const nb  = { x: ix + iw * pad, y: iy + ih * pad, w: iw * (1 - 2 * pad), h: ih * (1 - 2 * pad) };
        boxRef.current = nb;
        setBox({ ...nb });
        drawCanvas();
      };
      newImg.src = url;
    }, 'image/png');
  }, [drawCanvas]);

  const handleRotateLeft  = useCallback(() => transformImage(-90, false, false), [transformImage]);
  const handleRotateRight = useCallback(() => transformImage( 90, false, false), [transformImage]);
  const handleFlipH       = useCallback(() => transformImage(  0,  true, false), [transformImage]);
  const handleFlipV       = useCallback(() => transformImage(  0, false,  true), [transformImage]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="manual-crop-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 bg-slate-950/95 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          exit={{ scale: 0.95,    opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="relative w-full max-w-5xl h-full sm:h-[90vh] bg-[#020617] sm:rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-slate-800"
        >
          {/* ── Header ─────────────────────────────────── */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-xl">
                <Crop className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Manual Crop</h3>
                <p className="hidden sm:block text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                  Drag handles to resize · Drag inside to move
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowGrid(g => !g)}
                title="Toggle grid"
                className={`p-2 rounded-xl text-xs font-bold transition-all ${showGrid ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="14" height="14" rx="1"/>
                  <line x1="5.67" y1="1" x2="5.67" y2="15"/>
                  <line x1="10.33" y1="1" x2="10.33" y2="15"/>
                  <line x1="1" y1="5.67" x2="15" y2="5.67"/>
                  <line x1="1" y1="10.33" x2="15" y2="10.33"/>
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* ── Canvas Work Area ─────────────────────── */}
          <div className="relative flex-1 overflow-hidden">
            <canvas
              ref={canvasRef}
              style={{ cursor, display: 'block', width: '100%', height: '100%' }}
              onMouseDown={onPointerDown}
              onMouseMove={onPointerMove}
              onMouseUp={onPointerUp}
              onMouseLeave={onPointerUp}
              // Touch events are attached imperatively with { passive: false }
            />
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full pointer-events-none select-none">
              <Move className="w-3 h-3" />
              <span className="hidden sm:inline">Drag handles to resize · Drag inside to move</span>
              <span className="sm:hidden">Drag to crop</span>
            </div>
          </div>

          {/* ── Footer Toolbar ───────────────────────── */}
          <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 z-50">

            {/* ── Transform row ── */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 hidden sm:block mr-1">Transform</span>

              <motion.button
                whileHover={{ scale: 1.08, backgroundColor: 'rgba(99,102,241,0.25)' }}
                whileTap={{ scale: 0.86, rotate: -20 }}
                transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                onClick={handleRotateLeft}
                disabled={isProcessing}
                title="Rotate 90° counter-clockwise"
                className="flex-1 py-2 sm:py-2.5 bg-slate-800 border border-slate-700 hover:border-indigo-500/60 text-slate-300 hover:text-indigo-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:block">CCW</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08, backgroundColor: 'rgba(99,102,241,0.25)' }}
                whileTap={{ scale: 0.86, rotate: 20 }}
                transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                onClick={handleRotateRight}
                disabled={isProcessing}
                title="Rotate 90° clockwise"
                className="flex-1 py-2 sm:py-2.5 bg-slate-800 border border-slate-700 hover:border-indigo-500/60 text-slate-300 hover:text-indigo-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <RotateCw className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:block">CW</span>
              </motion.button>

              <div className="w-px h-7 bg-slate-700 mx-1 flex-shrink-0" />

              <motion.button
                whileHover={{ scale: 1.08, backgroundColor: 'rgba(20,184,166,0.2)' }}
                whileTap={{ scale: 0.86, scaleX: -1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                onClick={handleFlipH}
                disabled={isProcessing}
                title="Flip horizontal (mirror left↔right)"
                className="flex-1 py-2 sm:py-2.5 bg-slate-800 border border-slate-700 hover:border-teal-500/60 text-slate-300 hover:text-teal-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <FlipHorizontal2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:block">Flip H</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08, backgroundColor: 'rgba(20,184,166,0.2)' }}
                whileTap={{ scale: 0.86, scaleY: -1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 14 }}
                onClick={handleFlipV}
                disabled={isProcessing}
                title="Flip vertical (mirror top↔bottom)"
                className="flex-1 py-2 sm:py-2.5 bg-slate-800 border border-slate-700 hover:border-teal-500/60 text-slate-300 hover:text-teal-300 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
              >
                <FlipVertical2 className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:block">Flip V</span>
              </motion.button>
            </div>

            <div className="h-px bg-slate-800 mb-3" />

            {box && imgRef.current && (
              <div className="flex items-center gap-2 mb-3 text-slate-500 text-[10px] font-mono">
                <Info className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <span>
                  Crop:&nbsp;
                  {Math.round((box.x - imgRectRef.current.x) * (imgRef.current.naturalWidth  / imgRectRef.current.w))} ×&nbsp;
                  {Math.round((box.y - imgRectRef.current.y) * (imgRef.current.naturalHeight / imgRectRef.current.h))} →&nbsp;
                  {Math.round(box.w * (imgRef.current.naturalWidth  / imgRectRef.current.w))} ×&nbsp;
                  {Math.round(box.h * (imgRef.current.naturalHeight / imgRectRef.current.h))} px
                </span>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleReset} disabled={isProcessing}
                className="flex-1 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider disabled:opacity-40"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={handleSelectAll} disabled={isProcessing}
                className="flex-1 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider disabled:opacity-40"
              >
                <Crop className="w-3.5 h-3.5" /> Full
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}
                onClick={handleApply} disabled={isProcessing}
                className="flex-[2.5] py-2.5 sm:py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all uppercase tracking-wider disabled:opacity-50 text-white shadow-lg shadow-blue-600/30"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)' }}
              >
                {isProcessing
                  ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white" />
                  : <><Check className="w-4 h-4" /> Apply Crop</>
                }
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ManualCropModal;
