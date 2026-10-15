import { prisma } from "../src/config/prisma";

const SCAFFOLDS: Record<string, { prompt: string; files: Record<string, string> }> = {
  "HTML Basics": {
    prompt: "Add an <h1> heading with your adventurer name, a <p> description paragraph, and an <a> link to your quest log.",
    files: {
      "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Adventurer Scroll</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <!-- TODO 1: Add an <h1> heading with your adventurer name -->

  <!-- TODO 2: Add a <p> paragraph describing your journey -->

  <!-- TODO 3: Add an <a> link pointing to your quest log (e.g. href="#quests") -->

</body>
</html>`,
      "/styles.css": `body { font-family: sans-serif; background: #0f0f14; color: #f0f0f5; padding: 24px; }
h1 { color: #7c5cff; }
p { line-height: 1.6; color: #a0a0b0; }
a { color: #f59e0b; text-decoration: underline; }`,
    },
  },

  "Semantic HTML": {
    prompt: "Refactor the page: replace the generic <div> containers with semantic <header>, <main>, <article>, and <footer> tags.",
    files: {
      "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Quest Chronicle</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <!-- TODO: Replace this generic div with a semantic <header> tag -->
  <div class="site-header">
    <h1>DevQuest Chronicles</h1>
    <nav>
      <a href="#quests">Quests</a>
    </nav>
  </div>

  <!-- TODO: Replace this generic div with a semantic <main> tag -->
  <div class="content">
    <!-- TODO: Replace this inner div with an <article> tag -->
    <div class="quest-log">
      <h2>Chapter 1: The Awakening</h2>
      <p>A budding developer sets forth into the Realm of Code.</p>
    </div>
  </div>

  <!-- TODO: Replace this generic div with a semantic <footer> tag -->
  <div class="site-footer">
    <p>&copy; 2026 DevQuest Guild. Built with Semantic Web Standards.</p>
  </div>
</body>
</html>`,
      "/styles.css": `body { font-family: sans-serif; background: #0f0f14; color: #eee; padding: 20px; }
header, .site-header { border-bottom: 2px solid #7c5cff; padding-bottom: 10px; margin-bottom: 16px; }
article, .quest-log { background: #1c1c26; padding: 16px; border-radius: 8px; margin: 16px 0; }
footer, .site-footer { font-size: 12px; color: #888; border-top: 1px solid #2a2a36; padding-top: 10px; margin-top: 24px; }
a { color: #38bdf8; text-decoration: none; }`,
    },
  },

  "Forms & Inputs": {
    prompt: "Create an adventurer sign-up <form> containing a username <input>, an email <input>, and a submit <button>.",
    files: {
      "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Guild Registration</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="card">
    <h2>Adventurer Registration</h2>
    
    <!-- TODO: Build your registration form below:
         1. Create a <form id="signup-form"> element
         2. Inside the form, add a text input for username: <input type="text" placeholder="Adventurer Name" required />
         3. Add an email input: <input type="email" placeholder="Guild Email" required />
         4. Add a submit button: <button type="submit">Begin Quest</button>
    -->

  </div>
</body>
</html>`,
      "/styles.css": `body {
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #f8fafc;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  margin: 0;
}
.card {
  background: #1e293b;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  width: 320px;
}
form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
input {
  padding: 0.6rem;
  border-radius: 6px;
  border: 1px solid #475569;
  background: #0f172a;
  color: white;
}
button {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #7c5cff;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
}`,
    },
  },

  "Media & Embedding": {
    prompt: "Add an <img> tag with a valid src and descriptive alt attribute, wrapped in a <figure> with a <figcaption>.",
    files: {
      "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Artifact Vault</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h1>The Ancient Relic Gallery</h1>
  
  <!-- TODO: Embed an image below:
       1. Create a <figure> container
       2. Add an <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=500" alt="Mystic Cyber Crystal" />
       3. Add a <figcaption> describing the crystal relic
  -->

</body>
</html>`,
      "/styles.css": `body { font-family: sans-serif; background: #0f0f14; color: #fff; padding: 24px; text-align: center; }
figure { margin: 20px auto; max-width: 400px; background: #181824; padding: 16px; border-radius: 12px; border: 1px solid #2a2a38; }
img { max-width: 100%; border-radius: 8px; }
figcaption { margin-top: 8px; color: #a0a0b0; font-size: 14px; }`,
    },
  },

  "CSS Basics": {
    prompt: "In styles.css, style the .quest-banner with color: #7c5cff, centered text-align, and background: #1a1a26.",
    files: {
      "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CSS Basics Trial</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="quest-banner">
    <h1>Welcome to CSS Forest</h1>
    <p>Master the cascade and visual styling.</p>
  </div>
</body>
</html>`,
      "/styles.css": `body {
  font-family: sans-serif;
  background: #0a0a0f;
  color: #fff;
  padding: 30px;
}

/* TODO: Complete the .quest-banner styling rules below:
   1. Set color to #7c5cff
   2. Set text-align to center
   3. Set background to #1a1a26
   4. Set padding to 20px
*/
.quest-banner {

}`,
    },
  },

  "Flexbox": {
    prompt: "Use Flexbox in styles.css to center the .quest-card horizontally and vertically inside .container.",
    files: {
      "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Flexbox Forest Quest</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <div class="container">
    <div class="quest-card">
      <h3>Flexbox Mastery</h3>
      <p>Center me perfectly in the arena!</p>
    </div>
  </div>
</body>
</html>`,
      "/styles.css": `body {
  margin: 0;
  font-family: system-ui, sans-serif;
  background: #0f172a;
  color: #f8fafc;
}

.container {
  /* TODO: Use Flexbox to center the child card:
     1. Add display: flex;
     2. Add justify-content: center;
     3. Add align-items: center;
  */
  height: 70vh;
  border: 1px dashed rgba(124, 92, 255, 0.4);
}

.quest-card {
  width: 260px;
  padding: 24px;
  background: #1e293b;
  border-radius: 12px;
  text-align: center;
  border: 2px solid #7c5cff;
}`,
    },
  },

  "CSS Grid": {
    prompt: "Set up a 3-column CSS Grid on .grid-container in styles.css with a 16px gap.",
    files: {
      "/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>CSS Grid Trial</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <h2>Spell Inventory Grid</h2>
  <div class="grid-container">
    <div class="grid-item">⚡ Thunder Strike</div>
    <div class="grid-item">🔥 Fireball</div>
    <div class="grid-item">❄️ Frost Nova</div>
    <div class="grid-item">🛡️ Arcane Barrier</div>
    <div class="grid-item">🧪 Mana Elixir</div>
    <div class="grid-item">🗡️ Shadow Blade</div>
  </div>
</body>
</html>`,
      "/styles.css": `body {
  font-family: sans-serif;
  background: #0b0b12;
  color: #fff;
  padding: 24px;
}

.grid-container {
  /* TODO: Turn this into a CSS Grid:
     1. Set display: grid;
     2. Set grid-template-columns: repeat(3, 1fr);
     3. Set gap: 16px;
  */

}

.grid-item {
  background: #181824;
  border: 1px solid #2e2e42;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  font-weight: 600;
}`,
    },
  },

  "JavaScript Basics": {
    prompt: "Declare a const heroName variable with your name, a let level variable set to 1, and log them.",
    files: {
      "/index.html": `<!DOCTYPE html>
<html>
<head><title>JS Basics</title></head>
<body>
  <h1>Adventurer Console</h1>
  <p>Check the console tab below for output.</p>
  <script src="index.js"></script>
</body>
</html>`,
      "/index.js": `// TODO: Declare variables and log output below:
// 1. Declare a const heroName = "YourAdventurerName";
// 2. Declare a let level = 1;
// 3. Log them with console.log("Adventurer:", heroName, "Level:", level);

`,
    },
  },

  "DOM Events": {
    prompt: "Add a click event listener on #potion-btn that increments the health count and updates #health.",
    files: {
      "/index.html": `<!DOCTYPE html>
<html>
<head>
  <title>DOM Events</title>
  <style>
    body { font-family: sans-serif; background: #0f1016; color: #fff; padding: 24px; text-align: center; }
    button { padding: 10px 20px; font-size: 16px; background: #7c5cff; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
    #health { display: block; font-size: 28px; margin: 16px 0; color: #10b981; font-weight: bold; }
  </style>
</head>
<body>
  <h2>Potion Chamber</h2>
  <div id="health">Health: 100 HP</div>
  <button id="potion-btn">Drink Health Potion (+10)</button>

  <script src="index.js"></script>
</body>
</html>`,
      "/index.js": `let currentHp = 100;
const potionBtn = document.getElementById("potion-btn");
const healthDisplay = document.getElementById("health");

// TODO: Add an event listener to potionBtn:
// 1. Listen for the "click" event
// 2. Increase currentHp by 10
// 3. Update healthDisplay.textContent = \`Health: \${currentHp} HP\`;

`,
    },
  },

  "Async JavaScript": {
    prompt: "Write an async function fetchGuildData() that uses fetch to retrieve data with try/catch error handling.",
    files: {
      "/index.html": `<!DOCTYPE html>
<html>
<head><title>Async Quest</title></head>
<body style="font-family: sans-serif; background: #0f0f15; color: #fff; padding: 24px;">
  <h2>Guild Records Transceiver</h2>
  <p>Check console output.</p>
  <script src="index.js"></script>
</body>
</html>`,
      "/index.js": `// TODO: Implement an asynchronous function:
// 1. Define async function fetchGuildData()
// 2. Inside a try block, call await fetch('https://jsonplaceholder.typicode.com/todos/1')
// 3. Parse and log the result
// 4. In the catch block, handle errors with console.error(err)
// 5. Invoke fetchGuildData();

`,
    },
  },
};

async function main() {
  console.log("Starting scaffold cleanup...");
  for (const [title, data] of Object.entries(SCAFFOLDS)) {
    const updated = await prisma.topic.updateMany({
      where: { title },
      data: {
        exercisePrompt: data.prompt,
        exerciseFiles: data.files,
      },
    });
    console.log(`Updated ${title}: ${updated.count} topic record(s) cleaned to challenge scaffolds.`);
  }
  console.log("All starter scaffolds successfully updated!");
}

main()
  .catch((e) => {
    console.error("Error updating scaffolds:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
