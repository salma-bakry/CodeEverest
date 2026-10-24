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

let questions = [];   // filled when the test starts (see buildQuestions)

// Everything the student chooses is kept here.
// langs is a list, but it only ever holds ONE language.
const state = { level: '', goals: [], langs: [], score: 0, path: '', days: [], minutes: 0 };

let step = 1;        // which step is showing
let q = 0;           // which test question is showing
let picked = null;   // which answer was clicked

const el = (id) => document.getElementById(id);
const nextBtn = el('nextBtn');
const backBtn = el('backBtn');

// Build the 5 questions: the first one matches the language the student picked
function buildQuestions() {
  const lang = state.langs[0];
  const first = firstQuestions[lang] || firstQuestions['Python'];
  questions = [first, ...commonQuestions];
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
  step = n;
  document.querySelectorAll('.step').forEach((s) => { s.hidden = Number(s.dataset.step) !== n; });
  document.querySelectorAll('#segs .seg').forEach((s, i) => s.classList.toggle('on', i < n));
  el('stepLabel').textContent = 'Step ' + n + ' of 5';
  backBtn.hidden = n === 1 || n === 5;
  nextBtn.hidden = n === 5;
  nextBtn.textContent = n === 3 ? 'Confirm this path' : 'Next';
  updateNext();
}

// Put the current test question on the page
function renderQuestion() {
  const item = questions[q];
  el('qCount').textContent = 'Question ' + (q + 1) + ' of ' + questions.length;
  el('qText').textContent = item.q;
  el('qOptions').innerHTML = item.options
    .map((text, i) => '<button class="opt" data-i="' + i + '">' + text + '</button>')
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
    ['Level', state.level],
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
  if (step === 2) {
    if (picked === questions[q].answer) state.score++;
    if (q < questions.length - 1) {          // more questions left: show the next one
      q++; picked = null; renderQuestion(); updateNext();
      return;
    }
  }
  const n = step + 1;
  if (n === 2) { buildQuestions(); q = 0; picked = null; state.score = 0; renderQuestion(); }
  if (n === 3) choosePath();
  if (n === 5) finish();
  showStep(n);
});

backBtn.addEventListener('click', () => showStep(step - 1));

showStep(1);