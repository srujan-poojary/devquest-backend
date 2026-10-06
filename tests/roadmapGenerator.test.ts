import { describe, it, expect } from "vitest";
import { generateRoadmap, type TopicNode } from "../src/services/roadmapGenerator.service";

const topics: TopicNode[] = [
  { id: "1", title: "HTML Basics", estimatedHours: 2, prerequisiteIds: [], regionOrder: 1, chapterOrder: 1 },
  { id: "2", title: "Forms", estimatedHours: 3, prerequisiteIds: ["1"], regionOrder: 1, chapterOrder: 1 },
  { id: "3", title: "CSS Basics", estimatedHours: 2, prerequisiteIds: [], regionOrder: 2, chapterOrder: 1 },
];

describe("generateRoadmap", () => {
  it("orders topics so prerequisites come first", () => {
    const result = generateRoadmap(topics, 4, null);
    const htmlIndex = result.schedule.findIndex((s) => s.topicId === "1");
    const formsIndex = result.schedule.findIndex((s) => s.topicId === "2");
    expect(htmlIndex).toBeLessThan(formsIndex);
  });

  it("flags infeasible when deadline is too soon", () => {
    const nearDeadline = new Date();
    nearDeadline.setDate(nearDeadline.getDate() + 1);
    const result = generateRoadmap(topics, 1, nearDeadline);
    expect(result.feasible).toBe(false);
  });

  it("rejects zero daily hours", () => {
    const result = generateRoadmap(topics, 0, null);
    expect(result.feasible).toBe(false);
  });
});