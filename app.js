// Calculadora de Masa Madre y Fermentación de Pizza Napolitana
// Porcentaje Panadero, hidratación y cronograma inverso

const PRESETS = {
  pizza: {
    name: 'Pizza Napolitana',
    count: 4,
    unitWeight: 265,
    hydration: 65,
    leaveningType: 'sourdough',
    leaveningPct: 15,
    saltPct: 2.8,
    oilPct: 0,
    tempRoom: 22,
    coldHours: 20
  },
  bread: {
    name: 'Hogaza de Campo (Masa Madre)',
    count: 1,
    unitWeight: 850,
    hydration: 75,
    leaveningType: 'sourdough',
    leaveningPct: 20,
    saltPct: 2.2,
    oilPct: 0,
    tempRoom: 22,
    coldHours: 14
  },
  focaccia: {
    name: 'Focaccia Alta Hidratación',
    count: 1,
    unitWeight: 900,
    hydration: 80,
    leaveningType: 'sourdough',
    leaveningPct: 20,
    saltPct: 2.5,
    oilPct: 4.5,
    tempRoom: 23,
    coldHours: 18
  }
};

let state = {
  recipe: 'pizza',
  count: 4,
  unitWeight: 265,
  hydration: 65,
  leaveningType: 'sourdough', // 'sourdough', 'instant_yeast', 'fresh_yeast'
  leaveningPct: 15,
  saltPct: 2.8,
  oilPct: 0,
  tempRoom: 22,
  coldHours: 20,
  targetDate: '',
  targetTime: '20:30'
};

function calculateRecipe() {
  const count = parseInt(state.count, 10) || 1;
  const unitWeight = parseFloat(state.unitWeight) || 250;
  const totalDough = count * unitWeight;

  const hydration = parseFloat(state.hydration) || 65;
  const saltPct = parseFloat(state.saltPct) || 2.5;
  const oilPct = parseFloat(state.oilPct) || 0;

  // Leavening percentage logic
  let leaveningPct = 0;
  if (state.leaveningType === 'sourdough') {
    leaveningPct = parseFloat(state.leaveningPct) || 15;
  } else if (state.leaveningType === 'fresh_yeast') {
    // Fresh yeast: ~0.3% to 1.5% depending on cold fermentation
    leaveningPct = state.coldHours >= 12 ? 0.35 : 1.2;
  } else if (state.leaveningType === 'instant_yeast') {
    // Instant dry yeast: fresh yeast / 3
    leaveningPct = state.coldHours >= 12 ? 0.12 : 0.4;
  }

  // Baker's Math: Total % sum
  const totalPctSum = 100 + hydration + leaveningPct + saltPct + oilPct;

  // Base dry flour
  const flourGrams = (totalDough / totalPctSum) * 100;
  const waterGrams = flourGrams * (hydration / 100);
  const leaveningGrams = flourGrams * (leaveningPct / 100);
  const saltGrams = flourGrams * (saltPct / 100);
  const oilGrams = flourGrams * (oilPct / 100);

  return {
    count,
    unitWeight,
    totalDough,
    flourGrams,
    waterGrams,
    leaveningGrams,
    leaveningPct,
    saltGrams,
    oilGrams,
    hydration,
    saltPct,
    oilPct
  };
}

