/* Landing page — hero drop-zone demo, stat counters, tweaks panel */

(function () {
  // ============ DROP-ZONE DEMO ============
  const dropzone = document.getElementById('dropzone');
  const states = dropzone ? dropzone.querySelectorAll('.dropzone-state') : [];
  const statusRight = document.getElementById('statusRight');
  const processStage = document.getElementById('processStage');
  const doneSize = document.getElementById('doneSize');
  const tryBtn = document.getElementById('tryBtn');
  const resetBtn = document.getElementById('resetBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  function setState(name) {
    states.forEach(s => s.classList.toggle('active', s.dataset.state === name));
  }

  const stages = [
    { label: 'Detecting edges…', duration: 500 },
    { label: 'Deskewing image…', duration: 400 },
    { label: 'Enhancing contrast…', duration: 400 },
    { label: 'Running OCR…', duration: 500 },
    { label: 'Encrypting file…', duration: 400 },
  ];

  let processTimer = null;
  function runProcess() {
    setState('processing');
    if (statusRight) statusRight.textContent = 'Processing…';
    let i = 0;
    const step = () => {
      if (i >= stages.length) {
        // Finish
        const size = (120 + Math.floor(Math.random() * 200));
        if (doneSize) doneSize.textContent = size + ' KB';
        setState('done');
        if (statusRight) statusRight.textContent = 'Complete · ' + size + ' KB';
        return;
      }
      const stage = stages[i];
      if (processStage) processStage.textContent = stage.label;
      i++;
      processTimer = setTimeout(step, stage.duration);
    };
    step();
  }

  function reset() {
    if (processTimer) { clearTimeout(processTimer); processTimer = null; }
    setState('idle');
    if (statusRight) statusRight.textContent = 'Ready';
  }

  // Ensure initial state
  if (dropzone) setState('idle');

  if (tryBtn) tryBtn.addEventListener('click', runProcess);
  if (resetBtn) resetBtn.addEventListener('click', reset);
  if (downloadBtn) downloadBtn.addEventListener('click', () => {
    downloadBtn.textContent = 'Downloaded ✓';
    setTimeout(() => { downloadBtn.textContent = 'Download'; }, 1400);
  });

  // Drag & drop
  if (dropzone) {
    ['dragenter', 'dragover'].forEach(e => {
      dropzone.addEventListener(e, (ev) => {
        ev.preventDefault();
        dropzone.classList.add('drag-over');
      });
    });
    ['dragleave', 'drop'].forEach(e => {
      dropzone.addEventListener(e, (ev) => {
        ev.preventDefault();
        dropzone.classList.remove('drag-over');
      });
    });
    dropzone.addEventListener('drop', (ev) => {
      ev.preventDefault();
      runProcess();
    });
  }

  // ============ STAT COUNTERS ============
  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    const suffix = el.querySelector('.stat-suffix');
    const suffixText = suffix ? suffix.outerHTML : '';
    const decimals = (String(target).split('.')[1] || '').length;
    const duration = 1400;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const val = target * eased;
      const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val);
      el.innerHTML = display + suffixText;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        statObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('.stat-num[data-count]').forEach(el => statObserver.observe(el));

  // ============ TWEAKS PANEL ============
  // Wrap tweak defaults in EDITMODE markers so the host can persist
  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "heroVariant": "A"
  }/*EDITMODE-END*/;

  let state = { ...TWEAK_DEFAULTS };

  function applyState() {
    document.querySelectorAll('.showcase-variant').forEach(v => {
      v.setAttribute('data-active', v.dataset.variant === state.heroVariant ? 'true' : 'false');
    });
    document.querySelectorAll('.tweak-opt[data-variant]').forEach(b => {
      b.classList.toggle('active', b.dataset.variant === state.heroVariant);
    });
  }

  function buildTweaksPanel() {
    const mount = document.getElementById('tweaksMount');
    if (!mount) return;
    mount.innerHTML = `
      <div class="tweaks-panel" id="tweaksPanel">
        <div class="tweaks-panel-title">Tweaks</div>
        <h4>Hero variation</h4>
        <div class="tweak-options">
          <button class="tweak-opt" data-variant="A">Demo</button>
          <button class="tweak-opt" data-variant="B">Phone</button>
          <button class="tweak-opt" data-variant="C">Stack</button>
        </div>
      </div>
    `;
    mount.querySelectorAll('.tweak-opt').forEach(btn => {
      btn.addEventListener('click', () => {
        state.heroVariant = btn.dataset.variant;
        applyState();
        // Persist
        try {
          window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { heroVariant: state.heroVariant } }, '*');
        } catch (e) {}
      });
    });
    applyState();
  }

  // Edit-mode protocol
  window.addEventListener('message', (ev) => {
    const d = ev.data;
    if (!d || typeof d !== 'object') return;
    if (d.type === '__activate_edit_mode') {
      document.getElementById('tweaksPanel')?.classList.add('visible');
    }
    if (d.type === '__deactivate_edit_mode') {
      document.getElementById('tweaksPanel')?.classList.remove('visible');
    }
  });

  buildTweaksPanel();

  // Announce availability
  try {
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
  } catch (e) {}

})();
