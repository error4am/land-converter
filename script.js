// script.js - optimized for performance & accessibility
(() => {
  const valueInput = document.getElementById('value');
  const unitSelect = document.getElementById('unit');
  const resultsDiv = document.getElementById('results');

  // small aria-live element to announce copy actions (accessibility)
  const statusEl = document.createElement('div');
  statusEl.setAttribute('aria-live', 'polite');
  statusEl.className = 'sr-only';
  document.body.appendChild(statusEl);

  // focus on load
  window.addEventListener('load', () => valueInput && valueInput.focus());

  // debounce helper
  function debounce(fn, wait = 150) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  // conversion factors (to square feet)
  const FACTORS = {
    marla: 272.25,
    kanal: 5445,
    acre: 43560,
    sqft: 1,
    sqm: 10.7639 // sqm -> sqft multiplier
  };

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
      'Square Meters': sqft * 0.092903
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

  // expose a manual convert if needed
  window.convertAndRender = convertAndRender;
})();