function updateUI() {
  const r = calculateRecipe();

  // Hero metrics
  const heroDough = document.getElementById('hero-total-dough');
  const heroFlour = document.getElementById('hero-flour');
  if (heroDough) heroDough.textContent = Math.round(r.totalDough) + ' g';
  if (heroFlour) heroFlour.textContent = Math.round(r.flourGrams) + ' g';

  // Ingredients breakdown
  const ingFlour = document.getElementById('val-flour');
  const ingWater = document.getElementById('val-water');
  const ingLeavening = document.getElementById('val-leavening');
  const ingLeaveningTitle = document.getElementById('title-leavening');
  const ingLeaveningPct = document.getElementById('pct-leavening');
  const ingSalt = document.getElementById('val-salt');
  const ingOil = document.getElementById('val-oil');
  const ingOilCard = document.getElementById('card-oil');

  if (ingFlour) ingFlour.textContent = Math.round(r.flourGrams) + ' g';
  if (ingWater) ingWater.textContent = Math.round(r.waterGrams) + ' g';

  if (ingLeavening) {
    if (state.leaveningType === 'sourdough') {
      ingLeavening.textContent = Math.round(r.leaveningGrams) + ' g';
      if (ingLeaveningTitle) ingLeaveningTitle.textContent = 'Masa Madre Activa (100% hidr.)';
      if (ingLeaveningPct) ingLeaveningPct.textContent = `${r.leaveningPct}%`;
    } else if (state.leaveningType === 'fresh_yeast') {
      ingLeavening.textContent = r.leaveningGrams.toFixed(1) + ' g';
      if (ingLeaveningTitle) ingLeaveningTitle.textContent = 'Levadura Fresca Prensada';
      if (ingLeaveningPct) ingLeaveningPct.textContent = `${r.leaveningPct.toFixed(2)}%`;
    } else {
      ingLeavening.textContent = r.leaveningGrams.toFixed(2) + ' g';
      if (ingLeaveningTitle) ingLeaveningTitle.textContent = 'Levadura Seca Instantánea';
      if (ingLeaveningPct) ingLeaveningPct.textContent = `${r.leaveningPct.toFixed(2)}%`;
    }
  }

  if (ingSalt) ingSalt.textContent = r.saltGrams.toFixed(1) + ' g';

  if (ingOil) {
    if (r.oilGrams > 0) {
      ingOil.textContent = Math.round(r.oilGrams) + ' g';
      if (ingOilCard) ingOilCard.style.display = 'flex';
    } else {
      if (ingOilCard) ingOilCard.style.display = 'none';
    }
  }

  // Sticky Mobile Bar
  const stickyDough = document.getElementById('sticky-dough');
  const stickyHydration = document.getElementById('sticky-hydration');
  if (stickyDough) stickyDough.textContent = Math.round(r.totalDough) + ' g';
  if (stickyHydration) stickyHydration.textContent = `${state.hydration}% agua (${state.count}x${state.unitWeight}g)`;

  // Range badges
  const hydBadge = document.getElementById('badge-hydration');
  const tempBadge = document.getElementById('badge-temp');
  const coldBadge = document.getElementById('badge-cold');
  if (hydBadge) hydBadge.textContent = state.hydration + '%';
  if (tempBadge) tempBadge.textContent = state.tempRoom + '°C';
  if (coldBadge) coldBadge.textContent = state.coldHours + ' h';

  updateSchedule();
  saveState();
}

