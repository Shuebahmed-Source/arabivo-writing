/* TraceStep.jsx — interactive "trace your first letter" moment.
   User traces a faded Arabic glyph with finger / stylus / mouse;
   coverage of the guide is measured and celebrated.
   Exports to window: TraceStep */

function TraceStep({ glyph = 'س', translit = 'sīn', meaning = 'the letter sīn', onDone }) {
  const wrapRef = React.useRef(null);
  const guideRef = React.useRef(null);   // visible faded guide
  const inkRef = React.useRef(null);     // user strokes
  const maskRef = React.useRef(null);    // {cols, rows, cell, guide:Set, total, covered:Set}
  const draw = React.useRef({ on: false, lastX: 0, lastY: 0 });
  const [coverage, setCoverage] = React.useState(0);
  const [done, setDone] = React.useState(false);
  const [started, setStarted] = React.useState(false);

  const CELL = 12;
  const BRUSH = 22;

  const setupCanvases = React.useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    [guideRef.current, inkRef.current].forEach((c) => {
      c.width = w * dpr; c.height = h * dpr;
      c.style.width = w + 'px'; c.style.height = h + 'px';
      const ctx = c.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    });

    // --- draw faded guide glyph ---
    const g = guideRef.current.getContext('2d');
    g.clearRect(0, 0, w, h);
    const fs = Math.min(h * 0.82, w * 0.6);
    g.font = `${fs}px 'Noto Naskh Arabic', serif`;
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.fillStyle = 'rgba(14,122,75,0.14)';
    g.fillText(glyph, w / 2, h / 2 + fs * 0.04);
    // outline shimmer
    g.lineWidth = 2;
    g.strokeStyle = 'rgba(14,122,75,0.32)';
    g.setLineDash([5, 7]);
    g.strokeText(glyph, w / 2, h / 2 + fs * 0.04);
    g.setLineDash([]);

    // --- build coverage mask from the glyph alpha ---
    const data = g.getImageData(0, 0, guideRef.current.width, guideRef.current.height).data;
    const dpw = guideRef.current.width;
    const cols = Math.ceil(w / CELL), rows = Math.ceil(h / CELL);
    const guide = new Set();
    for (let cy = 0; cy < rows; cy++) {
      for (let cx = 0; cx < cols; cx++) {
        // sample center of cell (scaled to device px)
        const px = Math.floor((cx * CELL + CELL / 2) * dpr);
        const py = Math.floor((cy * CELL + CELL / 2) * dpr);
        const idx = (py * dpw + px) * 4 + 3;
        if (data[idx] > 18) guide.add(cy * cols + cx);
      }
    }
    maskRef.current = { cols, rows, guide, total: guide.size || 1, covered: new Set() };
  }, [glyph]);

  React.useEffect(() => {
    let ran = false;
    const run = () => { if (!ran) { ran = true; setupCanvases(); } };
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => requestAnimationFrame(run));
      // fallback if fonts.ready resolves before naskh registered
      setTimeout(run, 400);
    } else { run(); }
    const onResize = () => { setupCanvases(); clearInk(); setCoverage(0); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line
  }, [setupCanvases]);

  const clearInk = () => {
    const c = inkRef.current; if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, c.width, c.height);
    if (maskRef.current) maskRef.current.covered = new Set();
  };

  const pos = (e) => {
    const r = inkRef.current.getBoundingClientRect();
    const t = e.touches ? e.touches[0] : e;
    return { x: t.clientX - r.left, y: t.clientY - r.top };
  };

  const stamp = (x, y) => {
    const m = maskRef.current; if (!m) return;
    const r = Math.ceil(BRUSH / 2 / CELL);
    const ccx = Math.floor(x / CELL), ccy = Math.floor(y / CELL);
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const cx = ccx + dx, cy = ccy + dy;
        if (cx < 0 || cy < 0 || cx >= m.cols || cy >= m.rows) continue;
        const key = cy * m.cols + cx;
        if (m.guide.has(key)) m.covered.add(key);
      }
    }
  };

  const start = (e) => {
    e.preventDefault();
    if (done) return;
    setStarted(true);
    const { x, y } = pos(e);
    draw.current = { on: true, lastX: x, lastY: y };
    const ctx = inkRef.current.getContext('2d');
    ctx.beginPath();
    stamp(x, y);
  };

  const move = (e) => {
    if (!draw.current.on) return;
    e.preventDefault();
    const { x, y } = pos(e);
    const ctx = inkRef.current.getContext('2d');
    ctx.strokeStyle = '#0E7A4B';
    ctx.lineWidth = BRUSH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(draw.current.lastX, draw.current.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    // interpolate stamps for smooth coverage
    const steps = Math.max(1, Math.hypot(x - draw.current.lastX, y - draw.current.lastY) / 4);
    for (let i = 0; i <= steps; i++) {
      stamp(draw.current.lastX + (x - draw.current.lastX) * (i / steps),
            draw.current.lastY + (y - draw.current.lastY) * (i / steps));
    }
    draw.current.lastX = x; draw.current.lastY = y;
    const m = maskRef.current;
    const cov = m ? m.covered.size / m.total : 0;
    setCoverage(cov);
    if (cov >= 0.5 && !done) { setDone(true); draw.current.on = false; }
  };

  const end = () => { draw.current.on = false; };

  const pct = Math.min(100, Math.round(coverage * 175)); // feels generous

  return (
    <div className="step trace-step">
      <h1 className="q-title">Now — trace your first letter ✍️</h1>
      <p className="q-sub">
        Follow the glowing outline below. Finger, stylus or mouse — whatever you’ve got.
      </p>

      <div className="trace-card">
        <div className="trace-meta">
          <span className="trace-tag">FIRST TRACE</span>
          <span className="trace-translit">{translit}</span>
        </div>

        <div className="trace-canvas-wrap" ref={wrapRef}>
          <canvas ref={guideRef} className="trace-canvas guide"></canvas>
          <canvas
            ref={inkRef}
            className="trace-canvas ink"
            onMouseDown={start} onMouseMove={move}
            onMouseUp={end} onMouseLeave={end}
            onTouchStart={start} onTouchMove={move} onTouchEnd={end}
          ></canvas>

          {!started && !done && (
            <div className="trace-hint">
              <span className="trace-hint-dot"></span>
              Start here & trace the glow
            </div>
          )}

          <Sparkles show={done} />
          {done && (
            <div className="trace-done-badge">
              <span>🎉</span> You wrote {meaning}!
            </div>
          )}
        </div>

        <div className="trace-footer">
          <button className="trace-clear" onClick={() => { clearInk(); setCoverage(0); setDone(false); setStarted(false); }}>
            ↺ Clear
          </button>
          <div className="trace-bar" aria-hidden="true">
            <span style={{ width: pct + '%' }}></span>
          </div>
          <span className="trace-pct">{pct}%</span>
        </div>
      </div>

      <div className="cta-dock">
        <button className="btn" disabled={!started && !done}
                onClick={onDone}>
          {done ? "Beautiful — keep going" : started ? 'Continue' : 'Trace to continue'}
        </button>
      </div>
    </div>
  );
}

Object.assign(window, { TraceStep });
