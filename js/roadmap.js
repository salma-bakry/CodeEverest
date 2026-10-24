/* Mock data for My Roadmap (Code Everest).
   x / y are positions inside the scene, on a 1288 x 854 grid.
   type:  lesson | quiz | challenge | boss | project | summit
   state: completed | current | available | locked
   Nodes are listed in trail order, from Base Camp up to the summit. */

window.ROADMAP = {
  // Where the trail begins (not a clickable node)
  start: { x: 300, y: 788 },

  nodes: [
    {
      id: "variables", type: "lesson", state: "completed",
      label: "Variables", title: "Variables", minutes: 15,
      desc: "Store information in named boxes called variables.",
      href: "lesson.html",
      x: 483, y: 767
    },
    {
      id: "quiz-strings", type: "quiz", state: "completed",
      label: "Quiz: Strings · 92%", title: "Quiz: Strings",
      desc: "You scored 92% on the Strings quiz. You can retake it any time.",
      href: "lesson.html",
      x: 777, y: 742
    },
    {
      id: "boss-1", type: "boss", state: "completed",
      label: "Boss Fight · Unit 1 ✓", title: "Boss Fight · Unit 1",
      desc: "You finished the Unit 1 Boss Fight. On to Unit 2!",
      cta: "Review result", href: "boss-fight.html",
      x: 1058, y: 720
    },
    {
      id: "conditionals", type: "lesson", state: "current",
      label: "Conditionals", title: "Conditionals", minutes: 18,
      desc: "Make your programs decide. Learn if, elif and else with a trail-difficulty example.",
      cta: "Continue Climbing", href: "lesson.html",
      x: 1031, y: 602
    },
    {
      id: "loops", type: "lesson", state: "available",
      label: "Loops · Lesson · 20 min", title: "Loops", minutes: 20,
      desc: "Repeat actions without copying your code. Learn for and while loops.",
      cta: "Start lesson", href: "lesson.html",
      x: 723, y: 573
    },
    {
      id: "fizzbuzz", type: "challenge", state: "locked", icon: "lock",
      label: "Challenge: FizzBuzz", title: "Challenge: FizzBuzz", minutes: 25,
      desc: "Put loops to work in a classic coding challenge.",
      lockMsg: "Complete the Loops lesson to unlock this challenge.",
      x: 416, y: 567
    },
    {
      id: "boss-2", type: "boss", state: "locked",
      label: "Boss Fight · Unit 2", title: "Boss Fight · Unit 2",
      desc: "Show what you learned in Unit 2 to finish the unit.",
      lockMsg: "Finish the Unit 2 lessons and challenge to unlock this Boss Fight.",
      x: 203, y: 460
    },
    {
      id: "functions", type: "lesson", state: "locked",
      label: "Functions", title: "Functions", minutes: 20,
      desc: "Group your code into reusable pieces called functions.",
      lockMsg: "Beat the Unit 2 Boss Fight to unlock this lesson.",
      x: 416, y: 400
    },
    {
      id: "lists", type: "lesson", state: "locked",
      label: "Lists & Dicts", title: "Lists & Dicts", minutes: 22,
      desc: "Keep many values together with lists and dictionaries.",
      lockMsg: "Complete the Functions lesson to unlock this lesson.",
      x: 777, y: 390
    },
    {
      id: "boss-3", type: "boss", state: "locked",
      label: "Boss Fight · Unit 3", title: "Boss Fight · Unit 3",
      desc: "Show what you learned in Unit 3 to finish the unit.",
      lockMsg: "Finish the Unit 3 lessons to unlock this Boss Fight.",
      x: 991, y: 320
    },
    {
      id: "capstone", type: "project", state: "locked",
      label: "Capstone Project", title: "Capstone Project",
      desc: "Build a small project that uses everything you have learned.",
      lockMsg: "Beat the Unit 3 Boss Fight to unlock the Capstone Project.",
      x: 830, y: 203
    },
    {
      id: "summit", type: "summit", state: "locked",
      label: "SUMMIT · Certificate of Mastery", title: "The Summit",
      desc: "Finish every stage on the trail to earn your certificate.",
      lockMsg: "Finish the Capstone Project to reach the summit.",
      x: 644, y: 112
    }
  ]
};