function updateSchedule() {
  const timelineEl = document.getElementById('timeline-container');
  if (!timelineEl) return;

  // Compute reference target bake time
  const targetDateStr = state.targetDate || new Date().toISOString().split('T')[0];
  const targetTimeStr = state.targetTime || '20:30';
  const targetDateTime = new Date(`${targetDateStr}T${targetTimeStr}`);

  if (isNaN(targetDateTime.getTime())) return;

  const coldHours = parseInt(state.coldHours, 10) || 0;
  const isSourdough = state.leaveningType === 'sourdough';

  // Build steps in reverse hours from bake time
  const steps = [];

  // Step: Bake (0h before)
  steps.push({
    offsetMinutes: 0,
    title: '🔥 Hornear',
    desc: 'Horno precalentado al máximo (250°C a 450°C). Con piedra reflectaria o sartén de hierro para piso crocante y bordes alveolados.'
  });

  // Step: Tempering / Preheat (2h before)
  steps.push({
    offsetMinutes: -120,
    title: '🌡️ Atemperar y Precalentar Horno',
    desc: 'Sacar los bollos o la hogaza de la heladera. Dejar relajar a temperatura ambiente y precalentar el horno a tope.'
  });

  // Step: Balling / Shaping (Cold hours + 3h before)
  if (coldHours > 0) {
    steps.push({
      offsetMinutes: -(coldHours * 60 + 180),
      title: '❄️ Maduración Lenta en Heladera (4°C)',
      desc: `Guardar la masa en heladera durante ${coldHours} horas. Los azúcares se concentran y se logra una digestibilidad óptima.`
    });
  }

  // Step: Bulk Fermentation & Folds (Cold hours + 360m before)
  steps.push({
    offsetMinutes: -((coldHours * 60) + 300),
    title: '🔄 Amasado y Pliegues (Stretch & Fold)',
    desc: '3 a 4 series de pliegues cada 30 minutos para desarrollar la red de gluten sin desgarrar la estructura.'
  });

  // Step: Autolysis & Mix
  steps.push({
    offsetMinutes: -((coldHours * 60) + 360),
    title: '💧 Autólisis e Integración',
    desc: 'Mezclar harina y el 90% del agua. Dejar reposar 40 minutos para hidratar el almidón antes de incorporar sal y masa madre.'
  });

  // Step: Feed Sourdough Starter
  if (isSourdough) {
    steps.push({
      offsetMinutes: -((coldHours * 60) + 660), // ~5h before mix
      title: '🌾 Refrescar la Masa Madre',
      desc: 'Alimentar la masa madre en ratio 1:1:1 o 1:2:2. Usar cuando doble o triplique su volumen y pase la prueba de flotación.'
    });
  }

  // Sort chronologically (earliest to latest)
  steps.sort((a, b) => a.offsetMinutes - b.offsetMinutes);

  const formatStepTime = (offsetMins) => {
    const d = new Date(targetDateTime.getTime() + offsetMins * 60000);
    const dayName = d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' });
    const timeStr = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${dayName} - ${timeStr} hs`;
  };

  timelineEl.innerHTML = steps.map(s => `
    <div class="timeline-step">
      <div class="timeline-dot"></div>
      <div class="timeline-time">${formatStepTime(s.offsetMinutes)}</div>
      <div class="timeline-title">${s.title}</div>
      <div class="timeline-desc">${s.desc}</div>
    </div>
  `).join('');
}

function applyPreset(presetKey) {
  const p = PRESETS[presetKey];
  if (!p) return;

  state.recipe = presetKey;
  state.count = p.count;
  state.unitWeight = p.unitWeight;
  state.hydration = p.hydration;
  state.leaveningType = p.leaveningType;
  state.leaveningPct = p.leaveningPct;
  state.saltPct = p.saltPct;
  state.oilPct = p.oilPct;
  state.tempRoom = p.tempRoom;
  state.coldHours = p.coldHours;

  // Update tabs active state
  document.querySelectorAll('.recipe-tab-btn').forEach(b => {
    b.classList.toggle('active', b.getAttribute('data-recipe') === presetKey);
  });

  // Form controls sync
  const countInput = document.getElementById('count-input');
  const weightInput = document.getElementById('weight-input');
  const hydRange = document.getElementById('hydration-range');
  const leavenSelect = document.getElementById('leavening-select');
  const saltInput = document.getElementById('salt-input');
  const oilInput = document.getElementById('oil-input');
  const tempRange = document.getElementById('temp-range');
  const coldRange = document.getElementById('cold-range');

  if (countInput) countInput.value = p.count;
  if (weightInput) weightInput.value = p.unitWeight;
  if (hydRange) hydRange.value = p.hydration;
  if (leavenSelect) leavenSelect.value = p.leaveningType;
  if (saltInput) saltInput.value = p.saltPct;
  if (oilInput) oilInput.value = p.oilPct;
  if (tempRange) tempRange.value = p.tempRoom;
  if (coldRange) coldRange.value = p.coldHours;

  updateUI();
}

function shareRecipe() {
  const r = calculateRecipe();
  const recipeTitle = PRESETS[state.recipe] ? PRESETS[state.recipe].name : 'Masa de Pan/Pizza';

  let text = `🍕 Fórmula Panadera - ${recipeTitle}\n`;
  text += `---------------------------------\n`;
  text += `📦 Masa total: ${Math.round(r.totalDough)} g (${state.count} piezas de ${state.unitWeight}g)\n`;
  text += `💧 Hidratación: ${state.hydration}%\n\n`;
  text += `📋 Ingredientes Exactos:\n`;
  text += `• Harina (100%): ${Math.round(r.flourGrams)} g\n`;
  text += `• Agua (${state.hydration}%): ${Math.round(r.waterGrams)} g\n`;
  if (state.leaveningType === 'sourdough') {
    text += `• Masa madre activa (${r.leaveningPct}%): ${Math.round(r.leaveningGrams)} g\n`;
  } else if (state.leaveningType === 'fresh_yeast') {
    text += `• Levadura fresca: ${r.leaveningGrams.toFixed(1)} g\n`;
  } else {
    text += `• Levadura seca instantánea: ${r.leaveningGrams.toFixed(2)} g\n`;
  }
  text += `• Sal fina (${state.saltPct}%): ${r.saltGrams.toFixed(1)} g\n`;
  if (r.oilGrams > 0) {
    text += `• Aceite de oliva (${state.oilPct}%): ${Math.round(r.oilGrams)} g\n`;
  }
  text += `---------------------------------\n`;
  text += `❄️ Fermentación en frío: ${state.coldHours} horas en heladera\n`;
  text += `Calculado en: https://sebiglesias.com.ar/masa-madre/`;

  if (navigator.share) {
    navigator.share({
      title: `Receta de ${recipeTitle}`,
      text: text,
      url: 'https://sebiglesias.com.ar/masa-madre/'
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text).then(() => {
      const shareBtn = document.getElementById('btn-share');
      if (shareBtn) {
        const orig = shareBtn.innerHTML;
        shareBtn.innerHTML = '✓ ¡Copiado al portapapeles!';
        setTimeout(() => shareBtn.innerHTML = orig, 2500);
      }
    });
  }
}

function saveState() {
  try {
    localStorage.setItem('masa_madre_state', JSON.stringify(state));
  } catch (e) {}
}

function loadState() {
  try {
    const saved = localStorage.getItem('masa_madre_state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state = Object.assign(state, parsed);
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', () => {
  // Set default target date as tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  state.targetDate = tomorrow.toISOString().split('T')[0];

  loadState();

  // Recipe Preset Switchers
  document.querySelectorAll('.recipe-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyPreset(btn.getAttribute('data-recipe'));
    });
  });

  // Inputs
  const countInput = document.getElementById('count-input');
  const weightInput = document.getElementById('weight-input');
  const hydRange = document.getElementById('hydration-range');
  const leavenSelect = document.getElementById('leavening-select');
  const saltInput = document.getElementById('salt-input');
  const oilInput = document.getElementById('oil-input');
  const tempRange = document.getElementById('temp-range');
  const coldRange = document.getElementById('cold-range');

  const targetDateInput = document.getElementById('target-date');
  const targetTimeInput = document.getElementById('target-time');

  if (countInput) {
    countInput.value = state.count;
    countInput.addEventListener('input', (e) => {
      state.count = parseInt(e.target.value, 10) || 1;
      updateUI();
    });
  }

  if (weightInput) {
    weightInput.value = state.unitWeight;
    weightInput.addEventListener('input', (e) => {
      state.unitWeight = parseFloat(e.target.value) || 100;
      updateUI();
    });
  }

  if (hydRange) {
    hydRange.value = state.hydration;
    hydRange.addEventListener('input', (e) => {
      state.hydration = parseFloat(e.target.value) || 60;
      updateUI();
    });
  }

  if (leavenSelect) {
    leavenSelect.value = state.leaveningType;
    leavenSelect.addEventListener('change', (e) => {
      state.leaveningType = e.target.value;
      updateUI();
    });
  }

  if (saltInput) {
    saltInput.value = state.saltPct;
    saltInput.addEventListener('input', (e) => {
      state.saltPct = parseFloat(e.target.value) || 2;
      updateUI();
    });
  }

  if (oilInput) {
    oilInput.value = state.oilPct;
    oilInput.addEventListener('input', (e) => {
      state.oilPct = parseFloat(e.target.value) || 0;
      updateUI();
    });
  }

  if (tempRange) {
    tempRange.value = state.tempRoom;
    tempRange.addEventListener('input', (e) => {
      state.tempRoom = parseInt(e.target.value, 10) || 22;
      updateUI();
    });
  }

  if (coldRange) {
    coldRange.value = state.coldHours;
    coldRange.addEventListener('input', (e) => {
      state.coldHours = parseInt(e.target.value, 10) || 0;
      updateUI();
    });
  }

  if (targetDateInput) {
    targetDateInput.value = state.targetDate;
    targetDateInput.addEventListener('change', (e) => {
      state.targetDate = e.target.value;
      updateSchedule();
    });
  }

  if (targetTimeInput) {
    targetTimeInput.value = state.targetTime;
    targetTimeInput.addEventListener('change', (e) => {
      state.targetTime = e.target.value;
      updateSchedule();
    });
  }

  // Buttons
  const shareBtn = document.getElementById('btn-share');
  if (shareBtn) shareBtn.addEventListener('click', shareRecipe);

  const printBtn = document.getElementById('btn-print');
  if (printBtn) printBtn.addEventListener('click', () => window.print());

  const stickyBtn = document.getElementById('sticky-share-btn');
  if (stickyBtn) stickyBtn.addEventListener('click', shareRecipe);

  // Theme toggle
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeBtn.textContent = currentTheme === 'light' ? '🌙' : '☀️';

    themeBtn.addEventListener('click', () => {
      const now = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', now);
      localStorage.setItem('theme', now);
      themeBtn.textContent = now === 'light' ? '🌙' : '☀️';
    });
  }

  updateUI();

  // Register SW
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
});
