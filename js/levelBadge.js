/* level-badge.js - the climber level badge (beginner / intermediate / expert).
   Shared by every page that shows it.

   Usage in HTML (put the script after common.js):
     <span data-level-badge="small"></span>   -> small badge (header, next to the avatar)
     <div  data-level-badge="large"></div>    -> large badge + name + short text (My Progress page)
   Optional: data-level="expert" forces a level on that one element.

   Where the level comes from (prototype): localStorage key "ce-level".
   To test, run this in the browser console, then refresh:
     localStorage.setItem('ce-level', 'expert')      // beginner | intermediate | expert
*/

const LEVELS = {
  beginner:     { label: 'Beginner',     text: 'Just setting out. A few flags are planted along the trail.' },
  intermediate: { label: 'Intermediate', text: 'Well on your way. Each flag marks a stage you have cleared.' },
  expert:       { label: 'Expert',       text: 'At the summit. The flag at the peak is yours.' }
};

function getLevel() {
  try {
    const saved = localStorage.getItem('ce-level');
    if (LEVELS[saved]) return saved;
  } catch (e) { /* storage blocked: use the default */ }
  return 'beginner';
}
function setLevel(level) {
  if (!LEVELS[level]) return;
  try { localStorage.setItem('ce-level', level); } catch (e) { /* ignore */ }
  renderLevelBadges();
}

/* ---------- Large badge (viewBox 120) ---------- */
const TRAIL = [[40, 98], [72, 88], [50, 76], [70, 62], [54, 50]];   // switchbacks, bottom to top
const BIG = {                                                        // flags planted + where the climber stands
  beginner:     { flags: 2, climber: 2 },
  intermediate: { flags: 4, climber: 4 },
  expert:       { flags: 5, climber: null }                          // null = on the summit
};
let badgeId = 0;

function flagSvg(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path class="lb-pole" d="M0 0V-10" stroke-width="1.2"/><path class="lb-flag" d="M0 -10L7 -6.5L0 -3Z"/></g>`;
}
function climberSvg(x, y, armsUp) {
  const arms = armsUp ? '<path d="M0 -9L-3.5 -13.5M0 -9L3.5 -13.5"/>' : '<path d="M3.5 -7L5 0" stroke-width=".9"/>';
  return `<g class="lb-climber" transform="translate(${x} ${y})" fill="none" stroke-linecap="round">
    <path d="M0 -4.5V-9.5" stroke-width="3.2"/><path d="M0 -4.5L-2 0M0 -4.5L2 0" stroke-width="1.6"/>${arms}
    <circle class="lb-fill" cy="-12.4" r="2.5" stroke="none"/><rect class="lb-fill" x="-3.8" y="-9.6" width="2.6" height="4.4" rx="1" stroke="none"/></g>`;
}
function bigBadgeSvg(level) {
  const cfg = BIG[level];
  const id = `lb-clip-${++badgeId}`;
  const flags = TRAIL.slice(0, cfg.flags).map(([x, y]) => flagSvg(x, y)).join('');
  const onTop = cfg.climber === null;
  const peak = onTop ? flagSvg(64, 28, 1.5) : '';
  const climber = onTop ? climberSvg(58, 27, true) : climberSvg(...TRAIL[cfg.climber]);
  return `<svg class="level-${level}" viewBox="0 0 120 120" width="160" height="160" role="img" aria-label="${LEVELS[level].label} level badge">
    <defs><clipPath id="${id}"><circle cx="60" cy="60" r="56"/></clipPath></defs>
    <circle class="lb-sky" cx="60" cy="60" r="56"/>
    <g clip-path="url(#${id})">
      <path class="lb-ridge" d="M-10 120L28 64L66 120ZM54 120L94 70L134 120Z"/>
      <path class="lb-mountain" d="M-10 120L60 26L130 120Z"/>
      <path class="lb-snow" d="M60 26L51 40L56 37.5L60 42L65 37.5L70 40Z"/>
      <path class="lb-trail" d="M40 98L72 88L50 76L70 62L54 50L60 30" fill="none" stroke-width="1.2" stroke-dasharray="2 3"/>
      ${flags}${peak}${climber}
    </g>
    <circle class="lb-ring" cx="60" cy="60" r="56" fill="none" stroke-width="3"/>
  </svg>`;
}

/* ---------- Small badge (viewBox 36, simplified so it stays readable) ---------- */
const SMALL = {
  beginner:     { flags: [[12, 28], [24, 28]],                         dot: [18, 22],     peak: false },
  intermediate: { flags: [[12, 28], [24, 28], [14, 21], [22, 21]],     dot: [18, 15],     peak: false },
  expert:       { flags: [[12, 28], [24, 28], [14, 21], [22, 21]],     dot: [16.5, 9.5],  peak: true }
};
function smallBadgeSvg(level) {
  const cfg = SMALL[level];
  const flags = cfg.flags.map(([x, y]) => `<path class="lb-flag lb-flag-line" d="M${x} ${y}v-5l4 2-4 2"/>`).join('');
  const peak = cfg.peak ? '<path class="lb-flag lb-flag-line" d="M18 9v-6l5 2-5 2"/>' : '';
  return `<svg class="level-${level}" viewBox="0 0 36 36" width="36" height="36" role="img" aria-label="${LEVELS[level].label} level badge">
    <circle class="lb-sky lb-ring" cx="18" cy="18" r="16" stroke-width="2"/>
    <path class="lb-mountain" d="M8 29L18 9L28 29Z"/>${flags}${peak}
    <circle class="lb-fill" cx="${cfg.dot[0]}" cy="${cfg.dot[1]}" r="1.9"/>
  </svg>`;
}

/* ---------- Render every [data-level-badge] on the page ---------- */
function renderLevelBadges() {
  document.querySelectorAll('[data-level-badge]').forEach((el) => {
    const level = LEVELS[el.dataset.level] ? el.dataset.level : getLevel();
    const info = LEVELS[level];
    if (el.dataset.levelBadge === 'large') {
      el.innerHTML = `<div class="level-badge level-badge-large">${bigBadgeSvg(level)}
        <h3 class="level-badge-name">${info.label}</h3><p class="level-badge-text">${info.text}</p></div>`;
    } else {
      el.innerHTML = `<span class="level-badge level-badge-small" title="${info.label} level">${smallBadgeSvg(level)}</span>`;
    }
  });
}
renderLevelBadges();