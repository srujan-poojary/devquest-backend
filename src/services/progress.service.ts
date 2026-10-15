import { prisma } from "../config/prisma";
import { calculateLevel } from "../utils/level.util";
import { getLatestRoadmap } from "./roadmap.service";
import { checkAndAwardAchievements } from "./achievement.service";
import { isTodayBountyTopic } from "./bounty.service";

export async function completeQuest(userId: string, topicId: string) {
  const topic = await prisma.topic.findUnique({ where: { id: topicId } });
  if (!topic) throw new Error("Topic not found");

  const existing = await prisma.userProgress.findUnique({
    where: { userId_topicId: { userId, topicId } },
  });

  const allXpEventsPrior = await prisma.xpEvent.findMany({ where: { userId } });
  const priorTotalXp = allXpEventsPrior.reduce((sum, e) => sum + e.amount, 0);
  const priorLevel = calculateLevel(priorTotalXp);

  if (existing?.status === "completed") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const roadmap = await getLatestRoadmap(userId);
    const nextEntry = roadmap?.entries.find(
      (e) => !e.topic.progress?.some((p) => p.status === "completed")
    );

    return {
      progress: existing,
      xpAwarded: 0,
      alreadyCompleted: true,
      newTotalXp: priorTotalXp,
      newLevel: priorLevel,
      isLevelUp: false,
      currentStreak: user?.currentStreak ?? 1,
      topicTitle: topic.title,
      nextTopic: nextEntry ? { id: nextEntry.topic.id, title: nextEntry.topic.title, baseXp: nextEntry.topic.baseXp } : null,
      newlyUnlockedAchievements: [],
    };
  }

  // Check if this quest is today's rotating Daily Bounty Challenge (2x Bonus XP)
  const isBounty = await isTodayBountyTopic(topicId);

  // Prerequisite & Sequence Gate: verify earlier topics in user's roadmap are completed
  // (Daily Bounty Challenge grants a special Bounty Trial Pass allowing direct embarkation!)
  const roadmap = await getLatestRoadmap(userId);
  if (!isBounty && roadmap && roadmap.entries.length > 0) {
    const entryIndex = roadmap.entries.findIndex((e) => e.topic.id === topicId);
    if (entryIndex > 0) {
      const priorIncomplete = roadmap.entries
        .slice(0, entryIndex)
        .find((e) => !e.topic.progress?.some((p) => p.status === "completed"));
      if (priorIncomplete) {
        throw new Error(
          `Quest Trial Sealed! You must complete "${priorIncomplete.topic.title}" before embarking on "${topic.title}".`
        );
      }
    }
  }

  const xpAwarded = isBounty ? topic.baseXp * 2 : topic.baseXp;

  const progress = await prisma.userProgress.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: { status: "completed", completedAt: new Date() },
    create: { userId, topicId, status: "completed", completedAt: new Date() },
  });

  await prisma.xpEvent.create({
    data: {
      userId,
      sourceType: isBounty ? "daily_bounty" : "quest_complete",
      sourceId: topicId,
      amount: xpAwarded,
    },
  });

  await updateStreak(userId);

  const updatedUser = await prisma.user.findUnique({ where: { id: userId } });
  const newTotalXp = priorTotalXp + xpAwarded;
  const newLevel = calculateLevel(newTotalXp);
  const isLevelUp = newLevel > priorLevel;

  // Check and award achievements triggered by this quest or stats
  const newlyUnlockedAchievements = await checkAndAwardAchievements(userId);

  // Find next incomplete topic in user's latest roadmap
  const nextEntry = roadmap?.entries.find(
    (e) => e.topic.id !== topicId && !e.topic.progress?.some((p) => p.status === "completed")
  );

  return {
    progress,
    xpAwarded,
    isBounty,
    alreadyCompleted: false,
    newTotalXp,
    newLevel,
    isLevelUp,
    currentStreak: updatedUser?.currentStreak ?? 1,
    topicTitle: topic.title,
    nextTopic: nextEntry ? { id: nextEntry.topic.id, title: nextEntry.topic.title, baseXp: nextEntry.topic.baseXp } : null,
    newlyUnlockedAchievements,
  };
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