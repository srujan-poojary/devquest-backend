import { prisma } from "../config/prisma";
import { generateRoadmap, type TopicNode } from "./roadmapGenerator.service";

export async function createRoadmapForUser(
  userId: string,
  goal: string,
  dailyHours: number,
  deadline: Date | null,
  currentLevel: string = "beginner",
  target?: string
) {
  // 1. Clean up any existing roadmap for this user so they don't accumulate stale duplicates
  const oldRoadmaps = await prisma.roadmap.findMany({ where: { userId } });
  if (oldRoadmaps.length > 0) {
    const oldIds = oldRoadmaps.map((r) => r.id);
    await prisma.roadmapEntry.deleteMany({ where: { roadmapId: { in: oldIds } } });
    await prisma.roadmap.deleteMany({ where: { id: { in: oldIds } } });
  }

  // 2. Fetch all available topics
  const allTopics = await prisma.topic.findMany({
    include: {
      chapter: { include: { region: true } },
      prerequisites: true,
    },
  });

  // 3. Archetype Track Filtering:
  // - Backend Knight: Focuses on data intake, server communication, logic, async, fetch, and state (skips pure cosmetic CSS styling).
  // - Frontend Mage & Full-Stack Rogue: Full rich curriculum from HTML Basics to React Spire.
  const activeTopics = allTopics.filter((t) => {
    const title = t.title.toLowerCase().trim();

    if (goal === "backend") {
      const isBackendRelevant =
        title.includes("forms & inputs") ||
        title.includes("javascript basics") ||
        title.includes("arrays & iteration") ||
        title.includes("objects & destructuring") ||
        title.includes("dom events") ||
        title.includes("local storage persistence") ||
        title.includes("async javascript") ||
        title.includes("fetch api & remote data") ||
        title.includes("react components & props") ||
        title.includes("state with usestate");
      return isBackendRelevant;
    }

    return true;
  });

  // 4. Prior Knowledge Fast-Track (Diagnostic Credit):
  // Instead of deleting topics from the syllabus (which leaves an orphaned topic like "Forms & Inputs"),
  // we grant completion credit for foundational topics. The roadmap stays 100% complete,
  // and the student starts on the next active quest with starter XP!
  if (currentLevel === "intermediate" || currentLevel === "advanced") {
    const priorKnowledgeTitles =
      currentLevel === "advanced"
        ? [
            "html basics",
            "semantic html",
            "forms & inputs",
            "media & embedding",
            "css basics",
            "the box model & spacing",
            "javascript basics",
          ]
        : ["html basics", "semantic html", "css basics"];

    const topicsToCredit = activeTopics.filter((t) =>
      priorKnowledgeTitles.includes(t.title.toLowerCase().trim())
    );

    for (const t of topicsToCredit) {
      await prisma.userProgress.upsert({
        where: { userId_topicId: { userId, topicId: t.id } },
        update: { status: "completed", completedAt: new Date() },
        create: { userId, topicId: t.id, status: "completed", completedAt: new Date() },
      });

      const existingXp = await prisma.xpEvent.findFirst({
        where: { userId, sourceType: "quest_fast_track", sourceId: t.id },
      });
      if (!existingXp) {
        await prisma.xpEvent.create({
          data: {
            userId,
            sourceType: "quest_fast_track",
            sourceId: t.id,
            amount: t.baseXp,
          },
        });
      }
    }
  }

  // 5. Pacing Calibration: Intermediate & Advanced learners move faster through early material
  const topicNodes: TopicNode[] = activeTopics.map((t) => {
    let calibratedHours = t.estimatedHours;
    if (currentLevel === "intermediate" && t.difficulty <= 1) {
      calibratedHours = Math.max(1, Math.round(t.estimatedHours * 0.7));
    } else if (currentLevel === "advanced" && t.difficulty <= 2) {
      calibratedHours = Math.max(1, Math.round(t.estimatedHours * 0.5));
    }

    return {
      id: t.id,
      title: t.title,
      estimatedHours: calibratedHours,
      prerequisiteIds: t.prerequisites.map((p) => p.prerequisiteId),
      regionOrder: t.chapter.region.order,
      chapterOrder: t.chapter.order,
    };
  });

  const result = generateRoadmap(topicNodes, dailyHours, deadline);

  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      goal,
      entries: {
        create: result.schedule.map((s) => ({
          topicId: s.topicId,
          order: s.order,
          targetDate: s.targetDate,
        })),
      },
    },
    include: {
      user: {
        select: {
          goal: true,
          currentLevel: true,
          dailyHours: true,
        },
      },
      entries: {
        include: {
          topic: {
            include: {
              progress: {
                where: { userId },
              },
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });

  return { roadmap, feasible: result.feasible, message: result.message, totalHours: result.totalHours };
}
export async function getTopicDetail(topicId: string) {
  const topic = await prisma.topic.findUnique({
    where: { id: topicId },
    include: {
      chapter: {
        include: {
          region: true,
        },
      },
      resources: {
        include: { resource: true },
        orderBy: { rank: "asc" },
      },
    },
  });
  if (!topic) throw new Error("Topic not found");
  return topic;
}

export async function getLatestRoadmap(userId: string) {
  return prisma.roadmap.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          goal: true,
          currentLevel: true,
          dailyHours: true,
        },
      },
      entries: {
        include: {
          topic: {
            include: {
              chapter: {
                include: {
                  region: true,
                },
              },
              progress: {
                where: { userId },
              },
            },
          },
        },
        orderBy: { order: "asc" },
      },
    },
  });
}