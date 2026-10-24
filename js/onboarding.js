// The storage name. If Dashboard expects another name, change ONLY this line.
const STORAGE_KEY = 'codeEverestOnboarding';

// Question 1 depends on the language. "answer" is the number of the correct option (0 = first).
const firstQuestions = {
  'Python': { q: 'What does print("Hi") do?', options: ['Shows Hi on the screen', 'Saves Hi in a file', 'Deletes Hi', 'Draws Hi'], answer: 0 },
  'C++': { q: 'What does cout << "Hi"; do?', options: ['Shows Hi on the screen', 'Saves Hi in a file', 'Deletes Hi', 'Draws Hi'], answer: 0 },
  'JavaScript': { q: 'What does console.log("Hi") do?', options: ['Shows Hi in the console', 'Saves Hi in a file', 'Deletes Hi', 'Draws Hi'], answer: 0 },
  'HTML & CSS': { q: 'What is HTML used for?', options: ['Building the structure of a web page', 'Doing math', 'Storing a database', 'Editing photos'], answer: 0 }
};

// The other 4 questions work for every language.
const commonQuestions = [
  { q: 'What is a variable?', options: ['A broken line of code', 'A name that stores a value', 'A type of computer', 'A color'], answer: 1 },
  { q: 'What does a loop do?', options: ['Stops the program', 'Repeats code many times', 'Deletes code', 'Makes code faster'], answer: 1 },
  { q: 'What does "if x > 5" check?', options: ['If x is smaller than 5', 'If x equals 5', 'If x is bigger than 5', 'If x is a word'], answer: 2 },
  { q: 'What is a function?', options: ['A reusable block of code', 'A keyboard key', 'An error message', 'A file name'], answer: 0 }
];

// Nice names for the level chips (shown in the summary)
const LEVEL_LABELS = { beginner: 'Complete beginner', some: 'I know a little', advanced: 'I have experience' };

const LAST_STEP = 5;

let questions = [];   // filled when the test starts (see startTestIfNeeded)
let answers = [];     // answers[i] = number of the option picked for question i (kept so Back/Next never double counts)

// Everything the student chooses is kept here.
// langs is a list, but it only ever holds ONE language.
const state = { level: '', goals: [], langs: [], score: 0, path: '', days: [], minutes: 0 };

let step = 1;        // which step is showing
let q = 0;           // which test question is showing
let picked = null;   // which answer is selected for the question on screen

const el = (id) => document.getElementById(id);
const nextBtn = el('nextBtn');
const backBtn = el('backBtn');

// Show or hide something. Sets both the hidden attribute AND display,
// because classes like .btn and .card would otherwise win over [hidden].
function setShown(node, shown) {
  node.hidden = !shown;
  node.style.display = shown ? '' : 'none';
}

// Build the 5 questions (the first one matches the chosen language).
// If the student already started a test for the same language, keep their answers.
function startTestIfNeeded() {
  const first = firstQuestions[state.langs[0]] || firstQuestions['Python'];
  if (questions[0] === first) return;
  questions = [first, ...commonQuestions];
  answers = [];
  q = 0;
  picked = null;
  state.score = 0;
}

// Is the Next button allowed right now? (each step has its own rule)
function canGo() {
  if (step === 1) return state.level !== '' && state.langs.length > 0;
  if (step === 2) return picked !== null;
  if (step === 4) return state.days.length > 0 && state.minutes > 0;
  return true;
}

function updateNext() { nextBtn.disabled = !canGo(); }

// Show one step, hide the others, and update the progress bars
function showStep(n) {
  n = Math.max(1, Math.min(LAST_STEP, n));        // never go before step 1 or after the last step
  step = n;
  document.querySelectorAll('.step').forEach((s) => setShown(s, Number(s.dataset.step) === n));
  document.querySelectorAll('#segs .seg').forEach((s, i) => s.classList.toggle('on', i < n));
  el('stepLabel').textContent = 'Step ' + n + ' of ' + LAST_STEP;
  setShown(backBtn, n > 1);
  setShown(nextBtn, n < LAST_STEP);
  nextBtn.textContent = n === 3 ? 'Confirm this path' : 'Next';
  if (n === 2 && questions.length) { picked = answers[q] ?? null; renderQuestion(); }
  updateNext();
}

