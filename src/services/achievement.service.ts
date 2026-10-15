import { prisma } from "../config/prisma";

export interface AchievementDefinition {
  title: string;
  description: string;
  triggerType: "quests_completed" | "streak" | "xp_total" | "realm_completed";
  triggerValue: number;
  icon?: string;
}

export const DEFAULT_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    title: "First Steps",
    description: "Complete your first quest trial in DevQuest.",
    triggerType: "quests_completed",
    triggerValue: 1,
    icon: "⚔️",
  },
  {
    title: "Novice Scribe",
    description: "Conquer 3 quests across your campaign.",
    triggerType: "quests_completed",
    triggerValue: 3,
    icon: "📜",
  },
  {
    title: "Apprentice Developer",
    description: "Conquer 5 quests across the curriculum.",
    triggerType: "quests_completed",
    triggerValue: 5,
    icon: "🎓",
  },
  {
    title: "Code Journeyman",
    description: "Conquer 10 quests with verified solutions.",
    triggerType: "quests_completed",
    triggerValue: 10,
    icon: "🔮",
  },
  {
    title: "Grandmaster Adventurer",
    description: "Master all 22 quests in the entire campaign.",
    triggerType: "quests_completed",
    triggerValue: 22,
    icon: "👑",
  },
  {
    title: "Flame Initiate",
    description: "Maintain a 3-day daily coding streak.",
    triggerType: "streak",
    triggerValue: 3,
    icon: "🔥",
  },
  {
    title: "Week Warrior",
    description: "Maintain a 7-day daily coding streak.",
    triggerType: "streak",
    triggerValue: 7,
    icon: "🛡️",
  },
  {
    title: "Century Club",
    description: "Accumulate 500+ total XP in your career.",
    triggerType: "xp_total",
    triggerValue: 500,
    icon: "🌟",
  },
  {
    title: "XP Titan",
    description: "Accumulate 1,000+ total XP in your career.",
    triggerType: "xp_total",
    triggerValue: 1000,
    icon: "⚡",
  },
  {
    title: "HTML Monarch",
    description: "Conquer all foundational trials in Realm I: HTML Kingdom.",
    triggerType: "realm_completed",
    triggerValue: 1,
    icon: "🏰",
  },
  {
    title: "CSS Artificer",
    description: "Conquer all styling and responsive trials in Realm II: CSS Forest.",
    triggerType: "realm_completed",
    triggerValue: 2,
    icon: "🌲",
  },
  {
    title: "JavaScript Sage",
    description: "Conquer all algorithmic and DOM trials in Realm III: JavaScript Mountains.",
    triggerType: "realm_completed",
    triggerValue: 3,
    icon: "⛰️",
  },
  {
    title: "React Alchemist",
    description: "Conquer all reactive component trials in Realm IV: React Spire.",
    triggerType: "realm_completed",
    triggerValue: 4,
    icon: "⚡",
  },
];

export async function ensureDefaultAchievements() {
  for (const def of DEFAULT_ACHIEVEMENTS) {
    const existing = await prisma.achievement.findFirst({
      where: { title: def.title },
    });

    if (!existing) {
      await prisma.achievement.create({
        data: {
          title: def.title,
          description: def.description,
          triggerType: def.triggerType,
          triggerValue: def.triggerValue,
        },
      });
    } else if (existing.description !== def.description || existing.triggerValue !== def.triggerValue) {
      await prisma.achievement.update({
        where: { id: existing.id },
        data: {
          description: def.description,
          triggerType: def.triggerType,
          triggerValue: def.triggerValue,
        },
      });
    }
  }
}

