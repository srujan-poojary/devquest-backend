import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.topic.updateMany({
  where: { title: "HTML Basics" },
  data: {
    exercisePrompt: "Add a heading, a paragraph, and a link to the page.",
    exerciseFiles: {
      "/index.html": `<!DOCTYPE html>
<html>
  <body>
    <!-- Add an <h1>, a <p>, and an <a> link below -->

  </body>
</html>`,
      "/index.js": "",
    },
  },
});

  await prisma.topic.updateMany({
  where: { title: "CSS Basics" },
  data: {
    exercisePrompt: "Style the heading: make it purple, centered, and 32px.",
    exerciseFiles: {
      "/index.html": `<!DOCTYPE html>
<html>
  <head><link rel="stylesheet" href="styles.css" /></head>
  <body>
    <h1>Hello, DevQuest</h1>
  </body>
</html>`,
      "/styles.css": `/* Style the h1 below */
h1 {

}`,
      "/index.js": "",
    },
  },
});

  await prisma.topic.updateMany({
    where: { title: "DOM Events" },
    data: {
      exercisePrompt: "Add a click listener so clicking the button changes the paragraph text.",
      exerciseFiles: {
        "/index.html": `<!DOCTYPE html>
<html>
  <body>
    <button id="btn">Click me</button>
    <p id="text">Nothing clicked yet.</p>
    <script src="index.js"></script>
  </body>
</html>`,
        "/index.js": `const btn = document.getElementById("btn");
const text = document.getElementById("text");

// Your task: add a click event listener to btn
// that changes text.textContent
`,
      },
    },
  });

  console.log("Exercises added.");
}

main()
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });