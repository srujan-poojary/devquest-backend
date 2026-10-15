import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import { supabase } from "./config/supabase";
import { prisma } from "./config/prisma";
import { completeQuest } from "./services/progress.service";
import { calculateLevel } from "./utils/level.util";
import { getTopicDetail, getLatestRoadmap } from "./services/roadmap.service";
import { getUserAchievementsWithProgress } from "./services/achievement.service";
import { askMentor } from "./services/mentor.service";
import { getUserAnalytics } from "./services/analytics.service";
import { getTodayBounty } from "./services/bounty.service";

const app = express();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://devquest-frontend-gray.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      /\.vercel\.app$/.test(origin)
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.get("/health", async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from("health_check")
      .select("*")
      .limit(1)
      .single();

    if (error) {
      throw error;
    }

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      dbMessage: data.message,
    });
  } catch (err) {
    console.error("Health check DB query failed:", err);
    res.status(500).json({ status: "error", message: "Database check failed" });
  }
});

const PORT = process.env.PORT || 3000;
import { createRoadmapForUser } from "./services/roadmap.service";

import { authMiddleware, type AuthenticatedRequest } from "./middlewares/auth.middleware";

app.post("/roadmap/generate", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { goal, dailyHours, deadline, currentLevel, learningStyle, target } = req.body;
    if (!goal || !dailyHours) {
      return res.status(400).json({ error: "goal and dailyHours are required" });
    }

    const user = await ensureUserExists(req.userId!, req.userEmail!);

    await prisma.user.update({
      where: { id: user.id },
      data: { goal, currentLevel, dailyHours: Math.round(Number(dailyHours)) },
    });

    const result = await createRoadmapForUser(
      user.id,
      goal,
      Number(dailyHours),
      deadline ? new Date(deadline) : null,
      currentLevel,
      target
    );

    res.json(result);
  } catch (err) {
    console.error("Roadmap generation failed:", err);
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
});


async function ensureUserExists(authId: string, email: string) {
  return prisma.user.upsert({
    where: { authId },
    update: {},
    create: { authId, email },
  });
}

app.post("/quests/:topicId/complete", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const topicId = req.params.topicId;
    if (!topicId || typeof topicId !== "string") {
      return res.status(400).json({ error: "topicId is required" });
    }

    const user = await ensureUserExists(req.userId!, req.userEmail!);
    const result = await completeQuest(user.id, topicId);
    res.json(result);
  } catch (err: any) {
    console.error("Complete quest failed:", err);
    res.status(400).json({ error: err?.message || "Failed to complete quest" });
  }
});
app.get("/me/stats", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await ensureUserExists(req.userId!, req.userEmail!);

    const xpEvents = await prisma.xpEvent.findMany({ where: { userId: user.id } });
    const totalXp = xpEvents.reduce((sum, e) => sum + e.amount, 0);

    const completedQuests = await prisma.userProgress.count({
      where: { userId: user.id, status: "completed" },
    });

    res.json({
      totalXp,
      level: calculateLevel(totalXp),
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
      completedQuests,
    });
  } catch (err) {
    console.error("Fetch stats failed:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/me/progress", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await ensureUserExists(req.userId!, req.userEmail!);
    const progress = await prisma.userProgress.findMany({
      where: { userId: user.id },
    });
    res.json(progress);
  } catch (err) {
    console.error("Fetch progress failed:", err);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
});

app.get("/me/achievements", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await ensureUserExists(req.userId!, req.userEmail!);
    const achievements = await getUserAchievementsWithProgress(user.id);
    res.json(achievements);
  } catch (err) {
    console.error("Fetch achievements failed:", err);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

app.get("/me/account", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await ensureUserExists(req.userId!, req.userEmail!);
    const roadmap = await prisma.roadmap.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        entries: {
          orderBy: { order: "asc" },
        },
      },
    });
    const hasRoadmap = Boolean(roadmap && roadmap.entries.length > 0);
    const totalQuests = roadmap?.entries.length || 0;
    const targetFinishDate =
      roadmap && roadmap.entries.length > 0
        ? roadmap.entries[roadmap.entries.length - 1]?.targetDate ?? null
        : null;

    res.json({
      id: user.id,
      email: user.email,
      name: user.name || null,
      avatar: user.avatar || "🧙‍♂️",
      goal: user.goal,
      currentLevel: user.currentLevel,
      dailyHours: user.dailyHours,
      hasRoadmap,
      totalQuests,
      targetFinishDate,
      isOnboarded: Boolean(hasRoadmap || user.goal),
    });
  } catch (err) {
    console.error("Fetch me account failed:", err);
    res.status(500).json({ error: "Failed to fetch account info" });
  }
});