export async function checkAndAwardAchievements(userId: string) {
  // Ensure default catalog is populated
  await ensureDefaultAchievements();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return [];

  const [allAchievements, userAchievements, userProgress, xpEvents, topics] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId } }),
    prisma.userProgress.findMany({ where: { userId, status: "completed" } }),
    prisma.xpEvent.findMany({ where: { userId } }),
    prisma.topic.findMany({ include: { chapter: { include: { region: true } } } }),
  ]);

  const unlockedMap = new Set(userAchievements.map((ua) => ua.achievementId));
  const completedTopicIds = new Set(userProgress.map((p) => p.topicId));
  const totalXp = xpEvents.reduce((sum, e) => sum + e.amount, 0);
  const completedCount = userProgress.length;
  const currentStreak = Math.max(user.currentStreak, user.longestStreak);

  // Group completed topics by Realm (order 1..4)
  const realmCompletedMap = new Map<number, boolean>();
  for (let realmOrder = 1; realmOrder <= 4; realmOrder++) {
    const realmTopics = topics.filter((t) => {
      const regOrder = t.chapter?.region?.order;
      if (regOrder === realmOrder) return true;
      // Fallback by title keywords
      const title = t.title.toLowerCase();
      if (realmOrder === 1 && title.includes("html")) return true;
      if (realmOrder === 2 && (title.includes("css") || title.includes("flexbox") || title.includes("grid") || title.includes("box model") || title.includes("selectors") || title.includes("responsive"))) return true;
      if (realmOrder === 3 && (title.includes("javascript") || title.includes("dom") || title.includes("array") || title.includes("object") || title.includes("async") || title.includes("fetch") || title.includes("storage"))) return true;
      if (realmOrder === 4 && (title.includes("react") || title.includes("usestate") || title.includes("useeffect") || title.includes("conditional"))) return true;
      return false;
    });

    const isRealmComplete = realmTopics.length > 0 && realmTopics.every((t) => completedTopicIds.has(t.id));
    realmCompletedMap.set(realmOrder, isRealmComplete);
  }

  const newlyUnlocked: any[] = [];

  for (const ach of allAchievements) {
    if (unlockedMap.has(ach.id)) continue;

    let qualifies = false;

    if (ach.triggerType === "quests_completed") {
      qualifies = completedCount >= ach.triggerValue;
    } else if (ach.triggerType === "streak") {
      qualifies = currentStreak >= ach.triggerValue;
    } else if (ach.triggerType === "xp_total") {
      qualifies = totalXp >= ach.triggerValue;
    } else if (ach.triggerType === "realm_completed") {
      qualifies = !!realmCompletedMap.get(ach.triggerValue);
    }

    if (qualifies) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: ach.id,
          unlockedAt: new Date(),
        },
      });

      const icon = DEFAULT_ACHIEVEMENTS.find((d) => d.title === ach.title)?.icon || "🏆";
      newlyUnlocked.push({
        id: ach.id,
        title: ach.title,
        description: ach.description,
        triggerType: ach.triggerType,
        triggerValue: ach.triggerValue,
        icon,
        unlockedAt: new Date(),
      });
    }
  }

  return newlyUnlocked;
}

export async function getUserAchievementsWithProgress(userId: string) {
  await ensureDefaultAchievements();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const [allAchievements, userAchievements, userProgress, xpEvents, topics] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId } }),
    prisma.userProgress.findMany({ where: { userId, status: "completed" } }),
    prisma.xpEvent.findMany({ where: { userId } }),
    prisma.topic.findMany({ include: { chapter: { include: { region: true } } } }),
  ]);

  const userAchMap = new Map(userAchievements.map((ua) => [ua.achievementId, ua]));
  const completedTopicIds = new Set(userProgress.map((p) => p.topicId));
  const totalXp = xpEvents.reduce((sum, e) => sum + e.amount, 0);
  const completedCount = userProgress.length;
  const currentStreak = user ? Math.max(user.currentStreak, user.longestStreak) : 0;

  // Realm completion counts
  const realmProgressMap = new Map<number, { completed: number; total: number }>();
  for (let realmOrder = 1; realmOrder <= 4; realmOrder++) {
    const realmTopics = topics.filter((t) => {
      const regOrder = t.chapter?.region?.order;
      if (regOrder === realmOrder) return true;
      const title = t.title.toLowerCase();
      if (realmOrder === 1 && title.includes("html")) return true;
      if (realmOrder === 2 && (title.includes("css") || title.includes("flexbox") || title.includes("grid") || title.includes("box model") || title.includes("selectors") || title.includes("responsive"))) return true;
      if (realmOrder === 3 && (title.includes("javascript") || title.includes("dom") || title.includes("array") || title.includes("object") || title.includes("async") || title.includes("fetch") || title.includes("storage"))) return true;
      if (realmOrder === 4 && (title.includes("react") || title.includes("usestate") || title.includes("useeffect") || title.includes("conditional"))) return true;
      return false;
    });

    const cCount = realmTopics.filter((t) => completedTopicIds.has(t.id)).length;
    realmProgressMap.set(realmOrder, { completed: cCount, total: realmTopics.length });
  }

  return allAchievements.map((ach) => {
    const ua = userAchMap.get(ach.id);
    const def = DEFAULT_ACHIEVEMENTS.find((d) => d.title === ach.title);
    const icon = def?.icon || "🏆";

    let current = 0;
    let target = ach.triggerValue;

    if (ach.triggerType === "quests_completed") {
      current = Math.min(target, completedCount);
    } else if (ach.triggerType === "streak") {
      current = Math.min(target, currentStreak);
    } else if (ach.triggerType === "xp_total") {
      current = Math.min(target, totalXp);
    } else if (ach.triggerType === "realm_completed") {
      const rp = realmProgressMap.get(ach.triggerValue);
      current = rp?.completed ?? 0;
      target = rp?.total || 1;
    }

    return {
      id: ach.id,
      title: ach.title,
      description: ach.description,
      triggerType: ach.triggerType,
      triggerValue: ach.triggerValue,
      icon,
      isUnlocked: !!ua,
      unlockedAt: ua?.unlockedAt ?? null,
      progress: {
        current,
        target,
        percent: Math.min(100, Math.round((current / (target || 1)) * 100)),
      },
    };
  });
}
