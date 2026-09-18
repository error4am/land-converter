// script.js - homepage converter + legacy subpage converter
(() => {
  'use strict';

  // ---------- shared helpers ----------
  function debounce(fn, wait) {
    wait = wait || 150;
    let t;
    return function () {
      const args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(null, args); }, wait);
    };
  }

  // conversion factors (to square feet)
  const FACTORS = {
    marla: 272.25,
    kanal: 5445,
    acre: 43560,
    sqft: 1,
    sqm: 10.7639104167 // sqm -> sqft multiplier
  };

  const AREA_LABELS = {
    marla: 'Marla',
    kanal: 'Kanal',
    acre: 'Acre',
    sqft: 'Square Feet',
    sqm: 'Square Meters'
  };

  const LENGTH_FACTORS = {
    ft: 0.3048,
    m: 1,
    yd: 0.9144,
    in: 0.0254,
    cm: 0.01
  };

  const LENGTH_LABELS = {
    ft: 'Feet',
    m: 'Meters',
    yd: 'Yards',
    in: 'Inches',
    cm: 'Centimeters'
  };

  // ---------- legacy converter (used on subpages) ----------
  (function initLegacyConverter() {
    const valueInput = document.getElementById('value');
    const unitSelect = document.getElementById('unit');
    const resultsDiv = document.getElementById('results');
    const quickFillButtons = document.querySelectorAll('.quick-fill');

    if (!valueInput || !unitSelect || !resultsDiv) return;

    // small aria-live element to announce copy actions (accessibility)
    const statusEl = document.createElement('div');
    statusEl.setAttribute('aria-live', 'polite');
    statusEl.className = 'sr-only';
    document.body.appendChild(statusEl);

    // focus on load
    window.addEventListener('load', () => {
      if (valueInput.value.trim()) {
        convertAndRender();
      }
      valueInput.focus();
    });

    function toFixedNumber(n, decimals = 2) {
      return Number.parseFloat(n).toFixed(decimals);
    }

    // convert and render results
    function convertAndRender() {
      const raw = valueInput.value.trim();
      const value = parseFloat(raw);
      const unit = unitSelect.value;
      if (!raw || isNaN(value)) {
        resultsDiv.innerHTML = '';
        return;
      }

      const sqft = value * (FACTORS[unit] || 1);

      const results = {
        'Marla': sqft / FACTORS.marla,
        'Kanal': sqft / FACTORS.kanal,
        'Acre': sqft / FACTORS.acre,
        'Square Feet': sqft,
        'Square Meters': sqft / FACTORS.sqm
      };

      // build fragment to avoid repeated reflow
      const frag = document.createDocumentFragment();
      Object.entries(results).forEach(([label, num]) => {
        const outer = document.createElement('div');
        outer.className = 'result-row relative flex justify-between items-center p-2 rounded-md bg-gray-50 hover:bg-green-50 transition-colors animate-fadeIn';

        const span = document.createElement('span');
        span.className = 'result-label';
        span.dataset.target = Number(num).toString();
        span.textContent = `${label}: ${toFixedNumber(0, 2)}`;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'copy-btn bg-green-500 text-white text-xs px-2 py-1 rounded-md hover:bg-green-600 active:scale-95 transition-all';
        btn.setAttribute('aria-label', `Copy ${label} value`);
        btn.dataset.value = Number(num).toFixed(2);
        btn.textContent = 'Copy';

        outer.appendChild(span);
        outer.appendChild(btn);
        frag.appendChild(outer);

        animateCount(span, Number(num));
      });

      resultsDiv.innerHTML = '';
      resultsDiv.appendChild(frag);
    }

    // smooth animation using requestAnimationFrame
    function animateCount(spanEl, targetNum) {
      const displayDecimals = targetNum < 1 ? 4 : 2;
      const start = performance.now();
      const duration = 400; // ms

      function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        // ease out
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = targetNum * eased;
        spanEl.textContent = spanEl.textContent.split(':')[0] + ': ' + toFixedNumber(current, displayDecimals);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          // ensure final exact value
          spanEl.textContent = spanEl.textContent.split(':')[0] + ': ' + Number(targetNum).toFixed(displayDecimals);
        }
      }
      requestAnimationFrame(step);
    }

    // event delegation for copy buttons
    resultsDiv.addEventListener('click', (e) => {
      const btn = e.target.closest('.copy-btn');
      if (!btn) return;
      const val = btn.dataset.value || '';
      if (!val) return;
      navigator.clipboard?.writeText(val).then(() => {
        flashCopySuccess(btn, `Copied ${val}`);
      }).catch(() => {
        // fallback: temporary textbox selection
        fallbackCopy(val, btn);
      });
    });

    function fallbackCopy(text, btn) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
        flashCopySuccess(btn, `Copied ${text}`);
      } catch {
        flashCopyFailure(btn, 'Copy failed');
      } finally {
        ta.remove();
      }
    }

    function flashCopySuccess(btn, message = 'Copied!') {
      const parent = btn.parentElement;
      if (!parent) return;
      parent.classList.add('bg-green-200');
      setTimeout(() => parent.classList.remove('bg-green-200'), 800);

      // small tooltip element
      const tip = document.createElement('span');
      tip.className = 'copy-tip absolute -mt-6 text-xs px-2 py-1 rounded bg-green-500 text-white';
      tip.textContent = message;
      // ensure parent is positioned
      parent.style.position = parent.style.position || 'relative';
      parent.appendChild(tip);
      setTimeout(() => tip.remove(), 900);

      // announce for screen readers
      statusEl.textContent = message;
    }

    function flashCopyFailure(btn, message = 'Copy failed') {
      const parent = btn.parentElement;
      if (!parent) return;
      parent.classList.add('bg-red-200');
      setTimeout(() => parent.classList.remove('bg-red-200'), 900);
      statusEl.textContent = message;
    }

    // hook inputs (debounced)
    const runConvert = debounce(convertAndRender, 120);
    valueInput.addEventListener('input', runConvert);
    unitSelect.addEventListener('change', convertAndRender);

    quickFillButtons.forEach((button) => {
      button.addEventListener('click', () => {
        valueInput.value = button.dataset.value || '';
        unitSelect.value = button.dataset.unit || 'marla';
        convertAndRender();
        valueInput.focus();
      });
    });

    // expose a manual convert if needed
    window.convertAndRender = convertAndRender;
  })();

  // ---------- homepage converter panels ----------
  function setupConverter(cfg) {
    const fromValue = document.getElementById(cfg.prefix + '-from-value');
    const fromUnit = document.getElementById(cfg.prefix + '-from-unit');
    const toUnit = document.getElementById(cfg.prefix + '-to-unit');
    const readout = document.getElementById(cfg.prefix + '-to-value');
    const convertBtn = document.getElementById(cfg.prefix + '-convert');
    const resultBox = document.getElementById(cfg.prefix + '-result-box');
    const resultTitle = document.getElementById(cfg.prefix + '-result-title');
    const resultSub = document.getElementById(cfg.prefix + '-result-sub');
    const chips = document.querySelectorAll('[data-quick="' + cfg.prefix + '"]');
    const swapButtons = document.querySelectorAll('[data-swap="' + cfg.prefix + '"]');

    if (!fromValue || !fromUnit || !toUnit || !readout) return;

    function formatNumber(n) {
      const abs = Math.abs(n);
      const decimals = abs >= 1000 ? 2 : abs >= 1 ? 3 : 5;
      return Number(n).toLocaleString('en-US', { maximumFractionDigits: decimals });
    }

    function compute() {
      const value = parseFloat(fromValue.value);
      if (isNaN(value)) return null;
      const from = fromUnit.value;
      const to = toUnit.value;
      const base = value * (cfg.factors[from] || 1);
      const result = base / (cfg.factors[to] || 1);
      return { value: value, from: from, to: to, result: result };
    }

    function renderReadout() {
      const c = compute();
      if (!c) {
        readout.textContent = 'Select unit';
        readout.classList.add('is-placeholder');
        return;
      }
      readout.textContent = formatNumber(c.result);
      readout.classList.remove('is-placeholder');
    }

    function renderResult() {
      const c = compute();
      if (!c) {
        if (resultTitle) resultTitle.textContent = 'Result will appear here';
        if (resultSub) resultSub.textContent = cfg.emptySub;
        return;
      }
      if (resultTitle) {
        resultTitle.textContent = formatNumber(c.value) + ' ' + (cfg.labels[c.from] || '') +
          ' = ' + formatNumber(c.result) + ' ' + (cfg.labels[c.to] || '');
      }
      if (resultSub) resultSub.textContent = cfg.resultSub;
    }

    function pulse() {
      if (!resultBox) return;
      resultBox.classList.remove('pulse');
      void resultBox.offsetWidth;
      resultBox.classList.add('pulse');
    }

    function updateAll(pulseIt) {
      renderReadout();
      renderResult();
      if (pulseIt) pulse();
    }

    const liveUpdate = debounce(function () { updateAll(false); }, 150);

    fromValue.addEventListener('input', liveUpdate);
    fromUnit.addEventListener('change', function () { updateAll(false); });
    toUnit.addEventListener('change', function () { updateAll(false); });

    if (convertBtn) {
      convertBtn.addEventListener('click', function () { updateAll(true); });
    }

    swapButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const previousFrom = fromUnit.value;
        fromUnit.value = toUnit.value;
        toUnit.value = previousFrom;
        updateAll(false);
      });
    });

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        fromValue.value = chip.dataset.value || '';
        if (chip.dataset.from) fromUnit.value = chip.dataset.from;
        updateAll(true);
      });
    });

    updateAll(false);
  }

  setupConverter({
    prefix: 'area',
    factors: FACTORS,
    labels: AREA_LABELS,
    emptySub: 'Accurate to standard Pakistani land measurement conversions.',
    resultSub: 'Based on standard Pakistani land measurements (1 Marla = 272.25 sq ft, 1 Kanal = 20 Marla).'
  });

  setupConverter({
    prefix: 'length',
    factors: LENGTH_FACTORS,
    labels: LENGTH_LABELS,
    emptySub: 'Useful for plot dimensions, maps and construction plans.',
    resultSub: 'Converted with standard international length units.'
  });

  // ---------- homepage tabs ----------
  (function initTabs() {
    const tabs = document.querySelectorAll('.converter-tab');
    const panels = document.querySelectorAll('.converter-panel');
    if (!tabs.length || !panels.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        const target = tab.dataset.tab;
        tabs.forEach(function (t) {
          const active = t === tab;
          t.classList.toggle('active', active);
          t.setAttribute('aria-selected', active ? 'true' : 'false');
        });
        panels.forEach(function (panel) {
          panel.classList.toggle('active', panel.id === 'panel-' + target);
        });
      });
    });
  })();

  // ---------- keep card height stable across tabs (hero background stays fixed) ----------
  (function equalizeConverterPanels() {
    const card = document.querySelector('.converter-card');
    if (!card) return;
    const panels = card.querySelectorAll('.converter-panel');
    const tabs = card.querySelector('.converter-tabs');
    if (!panels.length) return;

    function apply() {
      card.style.minHeight = '';
      let max = 0;
      panels.forEach(function (panel) {
        const isActive = panel.classList.contains('active');
        if (!isActive) {
          panel.style.display = 'block';
          panel.style.visibility = 'hidden';
        }
        max = Math.max(max, panel.offsetHeight);
        if (!isActive) {
          panel.style.display = '';
          panel.style.visibility = '';
        }
      });
      const tabsHeight = tabs ? tabs.offsetHeight : 0;
      card.style.minHeight = (max + tabsHeight + 4) + 'px';
    }

    apply();
    window.addEventListener('load', apply);
    window.addEventListener('resize', debounce(apply, 200));
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(apply);
    }
    setTimeout(apply, 700);
  })();

  // ---------- theme toggle ----------
  (function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      const isDark = document.documentElement.classList.toggle('dark');
      try { localStorage.setItem('lpt-theme', isDark ? 'dark' : 'light'); } catch (e) {}
    });
  })();

  // ---------- mobile menu ----------
  (function initMenu() {
    const btn = document.getElementById('menu-toggle');
    const menu = document.getElementById('mobile-menu');
    const icon = document.getElementById('menu-icon');
    if (!btn || !menu) return;

    function setIcon(open) {
      if (icon) icon.innerHTML = '<use href="#' + (open ? 'i-close' : 'i-menu') + '"/>';
    }

    btn.addEventListener('click', function () {
      const open = menu.classList.toggle('open');
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      setIcon(open);
    });

    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        setIcon(false);
      });
    });
  })();
})();
