import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Region 1: HTML Kingdom
  const htmlRegion = await prisma.region.create({
    data: { name: "HTML Kingdom", slug: "html-kingdom", order: 1, description: "Where every developer's journey begins." },
  });
  const htmlChapter = await prisma.chapter.create({
    data: { title: "HTML Fundamentals", order: 1, regionId: htmlRegion.id },
  });

  const htmlIntro = await prisma.topic.create({
    data: { title: "HTML Basics", difficulty: 1, baseXp: 50, estimatedHours: 2, chapterId: htmlChapter.id, description: "Tags, elements, and document structure." },
  });
  const htmlForms = await prisma.topic.create({
    data: { title: "Forms & Inputs", difficulty: 2, baseXp: 75, estimatedHours: 3, chapterId: htmlChapter.id, description: "Building interactive forms." },
  });
  const htmlSemantic = await prisma.topic.create({
    data: { title: "Semantic HTML", difficulty: 2, baseXp: 75, estimatedHours: 2, chapterId: htmlChapter.id, description: "Writing meaningful, accessible markup." },
  });

  // Prerequisites: Forms and Semantic both require Basics
  await prisma.topicPrerequisite.create({ data: { topicId: htmlForms.id, prerequisiteId: htmlIntro.id } });
  await prisma.topicPrerequisite.create({ data: { topicId: htmlSemantic.id, prerequisiteId: htmlIntro.id } });

  // Region 2: CSS Forest
  const cssRegion = await prisma.region.create({
    data: { name: "CSS Forest", slug: "css-forest", order: 2, description: "Style your way through the wilderness." },
  });
  const cssChapter = await prisma.chapter.create({
    data: { title: "CSS Fundamentals", order: 1, regionId: cssRegion.id },
  });

  const cssBasics = await prisma.topic.create({
    data: { title: "CSS Basics", difficulty: 1, baseXp: 50, estimatedHours: 2, chapterId: cssChapter.id, description: "Selectors, properties, and the cascade." },
  });
  const cssFlexbox = await prisma.topic.create({
    data: { title: "Flexbox", difficulty: 3, baseXp: 100, estimatedHours: 3, chapterId: cssChapter.id, description: "One-dimensional layouts made easy." },
  });
  const cssGrid = await prisma.topic.create({
    data: { title: "CSS Grid", difficulty: 3, baseXp: 100, estimatedHours: 3, chapterId: cssChapter.id, description: "Two-dimensional layout mastery." },
  });

  await prisma.topicPrerequisite.create({ data: { topicId: cssFlexbox.id, prerequisiteId: cssBasics.id } });
  await prisma.topicPrerequisite.create({ data: { topicId: cssGrid.id, prerequisiteId: cssBasics.id } });
  await prisma.topicPrerequisite.create({ data: { topicId: cssGrid.id, prerequisiteId: htmlIntro.id } });

  // Region 3: JavaScript Mountains
  const jsRegion = await prisma.region.create({
    data: { name: "JavaScript Mountains", slug: "javascript-mountains", order: 3, description: "The climb gets steep here." },
  });
  const jsChapter = await prisma.chapter.create({
    data: { title: "JS Fundamentals", order: 1, regionId: jsRegion.id },
  });

  const jsBasics = await prisma.topic.create({
    data: { title: "JavaScript Basics", difficulty: 2, baseXp: 100, estimatedHours: 4, chapterId: jsChapter.id, description: "Variables, functions, and control flow." },
  });
  const jsDom = await prisma.topic.create({
    data: { title: "DOM Events", difficulty: 3, baseXp: 125, estimatedHours: 3, chapterId: jsChapter.id, description: "Making pages interactive." },
  });
  const jsAsync = await prisma.topic.create({
    data: { title: "Async JavaScript", difficulty: 4, baseXp: 150, estimatedHours: 4, chapterId: jsChapter.id, description: "Promises, async/await, and fetch." },
  });

  await prisma.topicPrerequisite.create({ data: { topicId: jsDom.id, prerequisiteId: jsBasics.id } });
  await prisma.topicPrerequisite.create({ data: { topicId: jsAsync.id, prerequisiteId: jsDom.id } });

  // A few curated resources, linked to DOM Events as an example
  const mdnEvents = await prisma.resource.create({
    data: { title: "Introduction to Events", url: "https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events", type: "docs", platform: "MDN" },
  });
  const jsInfoEvents = await prisma.resource.create({
    data: { title: "Introduction to Browser Events", url: "https://javascript.info/introduction-browser-events", type: "article", platform: "JavaScript.info" },
  });

  await prisma.topicResource.create({ data: { topicId: jsDom.id, resourceId: mdnEvents.id, rank: 1 } });
  await prisma.topicResource.create({ data: { topicId: jsDom.id, resourceId: jsInfoEvents.id, rank: 2 } });

  // A couple of achievements
  await prisma.achievement.create({
    data: { title: "First Steps", description: "Complete your first quest.", triggerType: "quests_completed", triggerValue: 1 },
  });
  await prisma.achievement.create({
    data: { title: "Week Warrior", description: "Maintain a 7-day streak.", triggerType: "streak", triggerValue: 7 },
  });

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });