// ============================================================
//  ФРУКТОВЫЙ НИНДЗЯ — вся логика и физика
// ============================================================

// ---------- НАСТРОЙКИ ----------
const SETTINGS = {
  LIVES: 3,
  GRAVITY: 1150,
  SPAWN_INTERVAL: 1.15,
  SPAWN_MIN: 0.42,
  SPEED_START: 1050,
  SPEED_MAX: 1550,
  RAMP_TIME: 55,
  FRUIT_RADIUS: 46,
  COMBO_WINDOW: 0.85,
  COMBO_MIN: 3,
  TITLE: 'ФРУКТОВЫЙ НИНДЗЯ',
  STAIN_LIFE: 4.5,
  SPLAT_LIFE: 6.0,
  LEADERS_MAX: 10,
  LEADERS_KEY: 'fruitNinjaLeaders',
  ROUND_TIME: 60,
  MAX_LIVES: 5,
  BONUS_CHANCE: 0.12,
  RAINBOW_DURATION: 3.0,
  RAINBOW_SPAWN_RATE: 0.12,
  FREEZE_DURATION: 3.0
};
// -------------------------------------------

// ---------- КЛИНКИ ----------
const BLADES = [
  { id: 'fire',      name: 'ОГОНЬ',   core: '#fff2b0', glow: '#ff7a1a', spark: '#ffb14a', thickness: 8, fx: 'fire' },
  { id: 'butterfly', name: 'БАБОЧКИ', core: '#ffeaff', glow: '#ff8ac8', spark: '#ff5cae', thickness: 7, fx: 'butterfly' },
  { id: 'demon',     name: 'ДЕМОН',   core: '#ffdada', glow: '#ff1a1a', spark: '#ff4a1a', thickness: 9, fx: 'demon' }
];

// ---------- ЦВЕТА СЛЕДА ----------
const COLORS = [
  { id: 'cyan',   name: 'Голубой', hex: '#7fe9ff' },
  { id: 'gold',   name: 'Золото',  hex: '#ffd166' },
  { id: 'violet', name: 'Фиолет',  hex: '#c17bff' },
  { id: 'red',    name: 'Алый',    hex: '#ff5577' }
];

// ---------- ВЫБОР ИГРОКА ----------
let currentBlade = BLADES[0];
let currentColor = COLORS[0];

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

let W = 0, H = 0, DPR = 1;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', resize);
resize();

// ---------- УТИЛИТЫ ----------
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => v < a ? a : (v > b ? b : v);
function hexA(hex, a) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}

// ---------- ТИПЫ ФРУКТОВ ----------
const FRUITS = [
  { name: 'watermelon', shape: 'watermelon', r: 78, base: '#1f6b2c', mid: '#2e8b3d', hi: '#7be089',
    stripe: '#0e3f17', juice: '#ff3d6e', flesh: '#ff4d6d', pip: '#2b1206' },
  { name: 'apple',      shape: 'round', r: 62, base: '#8f131a', mid: '#e63946', hi: '#ff9aa2',
    juice: '#ff2e4d', flesh: '#ffe3c6', pip: '#3a1408', leaf: '#3a8a3a' },
  { name: 'banana',     shape: 'banana', r: 66, base: '#b8860b', mid: '#ffd93b', hi: '#fff2a8',
    juice: '#ffe066', flesh: '#fff4c2', pip: '#5a3a10' },
  { name: 'orange',     shape: 'round', r: 64, base: '#b25000', mid: '#ff8c15', hi: '#ffd28a',
    juice: '#ff8f1f', flesh: '#ffb059', pip: '#7a3a00', segments: true },
  { name: 'lemon',      shape: 'round', r: 58, base: '#b8a300', mid: '#f4e02b', hi: '#fffbb0',
    juice: '#fff23b', flesh: '#fff9c4', pip: '#7a6b00', segments: true, oval: true },
  { name: 'lime',       shape: 'round', r: 54, base: '#3d7a1a', mid: '#7bd43a', hi: '#c8f79a',
    juice: '#a4ff3b', flesh: '#dcffb0', pip: '#3a5a10', segments: true },
  { name: 'grapefruit', shape: 'round', r: 68, base: '#a83050', mid: '#ff5570', hi: '#ffb3c0',
    juice: '#ff5570', flesh: '#ff8095', pip: '#6a1a30', segments: true },
  { name: 'tangerine',  shape: 'round', r: 54, base: '#b25000', mid: '#ff7f1a', hi: '#ffd18a',
    juice: '#ff8f1f', flesh: '#ffc07a', pip: '#7a3a00', segments: true },
  { name: 'kiwi',       shape: 'round', r: 52, base: '#5a4a2a', mid: '#8a7a44', hi: '#c4b280',
    juice: '#a4e03b', flesh: '#b6e34a', pip: '#1a1a08', kiwiSlice: true },
  { name: 'peach',      shape: 'peach', r: 60, base: '#c14a2a', mid: '#ffa46a', hi: '#ffe0b0',
    juice: '#ffb27a', flesh: '#ffd9a8', pip: '#5a2800' },
  { name: 'mango',      shape: 'round', r: 62, base: '#a83010', mid: '#ff7a1a', hi: '#ffd166',
    juice: '#ffa41a', flesh: '#ffd166', pip: '#6a2800', oval: true },
  { name: 'strawberry', shape: 'strawberry', r: 54, base: '#8a0f1a', mid: '#e02a3a', hi: '#ff7a86',
    juice: '#ff2e4d', flesh: '#ffb0b8', pip: '#ffe066' },
  { name: 'pomegranate',shape: 'round', r: 60, base: '#7a0a1a', mid: '#c01530', hi: '#ff5a6a',
    juice: '#d81f3a', flesh: '#ff4a6a', pip: '#5a0810', crown: true },
  { name: 'pineapple',  shape: 'pineapple', r: 68, base: '#4a6a10', mid: '#a88020', hi: '#e0c060',
    juice: '#ffd23b', flesh: '#fff0a0', pip: '#4a3808' }
];

// ---------- СОСТОЯНИЕ ИГРЫ ----------
let state = 'menu';
let score = 0;
let best = 0;
let lives = SETTINGS.LIVES;
let elapsed = 0;
let timeLeft = SETTINGS.ROUND_TIME;
let spawnTimer = 0.6;
let comboTimer = 0;
let comboCount = 0;
let comboMultiplier = 1;
let shake = 0;

let freezeTimer = 0;
let rainbowTimer = 0;
let rainbowSpawnTimer = 0;

let objects = [];
let halves = [];
let particles = [];
let stains = [];
let splats = [];
let decals = [];
const trail = [];
const fireTrail = [];
const clawMarks = [];

// ---------- DOM ----------
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const livesEl = document.getElementById('lives');
const comboEl = document.getElementById('combo');
const gameoverEl = document.getElementById('gameover');
const finalScoreEl = document.getElementById('final-score');
const finalBestEl = document.getElementById('final-best');
const restartBtn = document.getElementById('restart');
const toMenuBtn = document.getElementById('to-menu');
const menuEl = document.getElementById('menu');
const bladesEl = document.getElementById('blades');
const colorsEl = document.getElementById('colors');
const startBtn = document.getElementById('start-btn');
const leadersBtn = document.getElementById('leaders-btn');
const leadersEl = document.getElementById('leaders');
const leadersListEl = document.getElementById('leaders-list');
const leadersCloseBtn = document.getElementById('leaders-close');
const leadersClearBtn = document.getElementById('leaders-clear');
const leadersPlayBtn = document.getElementById('leaders-play');
const nameoverEl = document.getElementById('nameover');
const nameInputEl = document.getElementById('name-input');
const nameScoreEl = document.getElementById('name-score');
const nameSaveBtn = document.getElementById('name-save');
const nameSkipBtn = document.getElementById('name-skip');

let timerEl = document.getElementById('timer');
if (!timerEl) {
  timerEl = document.createElement('div');
  timerEl.id = 'timer';
  timerEl.innerHTML = '<div id="timer-label">ВРЕМЯ</div><div id="timer-value">1:00</div>';
  document.body.appendChild(timerEl);
}
let timerValueEl = document.getElementById('timer-value');

let bonusToast = document.getElementById('bonus-toast');
if (!bonusToast) {
  bonusToast = document.createElement('div');
  bonusToast.id = 'bonus-toast';
  document.body.appendChild(bonusToast);
}

// ---------- РЕКОРД ----------
try {
  best = parseInt(localStorage.getItem('fruitNinjaBest') || '0', 10) || 0;
} catch (e) { best = 0; }
bestEl.textContent = 'Рекорд: ' + best;

// ---------- ТАБЛИЦА ЛИДЕРОВ ----------
let leaders = [];
function loadLeaders() {
  try {
    const raw = localStorage.getItem(SETTINGS.LEADERS_KEY);
    leaders = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(leaders)) leaders = [];
    leaders = leaders.filter(x => x && typeof x.score === 'number').map(x => ({
      name: String(x.name || 'Ниндзя').slice(0, 12),
      score: Math.max(0, Math.floor(x.score)),
      date: x.date || Date.now()
    }));
    leaders.sort((a, b) => b.score - a.score);
    leaders = leaders.slice(0, SETTINGS.LEADERS_MAX);
  } catch (e) { leaders = []; }
}
function saveLeaders() {
  try { localStorage.setItem(SETTINGS.LEADERS_KEY, JSON.stringify(leaders)); } catch (e) {}
}
loadLeaders();

function addLeader(name, sc) {
  name = (name || 'Ниндзя').toString().trim().slice(0, 12) || 'Ниндзя';
  leaders.push({ name, score: sc, date: Date.now() });
  leaders.sort((a, b) => b.score - a.score);
  leaders = leaders.slice(0, SETTINGS.LEADERS_MAX);
  saveLeaders();
}
function isTopScore(sc) {
  if (sc <= 0) return false;
  if (leaders.length < SETTINGS.LEADERS_MAX) return true;
  return sc > leaders[leaders.length - 1].score;
}
function renderLeaders(highlightScore) {
  leadersListEl.innerHTML = '';
  if (!leaders.length) {
    const empty = document.createElement('div');
    empty.className = 'leaders-empty';
    empty.textContent = 'Пока никто не играл. Будь первым!';
    leadersListEl.appendChild(empty);
    return;
  }
  leaders.forEach((entry, i) => {
    const row = document.createElement('div');
    row.className = 'leader-row';
    if (typeof highlightScore === 'number' && entry.score === highlightScore && i < leaders.length) {
      row.classList.add('me');
    }
    const rank = document.createElement('div');
    rank.className = 'leader-rank';
    rank.textContent = (i + 1) + '.';
    const nm = document.createElement('div');
    nm.className = 'leader-name';
    nm.textContent = entry.name;
    const sc = document.createElement('div');
    sc.className = 'leader-score';
    sc.textContent = entry.score;
    row.appendChild(rank);
    row.appendChild(nm);
    row.appendChild(sc);
    leadersListEl.appendChild(row);
  });
}
function showLeaders(highlightScore) {
  renderLeaders(highlightScore);
  leadersEl.classList.remove('hidden');
}
function hideLeaders() {
  leadersEl.classList.add('hidden');
}

leadersBtn.addEventListener('click', () => showLeaders());
leadersCloseBtn.addEventListener('click', hideLeaders);
leadersClearBtn.addEventListener('click', () => {
  if (confirm('Очистить таблицу лидеров?')) {
    leaders = [];
    saveLeaders();
    renderLeaders();
  }
});

// ---------- СТАРТ ИГРЫ ЧЕРЕЗ МЕНЮ КЛИНКОВ ----------
// Единая функция: показать меню выбора клинка.
function openMenuForNewGame() {
  gameoverEl.classList.add('hidden');
  nameoverEl.classList.add('hidden');
  hideLeaders();
  state = 'menu';
  menuEl.classList.remove('hidden');
}

// Кнопка "ИГРАТЬ" в таблице лидеров — открывает меню выбора клинка
if (leadersPlayBtn) {
  leadersPlayBtn.addEventListener('click', () => {
    openMenuForNewGame();
  });
}

// Кнопка "ЕЩЁ РАЗ" в экране проигрыша — теперь ведёт в меню выбора клинка
restartBtn.addEventListener('click', () => {
  openMenuForNewGame();
});

// Кнопка "СМЕНИТЬ КЛИНК" из экрана проигрыша
toMenuBtn.addEventListener('click', () => {
  openMenuForNewGame();
});

// Кнопка "В БОЙ!" — уже из меню выбора клинка, стартует игру
startBtn.addEventListener('click', () => {
  menuEl.classList.add('hidden');
  state = 'playing';
  resetGame();
});

// ---------- ВВОД ИМЕНИ ----------
let pendingScore = 0;
function openNameEntry(sc) {
  pendingScore = sc;
  nameScoreEl.textContent = sc;
  nameInputEl.value = '';
  nameoverEl.classList.remove('hidden');
  setTimeout(() => nameInputEl.focus(), 50);
}
function closeNameEntry() {
  nameoverEl.classList.add('hidden');
}
nameSaveBtn.addEventListener('click', () => {
  addLeader(nameInputEl.value, pendingScore);
  closeNameEntry();
  showLeaders(pendingScore);
});
nameSkipBtn.addEventListener('click', () => {
  addLeader('Ниндзя', pendingScore);
  closeNameEntry();
  showLeaders(pendingScore);
});
nameInputEl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') nameSaveBtn.click();
});

// ---------- ЖИЗНИ ----------
function renderLives(justGained) {
  livesEl.innerHTML = '';
  for (let i = 0; i < SETTINGS.MAX_LIVES; i++) {
    const h = document.createElement('span');
    h.className = 'heart' + (i < lives ? '' : ' lost');
    if (justGained && i === lives - 1) h.classList.add('new');
    h.textContent = '❤';
    h.style.color = '#ff4d6d';
    livesEl.appendChild(h);
  }
}
renderLives();

// ---------- ЭКРАН ВЫБОРА КЛИНКА ----------
function drawBladePreview(cnv, blade, color) {
  const c = cnv.getContext('2d');
  const w = cnv.width, h = cnv.height;
  c.clearRect(0, 0, w, h);

  const bg = c.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, 'rgba(255,255,255,0.05)');
  bg.addColorStop(1, 'rgba(0,0,0,0.4)');
  c.fillStyle = bg;
  c.fillRect(0, 0, w, h);

  c.save();
  c.translate(w / 2, h / 2);
  c.rotate(-0.6);

  const len = w * 0.9;
  const thick = blade.thickness * 1.4;

  const g1 = c.createLinearGradient(-len / 2, 0, len / 2, 0);
  g1.addColorStop(0, hexA(blade.glow, 0));
  g1.addColorStop(0.5, hexA(blade.glow, 0.95));
  g1.addColorStop(1, hexA(blade.glow, 0));
  c.strokeStyle = g1;
  c.lineWidth = thick * 3.4;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(-len / 2, 0);
  c.lineTo(len / 2, 0);
  c.stroke();

  const g2 = c.createLinearGradient(-len / 2, 0, len / 2, 0);
  g2.addColorStop(0, hexA(blade.core, 0.2));
  g2.addColorStop(0.5, blade.core);
  g2.addColorStop(1, hexA(blade.core, 0.2));
  c.strokeStyle = g2;
  c.lineWidth = thick * 0.9;
  c.beginPath();
  c.moveTo(-len / 2, 0);
  c.lineTo(len / 2, 0);
  c.stroke();

  c.strokeStyle = hexA(color.hex, 0.8);
  c.lineWidth = thick * 0.4;
  c.beginPath();
  c.moveTo(-len / 2, 0);
  c.lineTo(len / 2, 0);
  c.stroke();

  if (blade.fx === 'fire') {
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 22; i++) {
      const px = rand(-len / 2, len / 2);
      const py = rand(-thick * 0.9, thick * 0.9);
      const r = rand(2, 7);
      const gg = c.createRadialGradient(px, py, 0, px, py, r * 3.2);
      gg.addColorStop(0, 'rgba(255,240,180,0.98)');
      gg.addColorStop(0.35, 'rgba(255,150,40,0.85)');
      gg.addColorStop(0.7, 'rgba(255,80,0,0.4)');
      gg.addColorStop(1, 'rgba(255,40,0,0)');
      c.fillStyle = gg;
      c.beginPath();
      c.arc(px, py, r * 3.2, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }
  if (blade.fx === 'butterfly') {
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) {
      const px = rand(-len / 2, len / 2);
      const py = rand(-thick * 1.2, thick * 1.2);
      drawTinyButterfly(c, px, py, 7, rand(0, Math.PI * 2));
    }
    c.restore();
  }
  if (blade.fx === 'demon') {
    c.save();
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) {
      const px = rand(-len / 2, len / 2);
      const py = rand(-thick * 1.6, thick * 1.6);
      const r = rand(1, 3.4);
      c.fillStyle = 'rgba(255,60,30,' + rand(0.4, 0.95) + ')';
      c.beginPath();
      c.arc(px, py, r, 0, Math.PI * 2);
      c.fill();
    }
    c.restore();
  }

  c.restore();

  c.save();
  c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 10; i++) {
    const x = rand(6, w - 6);
    const y = rand(6, h - 6);
    const r = rand(0.5, 1.6);
    c.fillStyle = hexA(blade.spark, rand(0.3, 0.9));
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }
  c.restore();
}

