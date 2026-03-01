import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, RefreshCw, Crop, Move, Info } from 'lucide-react';

// ─── Constants ────────────────────────────────────────────
const HANDLE_RADIUS = 10;      // px radius of drag handles (touch-friendly)
const MIN_CROP_SIZE  = 30;     // minimum width/height of selection box
const OVERLAY_COLOR  = 'rgba(0, 0, 0, 0.62)';
const BORDER_COLOR   = '#3b82f6';
const HANDLE_COLOR   = '#ffffff';
const HANDLE_BORDER  = '#3b82f6';
const GRID_COLOR     = 'rgba(255,255,255,0.25)';

// Handle positions (fractions of box: [xFrac, yFrac])
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

// CSS cursor per handle id
const CURSORS = {
  tl: 'nw-resize', tm: 'n-resize', tr: 'ne-resize',
  ml: 'w-resize',  mr: 'e-resize',
  bl: 'sw-resize', bm: 's-resize', br: 'se-resize',
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
  const canvasRef = useRef(null);
  const imgRef    = useRef(null);   // loaded HTMLImageElement

  // imgRect: where the image is drawn on the canvas {x, y, w, h}
  const imgRectRef = useRef({ x: 0, y: 0, w: 0, h: 0 });

  // crop box in canvas-space pixels {x, y, w, h}
  const [box, setBox] = useState(null);
  const boxRef = useRef(null);

  // Pointer drag state
  const dragRef = useRef({
    active: false,
    type: null,     // 'move' | 'handle'
    handleId: null,
    startX: 0, startY: 0,
    startBox: null,
  });

  const [cursor, setCursor] = useState('crosshair');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // ── Load image & compute initial layout ────────────────
  useEffect(() => {
    if (!isOpen || !image) return;

    loadImage(image).then((img) => {
      imgRef.current = img;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const container = canvas.parentElement;
      const cw = container.clientWidth;
      const ch = container.clientHeight;

      canvas.width  = cw;
      canvas.height = ch;

      const scale = Math.min(cw / img.naturalWidth, ch / img.naturalHeight, 1);
      const iw = img.naturalWidth  * scale;
      const ih = img.naturalHeight * scale;
      const ix = (cw - iw) / 2;
      const iy = (ch - ih) / 2;

      imgRectRef.current = { x: ix, y: iy, w: iw, h: ih };

      // Initial crop box: 80% inset of image
      const pad = 0.1;
      const initBox = {
        x: ix + iw * pad,
        y: iy + ih * pad,
        w: iw * (1 - 2 * pad),
        h: ih * (1 - 2 * pad),
      };
      boxRef.current = initBox;
      setBox({ ...initBox });
    });
  }, [isOpen, image]);

  // ── Redraw canvas whenever box changes ─────────────────
  useEffect(() => {
    if (!box || !imgRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');
    const img    = imgRef.current;
    const ir     = imgRectRef.current;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw image
    ctx.drawImage(img, ir.x, ir.y, ir.w, ir.h);

    // ── Dimmed overlay (4 rects around the box) ───────────
    ctx.fillStyle = OVERLAY_COLOR;
    // Top
    ctx.fillRect(0, 0, canvas.width, box.y);
    // Bottom
    ctx.fillRect(0, box.y + box.h, canvas.width, canvas.height - (box.y + box.h));
    // Left
    ctx.fillRect(0, box.y, box.x, box.h);
    // Right
    ctx.fillRect(box.x + box.w, box.y, canvas.width - (box.x + box.w), box.h);

    // ── Rule-of-thirds grid ────────────────────────────────
    if (showGrid) {
      ctx.strokeStyle = GRID_COLOR;
      ctx.lineWidth   = 0.8;
      // vertical thirds
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(box.x + (box.w / 3) * i, box.y);
        ctx.lineTo(box.x + (box.w / 3) * i, box.y + box.h);
        ctx.stroke();
      }
      // horizontal thirds
      for (let i = 1; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(box.x, box.y + (box.h / 3) * i);
        ctx.lineTo(box.x + box.w, box.y + (box.h / 3) * i);
        ctx.stroke();
      }
    }

    // ── Crop border ────────────────────────────────────────
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth   = 2;
    ctx.strokeRect(box.x, box.y, box.w, box.h);

    // ── Corner accents (L-brackets) ───────────────────────
    const bracketLen = 16;
    ctx.strokeStyle = BORDER_COLOR;
    ctx.lineWidth   = 3;
    ctx.lineCap     = 'round';
    const corners = [
      { cx: box.x,         cy: box.y,         dx:  1, dy:  1 },
      { cx: box.x + box.w, cy: box.y,         dx: -1, dy:  1 },
      { cx: box.x,         cy: box.y + box.h, dx:  1, dy: -1 },
      { cx: box.x + box.w, cy: box.y + box.h, dx: -1, dy: -1 },
    ];
    corners.forEach(({ cx, cy, dx, dy }) => {
      ctx.beginPath();
      ctx.moveTo(cx + dx * bracketLen, cy);
      ctx.lineTo(cx, cy);
      ctx.lineTo(cx, cy + dy * bracketLen);
      ctx.stroke();
    });

    // ── Drag handles ──────────────────────────────────────
    HANDLE_DEF.forEach(({ xFrac, yFrac }) => {
      const hx = box.x + box.w * xFrac;
      const hy = box.y + box.h * yFrac;

      // Shadow
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
      ctx.strokeStyle = HANDLE_BORDER;
      ctx.lineWidth   = 2.5;
      ctx.stroke();

      // Inner dot
      ctx.beginPath();
      ctx.arc(hx, hy, 3, 0, Math.PI * 2);
      ctx.fillStyle = BORDER_COLOR;
      ctx.fill();
    });

    // ── Size readout ──────────────────────────────────────
    const ir2 = imgRectRef.current;
    const scaleX = imgRef.current.naturalWidth  / ir2.w;
    const scaleY = imgRef.current.naturalHeight / ir2.h;
    const realW  = Math.round((box.x - ir2.x + box.w > 0 ? box.w : 0) * scaleX);
    const realH  = Math.round((box.y - ir2.y + box.h > 0 ? box.h : 0) * scaleY);

    const label = `${realW} × ${realH} px`;
    ctx.font      = 'bold 11px ui-monospace, monospace';
    const tw      = ctx.measureText(label).width;
    const lx      = clamp(box.x + box.w / 2 - tw / 2 - 6, 4, canvas.width - tw - 16);
    const ly      = box.y - 14 > 4 ? box.y - 10 : box.y + box.h + 22;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.beginPath();
    ctx.roundRect(lx - 2, ly - 13, tw + 16, 18, 4);
    ctx.fill();
    ctx.fillStyle = '#e2e8f0';
    ctx.fillText(label, lx + 6, ly);

  }, [box, showGrid]);

  // ── Hit-testing helpers ─────────────────────────────────
  const getHandleAt = useCallback((px, py) => {
    const b = boxRef.current;
    if (!b) return null;
    for (const h of HANDLE_DEF) {
      const hx = b.x + b.w * h.xFrac;
      const hy = b.y + b.h * h.yFrac;
      if (Math.hypot(px - hx, py - hy) <= HANDLE_RADIUS + 4) return h.id;
    }
    return null;
  }, []);

  const isInsideBox = useCallback((px, py) => {
    const b = boxRef.current;
    if (!b) return false;
    return px > b.x && px < b.x + b.w && py > b.y && py < b.y + b.h;
  }, []);

  // ── Pointer helpers (unified mouse + touch) ─────────────
  const getEventXY = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    if (e.touches) {
      return {
        px: e.touches[0].clientX - rect.left,
        py: e.touches[0].clientY - rect.top,
      };
    }
    return { px: e.clientX - rect.left, py: e.clientY - rect.top };
  };

  // ── Constrain box inside image bounds ──────────────────
  const constrainBox = (b) => {
    const ir = imgRectRef.current;
    let { x, y, w, h } = b;
    w = Math.max(w, MIN_CROP_SIZE);
    h = Math.max(h, MIN_CROP_SIZE);
    x = clamp(x, ir.x, ir.x + ir.w - w);
    y = clamp(y, ir.y, ir.y + ir.h - h);
    w = Math.min(w, ir.x + ir.w - x);
    h = Math.min(h, ir.y + ir.h - y);
    return { x, y, w, h };
  };

  // ── Pointer Down ────────────────────────────────────────
  const onPointerDown = useCallback((e) => {
    e.preventDefault();
    const { px, py } = getEventXY(e);
    const handle = getHandleAt(px, py);

    if (handle) {
      dragRef.current = {
        active: true, type: 'handle', handleId: handle,
        startX: px, startY: py, startBox: { ...boxRef.current },
      };
    } else if (isInsideBox(px, py)) {
      dragRef.current = {
        active: true, type: 'move', handleId: null,
        startX: px, startY: py, startBox: { ...boxRef.current },
      };
    }
  }, [getHandleAt, isInsideBox]);

  // ── Pointer Move ────────────────────────────────────────
  const onPointerMove = useCallback((e) => {
    const { px, py } = getEventXY(e);

    // Update cursor
    const hid = getHandleAt(px, py);
    if (hid) {
      setCursor(CURSORS[hid]);
    } else if (isInsideBox(px, py)) {
      setCursor(CURSORS.move);
    } else {
      setCursor(CURSORS.default);
    }

    if (!dragRef.current.active) return;
    e.preventDefault();

    const { type, handleId, startX, startY, startBox } = dragRef.current;
    const dx = px - startX;
    const dy = py - startY;
    let { x, y, w, h } = startBox;

    if (type === 'move') {
      x += dx;
      y += dy;
      const nb = constrainBox({ x, y, w, h });
      boxRef.current = nb;
      setBox({ ...nb });
      return;
    }

    // Handle resize
    switch (handleId) {
      case 'tl': x += dx; y += dy; w -= dx; h -= dy; break;
      case 'tm': y += dy; h -= dy; break;
      case 'tr': y += dy; w += dx; h -= dy; break;
      case 'ml': x += dx; w -= dx; break;
      case 'mr': w += dx; break;
      case 'bl': x += dx; w -= dx; h += dy; break;
      case 'bm': h += dy; break;
      case 'br': w += dx; h += dy; break;
    }

    const nb = constrainBox({ x, y, w, h });
    boxRef.current = nb;
    setBox({ ...nb });
  }, [getHandleAt, isInsideBox]);

  const onPointerUp = useCallback(() => {
    dragRef.current.active = false;
  }, []);

  // ── Attach touch events imperatively with { passive: false } ──
  // React's synthetic onTouchXxx are passive by default, which prevents
  // calling e.preventDefault() and causes console errors during drag.
  // We bypass React's passivity by attaching directly to the DOM element.
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

  // ── Apply crop: draw region to off-screen canvas ───────
  const handleApply = async () => {
    if (!box || !imgRef.current) return;
    setIsProcessing(true);
    try {
      const ir  = imgRectRef.current;
      const img = imgRef.current;

      // Scale canvas-space box → natural image coordinates
      const scaleX = img.naturalWidth  / ir.w;
      const scaleY = img.naturalHeight / ir.h;

      const cropX = (box.x - ir.x) * scaleX;
      const cropY = (box.y - ir.y) * scaleY;
      const cropW = box.w * scaleX;
      const cropH = box.h * scaleY;

      const offCanvas = document.createElement('canvas');
      offCanvas.width  = cropW;
      offCanvas.height = cropH;
      const ctx = offCanvas.getContext('2d');
      ctx.imageSmoothingEnabled  = true;
      ctx.imageSmoothingQuality  = 'high';
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);

      const blobUrl = await new Promise((res) =>
        offCanvas.toBlob((blob) => res(URL.createObjectURL(blob)), 'image/jpeg', 0.95)
      );
      onCropComplete(blobUrl);
    } catch (err) {
      console.error('Crop failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Reset box to 80 % of image ──────────────────────────
  const handleReset = () => {
    const ir  = imgRectRef.current;
    const pad = 0.1;
    const nb  = constrainBox({
      x: ir.x + ir.w * pad,
      y: ir.y + ir.h * pad,
      w: ir.w * (1 - 2 * pad),
      h: ir.h * (1 - 2 * pad),
    });
    boxRef.current = nb;
    setBox({ ...nb });
  };

  // ── Select full image ───────────────────────────────────
  const handleSelectAll = () => {
    const { x, y, w, h } = imgRectRef.current;
    const nb = { x, y, w, h };
    boxRef.current = nb;
    setBox({ ...nb });
  };

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

          {/* ── Header ───────────────────────────────── */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 z-50 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/20 rounded-xl">
                <Crop className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-white">Manual Crop</h3>
                <p className="hidden sm:block text-[10px] text-slate-500 uppercase tracking-widest font-medium">Drag handles to resize · Drag inside to move</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Grid toggle */}
              <button
                onClick={() => setShowGrid(g => !g)}
                title="Toggle grid"
                className={`p-2 rounded-xl text-xs font-bold transition-all ${showGrid ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="14" height="14" rx="1"/>
                  <line x1="5.67" y1="1" x2="5.67" y2="15"/><line x1="10.33" y1="1" x2="10.33" y2="15"/>
                  <line x1="1" y1="5.67" x2="15" y2="5.67"/><line x1="1" y1="10.33" x2="15" y2="10.33"/>
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
              // in the useEffect above to allow e.preventDefault() during drag.
            />

            {/* Touch-friendly hint chip */}
            <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 backdrop-blur-md border border-white/10 text-white text-[10px] font-bold px-3 py-1.5 rounded-full pointer-events-none select-none">
              <Move className="w-3 h-3" />
              <span className="hidden sm:inline">Drag handles to resize · Drag inside to move</span>
              <span className="sm:hidden">Drag to crop</span>
            </div>
          </div>

          {/* ── Footer Toolbar ───────────────────────── */}
          <div className="bg-slate-900/90 backdrop-blur-md border-t border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex-shrink-0 z-50">
            
            {/* Info strip */}
            {box && imgRef.current && (
              <div className="flex items-center gap-2 mb-3 text-slate-500 text-[10px] font-mono">
                <Info className="w-3 h-3 text-blue-500 flex-shrink-0" />
                <span>
                  Crop: {Math.round((box.x - imgRectRef.current.x) * (imgRef.current.naturalWidth / imgRectRef.current.w))} ×&nbsp;
                  {Math.round((box.y - imgRectRef.current.y) * (imgRef.current.naturalHeight / imgRectRef.current.h))} →&nbsp;
                  {Math.round(box.w * (imgRef.current.naturalWidth / imgRectRef.current.w))} ×&nbsp;
                  {Math.round(box.h * (imgRef.current.naturalHeight / imgRectRef.current.h))} px
                </span>
              </div>
            )}

            <div className="flex gap-2 sm:gap-3">
              {/* Reset */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleReset}
                disabled={isProcessing}
                className="flex-1 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider disabled:opacity-40"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </motion.button>

              {/* Select all */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSelectAll}
                disabled={isProcessing}
                className="flex-1 py-2.5 sm:py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all uppercase tracking-wider disabled:opacity-40"
              >
                <Crop className="w-3.5 h-3.5" />
                Full
              </motion.button>

              {/* Apply */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleApply}
                disabled={isProcessing}
                className="flex-[2.5] py-2.5 sm:py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all uppercase tracking-wider disabled:opacity-50 text-white shadow-lg shadow-blue-600/30"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)' }}
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white" />
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Apply Crop
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ManualCropModal;
