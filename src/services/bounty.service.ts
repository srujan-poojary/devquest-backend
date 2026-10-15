import { prisma } from "../config/prisma";

export interface DailyBounty {
  topicId: string;
  topicTitle: string;
  description: string | null;
  baseXp: number;
  bonusMultiplier: number;
  totalXp: number;
  expiresAt: string;
  isCompleted: boolean;
}

/**
 * Computes a stable deterministic integer seed for today's date in UTC.
 */
function getUtcDaySeed(): number {
  const dateStr = new Date().toISOString().split("T")[0] ?? "2026-10-15";
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = ((hash << 5) - hash + dateStr.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Calculates the ISO timestamp of next midnight UTC (24-hour reset mark).
 */
export function getNextMidnightUtc(): string {
  const now = new Date();
  const nextMidnight = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0)
  );
  return nextMidnight.toISOString();
}

/**
 * Selects today's global daily bounty topic.
 */
export async function getTodayBounty(userId: string): Promise<DailyBounty | null> {
  const topics = await prisma.topic.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      baseXp: true,
      chapter: {
        select: {
          region: {
            select: { name: true, slug: true },
          },
        },
      },
    },
    orderBy: { id: "asc" },
  });

  if (topics.length === 0) return null;

  const seed = getUtcDaySeed();
  const index = seed % topics.length;
  const bountyTopic = topics[index];
  if (!bountyTopic) return null;

  const progress = await prisma.userProgress.findUnique({
    where: {
      userId_topicId: {
        userId,
        topicId: bountyTopic.id,
      },
    },
  });

  const isCompleted = progress?.status === "completed";

  return {
    topicId: bountyTopic.id,
    topicTitle: bountyTopic.title,
    description: bountyTopic.description,
    baseXp: bountyTopic.baseXp,
    bonusMultiplier: 2,
    totalXp: bountyTopic.baseXp * 2,
    expiresAt: getNextMidnightUtc(),
    isCompleted,
  };
}

/**
 * Verifies whether a given topic is today's daily bounty topic.
 */
export async function isTodayBountyTopic(topicId: string): Promise<boolean> {
  const topics = await prisma.topic.findMany({
    select: { id: true },
    orderBy: { id: "asc" },
  });

  if (topics.length === 0) return false;

  const seed = getUtcDaySeed();
  const index = seed % topics.length;
  const match = topics[index];
  return match ? match.id === topicId : false;
}