function drawTinyButterfly(c, x, y, s, rot) {
  c.save();
  c.translate(x, y);
  c.rotate(rot);
  c.fillStyle = 'rgba(255,140,200,0.95)';
  c.beginPath();
  c.ellipse(-s * 0.6, -s * 0.35, s * 0.7, s * 0.5, -0.5, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.ellipse(s * 0.6, -s * 0.35, s * 0.7, s * 0.5, 0.5, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(255,90,170,0.95)';
  c.beginPath();
  c.ellipse(-s * 0.5, s * 0.3, s * 0.55, s * 0.4, -0.4, 0, Math.PI * 2);
  c.fill();
  c.beginPath();
  c.ellipse(s * 0.5, s * 0.3, s * 0.55, s * 0.4, 0.4, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = '#3a1030';
  c.fillRect(-s * 0.07, -s * 0.4, s * 0.14, s * 0.8);
  c.restore();
}

function buildMenu() {
  bladesEl.innerHTML = '';
  colorsEl.innerHTML = '';

  BLADES.forEach(b => {
    const div = document.createElement('div');
    div.className = 'blade' + (b.id === currentBlade.id ? ' selected' : '');
    div.dataset.id = b.id;

    const cnv = document.createElement('canvas');
    cnv.width = 78; cnv.height = 78;
    drawBladePreview(cnv, b, currentColor);
    div.appendChild(cnv);

    const label = document.createElement('div');
    label.textContent = b.name;
    div.appendChild(label);

    div.addEventListener('click', () => {
      currentBlade = b;
      buildMenu();
    });
    bladesEl.appendChild(div);
  });

  COLORS.forEach(c => {
    const dot = document.createElement('div');
    dot.className = 'color-dot' + (c.id === currentColor.id ? ' selected' : '');
    dot.style.background = 'radial-gradient(circle at 35% 30%, #ffffff, ' + c.hex + ' 55%, ' + hexA(c.hex, 0.6) + ')';
    dot.style.setProperty('--dot-glow', c.hex);
    dot.title = c.name;
    dot.addEventListener('click', () => {
      currentColor = c;
      buildMenu();
    });
    colorsEl.appendChild(dot);
  });
}
buildMenu();

// ---------- ФОН ----------
let boardCanvas = null;
let scratchCanvas = null;

function makeBoardTexture(w, h) {
  const cnv = document.createElement('canvas');
  cnv.width = w; cnv.height = h;
  const c = cnv.getContext('2d');

  const base = c.createLinearGradient(0, 0, 0, h);
  base.addColorStop(0, '#4a2c14');
  base.addColorStop(0.5, '#3a2010');
  base.addColorStop(1, '#25140a');
  c.fillStyle = base;
  c.fillRect(0, 0, w, h);

  const plankH = Math.max(70, Math.round(h / 9));
  for (let y = 0; y < h; y += plankH) {
    const v = (Math.sin(y * 0.37) + 1) * 0.5;
    c.fillStyle = 'rgba(0,0,0,' + (0.10 + v * 0.10) + ')';
    c.fillRect(0, y, w, plankH);

    c.fillStyle = 'rgba(0,0,0,0.55)';
    c.fillRect(0, y, w, 2);
    c.fillStyle = 'rgba(255,220,170,0.06)';
    c.fillRect(0, y + 2, w, 1);

    for (let i = 0; i < 40; i++) {
      const yy = y + rand(4, plankH - 4);
      const xx = rand(-100, w);
      const len = rand(40, 320);
      c.strokeStyle = 'rgba(20,10,4,' + rand(0.05, 0.16) + ')';
      c.lineWidth = rand(0.5, 1.6);
      c.beginPath();
      c.moveTo(xx, yy);
      c.bezierCurveTo(xx + len * 0.3, yy + rand(-2, 2), xx + len * 0.7, yy + rand(-2, 2), xx + len, yy + rand(-2, 2));
      c.stroke();
    }
  }

  for (let i = 0; i < 260; i++) {
    const x = rand(0, w), y = rand(0, h), r = rand(4, 40);
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    const dark = Math.random() < 0.5;
    g.addColorStop(0, dark ? 'rgba(0,0,0,' + rand(0.05, 0.14) + ')' : 'rgba(255,200,140,' + rand(0.03, 0.08) + ')');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }

  const topGlow = c.createLinearGradient(0, 0, 0, h * 0.5);
  topGlow.addColorStop(0, 'rgba(255,190,120,0.06)');
  topGlow.addColorStop(1, 'rgba(0,0,0,0)');
  c.fillStyle = topGlow;
  c.fillRect(0, 0, w, h * 0.5);

  return cnv;
}

function makeScratchTexture(w, h) {
  const cnv = document.createElement('canvas');
  cnv.width = w; cnv.height = h;
  const c = cnv.getContext('2d');
  c.clearRect(0, 0, w, h);

  const cuts = Math.round((w + h) / 22) + 30;
  for (let i = 0; i < cuts; i++) {
    const x1 = rand(-50, w + 50);
    const y1 = rand(-50, h + 50);
    const len = rand(80, Math.max(w, h) * 0.9);
    const ang = rand(-0.35, 0.35) + (Math.random() < 0.5 ? Math.PI / 6 : -Math.PI / 6) + rand(-0.2, 0.2);
    const dx = Math.cos(ang) * len;
    const dy = Math.sin(ang) * len;

    c.strokeStyle = 'rgba(255,230,190,' + rand(0.06, 0.22) + ')';
    c.lineWidth = rand(0.7, 2.4);
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(x1, y1);
    c.lineTo(x1 + dx, y1 + dy);
    c.stroke();

    c.strokeStyle = 'rgba(255,255,255,' + rand(0.05, 0.18) + ')';
    c.lineWidth = rand(0.4, 1.1);
    c.beginPath();
    c.moveTo(x1, y1 + rand(-1, 1));
    c.lineTo(x1 + dx, y1 + dy + rand(-1, 1));
    c.stroke();

    c.strokeStyle = 'rgba(0,0,0,' + rand(0.10, 0.28) + ')';
    c.lineWidth = rand(0.6, 1.8);
    c.beginPath();
    c.moveTo(x1 + rand(1, 3), y1 + rand(1, 3));
    c.lineTo(x1 + dx + rand(1, 3), y1 + dy + rand(1, 3));
    c.stroke();
  }

  const chips = Math.round((w * h) / 40000);
  for (let i = 0; i < chips; i++) {
    const x = rand(0, w), y = rand(0, h), r = rand(1, 5);
    c.fillStyle = 'rgba(255,225,180,' + rand(0.10, 0.35) + ')';
    c.beginPath();
    c.arc(x, y, r * 0.6, 0, Math.PI * 2);
    c.fill();
    c.fillStyle = 'rgba(0,0,0,' + rand(0.15, 0.35) + ')';
    c.beginPath();
    c.arc(x + r * 0.8, y + r * 0.8, r * 0.5, 0, Math.PI * 2);
    c.fill();
  }

  return cnv;
}

function buildBackground() {
  boardCanvas = makeBoardTexture(W, H);
  scratchCanvas = makeScratchTexture(W, H);
}
buildBackground();
window.addEventListener('resize', buildBackground);

function drawBackground(time) {
  if (!boardCanvas) return;
  ctx.drawImage(boardCanvas, 0, 0, W, H);

  for (const cm of clawMarks) {
    drawClawMark(cm, 1);
  }

  for (const d of decals) {
    const a = clamp(d.life / d.maxLife, 0, 1);
    if (d.type === 'claw') {
      drawClawMark(d, a);
    }
  }

  for (const s of stains) {
    const a = clamp(s.life / s.maxLife, 0, 1);
    drawStain(s, a);
  }

  const g = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.55, Math.max(W, H) * 0.7);
  g.addColorStop(0, 'rgba(255,190,120,0.06)');
  g.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (scratchCanvas) {
    const flick = 0.85 + Math.sin(time * 1.7) * 0.05 + Math.sin(time * 4.3) * 0.03;
    ctx.save();
    ctx.globalAlpha = flick;
    ctx.drawImage(scratchCanvas, 0, 0, W, H);
    ctx.restore();
  }

  drawTitle(time);
}

function drawClawMark(cm, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha * cm.alpha;
  ctx.translate(cm.x, cm.y);
  ctx.rotate(cm.angle);

  for (let k = -1; k <= 1; k++) {
    const off = k * cm.spread;
    const len = cm.len * (1 - Math.abs(k) * 0.12);
    ctx.strokeStyle = 'rgba(20,0,0,0.85)';
    ctx.lineWidth = cm.w * 1.7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-len, off);
    ctx.lineTo(len, off + k * 4);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(180,10,20,0.95)';
    ctx.lineWidth = cm.w;
    ctx.beginPath();
    ctx.moveTo(-len, off);
    ctx.lineTo(len, off + k * 4);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,70,40,0.85)';
    ctx.lineWidth = cm.w * 0.4;
    ctx.beginPath();
    ctx.moveTo(-len, off);
    ctx.lineTo(len, off + k * 4);
    ctx.stroke();
    ctx.fillStyle = 'rgba(160,0,10,0.75)';
    const teeth = 6;
    for (let t = 0; t < teeth; t++) {
      const px = -len + (t + 0.5) * (len * 2 / teeth);
      const py = off + k * 4;
      ctx.beginPath();
      ctx.arc(px, py, cm.w * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawStain(s, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r);
  g.addColorStop(0, hexA(s.color, 0.85));
  g.addColorStop(0.55, hexA(s.color, 0.55));
  g.addColorStop(1, hexA(s.color, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(s.x, s.y, s.r, s.r * s.squash, s.rot, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalCompositeOperation = 'lighter';
  ctx.fillStyle = 'rgba(255,255,255,' + (alpha * 0.20) + ')';
  ctx.beginPath();
  ctx.ellipse(s.x - s.r * 0.25, s.y - s.r * 0.3, s.r * 0.35, s.r * 0.18, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  ctx.fillStyle = hexA(s.color, 0.6);
  for (const d of s.drops) {
    ctx.beginPath();
    ctx.arc(s.x + d.x, s.y + d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawTitle(time) {
  const text = SETTINGS.TITLE;
  if (!text) return;

  const cx = W * 0.5;
  const cy = H * 0.16;
  const size = Math.max(26, Math.min(W * 0.075, H * 0.085));

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.sin(time * 0.8) * 0.01);
  ctx.font = '900 ' + size + 'px "Trebuchet MS", "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = 'rgba(0,0,0,0.65)';
  ctx.fillText(text, 2, 3);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillText(text, 1, 2);

  ctx.fillStyle = 'rgba(255,220,170,0.55)';
  ctx.fillText(text, -2, -2);
  ctx.fillStyle = 'rgba(255,240,210,0.35)';
  ctx.fillText(text, -1, -1);

  const inner = ctx.createLinearGradient(0, -size * 0.7, 0, size * 0.7);
  inner.addColorStop(0, '#1a0d05');
  inner.addColorStop(0.5, '#2a160a');
  inner.addColorStop(1, '#180b04');
  ctx.fillStyle = inner;
  ctx.fillText(text, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const m = ctx.measureText(text);
  const tw = m.width;
  for (let i = 0; i < 26; i++) {
    const px = rand(-tw / 2, tw / 2);
    const py = rand(-size * 0.55, size * 0.55);
    ctx.fillStyle = 'rgba(255,225,180,' + rand(0.05, 0.18) + ')';
    ctx.fillRect(px, py, rand(1, 3), rand(0.6, 1.4));
  }
  ctx.restore();

  ctx.globalCompositeOperation = 'lighter';
  const halo = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, Math.max(tw, size * 3) * 0.55);
  halo.addColorStop(0, 'rgba(255,180,90,0.10)');
  halo.addColorStop(1, 'rgba(255,180,90,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.ellipse(0, 0, Math.max(tw, size * 3) * 0.6, size * 2.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  ctx.restore();
}

// ---------- СПАВН ----------
let objId = 0;
function spawnObject(forceType) {
  const progress = Math.min(elapsed / SETTINGS.RAMP_TIME, 1);
  const isBomb = !forceType && rainbowTimer <= 0 && Math.random() < 0.12 + progress * 0.1;

  const speed = SETTINGS.SPEED_START + (SETTINGS.SPEED_MAX - SETTINGS.SPEED_START) * progress;
  const speedMul = rand(0.95, 1.1);

  const margin = W * 0.16;
  const x = rand(margin, W - margin);
  const y = H + 80;

  const toCenter = (W / 2 - x) / (W / 2);
  const angle = -Math.PI / 2 + toCenter * 0.32 + rand(-0.18, 0.18);
  const v = speed * speedMul;

  let bonusType = forceType || null;
  let type = null;

  if (!forceType) {
    if (!isBomb && Math.random() < SETTINGS.BONUS_CHANCE) {
      const r = Math.random();
      if (r < 0.4) bonusType = 'rainbow';
      else if (r < 0.75) bonusType = 'freeze';
      else bonusType = 'life';
    }
  }
  if (!bonusType) type = FRUITS[randInt(0, FRUITS.length - 1)];

  const vy = Math.sin(-angle) * v;
  const peak = (vy * vy) / (2 * SETTINGS.GRAVITY);
  const desiredPeak = H + 100;
  let scale = 1;
  if (peak < desiredPeak) {
    scale = Math.sqrt(desiredPeak / peak);
    scale = Math.min(scale, 1.35);
  }

  let radius = 62;
  if (type) radius = type.r * rand(0.95, 1.05);
  if (bonusType === 'rainbow') radius = 72;   // ананас — крупный
  if (bonusType === 'freeze') radius = 66;    // банан
  if (bonusType === 'life') radius = 58;

  objects.push({
    id: objId++,
    isBomb,
    bonusType,
    x, y,
    vx: Math.cos(angle) * v * scale,
    vy: Math.sin(angle) * v * scale,
    rot: rand(0, Math.PI * 2),
    vrot: rand(-3.2, 3.2),
    type,
    r: radius,
    alive: true,
    sliced: false,
    seed: rand(0, 1000)
  });
}

// ---------- ПЯТНА, БРЫЗГИ, ДЕКАЛИ ----------
function makeStain(x, y, color, r) {
  const drops = [];
  const dropsCount = randInt(5, 11);
  for (let i = 0; i < dropsCount; i++) {
    const a = rand(0, Math.PI * 2);
    const d = r * rand(0.7, 1.6);
    drops.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, r: rand(2, r * 0.18) });
  }
  return {
    x, y,
    r: r * rand(0.9, 1.3),
    squash: rand(0.7, 1.0),
    rot: rand(0, Math.PI * 2),
    color,
    life: SETTINGS.STAIN_LIFE,
    maxLife: SETTINGS.STAIN_LIFE,
    drops
  };
}

function makeSplat(x, y, color, r) {
  return {
    x, y,
    color,
    size: r * rand(0.5, 1.0),
    growth: rand(0.3, 0.8),
    drip: Math.random() < 0.35,
    dripLen: 0,
    dripMax: r * rand(1.5, 4.5),
    dripSpeed: rand(30, 90),
    wobble: rand(0, Math.PI * 2),
    life: SETTINGS.SPLAT_LIFE,
    maxLife: SETTINGS.SPLAT_LIFE
  };
}

function makeClawMark(x, y, angle, r) {
  return {
    x, y, angle,
    len: r * rand(1.2, 2.0),
    w: rand(3, 6),
    spread: rand(7, 12),
    alpha: 1
  };
}

// ---------- ЭФФЕКТЫ КЛИНКОВ ПРИ РАЗРЕЗЕ ----------
function bladeSlashEffect(x, y, angle, r) {
  const blade = currentBlade;
  const colorHex = currentColor.hex;

  particles.push({
    x, y,
    vx: 0, vy: 0,
    r: r * 2.1,
    color: blade.glow,
    life: 0.22,
    maxLife: 0.22,
    gravity: 0,
    flash: true,
    slash: true,
    angle: angle
  });

  const sparkCount = blade.fx === 'demon' ? 46 : blade.fx === 'fire' ? 44 : 34;
  for (let i = 0; i < sparkCount; i++) {
    const a = angle + Math.PI / 2 + rand(-1.0, 1.0);
    const sp = rand(160, 820);
    particles.push({
      x: x + rand(-r * 0.4, r * 0.4),
      y: y + rand(-r * 0.4, r * 0.4),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      r: rand(1.5, 5),
      color: Math.random() < 0.5 ? blade.spark : colorHex,
      life: rand(0.25, 0.8),
      maxLife: 0.8,
      gravity: 0.6,
      flash: false,
      kind: blade.fx
    });
  }

  if (blade.fx === 'fire') {
    for (let i = 0; i < 40; i++) {
      const t = (i / 40) - 0.5;
      const ox = Math.cos(angle) * t * r * 2.2;
      const oy = Math.sin(angle) * t * r * 2.2;
      const spreadA = angle + Math.PI / 2 + rand(-1.1, 1.1);
      const sp = rand(120, 620);
      particles.push({
        x: x + ox + rand(-r * 0.4, r * 0.4),
        y: y + oy + rand(-r * 0.4, r * 0.4),
        vx: Math.cos(spreadA) * sp + Math.cos(angle) * rand(-80, 80),
        vy: Math.sin(spreadA) * sp - rand(60, 200) + Math.sin(angle) * rand(-80, 80),
        r: rand(5, 13),
        color: Math.random() < 0.4 ? '#ffef9a' : (Math.random() < 0.5 ? '#ff7a1a' : '#ff3a10'),
        life: rand(0.4, 1.1),
        maxLife: 1.1,
        gravity: -0.2,
        flash: false,
        additive: true
      });
    }
    for (let i = 0; i < 24; i++) {
      const a = angle + Math.PI / 2 + rand(-1.3, 1.3);
      const sp = rand(220, 820);
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - rand(80, 220),
        r: rand(1, 3),
        color: Math.random() < 0.5 ? '#fff2a0' : '#ffa23a',
        life: rand(0.6, 1.4),
        maxLife: 1.4,
        gravity: 0.7,
        flash: false,
        additive: true
      });
    }
    for (let i = 0; i < 12; i++) {
      particles.push({
        x: x + rand(-r * 0.6, r * 0.6),
        y: y + rand(-r * 0.6, r * 0.6),
        vx: rand(-90, 90),
        vy: rand(-160, -40),
        r: rand(10, 22),
        color: 'rgba(40,20,10,0.55)',
        life: rand(0.7, 1.4),
        maxLife: 1.4,
        gravity: -0.15,
        flash: false,
        smoke: true
      });
    }
    shake = Math.max(shake, 10);
  }

  if (blade.fx === 'butterfly') {
    const bcount = 22;
    for (let i = 0; i < bcount; i++) {
      const a = angle + Math.PI / 2 + rand(-1.4, 1.4);
      const sp = rand(160, 560);
      particles.push({
        x: x + rand(-r * 0.4, r * 0.4),
        y: y + rand(-r * 0.4, r * 0.4),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 60,
        r: rand(11, 18),
        color: '#ff8ac8',
        life: rand(1.4, 2.6),
        maxLife: 2.6,
        gravity: -0.05,
        flash: false,
        butterfly: true,
        rot: rand(0, Math.PI * 2),
        spin: rand(-2.5, 2.5),
        flap: rand(0, Math.PI * 2),
        wobble: rand(0, Math.PI * 2),
        hue: rand(0, 1)
      });
    }
    for (let i = 0; i < 30; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(80, 420);
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rand(1.5, 4),
        color: Math.random() < 0.5 ? '#ffd0e8' : '#ff8ac8',
        life: rand(0.5, 1.4),
        maxLife: 1.4,
        gravity: 0.25,
        flash: false,
        additive: true
      });
    }
    particles.push({
      x, y,
      vx: 0, vy: 0,
      r: r * 3,
      color: '#ff5cae',
      life: 0.35,
      maxLife: 0.35,
      gravity: 0,
      flash: true
    });
  }

  if (blade.fx === 'demon') {
    particles.push({
      x, y,
      vx: 0, vy: 0,
      r: r * 3,
      color: '#ff1a1a',
      life: 0.35,
      maxLife: 0.35,
      gravity: 0,
      flash: true,
      slash: true,
      angle: angle
    });
    for (let i = 0; i < 44; i++) {
      const a = angle + Math.PI / 2 + rand(-1.4, 1.4);
      const sp = rand(240, 960);
      particles.push({
        x: x + rand(-r * 0.4, r * 0.4),
        y: y + rand(-r * 0.4, r * 0.4),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rand(2, 6),
        color: Math.random() < 0.5 ? '#ff2a1a' : '#8a0000',
        life: rand(0.4, 1.0),
        maxLife: 1.0,
        gravity: 0.7,
        flash: false,
        additive: true
      });
    }
    for (let i = 0; i < 16; i++) {
      particles.push({
        x: x + rand(-r * 0.6, r * 0.6),
        y: y + rand(-r * 0.6, r * 0.6),
        vx: rand(-120, 120),
        vy: rand(-180, -50),
        r: rand(12, 24),
        color: 'rgba(10,0,0,0.75)',
        life: rand(0.8, 1.6),
        maxLife: 1.6,
        gravity: -0.1,
        flash: false,
        smoke: true
      });
    }
    for (let i = 0; i < 24; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(140, 620);
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rand(1.5, 3.5),
        color: '#3a0606',
        life: rand(0.4, 1.1),
        maxLife: 1.1,
        gravity: 0.9,
        flash: false,
        shard: true,
        rot: rand(0, Math.PI * 2),
        spin: rand(-6, 6)
      });
    }
    const cm = makeClawMark(x, y, angle, r);
    decals.push({ ...cm, type: 'claw', life: 6.0, maxLife: 6.0 });
    if (decals.length > 12) decals.shift();
    clawMarks.push({ ...cm, alpha: rand(0.55, 0.85) });
    if (clawMarks.length > 24) clawMarks.shift();
    shake = 26;
  }
}

function showBonusToast(text, color) {
  bonusToast.textContent = text;
  bonusToast.style.color = color;
  bonusToast.classList.remove('show');
  void bonusToast.offsetWidth;
  bonusToast.classList.add('show');
}

function applyBonus(bonusType, x, y) {
  if (bonusType === 'rainbow') {
    rainbowTimer = SETTINGS.RAINBOW_DURATION;
    rainbowSpawnTimer = 0;
    showBonusToast('РАДУГА!', '#ffd23b');
    for (let i = 0; i < 60; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(120, 700);
      const hue = i * 6;
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rand(2, 6),
        color: 'hsl(' + hue + ',100%,65%)',
        life: rand(0.5, 1.2),
        maxLife: 1.2,
        gravity: 0.7,
        flash: false
      });
    }
  } else if (bonusType === 'freeze') {
    freezeTimer = SETTINGS.FREEZE_DURATION;
    showBonusToast('ЗАМОРОЗКА!', '#7fe9ff');
    for (let i = 0; i < 40; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(80, 500);
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rand(1.5, 4),
        color: '#bff0ff',
        life: rand(0.5, 1.0),
        maxLife: 1.0,
        gravity: 0.5,
        flash: false
      });
    }
  } else if (bonusType === 'life') {
    if (lives < SETTINGS.MAX_LIVES) {
      lives++;
      renderLives(true);
      showBonusToast('+1 ЖИЗНЬ', '#ff5c8a');
    } else {
      score += 5;
      scoreEl.textContent = score;
      showBonusToast('+5 ОЧКОВ', '#ffd166');
    }
    for (let i = 0; i < 30; i++) {
      const a = rand(0, Math.PI * 2);
      const sp = rand(80, 420);
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rand(2, 5),
        color: '#ff5c8a',
        life: rand(0.5, 1.1),
        maxLife: 1.1,
        gravity: 0.7,
        flash: false
      });
    }
  }
}

