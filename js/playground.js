/* ==========================================================================
   playground.js  |  Code Everest

   IMPORTANT: this file does NOT run the student's code. Browser JavaScript
   can't run Python or C++. Everything after "Run code" is a DEMO: we look at
   the text of the code with a simple pattern check and show ready-made results.
   A real runner (backend / execution API) can replace the demo parts later.

   Sections:
     1. Shortcuts & element references
     2. Data (challenges, starter code, hints)
     3. State (what the page remembers)
     4. Editor (line numbers + syntax colors)
     5. Demo checking
     6. Showing results (console, tests, feedback)
     7. Run / Submit / Reset
     8. Switching mode, language, challenge
     9. AI mentor chat
    10. Start-up
   ========================================================================== */

(function () {
  'use strict'; // makes JS stricter so silly mistakes show up as errors

  /* ---------- 1. Shortcuts & element references ---------- */

  // Short way to write document.getElementById("...")
  const $ = (id) => document.getElementById(id);

  // Grab every element we need ONCE, so we don't search the page again and again
  const el = {
    workspace: $('workspace'),
    modeTabs: $('modeTabs'),
    challengeSelect: $('challengeSelect'),
    challengeTitle: $('challengeTitle'),
    challengeDifficulty: $('challengeDifficulty'),
    challengeText: $('challengeText'),
    exampleInput: $('exampleInput'),
    exampleOutput: $('exampleOutput'),
    languageSelect: $('languageSelect'),
    fileName: $('fileName'),
    runBtn: $('runBtn'),
    submitBtn: $('submitBtn'),
    resetBtn: $('resetBtn'),
    lineNumbers: $('lineNumbers'),
    codeHighlight: $('codeHighlight'),
    codeEditor: $('codeEditor'),
    consoleMeta: $('consoleMeta'),
    consoleExit: $('consoleExit'),
    consoleOutput: $('consoleOutput'),
    testSummary: $('testSummary'),
    testList: $('testList'),
    feedbackPanel: $('feedbackPanel'),
    feedbackIcon: $('feedbackIcon'),
    feedbackLabel: $('feedbackLabel'),
    feedbackText: $('feedbackText'),
    chatLog: $('chatLog'),
    chatInput: $('chatInput'),
    sendBtn: $('sendBtn')
  };

  // The <code> tag inside the colored layer (that's where the colored text goes)
  const codeTag = el.codeHighlight.querySelector('code');

  // Remember the normal Run button content so we can put it back after "Running…"
  const RUN_HTML = el.runBtn.innerHTML;


  /* ---------- 2. Data ----------
     Each challenge has:
       tests    -> the rows shown in the "Test cases" list
       solution -> a pattern a correct answer contains (used by the demo check)
       hints    -> 3 hints, from gentle to almost-the-answer
       starter  -> the code the student starts with, per language */
  const CHALLENGES = {
    greet: {
      title: 'Greet the user',
      difficulty: 'easy',
      text: 'Write a function <code class="inline">greet(name)</code> that returns the text <code class="inline">"Hello, "</code> followed by the name.',
      exampleInput: 'greet("World")',
      exampleOutput: 'Hello, World',
      tests: [
        { name: 'greet("World")', expected: 'Hello, World' },
        { name: 'greet("Sam")', expected: 'Hello, Sam' },
        { name: 'greet("")', expected: 'Hello, ' }
      ],
      solution: /return[^\n]*Hello, [^\n]*name/,
      hints: [
        'Think about what the function should give back, not what it shows on the screen.',
        'Join two pieces of text together: the greeting and the name.',
        'Try: return "Hello, " + name'
      ],
      starter: {
        python: 'def greet(name):\n    # TODO: return "Hello, " followed by the name\n    pass\n\n\nprint(greet("World"))\n',
        cpp: '#include <iostream>\n#include <string>\nusing namespace std;\n\nstring greet(string name) {\n    // TODO: return "Hello, " followed by the name\n    return "";\n}\n\nint main() {\n    cout << greet("World") << endl;\n    return 0;\n}\n'
      }
    },

    sum: {
      title: 'Sum of a list',
      difficulty: 'medium',
      text: 'Write a function that takes a list of numbers and returns the <b>total</b> of all of them. An empty list should return <code class="inline">0</code>.',
      exampleInput: '[1, 2, 3, 4]',
      exampleOutput: '10',
      tests: [
        { name: 'sum of [1, 2, 3, 4]', expected: '10' },
        { name: 'sum of []', expected: '0' },
        { name: 'sum of [-5, 5]', expected: '0' }
      ],
      solution: /\+=|\bsum\s*\(\s*numbers|accumulate/,
      hints: [
        'You need a variable that starts at 0 and grows as you look at each number.',
        'Use a loop to visit every number in the list and add it to your variable.',
        'Start with total = 0, then loop and do total += number, then return total.'
      ],
      starter: {
        python: 'def sum_list(numbers):\n    # TODO: add up every number and return the total\n    return 0\n\n\nprint(sum_list([1, 2, 3, 4]))\n',
        cpp: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint sumList(vector<int> numbers) {\n    // TODO: add up every number and return the total\n    return 0;\n}\n\nint main() {\n    vector<int> nums = {1, 2, 3, 4};\n    cout << sumList(nums) << endl;\n    return 0;\n}\n'
      }
    },

    even: {
      title: 'Even or odd',
      difficulty: 'easy',
      text: 'Write a function that returns <code class="inline">true</code> when a number is even and <code class="inline">false</code> when it is odd.',
      exampleInput: '4',
      exampleOutput: 'true (4 is even)',
      tests: [
        { name: 'is 4 even?', expected: 'true' },
        { name: 'is 7 even?', expected: 'false' },
        { name: 'is 0 even?', expected: 'true' }
      ],
      solution: /%\s*2/,
      hints: [
        'Even numbers can be divided by 2 with nothing left over.',
        'The % operator gives you the remainder of a division.',
        'Try: return n % 2 == 0'
      ],
      starter: {
        python: 'def is_even(n):\n    # TODO: return True if n is even, otherwise False\n    return False\n\n\nprint(is_even(4))\n',
        cpp: '#include <iostream>\nusing namespace std;\n\nbool isEven(int n) {\n    // TODO: return true if n is even, otherwise false\n    return false;\n}\n\nint main() {\n    cout << isEven(4) << endl;\n    return 0;\n}\n'
      }
    }
  };

  // Starter code for Free play mode (no challenge)
  const FREE_STARTER = {
    python: '# Free play: write anything you like.\nprint("Hello, CodeEverest!")\nprint("Edit me and press Run code.")\n',
    cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeEverest!" << endl;\n    return 0;\n}\n'
  };

  // Words that get the "keyword" color, per language
  const KEYWORDS = {
    python: new Set(['def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 'import', 'from', 'class', 'True', 'False', 'None', 'pass', 'break', 'continue']),
    cpp: new Set(['int', 'bool', 'string', 'vector', 'double', 'float', 'char', 'void', 'return', 'if', 'else', 'for', 'while', 'true', 'false', 'using', 'namespace', 'std', 'const', 'auto', 'cout', 'cin', 'endl'])
  };

  // Icon shown on the feedback panel for each type
  const FEEDBACK_ICONS = { info: 'info', hint: 'lightbulb', error: 'error', success: 'check_circle' };


  /* ---------- 3. State ---------- */
  let mode = 'practice';       // 'practice' or 'free'
  let lang = 'python';         // 'python' or 'cpp'
  let challengeId = 'greet';   // which challenge is open
  let busy = false;            // true while the fake "run" is happening
  let lastResult = null;       // result of the last run (the chat uses it to explain errors)

  const savedCode = {};        // keeps the student's code for each challenge + language
  const hintCount = {};        // how many hints were already shown for each challenge

  const challenge = () => CHALLENGES[challengeId];
  const codeKey = () => (mode === 'free' ? 'free' : challengeId) + ':' + lang;
  const starter = () => (mode === 'free' ? FREE_STARTER[lang] : challenge().starter[lang]);


  /* ---------- 4. Editor ---------- */

  // Makes text safe to put inside HTML (so "<" in code isn't read as a tag)
  function esc(text) {
    return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // Colors the code: wraps comments, strings, numbers, keywords and function
  // names in <span class="tok-..."> (colors are defined in playground.css).
  function highlight(code) {
    // One regex finds all the "interesting" pieces. Everything else stays plain.
    const regex = lang === 'python'
      ? /(?<com>#.*)|(?<str>"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*')|(?<num>\b\d+(?:\.\d+)?\b)|(?<word>[A-Za-z_]\w*)/g
      : /(?<com>\/\/.*)|(?<pre>#\s*include)|(?<str>"(?:[^"\\\n]|\\.)*")|(?<num>\b\d+(?:\.\d+)?\b)|(?<word>[A-Za-z_]\w*)/g;

    let out = '';
    let last = 0; // where the previous match ended
    let m;

    while ((m = regex.exec(code)) !== null) {
      out += esc(code.slice(last, m.index)); // plain text before this match
      const text = esc(m[0]);
      const g = m.groups;

      if (g.com) out += '<span class="tok-com">' + text + '</span>';
      else if (g.pre) out += '<span class="tok-kw">' + text + '</span>';
      else if (g.str) out += '<span class="tok-str">' + text + '</span>';
      else if (g.num) out += '<span class="tok-num">' + text + '</span>';
      else if (KEYWORDS[lang].has(m[0])) out += '<span class="tok-kw">' + text + '</span>';
      else if (code[m.index + m[0].length] === '(') out += '<span class="tok-fn">' + text + '</span>'; // word followed by "(" = function
      else out += text;

      last = m.index + m[0].length;
    }
    return out + esc(code.slice(last)); // plain text after the last match
  }

  // Redraws the colored layer and the line numbers from what's in the textarea
  function refreshEditor() {
    const value = el.codeEditor.value;

    // The extra "\n" keeps the last line lined up with the textarea
    codeTag.innerHTML = highlight(value) + '\n';

    // Line numbers: 1, 2, 3 ... one per line of code
    const count = value.split('\n').length;
    let numbers = '';
    for (let i = 1; i <= count; i++) numbers += i + (i < count ? '\n' : '');
    el.lineNumbers.textContent = numbers;

    syncScroll();
  }

  // Keeps the colored layer and line numbers scrolled with the textarea
  function syncScroll() {
    el.codeHighlight.scrollTop = el.codeEditor.scrollTop;
    el.codeHighlight.scrollLeft = el.codeEditor.scrollLeft;
    el.lineNumbers.scrollTop = el.codeEditor.scrollTop;
  }

  // Every time the student types: save the code and redraw the colors
  el.codeEditor.addEventListener('input', () => {
    savedCode[codeKey()] = el.codeEditor.value;
    refreshEditor();
  });
  el.codeEditor.addEventListener('scroll', syncScroll);

  el.codeEditor.addEventListener('keydown', (e) => {
    // Tab inserts 4 spaces instead of jumping out of the editor
    if (e.key === 'Tab') {
      e.preventDefault();
      el.codeEditor.setRangeText('    ', el.codeEditor.selectionStart, el.codeEditor.selectionEnd, 'end');
      el.codeEditor.dispatchEvent(new Event('input')); // tell the editor the text changed
    }
    // Ctrl + Enter (or Cmd + Enter on Mac) runs the code
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      run(false);
    }
  });

  // Puts the right code in the editor: the student's saved code, or the starter
  function loadCode() {
    const saved = savedCode[codeKey()];
    el.codeEditor.value = saved !== undefined ? saved : starter();
    el.fileName.textContent = lang === 'python' ? 'main.py' : 'main.cpp';
    el.codeEditor.scrollTop = 0;
    el.codeEditor.scrollLeft = 0;
    refreshEditor();
  }


  /* ---------- 5. Demo checking (the code is never executed) ---------- */

  // Removes comments so a TODO comment can't fool our pattern check
  function stripComments(code) {
    return lang === 'python'
      ? code.replace(/#.*$/gm, '')
      : code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  }

  // Practice mode: does the code look like a correct solution?
  function looksCorrect(code) {
    return challenge().solution.test(stripComments(code));
  }

  // Free play: finds the text inside simple print("...") or cout << "..." lines
  function demoOutput(code) {
    const clean = stripComments(code);
    const lines = [];

    if (lang === 'python') {
      for (const m of clean.matchAll(/^print\(\s*(?:"([^"]*)"|'([^']*)')\s*\)/gm)) {
        lines.push(m[1] !== undefined ? m[1] : m[2]);
      }
    } else {
      clean.split('\n').forEach((line) => {
        if (!line.includes('cout')) return;
        const parts = [...line.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
        if (parts.length) lines.push(parts.join(''));
      });
    }
    return lines;
  }


  /* ---------- 6. Showing results ---------- */

  // Updates the AI feedback box (type = info | hint | error | success)
  function setFeedback(type, label, text) {
    el.feedbackPanel.dataset.type = type;       // CSS changes the color from this
    el.feedbackIcon.textContent = FEEDBACK_ICONS[type];
    el.feedbackLabel.textContent = label;
    el.feedbackText.textContent = text;
  }

  // Writes lines into the Output box. Each line is [text, cssClass]
  function showConsole(lines, meta, exitText, exitClass) {
    el.consoleOutput.textContent = '';
    lines.forEach(([text, cls]) => {
      const div = document.createElement('div');
      div.className = cls || '';
      div.textContent = text;
      el.consoleOutput.appendChild(div);
    });
    el.consoleMeta.textContent = meta;
    el.consoleExit.textContent = exitText;
    el.consoleExit.className = 'console-exit fc' + (exitClass ? ' ' + exitClass : '');
  }

  // Draws the test list. results = null (not run) or [true, false, ...]
  function showTests(results) {
    if (mode !== 'practice') return;
    el.testList.textContent = '';

    challenge().tests.forEach((test, i) => {
      // Default look = "not run yet"
      let cls = 'idle', icon = 'radio_button_unchecked', status = 'Not run';
      if (results) {
        cls = results[i] ? 'pass' : 'fail';
        icon = results[i] ? 'check_circle' : 'cancel';
        status = results[i] ? 'Passed' : 'Failed';
      }

      // Build one row: icon | name | expected | status
      const li = document.createElement('li');
      li.className = 'test ' + cls;
      [
        ['material-symbols-outlined test-icon', icon],
        ['test-name fc', test.name],
        ['test-expected fc', 'Expected: ' + test.expected],
        ['test-status fc', status]
      ].forEach(([className, text]) => {
        const span = document.createElement('span');
        span.className = className;
        span.textContent = text;
        li.appendChild(span);
      });
      el.testList.appendChild(li);
    });

    // The small pill next to the "Test cases" title
    if (results) {
      const passed = results.filter(Boolean).length;
      el.testSummary.textContent = passed + '/' + results.length + ' passed';
      el.testSummary.className = 'pill ' + (passed === results.length ? 'pass' : 'fail');
    } else {
      el.testSummary.textContent = 'Not run yet';
      el.testSummary.className = 'pill';
    }
  }

  // Puts output, tests and feedback back to "nothing run yet"
  function clearOutput() {
    showConsole([['>>> Press “Run code” to see a demo result.']], 'stdout • idle', '—', '');
    showTests(null);
    setFeedback('info', 'Code feedback', 'Run your code and I will give you a hint or explain any error.');
    lastResult = null;
  }


  /* ---------- 7. Run / Submit / Reset ---------- */

  function run(isSubmit) {
    if (busy) return; // ignore clicks while a run is already happening
    busy = true;
    el.runBtn.classList.add('is-running');
    el.runBtn.innerHTML = 'Running…';
    showConsole([['Running (demo)…', 'out-muted']], 'stdout • running (demo)', '…', '');

    // Wait a moment so it feels like real code is running
    setTimeout(() => {
      const code = el.codeEditor.value;

      if (mode === 'practice') {
        const ok = looksCorrect(code);
        const tests = challenge().tests;
        // Demo rule: a good-looking solution passes everything, otherwise everything fails
        const results = tests.map(() => ok);
        const passed = ok ? tests.length : 0;
        lastResult = ok ? 'ok' : 'fail';

        const lines = [['[demo] Simulated result. Your code was not executed.', 'out-muted']];
        tests.forEach((t, i) => {
          lines.push(ok
            ? ['✓ Test ' + (i + 1) + ': ' + t.name + ' passed', 'out-ok']
            : ['✗ Test ' + (i + 1) + ': ' + t.name + ' failed', 'out-err']);
        });
        lines.push([passed + '/' + tests.length + ' tests passed (demo)', ok ? 'out-ok' : 'out-err']);

        showConsole(lines, 'stdout • demo', 'Demo: ' + passed + '/' + tests.length + ' passed', ok ? 'ok' : 'err');
        showTests(results);

        if (ok && isSubmit) setFeedback('success', 'Challenge solved (demo)', 'All test cases pass. +20 XP (demo value). Pick the next challenge from the list above.');
        else if (ok) setFeedback('success', 'Looking good', 'Your code looks right. Press Submit to finish this challenge.');
        else setFeedback('hint', 'Hint', 'Something is missing. Check the challenge text again, or ask me for a hint.');

      } else {
        // Free play: just show the text from the print lines
        const output = demoOutput(code);
        const lines = [['[demo] Your code was not executed. Showing the text from your print / cout lines.', 'out-muted']];
        if (output.length) output.forEach((text) => lines.push([text]));
        else lines.push(['(No print or cout line found, so there is nothing to show.)', 'out-muted']);

        showConsole(lines, 'stdout • demo', 'Demo', '');
        setFeedback('info', 'Demo output', 'This is a demo: your code was not executed. Real execution will be added later.');
        lastResult = 'free';
      }

      // Put the Run button back to normal
      el.runBtn.classList.remove('is-running');
      el.runBtn.innerHTML = RUN_HTML;
      busy = false;
    }, 700);
  }

  el.runBtn.addEventListener('click', () => run(false));
  el.submitBtn.addEventListener('click', () => run(true));

  // Reset = back to the starter code
  el.resetBtn.addEventListener('click', () => {
    if (busy) return;
    savedCode[codeKey()] = starter();
    loadCode();
    clearOutput();
  });


  /* ---------- 8. Switching mode, language, challenge ---------- */

  // Fills the challenge card (title, difficulty, text, examples)
  function showChallenge() {
    const c = challenge();
    el.challengeTitle.textContent = c.title;
    el.challengeDifficulty.textContent = c.difficulty.charAt(0).toUpperCase() + c.difficulty.slice(1);
    el.challengeDifficulty.className = 'pill difficulty ' + c.difficulty;
    el.challengeText.innerHTML = c.text; // our own text, safe to use as HTML
    el.exampleInput.textContent = c.exampleInput;
    el.exampleOutput.textContent = c.exampleOutput;
  }

  // Practice / Free play tabs
  el.modeTabs.addEventListener('click', (e) => {
    const tab = e.target.closest('.tab');
    if (!tab || tab.dataset.mode === mode) return;

    savedCode[codeKey()] = el.codeEditor.value; // save the current code first
    mode = tab.dataset.mode;
    el.workspace.dataset.mode = mode;           // CSS hides/shows the practice-only parts
    el.modeTabs.querySelectorAll('.tab').forEach((t) => {
      t.classList.toggle('active', t === tab);
      t.setAttribute('aria-selected', String(t === tab));
    });
    loadCode();
    clearOutput();
  });

  // Language dropdown
  el.languageSelect.addEventListener('change', () => {
    savedCode[codeKey()] = el.codeEditor.value; // save under the OLD language first
    lang = el.languageSelect.value;
    loadCode();
    clearOutput();
  });

  // Challenge dropdown
  el.challengeSelect.addEventListener('change', () => {
    savedCode[codeKey()] = el.codeEditor.value;
    challengeId = el.challengeSelect.value;
    showChallenge();
    loadCode();
    clearOutput();
  });


  /* ---------- 9. AI mentor chat (ready-made answers, no real AI) ---------- */

  // Adds a chat bubble. who = 'user' or 'ai'
  function addMessage(who, text) {
    const row = document.createElement('div');
    row.className = 'chat-row ' + who;
    const bubble = document.createElement('div');
    bubble.className = 'chat-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    el.chatLog.appendChild(row);
    el.chatLog.scrollTop = el.chatLog.scrollHeight; // scroll to the newest message
  }

  // Gives the next hint (each click shows a stronger one)
  function nextHint() {
    if (mode !== 'practice') {
      return 'Work in small steps: write one line, press Run code, and read the output before adding more.';
    }
    const hints = challenge().hints;
    const n = hintCount[challengeId] || 0;
    const hint = hints[Math.min(n, hints.length - 1)];
    hintCount[challengeId] = n + 1;
    setFeedback('hint', 'Hint ' + Math.min(n + 1, hints.length) + ' of ' + hints.length, hint);
    return hint;
  }

  function explainError() {
    if (lastResult === null) return 'Press Run code first, then I can explain what happened.';
    if (lastResult === 'ok') return 'Nothing is wrong, all the demo tests passed.';
    return 'The tests did not pass. Re-read the challenge, then check that your function returns a value instead of only printing it.';
  }

  // Picks an answer by looking for words in the question
  function answerFor(question) {
    const q = question.toLowerCase();
    if (/hint|stuck|help/.test(q)) return nextHint();
    if (/error|bug|wrong|fail|why/.test(q)) return explainError();
    if (/improve|better|clean/.test(q)) return 'Use clear variable names and add a short comment above anything that is not obvious.';
    return 'I am a demo mentor with pre-written answers. Try one of the quick questions below.';
  }

  function ask(question) {
    const text = question.trim();
    if (!text) return;
    addMessage('user', text);
    setTimeout(() => addMessage('ai', answerFor(text)), 700); // small delay feels more natural
  }

  document.querySelectorAll('.chips .chip').forEach((chip) => {
    chip.addEventListener('click', () => ask(chip.dataset.q));
  });
  el.sendBtn.addEventListener('click', () => { ask(el.chatInput.value); el.chatInput.value = ''; });
  el.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { ask(el.chatInput.value); el.chatInput.value = ''; }
  });


  /* ---------- 10. Start-up ---------- */

  // Tells the CSS to hide the plain textarea text and show the colored layer
  // (if this file fails to load, the editor still works, just without colors)
  el.codeEditor.closest('.editor-body').classList.add('highlight-on');

  showChallenge();
  loadCode();
  clearOutput();
})();