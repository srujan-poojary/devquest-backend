import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TopicSeed {
  title: string;
  description: string;
  difficulty: number;
  baseXp: number;
  estimatedHours: number;
  exercisePrompt: string;
  exerciseFiles: Record<string, string>;
  prereqTitles?: string[];
  resources?: { title: string; url: string; platform: string; type: string }[];
}

interface ChapterSeed {
  title: string;
  order: number;
  topics: TopicSeed[];
}

interface RegionSeed {
  name: string;
  slug: string;
  order: number;
  description: string;
  chapters: ChapterSeed[];
}

const REGIONS: RegionSeed[] = [
  {
    name: "HTML Kingdom",
    slug: "html-kingdom",
    order: 1,
    description: "Where every developer's journey begins with foundational document structure.",
    chapters: [
      {
        title: "HTML Fundamentals",
        order: 1,
        topics: [
          {
            title: "HTML Basics",
            description: "Essential tags, elements, attributes, and page document anatomy.",
            difficulty: 1,
            baseXp: 50,
            estimatedHours: 2,
            exercisePrompt: "Add an <h1> heading with your adventurer name, a <p> description paragraph, and an <a> link to your quest log.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Adventurer Scroll</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <!-- TODO: Add an <h1> heading, a <p> paragraph, and an <a> link below -->

</body>
</html>`,
              "/styles.css": `body { font-family: sans-serif; background: #0f0f14; color: #f0f0f5; padding: 24px; }
h1 { color: #7c5cff; }
a { color: #f59e0b; text-decoration: underline; }`,
            },
            resources: [
              { title: "HTML Basics - MDN", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/HTML_basics", platform: "MDN", type: "docs" },
            ],
          },
          {
            title: "Semantic HTML",
            description: "Write meaningful, accessible markup using native semantic landmarks.",
            difficulty: 2,
            baseXp: 75,
            estimatedHours: 2,
            prereqTitles: ["HTML Basics"],
            exercisePrompt: "Wrap your content in <header>, <main>, <article>, and <footer> tags with accessible semantic structure.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Quest Chronicle</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <!-- TODO: Restructure using <header>, <main>, <article>, and <footer> landmarks -->
  <div>
    <h1>DevQuest Chronicles</h1>
  </div>
  <div>
    <div>
      <h2>Chapter 1: The Awakening</h2>
      <p>The developer set forth into the code editor.</p>
    </div>
  </div>
  <div>
    <p>&copy; 2026 DevQuest Guild</p>
  </div>
</body>
</html>`,
              "/styles.css": `body { font-family: sans-serif; background: #0f0f14; color: #eee; padding: 20px; }
header { border-bottom: 2px solid #7c5cff; padding-bottom: 10px; }
article { background: #1c1c26; padding: 16px; border-radius: 8px; margin: 16px 0; }
footer { font-size: 12px; color: #888; }`,
            },
            resources: [
              { title: "Semantic HTML Guide", url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics#semantics_in_html", platform: "MDN", type: "docs" },
            ],
          },
        ],
      },
      {
        title: "Forms & Modern Markup",
        order: 2,
        topics: [
          {
            title: "Forms & Inputs",
            description: "Build interactive player input forms with labels, text inputs, and submit buttons.",
            difficulty: 2,
            baseXp: 80,
            estimatedHours: 3,
            prereqTitles: ["HTML Basics"],
            exercisePrompt: "Create an adventurer sign-up <form> with a username <input>, an email <input>, and a submit <button>.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Guild Registration</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1>Guild Registration Form</h1>
  <!-- TODO: Create a <form> with <label>, text <input>, email <input>, and submit <button> -->

</body>
</html>`,
              "/styles.css": `body { font-family: sans-serif; background: #0f0f14; color: #fff; padding: 24px; }
form { display: flex; flex-direction: column; gap: 12px; max-width: 320px; }
input { padding: 10px; border-radius: 6px; border: 1px solid #333; background: #1a1a24; color: #fff; }
button { padding: 10px; background: #7c5cff; color: #fff; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }`,
            },
            resources: [
              { title: "HTML Forms Guide", url: "https://developer.mozilla.org/en-US/docs/Learn/Forms", platform: "MDN", type: "docs" },
            ],
          },
          {
            title: "Media & Embedding",
            description: "Embed images with responsive alt attributes, audio players, and multimedia elements.",
            difficulty: 2,
            baseXp: 75,
            estimatedHours: 2,
            prereqTitles: ["HTML Basics"],
            exercisePrompt: "Add an <img> tag with a valid src and descriptive alt attribute, along with a <figure> and <figcaption>.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Artifact Vault</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1>The Ancient Relic Gallery</h1>
  <!-- TODO: Embed an <img> with src and alt, wrapped in <figure> with <figcaption> -->

</body>
</html>`,
              "/styles.css": `body { font-family: sans-serif; background: #0f0f14; color: #fff; padding: 24px; text-align: center; }
figure { margin: 20px auto; max-width: 400px; background: #181824; padding: 16px; border-radius: 12px; }
img { max-width: 100%; border-radius: 8px; }
figcaption { margin-top: 8px; color: #a0a0b0; font-size: 14px; }`,
            },
          },
        ],
      },
            resources: [
              { title: "HTML5 Semantic Elements - MDN", url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics", platform: "MDN", type: "docs" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "CSS Forest",
    slug: "css-forest",
    order: 2,
    description: "Master the visual arts, layout geometries, colors, and responsive media rules.",
    chapters: [
      {
        title: "Styling Foundations",
        order: 1,
        topics: [
          {
            title: "CSS Basics",
            description: "Selectors, cascading rules, colors, and typography fundamentals.",
            difficulty: 1,
            baseXp: 50,
            estimatedHours: 2,
            prereqTitles: ["HTML Basics"],
            exercisePrompt: "Style the heading in styles.css: color #7c5cff, centered text-align, and font-size 32px.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1>Hello, DevQuest Adventurer</h1>
  <p>Your journey into CSS styling starts now.</p>
</body>
</html>`,
              "/styles.css": `body { background: #0c0c12; font-family: sans-serif; padding: 40px; }
/* TODO: Style h1 with color: #7c5cff, text-align: center, font-size: 32px */
h1 {

}
p { text-align: center; color: #888; }`,
            },
          },
          {
            title: "The Box Model & Spacing",
            description: "Master content width, padding, borders, margins, and border-box sizing.",
            difficulty: 2,
            baseXp: 75,
            estimatedHours: 2,
            prereqTitles: ["CSS Basics"],
            exercisePrompt: "Style .card: set box-sizing: border-box, padding: 24px, margin: 20px auto, border: 2px solid #7c5cff, and border-radius: 12px.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="card">
    <h2>Loot Chest #42</h2>
    <p>Contains 250 XP and a Legendary Keyboard artifact.</p>
  </div>
</body>
</html>`,
              "/styles.css": `body { background: #0c0c12; font-family: sans-serif; padding: 20px; color: #fff; }
/* TODO: Style .card with box-sizing, padding, margin, border, and border-radius */
.card {
  max-width: 380px;
  background: #181824;
}`,
            },
          },
        ],
      },
      {
        title: "Modern Layouts",
        order: 2,
        topics: [
          {
            title: "Flexbox",
            description: "One-dimensional flexible layout engine for responsive toolbars, rows, and cards.",
            difficulty: 3,
            baseXp: 100,
            estimatedHours: 3,
            prereqTitles: ["CSS Basics"],
            exercisePrompt: "Style .nav-bar with display: flex, justify-content: space-between, and align-items: center.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <nav class="nav-bar">
    <div class="logo">⚔️ DevQuest</div>
    <ul class="nav-links">
      <li>Quests</li>
      <li>Leaderboard</li>
      <li>Armory</li>
    </ul>
  </nav>
</body>
</html>`,
              "/styles.css": `body { background: #09090e; font-family: sans-serif; margin: 0; padding: 20px; color: #fff; }
/* TODO: Apply display: flex, justify-content: space-between, align-items: center to .nav-bar */
.nav-bar {
  background: #151520;
  padding: 12px 24px;
  border-radius: 10px;
}
.logo { font-weight: 800; color: #7c5cff; }
.nav-links { display: flex; gap: 16px; list-style: none; margin: 0; padding: 0; }
.nav-links li { cursor: pointer; color: #aaa; }`,
            },
          },
          {
            title: "CSS Grid",
            description: "Two-dimensional layout power grid with rows, columns, gaps, and template areas.",
            difficulty: 3,
            baseXp: 100,
            estimatedHours: 3,
            prereqTitles: ["CSS Basics"],
            exercisePrompt: "Style .grid-container using display: grid, grid-template-columns: repeat(3, 1fr), and gap: 16px.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1>Party Inventory</h1>
  <div class="grid-container">
    <div class="item">🗡️ Sword</div>
    <div class="item">🛡️ Shield</div>
    <div class="item">🧪 Potion</div>
    <div class="item">📜 Scroll</div>
    <div class="item">💍 Ring</div>
    <div class="item">👑 Crown</div>
  </div>
</body>
</html>`,
              "/styles.css": `body { background: #08080c; font-family: sans-serif; padding: 24px; color: #fff; }
/* TODO: Apply display: grid, grid-template-columns: repeat(3, 1fr), and gap: 16px to .grid-container */
.grid-container {

}
.item { background: #181824; border: 1px solid #2d2d3d; padding: 24px; border-radius: 8px; text-align: center; }`,
            },
          },
          {
            title: "Responsive Media Queries",
            description: "Design mobile-first interfaces that gracefully adapt across viewport sizes.",
            difficulty: 3,
            baseXp: 95,
            estimatedHours: 2,
            prereqTitles: ["Flexbox"],
            exercisePrompt: "Write a media query for max-width: 600px that changes .container flex-direction to column.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="container">
    <div class="col">Left Column</div>
    <div class="col">Right Column</div>
  </div>
</body>
</html>`,
              "/styles.css": `body { background: #0c0c12; font-family: sans-serif; padding: 20px; color: #fff; }
.container { display: flex; gap: 16px; }
.col { flex: 1; background: #161622; padding: 30px; border-radius: 8px; text-align: center; }
/* TODO: Add @media (max-width: 600px) changing .container flex-direction to column */`,
            },
          },
        ],
      },
      {
        title: "Motion & Polish",
        order: 3,
        topics: [
          {
            title: "CSS Transitions & Keyframes",
            description: "Bring static elements alive with smooth CSS transitions and keyframe loops.",
            difficulty: 3,
            baseXp: 110,
            estimatedHours: 3,
            prereqTitles: ["CSS Basics"],
            exercisePrompt: "Add hover transition to .crystal (transform: scale(1.15)) and define an animated @keyframes pulse.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="scene">
    <div class="crystal">🔮</div>
    <p>Hover over the mystic orb</p>
  </div>
</body>
</html>`,
              "/styles.css": `body { background: #0a0a10; font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 80vh; color: #fff; margin: 0; }
.scene { text-align: center; }
.crystal { font-size: 64px; display: inline-block; cursor: pointer; transition: transform 0.3s ease; }
/* TODO: Add hover effect .crystal:hover { transform: scale(1.15); } and optional pulse keyframe */`,
            },
          },
        ],
      },
            resources: [
              { title: "CSS Grid vs Flexbox - MDN", url: "https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout", platform: "MDN", type: "docs" },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "JavaScript Mountains",
    slug: "javascript-mountains",
    order: 3,
    description: "Scale the highlands of client-side logic, interactivity, async tasks, and APIs.",
    chapters: [
      {
        title: "JS Foundations",
        order: 1,
        topics: [
          {
            title: "JavaScript Basics",
            description: "Variables, primitive types, mathematical operations, and control structures.",
            difficulty: 2,
            baseXp: 80,
            estimatedHours: 3,
            prereqTitles: ["HTML Basics"],
            exercisePrompt: "Declare a heroName string, a level number, and write a function calculatePower(base, multiplier) that returns base * multiplier.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html>
<body>
  <h1>Open Console To Inspect Stats</h1>
  <script src="index.js"></script>
</body>
</html>`,
              "/index.js": `// TODO: Declare heroName (string) and level (number)
const heroName = "Knight";
let level = 1;

// TODO: Complete calculatePower(base, multiplier)
function calculatePower(base, multiplier) {
  return base * multiplier;
}

console.log("Hero:", heroName, "| Power:", calculatePower(10, level));`,
            },
          },
          {
            title: "Arrays & Iteration",
            description: "Transform and filter data collections with modern methods like map, filter, and reduce.",
            difficulty: 3,
            baseXp: 95,
            estimatedHours: 3,
            prereqTitles: ["JavaScript Basics"],
            exercisePrompt: "Filter partyMembers to only those with health > 0, and map them to their names.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html>
<body>
  <h1>Party Status</h1>
  <div id="output"></div>
  <script src="index.js"></script>
</body>
</html>`,
              "/index.js": `const party = [
  { name: "Aria", health: 100 },
  { name: "Brom", health: 0 },
  { name: "Lyra", health: 85 }
];

// TODO: Filter party for health > 0, then map to get their names
const aliveNames = party.filter(p => p.health > 0).map(p => p.name);

document.getElementById("output").textContent = "Alive heroes: " + aliveNames.join(", ");`,
            },
          },
          {
            title: "Objects & Destructuring",
            description: "Structure complex state with objects, nested keys, spread syntax, and destructuring.",
            difficulty: 2,
            baseXp: 90,
            estimatedHours: 2,
            prereqTitles: ["JavaScript Basics"],
            exercisePrompt: "Destructure title, rank, and mana from the spellbook object and log a formatted incantation.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html><body><script src="index.js"></script></body></html>`,
              "/index.js": `const spell = {
  title: "Meteor Strike",
  rank: 5,
  mana: 80,
  school: "Evocation"
};

// TODO: Destructure title, rank, and mana from spell
const { title, rank, mana } = spell;

console.log(\`Casting \${title} (Rank \${rank}) costing \${mana} MP!\`);`,
            },
          },
        ],
      },
      {
        title: "DOM & Interaction",
        order: 2,
        topics: [
          {
            title: "DOM Manipulation",
            description: "Select elements with querySelector, create nodes, and update classList dynamically.",
            difficulty: 2,
            baseXp: 90,
            estimatedHours: 3,
            prereqTitles: ["JavaScript Basics", "Semantic HTML"],
            exercisePrompt: "Select #status-box using document.querySelector, set its textContent, and add the 'active' class.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html>
<head>
  <style>
    .box { padding: 16px; background: #222; color: #fff; font-family: sans-serif; }
    .active { background: #7c5cff; border: 2px solid #f59e0b; }
  </style>
</head>
<body>
  <div id="status-box" class="box">System Offline</div>
  <script src="index.js"></script>
</body>
</html>`,
              "/index.js": `// TODO: Select #status-box, update its textContent to "System Online", and add the class "active"
const box = document.querySelector("#status-box");
if (box) {
  box.textContent = "System Online";
  box.classList.add("active");
}`,
            },
          },
          {
            title: "DOM Events",
            description: "Listen to user clicks, keyboard presses, and form submits with event listeners.",
            difficulty: 3,
            baseXp: 120,
            estimatedHours: 3,
            prereqTitles: ["DOM Manipulation"],
            exercisePrompt: "Add a click listener to #attack-btn that increments the counter in #hits-display.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #0c0c14; color: #fff; font-family: sans-serif; padding: 24px; text-align: center; }
    button { padding: 12px 24px; font-size: 16px; background: #7c5cff; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
    #hits-display { font-size: 24px; font-weight: bold; margin: 16px 0; color: #f59e0b; }
  </style>
</head>
<body>
  <div id="hits-display">Hits: 0</div>
  <button id="attack-btn">⚔️ Attack Dummy</button>
  <script src="index.js"></script>
</body>
</html>`,
              "/index.js": `let hits = 0;
const btn = document.getElementById("attack-btn");
const display = document.getElementById("hits-display");

// TODO: Add click listener to btn to increment hits and update display textContent
btn.addEventListener("click", () => {
  hits++;
  display.textContent = "Hits: " + hits;
});`,
            },
          },
          {
            title: "Local Storage Persistence",
            description: "Persist game save states, theme preferences, and user tallies in browser storage.",
            difficulty: 3,
            baseXp: 110,
            estimatedHours: 2,
            prereqTitles: ["DOM Events"],
            exercisePrompt: "Save gold coins into localStorage on click, and restore the count from localStorage on page refresh.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #111; color: #fff; font-family: sans-serif; padding: 24px; text-align: center; }
    button { padding: 10px 20px; background: #f59e0b; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
  </style>
</head>
<body>
  <h2>Bank of DevQuest</h2>
  <div id="gold">Gold: 0</div>
  <button id="mine-btn">⛏️ Mine Gold</button>
  <script src="index.js"></script>
</body>
</html>`,
              "/index.js": `let gold = Number(localStorage.getItem("devquest_gold")) || 0;
const goldDisplay = document.getElementById("gold");
const mineBtn = document.getElementById("mine-btn");

goldDisplay.textContent = "Gold: " + gold;

mineBtn.addEventListener("click", () => {
  gold += 10;
  localStorage.setItem("devquest_gold", gold.toString());
  goldDisplay.textContent = "Gold: " + gold;
});`,
            },
          },
        ],
      },
      {
        title: "Async Realm",
        order: 3,
        topics: [
          {
            title: "Async JavaScript",
            description: "Promises, async/await syntax, rejection handling, and concurrent promises with Promise.all.",
            difficulty: 4,
            baseXp: 140,
            estimatedHours: 4,
            prereqTitles: ["DOM Events"],
            exercisePrompt: "Write an async function delay(ms) returning a Promise, then use await delay(1000) to simulate casting a spell.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html><body>
  <div id="log">Chanting spell...</div>
  <script src="index.js"></script>
</body></html>`,
              "/index.js": `function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function castSpell() {
  const log = document.getElementById("log");
  await delay(1200);
  log.textContent = "✨ Arcane Storm Unleashed!";
}

castSpell();`,
            },
          },
          {
            title: "Fetch API & Remote Data",
            description: "Communicate with REST APIs, parse JSON payloads, and gracefully render network states.",
            difficulty: 4,
            baseXp: 150,
            estimatedHours: 4,
            prereqTitles: ["Async JavaScript"],
            exercisePrompt: "Fetch quest JSON from an API endpoint, parse with .json(), and display the result in the DOM.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html>
<html>
<head><style>body { background: #121218; color: #fff; font-family: sans-serif; padding: 20px; }</style></head>
<body>
  <h1>Remote Quest Dispatcher</h1>
  <div id="content">Loading quests from satellite...</div>
  <script src="index.js"></script>
</body>
</html>`,
              "/index.js": `async function loadData() {
  const target = document.getElementById("content");
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/todos/1");
    const data = await res.json();
    target.innerHTML = \`<p><strong>Mission:</strong> \${data.title}</p><p>Status: \${data.completed ? "Done" : "In Progress"}</p>\`;
  } catch (err) {
    target.textContent = "Signal lost. Could not load data.";
  }
}
loadData();`,
            },
          },
        ],
      },
    ],
  },
  {
    name: "React Spire",
    slug: "react-spire",
    order: 4,
    description: "Summit the tower of component-driven architectures, reactive state hooks, and virtual DOM magic.",
    chapters: [
      {
        title: "React Component Alchemy",
        order: 1,
        topics: [
          {
            title: "React Components & Props",
            description: "Deconstruct interfaces into declarative JSX components with reusable props.",
            difficulty: 3,
            baseXp: 120,
            estimatedHours: 3,
            prereqTitles: ["Async JavaScript", "Flexbox"],
            exercisePrompt: "Create a QuestBadge component that accepts title and xp props and renders a stylized reward tag.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html><html><body><div id="root"></div></body></html>`,
              "/index.js": `import React from "react";
import ReactDOM from "react-dom/client";

function QuestBadge({ title, xp }) {
  return (
    <div style={{ background: "#1b1b26", padding: "12px 16px", borderRadius: 8, color: "#fff", display: "inline-flex", gap: 10 }}>
      <span>⚔️ {title}</span>
      <span style={{ color: "#f59e0b", fontWeight: "bold" }}>+{xp} XP</span>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<QuestBadge title="Slay the NullPointer" xp={150} />);`,
            },
          },
          {
            title: "State with useState",
            description: "Manage dynamic player state, counters, toggles, and form inputs reactively.",
            difficulty: 3,
            baseXp: 130,
            estimatedHours: 3,
            prereqTitles: ["React Components & Props"],
            exercisePrompt: "Use useState to build a stamina potion counter with drink and restock actions.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html><html><body><div id="root"></div></body></html>`,
              "/index.js": `import React, { useState } from "react";
import ReactDOM from "react-dom/client";

function PotionsTracker() {
  const [potions, setPotions] = useState(3);

  return (
    <div style={{ fontFamily: "sans-serif", background: "#101016", color: "#fff", padding: 24, borderRadius: 12 }}>
      <h2>🧪 Potions: {potions}</h2>
      <button onClick={() => setPotions(p => Math.max(0, p - 1))} style={{ padding: 10, marginRight: 8 }}>Drink Potion</button>
      <button onClick={() => setPotions(p => p + 1)} style={{ padding: 10 }}>Refill (+1)</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<PotionsTracker />);`,
            },
          },
          {
            title: "Side Effects with useEffect",
            description: "Control lifecycle hooks, timers, subscription events, and data synchronization.",
            difficulty: 4,
            baseXp: 150,
            estimatedHours: 4,
            prereqTitles: ["State with useState"],
            exercisePrompt: "Use useEffect with a setInterval timer to build an active quest countdown timer that cleans up on unmount.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html><html><body><div id="root"></div></body></html>`,
              "/index.js": `import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";

function QuestTimer() {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ fontFamily: "sans-serif", background: "#13131c", color: "#fff", padding: 20, textAlign: "center" }}>
      <h1>⏱️ Time Remaining: {seconds}s</h1>
      <p>{seconds === 0 ? "⚡ Trial has arrived!" : "Prepare defenses..."}</p>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<QuestTimer />);`,
            },
          },
          {
            title: "Lists & Conditional Rendering",
            description: "Render collections with map and key props, and toggle states with ternary or logical AND.",
            difficulty: 3,
            baseXp: 130,
            estimatedHours: 3,
            prereqTitles: ["State with useState"],
            exercisePrompt: "Render a quest inventory list using .map() with unique keys, and highlight completed quests with a badge.",
            exerciseFiles: {
              "/index.html": `<!DOCTYPE html><html><body><div id="root"></div></body></html>`,
              "/index.js": `import React from "react";
import ReactDOM from "react-dom/client";

const quests = [
  { id: "q1", title: "HTML Basics", done: true },
  { id: "q2", title: "Flexbox Trial", done: true },
  { id: "q3", title: "React Spire", done: false },
];

function QuestRoster() {
  return (
    <div style={{ fontFamily: "sans-serif", background: "#0e0e14", color: "#fff", padding: 24 }}>
      <h2>📜 Active Campaign Roster</h2>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {quests.map(q => (
          <li key={q.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #222" }}>
            <span>{q.title}</span>
            <span>{q.done ? "✅ Complete" : "⚔️ In Progress"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<QuestRoster />);`,
            },
          },
        ],
      },
    ],
  },
];

async function main() {
  console.log("Beginning expanded seed across 4 regions, chapters & topics...");

  const topicMap = new Map<string, string>(); // title -> id

  for (const rData of REGIONS) {
    const region = await prisma.region.upsert({
      where: { slug: rData.slug },
      update: { name: rData.name, order: rData.order, description: rData.description },
      create: { name: rData.name, slug: rData.slug, order: rData.order, description: rData.description },
    });

    console.log(`Region synced: ${region.name}`);

    for (const cData of rData.chapters) {
      // Find or create chapter by title + regionId
      let chapter = await prisma.chapter.findFirst({
        where: { title: cData.title, regionId: region.id },
      });

      if (!chapter) {
        chapter = await prisma.chapter.create({
          data: { title: cData.title, order: cData.order, regionId: region.id },
        });
      } else {
        await prisma.chapter.update({
          where: { id: chapter.id },
          data: { order: cData.order },
        });
      }

      console.log(`  Chapter: ${chapter.title}`);

      for (const tData of cData.topics) {
        // Find existing topic by title in this chapter or anywhere
        let topic = await prisma.topic.findFirst({
          where: { title: tData.title },
        });

        if (!topic) {
          topic = await prisma.topic.create({
            data: {
              title: tData.title,
              description: tData.description,
              difficulty: tData.difficulty,
              baseXp: tData.baseXp,
              estimatedHours: tData.estimatedHours,
              exercisePrompt: tData.exercisePrompt,
              exerciseFiles: tData.exerciseFiles,
              chapterId: chapter.id,
            },
          });
        } else {
          topic = await prisma.topic.update({
            where: { id: topic.id },
            data: {
              description: tData.description,
              difficulty: tData.difficulty,
              baseXp: tData.baseXp,
              estimatedHours: tData.estimatedHours,
              exercisePrompt: tData.exercisePrompt,
              exerciseFiles: tData.exerciseFiles,
              chapterId: chapter.id,
            },
          });
        }

        topicMap.set(tData.title, topic.id);

        // Seed resources if present
        if (tData.resources && tData.resources.length > 0) {
          for (let rank = 0; rank < tData.resources.length; rank++) {
            const resData = tData.resources[rank]!;
            let resource = await prisma.resource.findFirst({
              where: { url: resData.url },
            });
            if (!resource) {
              resource = await prisma.resource.create({
                data: { title: resData.title, url: resData.url, type: resData.type, platform: resData.platform },
              });
            }
            // Link topic to resource
            await prisma.topicResource.upsert({
              where: { topicId_resourceId: { topicId: topic.id, resourceId: resource.id } },
              update: { rank: rank + 1 },
              create: { topicId: topic.id, resourceId: resource.id, rank: rank + 1 },
            });
          }
        }
      }
    }
  }

  // Now create prerequisites
  console.log("Connecting topic prerequisites...");
  for (const rData of REGIONS) {
    for (const cData of rData.chapters) {
      for (const tData of cData.topics) {
        const topicId = topicMap.get(tData.title);
        if (!topicId || !tData.prereqTitles) continue;

        for (const prereqTitle of tData.prereqTitles) {
          const prereqId = topicMap.get(prereqTitle);
          if (!prereqId) continue;

          await prisma.topicPrerequisite.upsert({
            where: { topicId_prerequisiteId: { topicId, prerequisiteId: prereqId } },
            update: {},
            create: { topicId, prerequisiteId: prereqId },
          });
        }
      }
    }
  }

  const count = await prisma.topic.count();
  console.log(`\n🎉 Expanded seed completed! Total topics in database: ${count}`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