app.put("/me/profile", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, avatar, goal, dailyHours } = req.body;
    const user = await ensureUserExists(req.userId!, req.userEmail!);

    const updateData: { name?: string | null; avatar?: string; goal?: string; dailyHours?: number } = {};
    if (name !== undefined) {
      updateData.name = typeof name === "string" ? name.trim() : null;
    }
    if (avatar !== undefined && typeof avatar === "string") {
      updateData.avatar = avatar.trim();
    }
    if (goal !== undefined && typeof goal === "string") {
      updateData.goal = goal.trim();
    }
    if (dailyHours !== undefined && !isNaN(Number(dailyHours))) {
      updateData.dailyHours = Math.max(1, Math.round(Number(dailyHours)));
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // If goal or daily study hours changed, refresh the roadmap calculations
    const goalChanged = updateData.goal && updateData.goal !== user.goal;
    const hoursChanged = updateData.dailyHours && updateData.dailyHours !== user.dailyHours;

    if (goalChanged || hoursChanged) {
      await createRoadmapForUser(
        user.id,
        updatedUser.goal || "frontend",
        updatedUser.dailyHours || 2,
        null,
        updatedUser.currentLevel || "beginner"
      );
    }

    res.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        avatar: updatedUser.avatar || "🧙‍♂️",
        goal: updatedUser.goal,
        currentLevel: updatedUser.currentLevel,
        dailyHours: updatedUser.dailyHours,
      },
    });
  } catch (err: any) {
    console.error("Update profile failed:", err);
    res.status(500).json({ error: err?.message || "Failed to update adventurer profile" });
  }
});

app.get("/me/bounty", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await ensureUserExists(req.userId!, req.userEmail!);
    const bounty = await getTodayBounty(user.id);
    res.json(bounty);
  } catch (err) {
    console.error("Fetch daily bounty failed:", err);
    res.status(500).json({ error: "Failed to fetch daily bounty" });
  }
});

app.get("/topics/:topicId", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const topicId = req.params.topicId;
    if (!topicId || typeof topicId !== "string") {
      return res.status(400).json({ error: "topicId is required" });
    }

    const user = await ensureUserExists(req.userId!, req.userEmail!);
    const topic = await getTopicDetail(topicId);
    const progress = await prisma.userProgress.findUnique({
      where: { userId_topicId: { userId: user.id, topicId } },
    });

    res.json({ ...topic, progress });
  } catch (err) {
    console.error("Fetch topic failed:", err);
    res.status(500).json({ error: "Failed to fetch topic" });
  }
});

app.get("/roadmap/latest", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await ensureUserExists(req.userId!, req.userEmail!);
    const roadmap = await getLatestRoadmap(user.id);
    res.json(roadmap);
  } catch (err) {
    console.error("Fetch latest roadmap failed:", err);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

app.post("/mentor/chat", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await ensureUserExists(req.userId!, req.userEmail!);
    const { message, topicId, topicTitle, exercisePrompt, userCode, failedCriteria, history } = req.body;
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message is required" });
    }

    const response = await askMentor({
      userId: user.id,
      message,
      topicId,
      topicTitle,
      exercisePrompt,
      userCode,
      failedCriteria,
      history,
    });

    res.json(response);
  } catch (err: any) {
    console.error("Mentor chat failed:", err);
    res.status(500).json({ error: "Failed to consult mentor" });
  }
});

app.get("/me/analytics", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await ensureUserExists(req.userId!, req.userEmail!);
    const analytics = await getUserAnalytics(user.id);
    res.json(analytics);
  } catch (err) {
    console.error("Fetch analytics failed:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});