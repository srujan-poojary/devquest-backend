import { prisma } from "../config/prisma";
export async function completeQuest(userId: string, topicId: string) {
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) throw new Error("Topic not found");

  const existing = await prisma.userProgress.findUnique({
    where: { userId_topicId: { userId, topicId } },
  });

  if (existing?.status === "completed") {
    return { progress: existing, xpAwarded: 0, alreadyCompleted: true };
  }

  const progress = await prisma.userProgress.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: { status: "completed", completedAt: new Date() },
    create: { userId, topicId, status: "completed", completedAt: new Date() },
  });

  await prisma.xpEvent.create({
    data: { userId, sourceType: "quest_complete", sourceId: topicId, amount: topic.baseXp },
  });

  await updateStreak(userId);

  return { progress, xpAwarded: topic.baseXp };
}

async function updateStreak(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const today = new Date().toISOString().split("T")[0];
  const lastActive = user.lastActiveDate?.toISOString().split("T")[0];

  let newStreak = user.currentStreak;

  if (lastActive === today) {
    // already counted today, no change
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    newStreak = lastActive === yesterdayStr ? user.currentStreak + 1 : 1;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
      lastActiveDate: new Date(),
    },
  });
}