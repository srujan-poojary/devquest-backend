import express, { type Request, type Response } from "express";
import cors from "cors";
import { supabase } from "./config/supabase";
import { prisma } from "./config/prisma";
import { completeQuest } from "./services/progress.service";
import { calculateLevel } from "./utils/level.util";
import { getTopicDetail, getLatestRoadmap } from "./services/roadmap.service";

const app = express();
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:5173", "https://devquest-frontend-gray.vercel.app"],
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
      data: { goal, currentLevel, dailyHours: Number(dailyHours) },
    });

    const result = await createRoadmapForUser(
      user.id,
      goal,
      Number(dailyHours),
      deadline ? new Date(deadline) : null
    );

    res.json(result);
  } catch (err) {
    console.error("Roadmap generation failed:", err);
    res.status(500).json({ error: "Failed to generate roadmap" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
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
  } catch (err) {
    console.error("Complete quest failed:", err);
    res.status(500).json({ error: "Failed to complete quest" });
  }
});
app.get("/me/stats", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await ensureUserExists(req.userId!, req.userEmail!);

    const xpEvents = await prisma.xpEvent.findMany({ where: { userId: user.id } });
    const totalXp = xpEvents.reduce((sum, e) => sum + e.amount, 0);

    res.json({
      totalXp,
      level: calculateLevel(totalXp),
      currentStreak: user.currentStreak,
      longestStreak: user.longestStreak,
    });
  } catch (err) {
    console.error("Fetch stats failed:", err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/topics/:topicId", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const topicId = req.params.topicId;
    if (!topicId || typeof topicId !== "string") {
      return res.status(400).json({ error: "topicId is required" });
    }

    const topic = await getTopicDetail(topicId);
    res.json(topic);
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