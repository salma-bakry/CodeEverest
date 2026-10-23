// Where the profile is saved in the browser
const PROFILE_KEY = 'codeEverestProfile';
// Where onboarding saved its answers (see js/onboarding.js)
const ONBOARDING_KEY = 'codeEverestOnboarding';

// All the choices a student can pick from
const options = {
  langs: ['Python', 'JavaScript', 'C++', 'HTML & CSS'],
  goals: ['Get a job', 'Build projects', 'Pass a course', 'Learn for fun'],
  days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  minutes: [15, 30, 60, 90]
};
const minuteLabels = { 15: '15 min', 30: '30 min', 60: '1 hour', 90: '1.5 hours' };

const byId = (id) => document.getElementById(id);

// Read something from the browser's storage (returns null if nothing is there)
function read(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (err) { return null; }
}

// Decide what profile to start with
function loadProfile() {
  const sample = {
    name: 'Alex Student',
    email: 'alex@example.com',
    langs: ['Python'],
    goals: ['Get a job'],
    days: ['Mon', 'Wed', 'Fri'],
    minutes: 30
  };
  const saved = read(PROFILE_KEY);              // 1) a profile the student already saved
  if (saved) return { ...sample, ...saved };

  const ob = read(ONBOARDING_KEY);              // 2) answers from onboarding
  if (ob) {
    return {
      ...sample,
      langs: ob.langs && ob.langs.length ? ob.langs : sample.langs,
      goals: ob.goals && ob.goals.length ? ob.goals : sample.goals,
      days: ob.days && ob.days.length ? ob.days : sample.days,
      minutes: ob.minutes || sample.minutes
    };
  }
  return sample;                                // 3) just the sample data
}

let saved = loadProfile();   // the real, saved profile
let draft = null;            // the copy being edited (only exists while editing)
let editing = false;
let toastTimer = null;

// Text shown for one choice (minutes need a nicer label)
const labelOf = (group, value) => (group === 'minutes' ? minuteLabels[value] : value);

// Click a chip while editing
function toggle(group, value) {
  if (group === 'minutes') {
    draft.minutes = value;                      // only one time allowed
  } else if (group === 'langs') {
    draft.langs = [value];                      // only one language allowed
  } else {
    const list = draft[group];
    const i = list.indexOf(value);
    if (i > -1) list.splice(i, 1); else list.push(value);
  }
  renderGroup(group);
}

// Draw one group: all chips when editing, only the picked ones as pills when viewing
function renderGroup(group) {
  const box = byId('g-' + group);
  const data = editing ? draft : saved;
  box.innerHTML = '';

  if (editing) {
    options[group].forEach((value) => {
      const picked = group === 'minutes' ? data.minutes === value : data[group].includes(value);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'chip' + (picked ? ' selected' : '');
      b.setAttribute('aria-pressed', String(picked));
      b.textContent = labelOf(group, value);
      b.addEventListener('click', () => toggle(group, value));
      box.appendChild(b);
    });
    return;
  }

  const values = group === 'minutes' ? [data.minutes] : data[group];
  if (!values.length) {
    box.innerHTML = '<span class="text-muted fs">Nothing picked yet</span>';
    return;
  }
  values.forEach((value) => {
    const p = document.createElement('span');
    p.className = 'pill';
    p.textContent = labelOf(group, value);
    box.appendChild(p);
  });
}

// Draw the whole page
function render() {
  const initial = (saved.name.trim()[0] || 'A').toUpperCase();

  byId('nameView').textContent = saved.name;
  byId('emailView').textContent = saved.email;
  byId('bigAvatar').textContent = initial;
  byId('headerAvatar').textContent = initial;

  byId('nameView').parentElement.hidden = editing;   // hide the heading while editing
  byId('emailView').hidden = editing;
  byId('editFields').hidden = !editing;
  byId('editBtn').hidden = editing;
  byId('editActions').hidden = !editing;

  Object.keys(options).forEach(renderGroup);
}

function showToast() {
  const toast = byId('toast');
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}

// Edit Profile: make a copy to edit, and put the current name/email in the boxes
byId('editBtn').addEventListener('click', () => {
  draft = JSON.parse(JSON.stringify(saved));
  editing = true;
  byId('toast').hidden = true;
  byId('errorMsg').hidden = true;
  byId('nameInput').value = draft.name;
  byId('emailInput').value = draft.email;
  render();
});

// Save Changes: check, then keep the draft
byId('saveBtn').addEventListener('click', () => {
  const name = byId('nameInput').value.trim();
  const email = byId('emailInput').value.trim();
  const error = byId('errorMsg');

  if (!name) { error.textContent = 'Please enter your name.'; error.hidden = false; return; }
  if (!email.includes('@') || !email.includes('.')) { error.textContent = 'Please enter a valid email, like name@example.com.'; error.hidden = false; return; }

  draft.name = name;
  draft.email = email;
  saved = draft;
  draft = null;
  editing = false;
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(saved)); } catch (err) { /* ignore */ }
  render();
  showToast();
});

// Cancel: throw the draft away, nothing changes
byId('cancelBtn').addEventListener('click', () => {
  draft = null;
  editing = false;
  render();
});

render();