function sliceObject(obj, angle) {
  if (!obj || !obj.alive || obj.sliced) return;
  obj.sliced = true;
  obj.alive = false;

  if (obj.isBomb) {
    explode(obj);
    loseLife();
    return;
  }

  if (obj.bonusType) {
    applyBonus(obj.bonusType, obj.x, obj.y);
    bladeSlashEffect(obj.x, obj.y, angle, obj.r);
    score += 1;
    scoreEl.textContent = score;
    return;
  }

  if (!obj.type) return;

  comboTimer = SETTINGS.COMBO_WINDOW;
  comboCount++;
  if (comboCount >= SETTINGS.COMBO_MIN) {
    comboMultiplier = comboCount;
    showCombo('COMBO x' + comboMultiplier);
  } else {
    comboMultiplier = 1;
  }

  const gained = 1 * (comboMultiplier > 1 ? comboMultiplier : 1);
  score += gained;
  scoreEl.textContent = score;

  const nx = Math.cos(angle);
  const ny = Math.sin(angle);
  const spread = 300;

  for (let s = -1; s <= 1; s += 2) {
    halves.push({
      x: obj.x,
      y: obj.y,
      vx: obj.vx * 0.5 + nx * spread * s + rand(-40, 40),
      vy: obj.vy * 0.5 + ny * spread * s - 120,
      rot: obj.rot,
      vrot: obj.vrot + rand(-2, 2) + s * 3,
      r: obj.r,
      type: obj.type,
      side: s,
      angle: angle,
      life: 3.2,
      alpha: 1,
      seed: obj.seed
    });
  }

  spawnJuice(obj.x, obj.y, obj.type.juice, obj.r, 26);
  stains.push(makeStain(obj.x, obj.y, obj.type.juice, obj.r * 0.85));
  if (stains.length > 22) stains.shift();
  const splatCount = randInt(2, 3);
  for (let i = 0; i < splatCount; i++) {
    const a = angle + Math.PI / 2 + rand(-1.1, 1.1);
    const d = obj.r * rand(1.2, 3.0);
    const sx = clamp(obj.x + Math.cos(a) * d, 20, W - 20);
    const sy = clamp(obj.y + Math.sin(a) * d, 20, H - 20);
    splats.push(makeSplat(sx, sy, obj.type.juice, obj.r * 0.25));
  }
  if (splats.length > 40) splats.shift();

  bladeSlashEffect(obj.x, obj.y, angle, obj.r);
}

// ---------- ЭФФЕКТЫ ----------
function spawnJuice(x, y, color, r, count) {
  for (let i = 0; i < count; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(80, 500);
    particles.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 80,
      r: rand(2.5, 8),
      color,
      life: rand(0.5, 1.1),
      maxLife: 1.1,
      gravity: 1,
      flash: false
    });
  }
  for (let i = 0; i < 8; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(140, 560);
    particles.push({
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      r: rand(1.2, 3.5),
      color: '#ffffff',
      life: rand(0.25, 0.5),
      maxLife: 0.5,
      gravity: 0.6,
      flash: false
    });
  }
}

function explode(bomb) {
  spawnJuice(bomb.x, bomb.y, '#ff8a1f', bomb.r, 40);
  spawnJuice(bomb.x, bomb.y, '#ff3b1f', bomb.r, 24);
  spawnJuice(bomb.x, bomb.y, '#ffe066', bomb.r, 16);
  for (let i = 0; i < 26; i++) {
    const a = rand(0, Math.PI * 2);
    const sp = rand(200, 760);
    particles.push({
      x: bomb.x, y: bomb.y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      r: rand(2, 6),
      color: '#2a2a2a',
      life: rand(0.4, 0.9),
      maxLife: 0.9,
      gravity: 0.9,
      flash: false
    });
  }
  particles.push({
    x: bomb.x, y: bomb.y,
    vx: 0, vy: 0,
    r: bomb.r * 3,
    color: '#ffcf5c',
    life: 0.28,
    maxLife: 0.28,
    gravity: 0,
    flash: true
  });
  stains.push(makeStain(bomb.x, bomb.y, '#2a1a0a', bomb.r * 0.9));
  if (stains.length > 22) stains.shift();
  shake = 24;
}

function loseLife() {
  if (state !== 'playing') return;
  lives--;
  renderLives();
  if (lives <= 0) endRound('lose');
}

function showCombo(text) {
  comboEl.textContent = text;
  comboEl.classList.remove('show');
  void comboEl.offsetWidth;
  comboEl.classList.add('show');
}

// ---------- КОНЕЦ РАУНДА ----------
function endRound(reason) {
  if (state === 'over') return;
  state = 'over';

  const isRecord = score > best;
  if (isRecord) {
    best = score;
    try { localStorage.setItem('fruitNinjaBest', String(best)); } catch (e) {}
    bestEl.textContent = 'Рекорд: ' + best;
  }

  const h1 = gameoverEl.querySelector('h1');
  const panel = gameoverEl.querySelector('.panel');
  if (reason === 'time') {
    h1.textContent = 'ВРЕМЯ ВЫШЛО!';
    panel.classList.add('win');
  } else {
    h1.textContent = 'ИГРА ОКОНЧЕНА';
    panel.classList.remove('win');
  }

  finalScoreEl.textContent = score;
  finalBestEl.textContent = best;

  if (isTopScore(score)) {
    openNameEntry(score);
  } else {
    gameoverEl.classList.remove('hidden');
  }
}

function resetGame() {
  score = 0;
  lives = SETTINGS.LIVES;
  elapsed = 0;
  timeLeft = SETTINGS.ROUND_TIME;
  spawnTimer = 0.6;
  comboTimer = 0;
  comboCount = 0;
  comboMultiplier = 1;
  shake = 0;
  freezeTimer = 0;
  rainbowTimer = 0;
  rainbowSpawnTimer = 0;
  objects = [];
  halves = [];
  particles = [];
  stains = [];
  splats = [];
  decals = [];
  clawMarks.length = 0;
  trail.length = 0;
  fireTrail.length = 0;
  scoreEl.textContent = '0';
  renderLives();
  updateTimerUI();
  lastTime = 0;
}

// ---------- ВВОД ----------
const pointer = { active: false, x: 0, y: 0, px: 0, py: 0 };

