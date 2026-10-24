/* dashboard.js - mock data + rendering for the student Dashboard.
   Front-end prototype: all data below is fake. Change it to test other states. */

const data = {
  user: { name: 'Sam' },
  path: { name: 'Python Basics' },                       // placeholder path name
  progress: { lessonsDone: 12, lessonsTotal: 40, stagesDone: 3, stagesTotal: 10, currentStage: { number: 4, name: 'Loops' }, quizAvg: 82 },
  streak: { days: 5 },                                   // counts back from today
  goals: [                                               // based on the study time chosen in Getting Started (FR-11)
    { text: 'Study for 30 minutes', done: true },
    { text: 'Finish 1 lesson', done: false },
    { text: 'Pass 1 quiz', done: false }
  ],
  recommended: {                                         // FR-39
    title: 'Repeating actions with for loops',
    stage: 'Stage 4: Loops',
    time: '15 min',
    reason: 'You scored 45% on the last loops quiz. This lesson will help before you move to the next stage.',
    href: 'lesson.html',
    more: [
      { icon: 'fitness_center', title: 'Loops practice exercise', meta: 'Coding challenge, 10 min', href: 'coding-playground.html' },
      { icon: 'replay', title: 'Revise variables', meta: 'Quick quiz, 5 min', href: 'lesson.html' }
    ]
  },
  achievements: [                                        // FR-50 / FR-51 (brief)
    { icon: 'flag',                  title: 'First flag',     desc: 'Finish your first stage', earned: true },
    { icon: 'quiz',                  title: 'Quiz starter',   desc: 'Pass your first quiz',    earned: true },
    { icon: 'local_fire_department', title: 'On a roll',      desc: 'Reach a 3 day streak',    earned: true },
    { icon: 'emoji_events',          title: 'Boss slayer',    desc: 'Win a Boss Fight',        earned: false }
  ],
  focus: [                                               // FR-38 / FR-49 (brief)
    { topic: 'Variables', score: 92 },
    { topic: 'Functions', score: 78 },
    { topic: 'Loops',     score: 45 }
  ]
};

const p = data.progress;
const overallPct = Math.round((p.lessonsDone / p.lessonsTotal) * 100);

/* 1. Plain text values: any element with data-bind="key" */
const values = {
  name: data.user.name,
  initial: data.user.name.charAt(0).toUpperCase(),
  pathName: data.path.name,
  currentStageText: `Stage ${p.currentStage.number}: ${p.currentStage.name}`,
  lessonsDone: p.lessonsDone, lessonsTotal: p.lessonsTotal,
  stagesDone: p.stagesDone, stagesTotal: p.stagesTotal,
  quizAvg: p.quizAvg, overallPct,
  streakDays: data.streak.days,
  recTitle: data.recommended.title, recStage: data.recommended.stage,
  recTime: data.recommended.time, recReason: data.recommended.reason
};
$$('[data-bind]').forEach((el) => {
  const v = values[el.dataset.bind];
  if (v !== undefined) el.textContent = v;
});
$('#startLesson').href = data.recommended.href;

/* 2. More recommendations */
$('#recList').innerHTML = data.recommended.more.map((r) => `
  <a class="rec-row" href="${r.href}">
    <span class="rec-icon"><span class="material-symbols-outlined">${r.icon}</span></span>
    <span class="stack">
      <span class="rec-title">${r.title}</span>
      <span class="rec-meta">${r.meta}</span>
    </span>
  </a>`).join('');

/* 3. Overall progress bar + one segment per stage */
$('#overallFill').dataset.w = overallPct;
$('#overallTrack').setAttribute('aria-valuenow', overallPct);

$('#stageSegs').innerHTML = Array.from({ length: p.stagesTotal }, (_, i) => {
  const n = i + 1;
  const cls = n <= p.stagesDone ? 'on' : n === p.currentStage.number ? 'on pulse-seg' : '';
  return `<i class="seg ${cls}" title="Stage ${n}"></i>`;
}).join('');

/* 4. Daily goals + ring */
function renderGoals() {
  const done = data.goals.filter((g) => g.done).length;
  const total = data.goals.length;
  $('#goalRing').style.setProperty('--p', Math.round((done / total) * 100));
  $('#goalRing').setAttribute('aria-label', `${done} of ${total} daily goals done`);
  $('#goalRingValue').textContent = `${done}/${total}`;
}
$('#goalList').innerHTML = data.goals.map((g, i) => `
  <button class="goal ${g.done ? 'done' : ''}" type="button" data-i="${i}" aria-pressed="${g.done}">
    <span class="goal-check"><span class="material-symbols-outlined">check</span></span>
    <span class="goal-text">${g.text}</span>
  </button>`).join('');

$('#goalList').addEventListener('click', (e) => {
  const btn = e.target.closest('.goal');
  if (!btn) return;
  const goal = data.goals[btn.dataset.i];
  goal.done = !goal.done;
  btn.classList.toggle('done', goal.done);
  btn.setAttribute('aria-pressed', goal.done);
  renderGoals();
});

/* 5. Streak: week strip (Monday first), counts back from today */
const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const todayIdx = (new Date().getDay() + 6) % 7;
$('#week').innerHTML = dayLetters.map((letter, i) => {
  const done = i <= todayIdx && todayIdx - i < data.streak.days;
  const cls = `${done ? 'done' : ''} ${i === todayIdx ? 'today' : ''}`;
  return `<div class="day ${cls}" title="${dayNames[i]}">
    <span class="day-dot"><span class="material-symbols-outlined">check</span></span>${letter}
  </div>`;
}).join('');

/* 6. Achievements (brief) */
$('#achievements').innerHTML = data.achievements.map((a) => `
  <div class="achievement ${a.earned ? '' : 'locked'}">
    <span class="achievement-icon"><span class="material-symbols-outlined">${a.earned ? a.icon : 'lock'}</span></span>
    <span class="achievement-title">${a.title}</span>
    <span class="achievement-desc">${a.desc}</span>
  </div>`).join('');

/* 7. Topics to focus on */
$('#focusList').innerHTML = data.focus.map((f) => {
  const level = f.score >= 80 ? ['Strong', 'pill-tertiary', 'fill-tertiary']
              : f.score >= 60 ? ['Good', '', '']
              : ['Needs practice', 'pill-warn', 'fill-warn'];
  return `<div class="focus-row">
    <div class="focus-top"><span>${f.topic}</span><span class="pill ${level[1]}">${level[0]}</span></div>
    <div class="progress-track"><div class="progress-fill ${level[2]}" data-w="${f.score}"></div></div>
  </div>`;
}).join('');

/* 8. Start animations after first paint (bars fill, ring sweeps) */
renderGoals();                                           // sets ring to its real value
$('#goalRing').style.setProperty('--p', 0);
setTimeout(() => {
  $$('.progress-fill[data-w]').forEach((el) => el.style.setProperty('--w', el.dataset.w + '%'));
  renderGoals();
}, 300);