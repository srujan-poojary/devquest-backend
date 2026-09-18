import express, { type Request, type Response } from "express";
import { supabase } from "./config/supabase";

const app = express();

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
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});