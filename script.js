const valueInput = document.getElementById('value');
const unitSelect = document.getElementById('unit');
const resultsDiv = document.getElementById('results');

window.onload = () => valueInput.focus();

valueInput.addEventListener('input', convert);
unitSelect.addEventListener('change', convert);

function convert() {
  const value = parseFloat(valueInput.value);
  const unit = unitSelect.value;

  if (isNaN(value)) {
    resultsDiv.innerHTML = '';
    return;
  }

  let sqft;
  switch (unit) {
    case 'marla': sqft = value * 272.25; break;
    case 'kanal': sqft = value * 5445; break;
    case 'acre': sqft = value * 43560; break;
    case 'sqft': sqft = value; break;
    case 'sqm': sqft = value * 10.7639; break;
  }

  const results = {
    'Marla': (sqft / 272.25).toFixed(2),
    'Kanal': (sqft / 5445).toFixed(2),
    'Acre': (sqft / 43560).toFixed(4),
    'Square Feet': sqft.toFixed(2),
    'Square Meters': (sqft * 0.092903).toFixed(2)
  };

  resultsDiv.innerHTML = '';

  for (const [key, val] of Object.entries(results)) {
    const div = document.createElement('div');
    div.className = 'flex justify-between items-center p-2 rounded-md bg-gray-50 hover:bg-green-50 transition-colors opacity-0 animate-fadeIn';
    div.innerHTML = `
      <span data-target="${val}">${key}: 0</span>
      <button class="bg-green-500 text-white text-xs px-2 py-1 rounded-md hover:bg-green-600 active:scale-95 transition-all"
        onclick="copyText(this,'${val}')">Copy</button>
    `;
    resultsDiv.appendChild(div);

    animateNumber(div.querySelector('span'), val);
  }
}

// smooth count-up animation for numbers
function animateNumber(span, target) {
  const num = parseFloat(target);
  let current = 0;
  const increment = num / 50; // adjust speed
  const interval = setInterval(() => {
    current += increment;
    if (current >= num) current = num;
    span.textContent = span.textContent.split(':')[0] + ': ' + parseFloat(current).toFixed(2);
    if (current >= num) clearInterval(interval);
  }, 10);
}

// copy to clipboard with highlight effect
function copyText(btn, val) {
  navigator.clipboard.writeText(val).then(() => {
    const parent = btn.parentElement;
    parent.classList.add('bg-green-200');
    setTimeout(() => parent.classList.remove('bg-green-200'), 800);

    // optional: show small tooltip on button
    const tooltip = document.createElement('span');
    tooltip.textContent = 'Copied!';
    tooltip.className = 'absolute bg-green-500 text-white text-xs px-2 py-1 rounded-md -mt-6';
    btn.parentElement.appendChild(tooltip);
    setTimeout(() => tooltip.remove(), 1000);
  });
}
