import { prisma } from "../config/prisma";
import { generateRoadmap, type TopicNode } from "./roadmapGenerator.service";

export async function createRoadmapForUser(
  userId: string,
  goal: string,
  dailyHours: number,
  deadline: Date | null
) {
  const topics = await prisma.topic.findMany({
    include: {
      chapter: { include: { region: true } },
      prerequisites: true,
    },
  });

  const topicNodes: TopicNode[] = topics.map((t) => ({
    id: t.id,
    title: t.title,
    estimatedHours: t.estimatedHours,
    prerequisiteIds: t.prerequisites.map((p) => p.prerequisiteId),
    regionOrder: t.chapter.region.order,
    chapterOrder: t.chapter.order,
  }));

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
    entries: {
      include: { topic: true },
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
      entries: {
        include: { topic: true },
        orderBy: { order: "asc" },
      },
    },
  });
}