function pos(e) {
  if (e.touches && e.touches.length) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  if (e.changedTouches && e.changedTouches.length) {
    return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function onDown(e) {
  if (state !== 'playing') return;
  const p = pos(e);
  pointer.active = true;
  pointer.x = p.x; pointer.y = p.y;
  pointer.px = p.x; pointer.py = p.y;
  trail.length = 0;
  fireTrail.length = 0;
  trail.push({ x: p.x, y: p.y, life: 1 });
}

function onMove(e) {
  if (!pointer.active || state !== 'playing') return;
  const p = pos(e);
  pointer.px = pointer.x;
  pointer.py = pointer.y;
  pointer.x = p.x;
  pointer.y = p.y;

  trail.push({ x: p.x, y: p.y, life: 1 });
  if (trail.length > 22) trail.shift();

  if (currentBlade.fx === 'fire') {
    fireTrail.push({
      x: p.x + rand(-4, 4),
      y: p.y + rand(-4, 4),
      life: 1
    });
    if (fireTrail.length > 30) fireTrail.shift();
  }

  spawnBladeTipParticles(p.x, p.y);

  const ax = pointer.px, ay = pointer.py;
  const bx = pointer.x, by = pointer.y;
  const dx = bx - ax, dy = by - ay;
  const segLen = Math.hypot(dx, dy);

  if (segLen > 4) {
    for (const o of objects) {
      if (!o || !o.alive || o.sliced) continue;
      if (segIntersectsCircle(ax, ay, bx, by, o.x, o.y, o.r)) {
        const ang = Math.atan2(dy, dx);
        sliceObject(o, ang);
      }
    }
  }
}

function spawnBladeTipParticles(x, y) {
  const blade = currentBlade;

  if (blade.fx === 'fire') {
    for (let i = 0; i < 4; i++) {
      const a = rand(-Math.PI, Math.PI);
      const sp = rand(30, 180);
      particles.push({
        x: x + rand(-6, 6),
        y: y + rand(-6, 6),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - rand(30, 90),
        r: rand(3, 8),
        color: Math.random() < 0.4 ? '#ffef9a' : (Math.random() < 0.5 ? '#ff7a1a' : '#ff3a10'),
        life: rand(0.25, 0.7),
        maxLife: 0.7,
        gravity: -0.15,
        flash: false,
        additive: true
      });
    }
    if (Math.random() < 0.7) {
      particles.push({
        x, y,
        vx: rand(-100, 100),
        vy: rand(-160, -20),
        r: rand(1, 2.4),
        color: '#fff2a0',
        life: rand(0.5, 1.1),
        maxLife: 1.1,
        gravity: 0.6,
        flash: false,
        additive: true
      });
    }
  } else if (blade.fx === 'butterfly') {
    if (Math.random() < 0.6) {
      const a = rand(-Math.PI, Math.PI);
      const sp = rand(20, 100);
      particles.push({
        x: x + rand(-4, 4),
        y: y + rand(-4, 4),
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 20,
        r: rand(6, 11),
        color: '#ff8ac8',
        life: rand(1.0, 2.0),
        maxLife: 2.0,
        gravity: -0.05,
        flash: false,
        butterfly: true,
        rot: rand(0, Math.PI * 2),
        spin: rand(-2, 2),
        flap: rand(0, Math.PI * 2),
        wobble: rand(0, Math.PI * 2),
        hue: rand(0, 1)
      });
    }
    if (Math.random() < 0.6) {
      const a = rand(-Math.PI, Math.PI);
      const sp = rand(8, 60);
      particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        r: rand(1, 2.2),
        color: Math.random() < 0.5 ? '#ffc8e0' : '#ff8ac8',
        life: rand(0.35, 0.8),
        maxLife: 0.8,
        gravity: 0.1,
        flash: false,
        additive: true
      });
    }
  } else if (blade.fx === 'demon') {
    const a = rand(-Math.PI, Math.PI);
    const sp = rand(30, 160);
    particles.push({
      x: x + rand(-5, 5),
      y: y + rand(-5, 5),
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 40,
      r: rand(2.5, 5.5),
      color: Math.random() < 0.5 ? '#ff1a1a' : '#ff5a2a',
      life: rand(0.25, 0.6),
      maxLife: 0.6,
      gravity: -0.1,
      flash: false,
      additive: true
    });
    if (Math.random() < 0.4) {
      particles.push({
        x, y,
        vx: rand(-50, 50),
        vy: rand(-80, -10),
        r: rand(5, 11),
        color: 'rgba(20,0,0,0.6)',
        life: rand(0.5, 1.0),
        maxLife: 1.0,
        gravity: -0.05,
        flash: false,
        smoke: true
      });
    }
  }
}

function onUp() {
  pointer.active = false;
}

canvas.addEventListener('mousedown', onDown);
canvas.addEventListener('mousemove', onMove);
window.addEventListener('mouseup', onUp);
canvas.addEventListener('touchstart', (e) => { e.preventDefault(); onDown(e); }, { passive: false });
canvas.addEventListener('touchmove', (e) => { e.preventDefault(); onMove(e); }, { passive: false });
canvas.addEventListener('touchend', (e) => { e.preventDefault(); onUp(e); }, { passive: false });
canvas.addEventListener('touchcancel', (e) => { e.preventDefault(); onUp(e); }, { passive: false });

function segIntersectsCircle(x1, y1, x2, y2, cx, cy, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const fx = x1 - cx;
  const fy = y1 - cy;
  const a = dx * dx + dy * dy;
  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  let disc = b * b - 4 * a * c;
  if (disc < 0) return false;
  disc = Math.sqrt(disc);
  const t1 = (-b - disc) / (2 * a);
  const t2 = (-b + disc) / (2 * a);
  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1);
}

// ---------- ТАЙМЕР ----------
function formatTime(sec) {
  sec = Math.max(0, Math.ceil(sec));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m + ':' + (s < 10 ? '0' + s : s);
}
function updateTimerUI() {
  timerValueEl.textContent = formatTime(timeLeft);
  timerEl.classList.remove('warning', 'danger');
  if (timeLeft <= 10) timerEl.classList.add('danger');
  else if (timeLeft <= 20) timerEl.classList.add('warning');
}

// ---------- ЦИКЛ ----------
let lastTime = 0;

function loop(t) {
  if (!lastTime) lastTime = t;
  let dt = (t - lastTime) / 1000;
  lastTime = t;
  if (dt > 0.05) dt = 0.05;

  update(dt);
  render(t / 1000);
  requestAnimationFrame(loop);
}

function update(dt) {
  let scaled = dt;
  if (freezeTimer > 0 && state === 'playing') {
    scaled = dt * 0.35;
  }

  if (comboTimer > 0) {
    comboTimer -= dt;
    if (comboTimer <= 0) {
      comboCount = 0;
      comboMultiplier = 1;
    }
  }

  if (shake > 0) shake = Math.max(0, shake - dt * 60);

  for (let i = trail.length - 1; i >= 0; i--) {
    trail[i].life -= dt * 3.2;
    if (trail[i].life <= 0) trail.splice(i, 1);
  }
  for (let i = fireTrail.length - 1; i >= 0; i--) {
    fireTrail[i].life -= dt * 1.4;
    if (fireTrail[i].life <= 0) fireTrail.splice(i, 1);
  }

  for (let i = stains.length - 1; i >= 0; i--) {
    stains[i].life -= dt;
    if (stains[i].life <= 0) stains.splice(i, 1);
  }

  for (let i = splats.length - 1; i >= 0; i--) {
    const s = splats[i];
    s.life -= dt;
    s.wobble += dt * 2.5;
    s.size += s.growth * dt;
    if (s.drip) s.dripLen = Math.min(s.dripMax, s.dripLen + s.dripSpeed * dt);
    if (s.life <= 0) splats.splice(i, 1);
  }

  for (let i = decals.length - 1; i >= 0; i--) {
    decals[i].life -= dt;
    if (decals[i].life <= 0) decals.splice(i, 1);
  }

  if (state === 'playing') {
    elapsed += dt;

    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      updateTimerUI();
      endRound('time');
    } else {
      updateTimerUI();
    }

    if (freezeTimer > 0) freezeTimer = Math.max(0, freezeTimer - dt);
    if (rainbowTimer > 0) rainbowTimer = Math.max(0, rainbowTimer - dt);

    if (rainbowTimer > 0) {
      rainbowSpawnTimer -= dt;
      if (rainbowSpawnTimer <= 0) {
        rainbowSpawnTimer = SETTINGS.RAINBOW_SPAWN_RATE;
        spawnObject(FRUITS[randInt(0, FRUITS.length - 1)]);
      }
    }

    const progress = Math.min(elapsed / SETTINGS.RAMP_TIME, 1);
    const interval = SETTINGS.SPAWN_INTERVAL + (SETTINGS.SPAWN_MIN - SETTINGS.SPAWN_INTERVAL) * progress;
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      spawnTimer = interval * rand(0.75, 1.25);
      spawnObject();
      if (Math.random() < 0.25 + progress * 0.3) {
        setTimeout(() => { if (state === 'playing') spawnObject(); }, 90);
      }
    }
  }

  for (let i = objects.length - 1; i >= 0; i--) {
    const o = objects[i];
    if (!o) { objects.splice(i, 1); continue; }
    if (o.sliced) { objects.splice(i, 1); continue; }
    o.x += o.vx * scaled;
    o.y += o.vy * scaled;
    o.vy += SETTINGS.GRAVITY * scaled;
    o.rot += o.vrot * scaled;

    if (o.y - o.r > H + 160) {
      objects.splice(i, 1);
      if (!o.isBomb && !o.sliced && !o.bonusType && o.type) loseLife();
      continue;
    }
    if (o.y + o.r < -500) objects.splice(i, 1);
  }

  for (let i = halves.length - 1; i >= 0; i--) {
    const h = halves[i];
    if (!h || !h.type) { halves.splice(i, 1); continue; }
    h.x += h.vx * scaled;
    h.y += h.vy * scaled;
    h.vy += SETTINGS.GRAVITY * scaled;
    h.rot += h.vrot * scaled;
    h.life -= dt;
    if (h.life < 0.5) h.alpha = Math.max(0, h.life / 0.5);
    if (h.y - h.r > H + 160 || h.life <= 0) halves.splice(i, 1);
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    if (!p) { particles.splice(i, 1); continue; }
    p.life -= dt;
    if (p.life <= 0) { particles.splice(i, 1); continue; }
    if (p.flash) continue;

    if (p.butterfly) {
      p.wobble += dt * 6;
      p.flap += dt * 10;
      p.x += (p.vx + Math.cos(p.wobble) * 40) * dt;
      p.y += (p.vy + Math.sin(p.wobble * 0.7) * 26) * dt;
      p.vy += SETTINGS.GRAVITY * 0.02 * dt;
      p.vx *= 0.985;
      p.vy *= 0.985;
      if (p.spin) p.rot += p.spin * dt;
      continue;
    }

    if (p.shard) {
      if (p.spin) p.rot += p.spin * dt;
      p.x += p.vx * scaled;
      p.y += p.vy * scaled;
      p.vy += SETTINGS.GRAVITY * p.gravity * scaled;
      p.vx *= 0.99;
      continue;
    }

    p.x += p.vx * scaled;
    p.y += p.vy * scaled;
    p.vy += SETTINGS.GRAVITY * p.gravity * scaled;
    p.vx *= 0.99;
  }
}

// ---------- РЕНДЕР ----------
function render(time) {
  ctx.save();
  ctx.clearRect(0, 0, W, H);

  if (shake > 0.5) {
    ctx.translate(rand(-shake, shake) * 0.4, rand(-shake, shake) * 0.4);
  }

  drawBackground(time);

  for (const h of halves) {
    if (!h || !h.type) continue;
    ctx.save();
    ctx.globalAlpha = h.alpha;
    ctx.translate(h.x, h.y);
    ctx.rotate(h.rot);
    drawHalf(h);
    ctx.restore();
  }

  for (const o of objects) {
    if (!o) continue;
    ctx.save();
    ctx.translate(o.x, o.y);
    ctx.rotate(o.rot);
    if (o.isBomb) drawBomb(o);
    else if (o.bonusType === 'rainbow') drawRainbowPineapple(o);
    else if (o.bonusType === 'freeze') drawFreezeBanana(o);
    else if (o.bonusType === 'life') drawLifeFruit(o);
    else if (o.type) drawFruit(o);
    ctx.restore();
  }

  for (const p of particles) {
    if (!p) continue;
    const a = clamp(p.life / p.maxLife, 0, 1);
    if (p.flash) {
      if (p.slash) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.globalCompositeOperation = 'lighter';
        const gg = ctx.createLinearGradient(-p.r, 0, p.r, 0);
        gg.addColorStop(0, hexA(p.color, 0));
        gg.addColorStop(0.5, hexA(p.color, a));
        gg.addColorStop(1, hexA(p.color, 0));
        ctx.fillStyle = gg;
        ctx.fillRect(-p.r, -p.r * 0.08, p.r * 2, p.r * 0.16);
        ctx.restore();
      } else {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, hexA(p.color, a * 0.9));
        g.addColorStop(0.5, hexA(p.color, a * 0.4));
        g.addColorStop(1, hexA(p.color, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      continue;
    }

    if (p.butterfly) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      const flap = Math.abs(Math.sin(p.flap)) * 0.7 + 0.3;
      ctx.scale(flap, 1);
      const hue = p.hue || 0;
      const c1 = hue < 0.33 ? 'rgba(255,140,200,0.98)' : hue < 0.66 ? 'rgba(255,90,180,0.98)' : 'rgba(255,170,220,0.98)';
      const c2 = hue < 0.33 ? 'rgba(255,90,170,0.98)' : hue < 0.66 ? 'rgba(230,60,150,0.98)' : 'rgba(255,130,200,0.98)';
      ctx.fillStyle = c1;
      ctx.beginPath();
      ctx.ellipse(-p.r * 0.6, -p.r * 0.4, p.r * 0.75, p.r * 0.55, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p.r * 0.6, -p.r * 0.4, p.r * 0.75, p.r * 0.55, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c2;
      ctx.beginPath();
      ctx.ellipse(-p.r * 0.5, p.r * 0.35, p.r * 0.6, p.r * 0.45, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p.r * 0.5, p.r * 0.35, p.r * 0.6, p.r * 0.45, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.beginPath();
      ctx.arc(-p.r * 0.7, -p.r * 0.45, p.r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p.r * 0.7, -p.r * 0.45, p.r * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a1030';
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 0.1, p.r * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#3a1030';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-p.r * 0.05, -p.r * 0.65);
      ctx.lineTo(-p.r * 0.28, -p.r * 0.95);
      ctx.moveTo(p.r * 0.05, -p.r * 0.65);
      ctx.lineTo(p.r * 0.28, -p.r * 0.95);
      ctx.stroke();
      ctx.restore();
      continue;
    }

    if (p.shard) {
      ctx.save();
      ctx.globalAlpha = a;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.moveTo(-p.r, 0);
      ctx.lineTo(p.r * 0.6, -p.r * 0.7);
      ctx.lineTo(p.r * 0.3, p.r * 0.9);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (p.smoke) {
      ctx.save();
      ctx.globalAlpha = a * 0.6;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    if (p.additive) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.4 + a * 0.6), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      continue;
    }

    ctx.globalAlpha = a;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r * (0.4 + a * 0.6), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  drawTrail();
  drawFireTrail();
  drawSplats();

  if (freezeTimer > 0) {
    const a = Math.min(0.28, freezeTimer * 0.28 / SETTINGS.FREEZE_DURATION * 1.5);
    ctx.save();
    ctx.fillStyle = 'rgba(120, 200, 255,' + a + ')';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }
  if (rainbowTimer > 0) {
    const a = Math.min(0.25, rainbowTimer * 0.25 / SETTINGS.RAINBOW_DURATION * 1.5);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    const hue = (time * 120) % 360;
    const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.max(W, H) * 0.75);
    grd.addColorStop(0, 'hsla(' + hue + ',100%,65%,' + a + ')');
    grd.addColorStop(1, 'hsla(' + ((hue + 180) % 360) + ',100%,65%,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  ctx.restore();
}

function drawSplats() {
  for (const s of splats) {
    const a = clamp(s.life / s.maxLife, 0, 1);
    const wob = 1 + Math.sin(s.wobble) * 0.06;

    ctx.save();
    ctx.globalAlpha = Math.min(1, a * 1.6);

    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(s.x + 1, s.y + 2, s.size * wob, s.size * 0.95 * wob, 0, 0, Math.PI * 2);
    ctx.fill();

    const g = ctx.createRadialGradient(s.x - s.size * 0.3, s.y - s.size * 0.35, s.size * 0.1, s.x, s.y, s.size * 1.1);
    g.addColorStop(0, hexA(s.color, 0.95));
    g.addColorStop(0.6, hexA(s.color, 0.75));
    g.addColorStop(1, hexA(s.color, 0.15));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, s.size * wob, s.size * 0.95 * wob, 0, 0, Math.PI * 2);
    ctx.fill();

    if (s.drip && s.dripLen > 1) {
      ctx.fillStyle = hexA(s.color, 0.7);
      ctx.beginPath();
      ctx.moveTo(s.x - s.size * 0.35, s.y);
      ctx.quadraticCurveTo(s.x, s.y + s.dripLen, s.x + s.size * 0.35, s.y);
      ctx.lineTo(s.x, s.y);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.arc(s.x, s.y + s.dripLen, s.size * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,255,255,' + (0.45 * a) + ')';
    ctx.beginPath();
    ctx.ellipse(s.x - s.size * 0.3, s.y - s.size * 0.35, s.size * 0.35, s.size * 0.2, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';

    ctx.restore();
  }
}

function drawTrail() {
  if (trail.length < 2) return;
  const core = currentBlade.core;
  const glow = currentBlade.glow;
  const accent = currentColor.hex;
  const thick = currentBlade.thickness;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (currentBlade.fx === 'demon' || currentBlade.fx === 'fire' || currentBlade.fx === 'butterfly') {
    const auraColor = currentBlade.fx === 'demon' ? '255,20,0'
      : currentBlade.fx === 'fire' ? '255,140,20'
      : '255,120,200';
    for (let i = 1; i < trail.length; i++) {
      const alpha = Math.min(trail[i].life, trail[i - 1].life);
      if (alpha <= 0) continue;
      ctx.strokeStyle = 'rgba(' + auraColor + ',' + (alpha * 0.38) + ')';
      ctx.lineWidth = thick * 6 * alpha;
      ctx.beginPath();
      ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
      ctx.lineTo(trail[i].x, trail[i].y);
      ctx.stroke();
    }
  }

  for (let i = 1; i < trail.length; i++) {
    const alpha = Math.min(trail[i].life, trail[i - 1].life);
    if (alpha <= 0) continue;
    ctx.strokeStyle = hexA(glow, alpha * 0.25);
    ctx.lineWidth = thick * 4.5 * alpha;
    ctx.beginPath();
    ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
    ctx.lineTo(trail[i].x, trail[i].y);
    ctx.stroke();
  }

  for (let i = 1; i < trail.length; i++) {
    const alpha = Math.min(trail[i].life, trail[i - 1].life);
    if (alpha <= 0) continue;
    ctx.strokeStyle = hexA(accent, alpha * 0.85);
    ctx.lineWidth = thick * 1.6 * alpha;
    ctx.beginPath();
    ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
    ctx.lineTo(trail[i].x, trail[i].y);
    ctx.stroke();
  }

  for (let i = 1; i < trail.length; i++) {
    const alpha = Math.min(trail[i].life, trail[i - 1].life);
    if (alpha <= 0) continue;
    ctx.strokeStyle = hexA(core, alpha * 0.95);
    ctx.lineWidth = thick * 0.7 * alpha;
    ctx.beginPath();
    ctx.moveTo(trail[i - 1].x, trail[i - 1].y);
    ctx.lineTo(trail[i].x, trail[i].y);
    ctx.stroke();
  }

  ctx.restore();
}

function drawFireTrail() {
  if (currentBlade.fx !== 'fire') return;
  if (fireTrail.length < 2) return;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (let i = 1; i < fireTrail.length; i++) {
    const alpha = Math.min(fireTrail[i].life, fireTrail[i - 1].life);
    if (alpha <= 0) continue;
    const jitter = Math.sin(performance.now() * 0.03 + i) * 3;
    ctx.strokeStyle = 'rgba(255,90,10,' + (alpha * 0.55) + ')';
    ctx.lineWidth = 22 * alpha;
    ctx.beginPath();
    ctx.moveTo(fireTrail[i - 1].x + jitter, fireTrail[i - 1].y + jitter);
    ctx.lineTo(fireTrail[i].x + jitter, fireTrail[i].y + jitter);
    ctx.stroke();
  }
  for (let i = 1; i < fireTrail.length; i++) {
    const alpha = Math.min(fireTrail[i].life, fireTrail[i - 1].life);
    if (alpha <= 0) continue;
    ctx.strokeStyle = 'rgba(255,220,120,' + (alpha * 0.85) + ')';
    ctx.lineWidth = 7 * alpha;
    ctx.beginPath();
    ctx.moveTo(fireTrail[i - 1].x, fireTrail[i - 1].y);
    ctx.lineTo(fireTrail[i].x, fireTrail[i].y);
    ctx.stroke();
  }
  for (let i = 1; i < fireTrail.length; i++) {
    const alpha = Math.min(fireTrail[i].life, fireTrail[i - 1].life);
    if (alpha <= 0) continue;
    ctx.strokeStyle = 'rgba(255,255,220,' + (alpha * 0.9) + ')';
    ctx.lineWidth = 2.4 * alpha;
    ctx.beginPath();
    ctx.moveTo(fireTrail[i - 1].x, fireTrail[i - 1].y);
    ctx.lineTo(fireTrail[i].x, fireTrail[i].y);
    ctx.stroke();
  }

  ctx.restore();
}

// ---------- БОНУСНЫЕ ФРУКТЫ ----------
// Радужный — АНАНАС в радужных цветах
function drawRainbowPineapple(o) {
  const r = o.r;
  const t = performance.now() / 1000;
  const hue0 = (t * 90) % 360;

  // корона (листья) в радужных тонах
  for (let i = -3; i <= 3; i++) {
    const a = i * 0.28;
    ctx.save();
    ctx.rotate(a);
    const lg = ctx.createLinearGradient(0, -r * 1.7, 0, -r * 0.85);
    lg.addColorStop(0, 'hsl(' + ((hue0 + i * 30 + 120) % 360) + ',95%,65%)');
    lg.addColorStop(1, 'hsl(' + ((hue0 + i * 30) % 360) + ',95%,55%)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.85);
    ctx.quadraticCurveTo(r * 0.12, -r * 1.5, 0, -r * 1.7);
    ctx.quadraticCurveTo(-r * 0.12, -r * 1.5, 0, -r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.55)';
    ctx.lineWidth = r * 0.02;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.lineTo(0, -r * 1.55);
    ctx.stroke();
    ctx.restore();
  }

  // тело — ананас с ромбиками, но в радужных цветах
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, r * 0.2, r * 0.85, r * 0.95, 0, 0, Math.PI * 2);
  ctx.clip();

  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, r * 0.2, r * 1.1);
  g.addColorStop(0, 'hsl(' + ((hue0 + 30) % 360) + ',100%,75%)');
  g.addColorStop(0.5, 'hsl(' + ((hue0 + 200) % 360) + ',100%,60%)');
  g.addColorStop(1, 'hsl(' + ((hue0 + 320) % 360) + ',100%,45%)');
  ctx.fillStyle = g;
  ctx.fillRect(-r, -r, r * 2, r * 2);

  const step = r * 0.22;
  for (let y = -r; y < r; y += step) {
    for (let x = -r; x < r; x += step) {
      const ox = (Math.round((y + r) / step) % 2) * step * 0.5;
      const hue = (hue0 + (x + y) * 0.6) % 360;
      ctx.strokeStyle = 'hsla(' + hue + ',100%,30%,0.85)';
      ctx.lineWidth = r * 0.022;
      ctx.beginPath();
      ctx.moveTo(x + ox, y);
      ctx.lineTo(x + ox + step * 0.5, y + step * 0.5);
      ctx.lineTo(x + ox, y + step);
      ctx.lineTo(x + ox - step * 0.5, y + step * 0.5);
      ctx.closePath();
      ctx.stroke();
      // яркая точка
      ctx.fillStyle = 'hsla(' + ((hue + 180) % 360) + ',100%,75%,0.85)';
      ctx.beginPath();
      ctx.arc(x + ox, y + step * 0.5, r * 0.025, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // радужная световая вспышка
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const warm = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.2);
  warm.addColorStop(0, 'hsla(' + ((hue0 + 60) % 360) + ',100%,80%,0.5)');
  warm.addColorStop(0.5, 'hsla(' + ((hue0 + 180) % 360) + ',100%,70%,0.15)');
  warm.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = warm;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();
  ctx.restore();

  // блик
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.25, r * 0.2, r * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();

  // контур
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = r * 0.02;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.2, r * 0.85, r * 0.95, 0, 0, Math.PI * 2);
  ctx.stroke();

  // радужная аура
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const aura = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.8);
  aura.addColorStop(0, 'hsla(' + hue0 + ',100%,70%,0.65)');
  aura.addColorStop(0.6, 'hsla(' + ((hue0 + 180) % 360) + ',100%,65%,0.25)');
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// Заморозка — БАНАН во льду
function drawFreezeBanana(o) {
  const r = o.r;

  // аура холода
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const aura = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.8);
  aura.addColorStop(0, 'rgba(150,235,255,0.65)');
  aura.addColorStop(0.6, 'rgba(90,200,255,0.25)');
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // сам банан (серп), но «ледяной» — синие/голубые оттенки
  ctx.save();
  ctx.rotate(0.35);

  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.55, r * 0.85, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  const outerG = ctx.createLinearGradient(-r, -r, r, r);
  outerG.addColorStop(0, '#ffffff');
  outerG.addColorStop(0.25, '#d6f3ff');
  outerG.addColorStop(0.6, '#7fd6f4');
  outerG.addColorStop(1, '#1a6a9a');
  ctx.fillStyle = outerG;
  ctx.beginPath();
  ctx.moveTo(-r * 1.05, r * 0.55);
  ctx.bezierCurveTo(-r * 0.7, -r * 0.55, r * 0.55, -r * 1.15, r * 1.05, -r * 0.25);
  ctx.bezierCurveTo(r * 0.9, r * 0.1, r * 0.4, r * 0.35, -r * 1.05, r * 0.55);
  ctx.closePath();
  ctx.fill();

  const shadG = ctx.createLinearGradient(0, -r * 0.2, 0, r * 0.7);
  shadG.addColorStop(0, 'rgba(0,0,0,0)');
  shadG.addColorStop(1, 'rgba(20,60,100,0.45)');
  ctx.fillStyle = shadG;
  ctx.beginPath();
  ctx.moveTo(-r * 1.05, r * 0.55);
  ctx.bezierCurveTo(-r * 0.7, -r * 0.55, r * 0.55, -r * 1.15, r * 1.05, -r * 0.25);
  ctx.bezierCurveTo(r * 0.9, r * 0.1, r * 0.4, r * 0.35, -r * 1.05, r * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(20,80,130,0.55)';
  ctx.lineWidth = r * 0.03;
  for (let k = 0; k < 3; k++) {
    const off = (k - 1) * r * 0.08;
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, r * 0.42 + off);
    ctx.bezierCurveTo(-r * 0.5, -r * 0.35 + off, r * 0.5, -r * 0.9 + off, r * 0.95, -r * 0.22 + off);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255,255,255,0.85)';
  ctx.lineWidth = r * 0.06;
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, r * 0.2);
  ctx.bezierCurveTo(-r * 0.3, -r * 0.55, r * 0.5, -r * 0.95, r * 0.85, -r * 0.35);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.15, -r * 0.35, r * 0.32, r * 0.09, -0.55, 0, Math.PI * 2);
  ctx.fill();

  // кончики — иней
  ctx.fillStyle = '#0d3a5a';
  ctx.beginPath();
  ctx.ellipse(-r * 1.02, r * 0.53, r * 0.12, r * 0.08, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(r * 1.02, -r * 0.25, r * 0.12, r * 0.08, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // снежинка-«бейдж» в центре
  ctx.save();
  ctx.rotate(performance.now() * 0.0008);
  ctx.strokeStyle = 'rgba(255,255,255,0.95)';
  ctx.lineWidth = r * 0.06;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.rotate(i * Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.55);
    ctx.lineTo(0, r * 0.55);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.35);
    ctx.lineTo(-r * 0.15, -r * 0.5);
    ctx.moveTo(0, -r * 0.35);
    ctx.lineTo(r * 0.15, -r * 0.5);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // морозные кристаллики
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + performance.now() * 0.001;
    const d = r * 1.05;
    ctx.fillStyle = 'rgba(220,245,255,0.85)';
    ctx.beginPath();
    ctx.arc(Math.cos(a) * d, Math.sin(a) * d, r * 0.06, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawLifeFruit(o) {
  const r = o.r;
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.05);
  g.addColorStop(0, '#ffc0d0');
  g.addColorStop(0.5, '#ff5577');
  g.addColorStop(1, '#6a0a1a');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  const hk = r * 0.55;
  const pulse = 1 + Math.sin(performance.now() * 0.006) * 0.08;
  ctx.save();
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(0, hk * 0.35);
  ctx.bezierCurveTo(-hk * 1.1, -hk * 0.5, -hk * 0.5, -hk * 1.05, 0, -hk * 0.5);
  ctx.bezierCurveTo(hk * 0.5, -hk * 1.05, hk * 1.1, -hk * 0.5, 0, hk * 0.35);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,100,140,0.9)';
  ctx.lineWidth = r * 0.035;
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, -r * 0.42, r * 0.2, r * 0.12, -0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const aura = ctx.createRadialGradient(0, 0, r * 0.6, 0, 0, r * 1.6);
  aura.addColorStop(0, 'rgba(255,120,160,0.55)');
  aura.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, r * 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ---------- ФРУКТ ----------
function drawFruit(o) {
  const t = o.type;
  if (!t) return;
  const r = o.r;
  if (t.shape === 'watermelon') drawWatermelon(0, 0, r);
  else if (t.shape === 'banana') drawBanana(0, 0, r, t);
  else if (t.shape === 'pineapple') drawPineapple(0, 0, r, t);
  else if (t.shape === 'strawberry') drawStrawberry(0, 0, r, t);
  else if (t.shape === 'peach') drawPeach(0, 0, r, t);
  else drawRoundFruit(0, 0, r, t);
}

function drawBodyShine(r, t, ovalK) {
  ovalK = ovalK || 1.0;
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.36, -r * 0.44, r * 0.22, r * 0.13, -0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.14, -r * 0.62, r * 0.08, r * 0.05, -0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.arc(r * 0.18, r * 0.32 * ovalK, r * 0.85, 0.35, Math.PI - 0.35);
  ctx.fill();
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const rim = ctx.createRadialGradient(r * 0.35, r * 0.5 * ovalK, r * 0.1, r * 0.35, r * 0.5 * ovalK, r * 1.1);
  rim.addColorStop(0, hexA(t.hi, 0.28));
  rim.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = rim;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * ovalK, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawWatermelon(cx, cy, r) {
  ctx.save();
  ctx.translate(cx, cy);

  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.08, 0, 0, r * 1.05);
  g.addColorStop(0, '#7be089');
  g.addColorStop(0.35, '#2e8b3d');
  g.addColorStop(0.75, '#1f6b2c');
  g.addColorStop(1, '#0d3a13');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.clip();
  for (let i = -3; i <= 3; i++) {
    const off = i * r * 0.36;
    ctx.strokeStyle = 'rgba(8, 50, 15, 0.8)';
    ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    ctx.moveTo(off - r * 0.95, -r * 1.3);
    ctx.quadraticCurveTo(off * 1.35, 0, off - r * 0.95, r * 1.3);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(150, 230, 160, 0.35)';
    ctx.lineWidth = r * 0.03;
    ctx.beginPath();
    ctx.moveTo(off - r * 0.95 + r * 0.09, -r * 1.3);
    ctx.quadraticCurveTo(off * 1.35 + r * 0.09, 0, off - r * 0.95 + r * 0.09, r * 1.3);
    ctx.stroke();
  }
  const warm = ctx.createRadialGradient(-r * 0.4, -r * 0.55, r * 0.1, 0, 0, r * 1.3);
  warm.addColorStop(0, 'rgba(220,255,210,0.22)');
  warm.addColorStop(0.55, 'rgba(180,240,190,0.06)');
  warm.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = warm;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();

  drawBodyShine(r, { hi: '#7be089' }, 1);

  ctx.restore();
}

function drawBanana(cx, cy, r, t) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(0.35);

  ctx.fillStyle = 'rgba(0,0,0,0.20)';
  ctx.beginPath();
  ctx.ellipse(0, r * 0.55, r * 0.85, r * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  const outerG = ctx.createLinearGradient(-r, -r, r, r);
  outerG.addColorStop(0, '#fff7c8');
  outerG.addColorStop(0.25, '#ffe98a');
  outerG.addColorStop(0.6, '#f4c830');
  outerG.addColorStop(1, '#a06e08');
  ctx.fillStyle = outerG;
  ctx.beginPath();
  ctx.moveTo(-r * 1.05, r * 0.55);
  ctx.bezierCurveTo(-r * 0.7, -r * 0.55, r * 0.55, -r * 1.15, r * 1.05, -r * 0.25);
  ctx.bezierCurveTo(r * 0.9, r * 0.1, r * 0.4, r * 0.35, -r * 1.05, r * 0.55);
  ctx.closePath();
  ctx.fill();

  const shadG = ctx.createLinearGradient(0, -r * 0.2, 0, r * 0.7);
  shadG.addColorStop(0, 'rgba(0,0,0,0)');
  shadG.addColorStop(1, 'rgba(80,50,0,0.45)');
  ctx.fillStyle = shadG;
  ctx.beginPath();
  ctx.moveTo(-r * 1.05, r * 0.55);
  ctx.bezierCurveTo(-r * 0.7, -r * 0.55, r * 0.55, -r * 1.15, r * 1.05, -r * 0.25);
  ctx.bezierCurveTo(r * 0.9, r * 0.1, r * 0.4, r * 0.35, -r * 1.05, r * 0.55);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(140, 90, 10, 0.5)';
  ctx.lineWidth = r * 0.03;
  for (let k = 0; k < 3; k++) {
    const off = (k - 1) * r * 0.08;
    ctx.beginPath();
    ctx.moveTo(-r * 0.95, r * 0.42 + off);
    ctx.bezierCurveTo(-r * 0.5, -r * 0.35 + off, r * 0.5, -r * 0.9 + off, r * 0.95, -r * 0.22 + off);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(255,255,230,0.75)';
  ctx.lineWidth = r * 0.06;
  ctx.beginPath();
  ctx.moveTo(-r * 0.7, r * 0.2);
  ctx.bezierCurveTo(-r * 0.3, -r * 0.55, r * 0.5, -r * 0.95, r * 0.85, -r * 0.35);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.15, -r * 0.35, r * 0.32, r * 0.09, -0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3a2408';
  ctx.beginPath();
  ctx.ellipse(-r * 1.02, r * 0.53, r * 0.12, r * 0.08, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(r * 1.02, -r * 0.25, r * 0.12, r * 0.08, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPineapple(cx, cy, r, t) {
  ctx.save();
  ctx.translate(cx, cy);

  for (let i = -3; i <= 3; i++) {
    const a = i * 0.28;
    ctx.save();
    ctx.rotate(a);
    const lg = ctx.createLinearGradient(0, -r * 1.7, 0, -r * 0.85);
    lg.addColorStop(0, '#4fb038');
    lg.addColorStop(1, '#2e7a20');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.85);
    ctx.quadraticCurveTo(r * 0.12, -r * 1.5, 0, -r * 1.7);
    ctx.quadraticCurveTo(-r * 0.12, -r * 1.5, 0, -r * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(180,255,150,0.55)';
    ctx.lineWidth = r * 0.02;
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.9);
    ctx.lineTo(0, -r * 1.55);
    ctx.stroke();
    ctx.restore();
  }

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(0, r * 0.2, r * 0.85, r * 0.95, 0, 0, Math.PI * 2);
  ctx.clip();

  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, r * 0.2, r * 1.1);
  g.addColorStop(0, '#f0d070');
  g.addColorStop(0.4, '#c89828');
  g.addColorStop(0.75, '#8a6814');
  g.addColorStop(1, '#3a4a0c');
  ctx.fillStyle = g;
  ctx.fillRect(-r, -r, r * 2, r * 2);

  const step = r * 0.22;
  ctx.strokeStyle = 'rgba(60, 40, 5, 0.75)';
  ctx.lineWidth = r * 0.022;
  for (let y = -r; y < r; y += step) {
    for (let x = -r; x < r; x += step) {
      const ox = (Math.round((y + r) / step) % 2) * step * 0.5;
      ctx.beginPath();
      ctx.moveTo(x + ox, y);
      ctx.lineTo(x + ox + step * 0.5, y + step * 0.5);
      ctx.lineTo(x + ox, y + step);
      ctx.lineTo(x + ox - step * 0.5, y + step * 0.5);
      ctx.closePath();
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,220,120,0.30)';
      ctx.beginPath();
      ctx.arc(x + ox, y + step * 0.5, r * 0.02, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  const warm = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.2);
  warm.addColorStop(0, 'rgba(255,240,180,0.35)');
  warm.addColorStop(0.5, 'rgba(255,220,140,0.10)');
  warm.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = warm;
  ctx.fillRect(-r, -r, r * 2, r * 2);
  ctx.restore();

  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.3, -r * 0.25, r * 0.2, r * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = r * 0.02;
  ctx.beginPath();
  ctx.ellipse(0, r * 0.2, r * 0.85, r * 0.95, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawStrawberry(cx, cy, r, t) {
  ctx.save();
  ctx.translate(cx, cy);

  const g = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r * 1.05);
  g.addColorStop(0, '#ff9aa6');
  g.addColorStop(0.5, '#e02a3a');
  g.addColorStop(1, '#5a0510');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, r * 0.95);
  ctx.bezierCurveTo(-r * 1.1, r * 0.2, -r * 0.95, -r * 0.85, 0, -r * 0.7);
  ctx.bezierCurveTo(r * 0.95, -r * 0.85, r * 1.1, r * 0.2, 0, r * 0.95);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = t.pip;
  const rows = 5;
  for (let i = 0; i < rows; i++) {
    const yy = -r * 0.5 + i * (r * 0.3);
    const count = 5 - Math.abs(i - 2);
    for (let j = 0; j < count; j++) {
      const xx = (j - (count - 1) / 2) * (r * 0.28);
      ctx.beginPath();
      ctx.ellipse(xx, yy, r * 0.045, r * 0.065, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,240,180,0.6)';
      ctx.beginPath();
      ctx.arc(xx - r * 0.012, yy - r * 0.022, r * 0.014, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = t.pip;
    }
  }

  for (let i = -2; i <= 2; i++) {
    ctx.save();
    ctx.translate(0, -r * 0.65);
    ctx.rotate(i * 0.55);
    const lg = ctx.createLinearGradient(0, 0, 0, -r * 0.45);
    lg.addColorStop(0, '#3a8a3a');
    lg.addColorStop(1, '#2e6a2e');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(r * 0.2, -r * 0.2, 0, -r * 0.42);
    ctx.quadraticCurveTo(-r * 0.2, -r * 0.2, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  ctx.strokeStyle = '#2e6a2e';
  ctx.lineWidth = r * 0.06;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.65);
  ctx.lineTo(r * 0.05, -r * 1.05);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.32, -r * 0.15, r * 0.18, r * 0.1, -0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPeach(cx, cy, r, t) {
  ctx.save();
  ctx.translate(cx, cy);

  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.08, 0, 0, r * 1.05);
  g.addColorStop(0, '#ffe6c0');
  g.addColorStop(0.4, '#ffa46a');
  g.addColorStop(0.85, '#c14a2a');
  g.addColorStop(1, '#6a1a08');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const blush = ctx.createRadialGradient(r * 0.35, r * 0.05, r * 0.1, r * 0.35, r * 0.05, r * 0.9);
  blush.addColorStop(0, 'rgba(255,140,90,0.4)');
  blush.addColorStop(0.6, 'rgba(255,120,80,0.12)');
  blush.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = blush;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(140, 40, 20, 0.7)';
  ctx.lineWidth = r * 0.05;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-r * 0.05, -r * 0.9);
  ctx.quadraticCurveTo(-r * 0.15, 0, -r * 0.05, r * 0.9);
  ctx.stroke();

  ctx.fillStyle = '#3a8a3a';
  ctx.beginPath();
  ctx.ellipse(r * 0.25, -r * 1.0, r * 0.22, r * 0.11, -0.55, 0, Math.PI * 2);
  ctx.fill();

  drawBodyShine(r, { hi: '#ffe0b0' }, 1);

  ctx.restore();
}

function drawRoundFruit(cx, cy, r, t) {
  ctx.save();
  ctx.translate(cx, cy);

  const ovalK = t.oval ? 1.12 : 1.0;

  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.42, r * 0.08, 0, 0, r * 1.08);
  g.addColorStop(0, t.hi);
  g.addColorStop(0.4, t.mid);
  g.addColorStop(0.85, t.base);
  g.addColorStop(1, 'rgba(0,0,0,0.4)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * ovalK, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  const juice = ctx.createRadialGradient(-r * 0.4, -r * 0.5, r * 0.1, 0, 0, r * 1.2);
  juice.addColorStop(0, hexA(t.hi, 0.35));
  juice.addColorStop(0.6, hexA(t.mid, 0.10));
  juice.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = juice;
  ctx.beginPath();
  ctx.ellipse(0, 0, r, r * ovalK, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (t.name === 'apple') {
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * ovalK, 0, 0, Math.PI * 2);
    ctx.clip();
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = 'rgba(255,180,180,' + (0.08 + i * 0.015) + ')';
      ctx.lineWidth = 1.5;
      const y0 = -r * 0.6 + i * (r * 0.3);
      ctx.beginPath();
      ctx.moveTo(-r, y0);
      ctx.quadraticCurveTo(0, y0 + r * 0.1, r, y0);
      ctx.stroke();
    }
    ctx.restore();
  }

  if (t.crown) {
    ctx.fillStyle = '#3a1010';
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(i * r * 0.12 - r * 0.05, -r * 0.95);
      ctx.lineTo(i * r * 0.12, -r * 1.18);
      ctx.lineTo(i * r * 0.12 + r * 0.05, -r * 0.95);
      ctx.closePath();
      ctx.fill();
    }
  }

  if (!t.crown) {
    ctx.fillStyle = 'rgba(0,0,0,0.20)';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.9, r * 0.14, r * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (t.name === 'apple') {
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(-r * 0.045, -r * 1.05, r * 0.09, r * 0.28);
    if (t.leaf) {
      const lg = ctx.createLinearGradient(r * 0.1, -r * 1.15, r * 0.4, -r * 0.9);
      lg.addColorStop(0, '#4fb038');
      lg.addColorStop(1, t.leaf);
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.ellipse(r * 0.22, -r * 1.05, r * 0.22, r * 0.11, -0.55, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.25)';
      ctx.lineWidth = r * 0.02;
      ctx.beginPath();
      ctx.moveTo(r * 0.05, -r * 1.05);
      ctx.lineTo(r * 0.42, -r * 1.08);
      ctx.stroke();
    }
  }

  drawBodyShine(r, t, ovalK);

  ctx.restore();
}

// ---------- ПОЛОВИНКА ----------
function drawHalf(h) {
  const t = h.type;
  if (!t) return;
  const r = h.r;
  ctx.save();
  ctx.rotate(h.angle);
  ctx.beginPath();
  if (h.side < 0) ctx.rect(-r * 1.3, -r * 1.6, r * 2.6, r * 1.6);
  else ctx.rect(-r * 1.3, 0, r * 2.6, r * 1.6);
  ctx.clip();
  ctx.rotate(-h.angle);

  if (t.shape === 'watermelon') drawWatermelon(0, 0, r);
  else if (t.shape === 'banana') drawBanana(0, 0, r, t);
  else if (t.shape === 'pineapple') drawPineapple(0, 0, r, t);
  else if (t.shape === 'strawberry') drawStrawberry(0, 0, r, t);
  else if (t.shape === 'peach') drawPeach(0, 0, r, t);
  else drawRoundFruit(0, 0, r, t);
  ctx.restore();

  ctx.save();
  ctx.rotate(h.angle);
  if (h.side < 0) ctx.translate(0, -r * 0.02);
  else ctx.translate(0, r * 0.02);

  const fg = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r * 1.05);
  fg.addColorStop(0, t.flesh);
  fg.addColorStop(0.75, t.flesh);
  fg.addColorStop(1, hexA(t.flesh, 0.5));
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.98, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(0, -r * 0.02, r * 0.85, r * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();

  if (t.name === 'watermelon') {
    ctx.fillStyle = t.pip;
    const pips = [-r * 0.55, -r * 0.3, 0, r * 0.3, r * 0.55];
    for (const px of pips) {
      ctx.beginPath();
      ctx.ellipse(px, 0, r * 0.05, r * 0.025, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (t.segments) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.18, r * 0.05, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexA(t.hi, 0.8);
    ctx.lineWidth = r * 0.022;
    for (let k = -3; k <= 3; k++) {
      if (k === 0) continue;
      ctx.beginPath();
      ctx.moveTo(k * r * 0.12, -r * 0.13);
      ctx.lineTo(k * r * 0.12, r * 0.13);
      ctx.stroke();
    }
  }
  if (t.kiwiSlice) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.3, r * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a1a08';
    for (let k = -5; k <= 5; k++) {
      ctx.beginPath();
      ctx.ellipse(k * r * 0.14, 0, r * 0.02, r * 0.015, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = r * 0.012;
    for (let k = -6; k <= 6; k++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(k * r * 0.13, r * 0.13);
      ctx.stroke();
    }
  }
  if (t.name === 'pomegranate') {
    for (let i = -4; i <= 4; i++) {
      for (let j = -1; j <= 1; j++) {
        const px = i * r * 0.16;
        const py = j * r * 0.06;
        ctx.fillStyle = 'rgba(120,0,20,0.8)';
        ctx.beginPath();
        ctx.arc(px, py, r * 0.05, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,80,120,0.9)';
        ctx.beginPath();
        ctx.arc(px - r * 0.012, py - r * 0.012, r * 0.03, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  if (t.name === 'peach') {
    ctx.strokeStyle = 'rgba(120,60,10,0.6)';
    ctx.lineWidth = r * 0.02;
    ctx.beginPath();
    ctx.moveTo(-r * 0.9, 0);
    ctx.quadraticCurveTo(0, r * 0.08, r * 0.9, 0);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(0,0,0,0.25)';
  ctx.lineWidth = r * 0.02;
  ctx.beginPath();
  ctx.ellipse(0, 0, r * 0.98, r * 0.16, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

// ---------- БОМБА ----------
function drawBomb(o) {
  const r = o.r;
  const g = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r);
  g.addColorStop(0, '#5a5a66');
  g.addColorStop(0.5, '#26262e');
  g.addColorStop(1, '#0a0a0e');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.2, r * 0.12, -0.7, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#8a6a3a';
  ctx.lineWidth = r * 0.12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -r * 0.9);
  ctx.quadraticCurveTo(r * 0.3, -r * 1.3, r * 0.1, -r * 1.55);
  ctx.stroke();

  const spark = 0.6 + Math.sin(performance.now() * 0.02) * 0.4;
  const sg = ctx.createRadialGradient(r * 0.1, -r * 1.55, 0, r * 0.1, -r * 1.55, r * 0.35);
  sg.addColorStop(0, 'rgba(255,255,200,' + spark + ')');
  sg.addColorStop(0.4, 'rgba(255,170,40,' + spark * 0.8 + ')');
  sg.addColorStop(1, 'rgba(255,80,0,0)');
  ctx.fillStyle = sg;
  ctx.beginPath();
  ctx.arc(r * 0.1, -r * 1.55, r * 0.35, 0, Math.PI * 2);
  ctx.fill();
}

// ---------- СТАРТ ----------
requestAnimationFrame(loop);

// ============================================================
//  ПОДСКАЗКИ ПО НАСТРОЙКАМ:
//  - При старте новой игры всегда открывается меню выбора клинка
//    (openMenuForNewGame), кнопка "В БОЙ!" в меню — старт.
//  - Радужный бонус нарисован как АНАНАС (drawRainbowPineapple)
//  - Заморозка нарисована как БАНАН во льду (drawFreezeBanana)
//  - Клинки: BLADES (ОГОНЬ, БАБОЧКИ, ДЕМОН)
//  - Шанс бонус-фрукта: SETTINGS.BONUS_CHANCE
//  - Радуга: SETTINGS.RAINBOW_DURATION / RAINBOW_SPAWN_RATE
//  - Заморозка: SETTINGS.FREEZE_DURATION
//  - Длительность раунда: SETTINGS.ROUND_TIME. Жизни: SETTINGS.LIVES / MAX_LIVES.
// ============================================================