// Put the current test question on the page (and re-select the earlier answer, if any)
function renderQuestion() {
  const item = questions[q];
  el('qCount').textContent = 'Question ' + (q + 1) + ' of ' + questions.length;
  el('qText').textContent = item.q;
  el('qOptions').innerHTML = item.options
    .map((text, i) => '<button type="button" class="opt' + (picked === i ? ' selected' : '') + '" data-i="' + i + '">' + text + '</button>')
    .join('');
}

// Simple rules: the language + level/score decide the path
function choosePath() {
  const lang = state.langs[0];
  const word = (state.level === 'advanced' || state.score >= 4) ? 'Intermediate' : 'Fundamentals';
  state.path = lang + ' ' + word;
  el('pathName').textContent = state.path;
  el('pathWhy').textContent = 'You picked ' + lang + ' and scored ' + state.score + ' out of ' + questions.length + ' on the test.';
}

// Fill the summary and save the answers in the browser
function finish() {
  const rows = [
    ['Level', LEVEL_LABELS[state.level] || state.level],
    ['Goals', state.goals.join(', ') || 'None picked'],
    ['Language', state.langs.join(', ')],
    ['Test score', state.score + ' / ' + questions.length],
    ['Your path', state.path],
    ['Study days', state.days.join(', ')],
    ['Time per day', state.minutes + ' min']
  ];
  el('summary').innerHTML = rows
    .map((r) => '<li class="sum-row"><span class="text-muted">' + r[0] + '</span><b>' + r[1] + '</b></li>')
    .join('');
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (err) { /* ignore */ }
}

// One click listener for everything clickable
document.addEventListener('click', (e) => {
  const chip = e.target.closest('.chip[data-group]');
  if (chip) {
    const group = chip.dataset.group;
    const value = chip.dataset.value;
    if (group === 'level') state.level = value;
    else if (group === 'minutes') state.minutes = Number(value);
    else if (group === 'langs') state.langs = [value];   // only ONE language allowed
    else {                                   // goals, days: click again to un-pick
      const list = state[group];
      const i = list.indexOf(value);
      if (i > -1) list.splice(i, 1); else list.push(value);
    }
    document.querySelectorAll('.chip[data-group="' + group + '"]').forEach((c) => {
      const cur = state[group];
      const on = Array.isArray(cur) ? cur.includes(c.dataset.value) : String(cur) === c.dataset.value;
      c.classList.toggle('selected', on);
      c.setAttribute('aria-pressed', on);
    });
    updateNext();
    return;
  }
  const opt = e.target.closest('.opt');
  if (opt) {
    picked = Number(opt.dataset.i);
    document.querySelectorAll('.opt').forEach((o) => o.classList.toggle('selected', o === opt));
    updateNext();
  }
});

nextBtn.addEventListener('click', () => {
  if (step >= LAST_STEP || nextBtn.disabled) return;      // nothing comes after the last step

  if (step === 1) startTestIfNeeded();

  if (step === 2) {
    answers[q] = picked;                                  // remember the answer (no score counting here)
    if (q < questions.length - 1) {                       // more questions left: show the next one
      q++; picked = answers[q] ?? null; renderQuestion(); updateNext();
      return;
    }
    // last question done: count the score from all saved answers, so going Back and Next never adds extra points
    state.score = answers.filter((a, i) => a === questions[i].answer).length;
  }

  const n = step + 1;
  if (n === 3) choosePath();
  if (n === LAST_STEP) finish();
  showStep(n);
});

backBtn.addEventListener('click', () => {
  if (step === 2 && q > 0) {                              // inside the test: go to the previous question
    answers[q] = picked;
    q--; picked = answers[q] ?? null; renderQuestion(); updateNext();
    return;
  }
  if (step > 1) showStep(step - 1);
});

showStep(1);