/* My Roadmap: builds the trail and nodes from window.ROADMAP (roadmap-data.js) */
(function () {
  var W = 1288, H = 854;           // size of the scene grid
  var data = window.ROADMAP;
  var nodes = data.nodes;

  var TYPE   = { lesson: "LESSON", quiz: "QUIZ", challenge: "CHALLENGE", boss: "BOSS FIGHT", project: "PROJECT", summit: "SUMMIT" };
  var STATUS = { completed: "COMPLETED", current: "IN PROGRESS", available: "READY", locked: "LOCKED" };
  var ICON   = { completed: "check", current: "flag", available: "play_arrow", locked: "" };
  var CTA    = { completed: "Review", current: "Continue Climbing", available: "Start", locked: "Locked" };

  var layer = document.getElementById("rmNodes");
  var pop = {
    box: document.getElementById("rmPopover"),
    kicker: document.getElementById("rmKicker"),
    title: document.getElementById("rmTitle"),
    text: document.getElementById("rmText"),
    cta: document.getElementById("rmCta")
  };
  var tip = {
    box: document.getElementById("rmTip"),
    title: document.getElementById("rmTipTitle"),
    text: document.getElementById("rmTipText")
  };

  /* ---------- Trail ---------- */
  // Points = start + every node. We draw a smooth curve through them.
  var pts = [data.start].concat(nodes);
  var cur = 0;
  nodes.forEach(function (n, i) { if (n.state === "current") cur = i + 1; });

  function segment(i) {
    var p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1];
    var p3 = pts[Math.min(i + 2, pts.length - 1)];
    var c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    var c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    return " C " + [c1x, c1y, c2x, c2y, p2.x, p2.y].map(Math.round).join(" ");
  }
  function build(from, to) {
    var d = "M " + pts[from].x + " " + pts[from].y;
    for (var i = from; i < to; i++) d += segment(i);
    return d;
  }
  var done = build(0, cur);                    // solid: already climbed
  var todo = build(cur, pts.length - 1);       // dotted: still ahead
  document.getElementById("rmTrailDone").setAttribute("d", done);
  document.getElementById("rmTrailGlow").setAttribute("d", done);
  document.getElementById("rmTrailTodo").setAttribute("d", todo);

  /* ---------- Helpers ---------- */
  function icon(name, extra) {
    var s = document.createElement("span");
    s.className = "material-symbols-outlined " + (extra || "");
    s.setAttribute("aria-hidden", "true");
    s.textContent = name;
    return s;
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    e.className = cls;
    if (text) e.textContent = text;
    return e;
  }

  /* ---------- Popover and locked tooltip ---------- */
  var buttons = {};

  function showPopover(n) {
    var kicker = TYPE[n.type];
    if (n.minutes) kicker += " · " + n.minutes + " MIN";
    if (n.type !== "summit") kicker += " · " + STATUS[n.state];
    pop.kicker.textContent = kicker;
    pop.title.textContent = n.title;
    pop.text.textContent = n.desc;

    var locked = n.state === "locked";
    pop.cta.textContent = locked ? "Locked" : (n.cta || CTA[n.state]);
    if (locked) {
      pop.cta.removeAttribute("href");
      pop.cta.setAttribute("aria-disabled", "true");
    } else {
      pop.cta.setAttribute("href", n.href || "#");
      pop.cta.removeAttribute("aria-disabled");
    }

    Object.keys(buttons).forEach(function (id) {
      buttons[id].classList.toggle("selected", id === n.id);
    });
  }

  function showTip(n) {
    tip.title.textContent = "Locked · " + n.title;
    tip.text.textContent = n.lockMsg || "Finish the earlier steps on the trail to unlock this.";
  }

  /* ---------- Nodes ---------- */
  nodes.forEach(function (n) {
    var b = document.createElement("button");
    b.type = "button";
    b.className = "rm-node " + n.type + " " + n.state;
    b.style.left = (n.x / W * 100) + "%";
    b.style.top = (n.y / H * 100) + "%";
    b.setAttribute("aria-label", n.label + ", " + STATUS[n.state].toLowerCase());

    if (n.type === "boss") {
      b.appendChild(icon("shield", "shield" + (n.state === "locked" ? "" : " filled")));
      if (n.state === "completed") b.appendChild(icon("check", "boss-check"));
    } else if (n.type === "summit") {
      b.appendChild(icon("flag", "summit-flag filled"));
    } else {
      var name = n.icon || ICON[n.state];
      if (name) b.appendChild(icon(name, n.state === "current" ? "filled" : ""));
    }

    if (n.state === "current") b.appendChild(el("span", "rm-here", "You're here"));
    b.appendChild(el("span", "rm-label", n.label));

    b.addEventListener("click", function () { showPopover(n); if (n.state === "locked") showTip(n); });
    if (n.state === "locked") {
      b.addEventListener("mouseenter", function () { showTip(n); });
      b.addEventListener("focus", function () { showTip(n); });
    }

    buttons[n.id] = b;
    layer.appendChild(b);
  });

  /* Start with the current stage in the popover and the first locked step in the tooltip */
  var currentNode = nodes.filter(function (n) { return n.state === "current"; })[0] || nodes[0];
  var firstLocked = nodes.filter(function (n) { return n.state === "locked" && n.type !== "summit"; })[0];
  showPopover(currentNode);
  if (firstLocked) showTip(firstLocked); else tip.box.hidden = true;
})();