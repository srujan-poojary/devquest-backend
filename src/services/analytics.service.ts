import { prisma } from "../config/prisma";
import { calculateLevel } from "../utils/level.util";

export interface AnalyticsSummary {
  player: {
    level: number;
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    completedQuests: number;
    totalQuests: number;
    completionPercent: number;
  };
  dailyXpVelocity: {
    date: string;
    day: string;
    xp: number;
    quests: number;
  }[];
  realmMastery: {
    realmId: string;
    name: string;
    shortName: string;
    icon: string;
    completed: number;
    total: number;
    percent: number;
    xpEarned: number;
    xpTotal: number;
  }[];
  recentActivity: {
    topicTitle: string;
    completedAt: string;
    xpAwarded: number;
  }[];
}

export async function getUserAnalytics(userId: string): Promise<AnalyticsSummary> {
  const [user, xpEvents, userProgress, topics] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.xpEvent.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userProgress.findMany({
      where: { userId, status: "completed" },
      include: { topic: true },
      orderBy: { completedAt: "desc" },
    }),
    prisma.topic.findMany({
      include: { chapter: { include: { region: true } } },
    }),
  ]);

  const totalXp = xpEvents.reduce((sum, e) => sum + e.amount, 0);
  const level = calculateLevel(totalXp);
  const completedCount = userProgress.length;
  const totalQuests = topics.length || 22;
  const completionPercent = Math.min(100, Math.round((completedCount / totalQuests) * 100));

  // 1. Compute 14-day Daily XP Velocity
  const now = new Date();
  const velocityDays: { date: string; day: string; xp: number; quests: number }[] = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const displayLabel = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const dayLabel = d.toLocaleDateString("en-US", { weekday: "short" });

    // Sum XP events on this date
    const dayXpEvents = xpEvents.filter((e) => e.createdAt.toISOString().split("T")[0] === dateStr);
    const dayXp = dayXpEvents.reduce((sum, e) => sum + e.amount, 0);

    // Count quests completed on this date
    const dayQuests = userProgress.filter((p) => p.completedAt && p.completedAt.toISOString().split("T")[0] === dateStr).length;

    velocityDays.push({
      date: displayLabel,
      day: dayLabel,
      xp: dayXp,
      quests: dayQuests,
    });
  }

  // 2. Realm Mastery Calculations (HTML, CSS, JS, React)
  const completedTopicIds = new Set(userProgress.map((p) => p.topicId));

  const REALM_SPECS = [
    { id: "html-kingdom", name: "Realm I: HTML Kingdom", shortName: "HTML", icon: "🏰", order: 1 },
    { id: "css-forest", name: "Realm II: CSS Forest", shortName: "CSS", icon: "🌲", order: 2 },
    { id: "javascript-mountains", name: "Realm III: JavaScript Mountains", shortName: "JavaScript", icon: "⛰️", order: 3 },
    { id: "react-spire", name: "Realm IV: React Spire", shortName: "React", icon: "⚡", order: 4 },
  ];

  const realmMastery = REALM_SPECS.map((realm) => {
    const realmTopics = topics.filter((t) => {
      const regOrder = t.chapter?.region?.order;
      if (regOrder === realm.order) return true;
      const title = t.title.toLowerCase();
      if (realm.order === 1 && title.includes("html")) return true;
      if (realm.order === 2 && (title.includes("css") || title.includes("flex") || title.includes("grid") || title.includes("box") || title.includes("selector") || title.includes("responsive"))) return true;
      if (realm.order === 3 && (title.includes("javascript") || title.includes("dom") || title.includes("array") || title.includes("object") || title.includes("async") || title.includes("fetch") || title.includes("storage"))) return true;
      if (realm.order === 4 && (title.includes("react") || title.includes("state") || title.includes("effect") || title.includes("component"))) return true;
      return false;
    });

    const total = realmTopics.length || 1;
    const completed = realmTopics.filter((t) => completedTopicIds.has(t.id)).length;
    const percent = Math.min(100, Math.round((completed / total) * 100));
    const xpTotal = realmTopics.reduce((sum, t) => sum + (t.baseXp || 0), 0);
    const xpEarned = realmTopics
      .filter((t) => completedTopicIds.has(t.id))
      .reduce((sum, t) => sum + (t.baseXp || 0), 0);

    return {
      realmId: realm.id,
      name: realm.name,
      shortName: realm.shortName,
      icon: realm.icon,
      completed,
      total,
      percent,
      xpEarned,
      xpTotal,
    };
  });

  // 3. Recent Activity (Top 5)
  const recentActivity = userProgress.slice(0, 5).map((p) => ({
    topicTitle: p.topic.title,
    completedAt: p.completedAt ? p.completedAt.toISOString() : new Date().toISOString(),
    xpAwarded: p.topic.baseXp,
  }));

  return {
    player: {
      level,
      totalXp,
      currentStreak: user?.currentStreak ?? 0,
      longestStreak: user?.longestStreak ?? 0,
      completedQuests: completedCount,
      totalQuests,
      completionPercent,
    },
    dailyXpVelocity: velocityDays,
    realmMastery,
    recentActivity,
  };
}
