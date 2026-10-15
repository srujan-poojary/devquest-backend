import "dotenv/config";
import "./config/env";
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

function renderOAuthBounceHtml(targetPath: string = "/") {
  const frontendUrl = process.env.FRONTEND_URL || "https://devquest-frontend-gray.vercel.app";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>DevQuest - Teleporting...</title>
  <style>
    * { box-sizing: border-box; }
    body {
      background-color: #0b0b0e;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
    }
    .card {
      background: rgba(18, 18, 26, 0.9);
      border: 1px solid rgba(124, 92, 255, 0.3);
      box-shadow: 0 0 50px rgba(124, 92, 255, 0.15);
      border-radius: 16px;
      padding: 36px 32px;
      text-align: center;
      max-width: 440px;
      width: 100%;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(124, 92, 255, 0.2);
      border-top-color: #7c5cff;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h2 {
      font-size: 18px;
      font-weight: 700;
      margin: 0 0 8px;
      color: #ffffff;
    }
    p {
      font-size: 13px;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }
  </style>
  <script>
    (function() {
      try {
        var isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        var frontendOrigin = isLocal ? 'http://localhost:5173' : ${JSON.stringify(frontendUrl)};
        var currentPath = window.location.pathname;
        var hash = window.location.hash || '';
        var search = window.location.search || '';

        var targetPath = ${JSON.stringify(targetPath)};
        if ((currentPath === '/' || !currentPath) && hash.indexOf('access_token') !== -1) {
          targetPath = '/onboarding';
        } else if (currentPath && currentPath !== '/') {
          targetPath = currentPath;
        }

        var destination = frontendOrigin + targetPath + search + hash;
        window.location.replace(destination);
      } catch (err) {
        window.location.href = 'http://localhost:5173';
      }
    })();
  </script>
</head>
<body>
  <div class="card">
    <div class="spinner"></div>
    <h2>⚔️ Teleporting to DevQuest Realm...</h2>
    <p>Authenticating adventurer credentials and unlocking quest portal.</p>
  </div>
</body>
</html>`;
}

app.get("/", (req: Request, res: Response) => {
  res.send(renderOAuthBounceHtml("/onboarding"));
});

app.get("/health", async (req: Request, res: Response) => {
  try {
    const topicCount = await prisma.topic.count();
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      database: "connected",
      topics: topicCount,
    });
  } catch (err: any) {
    console.error("Health check DB query failed:", err);
    res.status(500).json({
      status: "error",
      message: err?.message || "Database check failed",
    });
  }
});

const PORT = process.env.PORT || 3000;
import { createRoadmapForUser } from "./services/roadmap.service";

import { authMiddleware, type AuthenticatedRequest } from "./middlewares/auth.middleware";

async function ensureUserExists(authId: string, email?: string) {
  // If email is missing or empty, attempt to resolve via Supabase auth admin
  let resolvedEmail = email?.trim();
  if (!resolvedEmail || !resolvedEmail.includes("@")) {
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(authId);
      if (userData?.user?.email) {
        resolvedEmail = userData.user.email;
      }
    } catch {
      // ignore
    }
  }

  // Safe fallback email if user has a private GitHub email
  const safeEmail = resolvedEmail && resolvedEmail.includes("@")
    ? resolvedEmail
    : `user_${authId.substring(0, 8)}@devquest.local`;

  // 1. Check if user exists by authId
  let user = await prisma.user.findUnique({
    where: { authId },
  });

  if (user) {
    // If real email became available and differs from placeholder, update it
    if (resolvedEmail && resolvedEmail.includes("@") && user.email !== resolvedEmail) {
      const emailTaken = await prisma.user.findUnique({ where: { email: resolvedEmail } });
      if (!emailTaken) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { email: resolvedEmail },
        });
      }
    }
    return user;
  }

  // 2. Check if a user with this email exists (e.g. earlier email signup or same email across OAuth providers)
  if (resolvedEmail && resolvedEmail.includes("@")) {
    const existingByEmail = await prisma.user.findUnique({
      where: { email: resolvedEmail },
    });
    if (existingByEmail) {
      // Link the new authId to this existing user record
      return prisma.user.update({
        where: { id: existingByEmail.id },
        data: { authId },
      });
    }
  }

  // 3. Create fresh user record safely
  return prisma.user.create({
    data: {
      authId,
      email: safeEmail,
      avatar: "🧙‍♂️",
    },
  });
}

app.post("/roadmap/generate", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { goal, dailyHours, deadline, currentLevel, learningStyle, target } = req.body;
    if (!goal || !dailyHours) {
      return res.status(400).json({ error: "goal and dailyHours are required" });
    }

    const user = await ensureUserExists(req.userId!, req.userEmail);

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
  } catch (err: any) {
    console.error("Roadmap generation failed:", err);
    res.status(500).json({
      error: "Failed to generate roadmap",
      details: err?.message || "Unknown error",
    });
  }
});

app.post("/quests/:topicId/complete", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const topicId = req.params.topicId;
    if (!topicId || typeof topicId !== "string") {
      return res.status(400).json({ error: "topicId is required" });
    }

    const user = await ensureUserExists(req.userId!, req.userEmail);
    const result = await completeQuest(user.id, topicId);
    res.json(result);
  } catch (err: any) {
    console.error("Complete quest failed:", err);
    res.status(400).json({ error: err?.message || "Failed to complete quest" });
  }
});
app.get("/me/stats", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await ensureUserExists(req.userId!, req.userEmail);

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
    const user = await ensureUserExists(req.userId!, req.userEmail);
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
    const user = await ensureUserExists(req.userId!, req.userEmail);
    const achievements = await getUserAchievementsWithProgress(user.id);
    res.json(achievements);
  } catch (err) {
    console.error("Fetch achievements failed:", err);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

app.get("/me/account", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await ensureUserExists(req.userId!, req.userEmail);
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
  } catch (err: any) {
    console.error("Fetch me account failed:", err);
    res.status(500).json({ error: "Failed to fetch account info", details: err?.message || "Unknown error" });
  }
});

app.put("/me/profile", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, avatar, goal, dailyHours } = req.body;
    const user = await ensureUserExists(req.userId!, req.userEmail);

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
    const user = await ensureUserExists(req.userId!, req.userEmail);
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

    const user = await ensureUserExists(req.userId!, req.userEmail);
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
    const user = await ensureUserExists(req.userId!, req.userEmail);
    const roadmap = await getLatestRoadmap(user.id);
    res.json(roadmap);
  } catch (err) {
    console.error("Fetch latest roadmap failed:", err);
    res.status(500).json({ error: "Failed to fetch roadmap" });
  }
});

app.post("/mentor/chat", authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await ensureUserExists(req.userId!, req.userEmail);
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
    const user = await ensureUserExists(req.userId!, req.userEmail);
    const analytics = await getUserAnalytics(user.id);
    res.json(analytics);
  } catch (err) {
    console.error("Fetch analytics failed:", err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

app.use((req: Request, res: Response) => {
  if (req.method === "GET" && req.accepts("html")) {
    const targetPath = req.path === "/" ? "/onboarding" : req.path;
    return res.send(renderOAuthBounceHtml(targetPath));
  }
  return res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});