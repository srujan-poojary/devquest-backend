export interface TopicNode {
  id: string;
  title: string;
  estimatedHours: number;
  prerequisiteIds: string[];
  regionOrder: number;
  chapterOrder: number;
}

export interface ScheduledTopic {
  topicId: string;
  order: number;
  targetDate: Date;
}

export interface RoadmapResult {
  schedule: ScheduledTopic[];
  totalHours: number;
  feasible: boolean;
  message?: string | undefined;
}

export function generateRoadmap(
  topics: TopicNode[],
  dailyHours: number,
  deadline: Date | null
): RoadmapResult {
  const sorted = topologicalSort(topics);

  const totalHours = sorted.reduce((sum, t) => sum + t.estimatedHours, 0);

  const schedule: ScheduledTopic[] = [];
  const startDate = new Date();
  let hoursUsedToday = 0;
  let currentDay = 0;

  for (let i = 0; i < sorted.length; i++) {
    const topic = sorted[i]!;

    if (dailyHours > 0 && hoursUsedToday + topic.estimatedHours > dailyHours && hoursUsedToday > 0) {
      currentDay++;
      hoursUsedToday = 0;
    }

    hoursUsedToday += topic.estimatedHours;

    const targetDate = new Date(startDate);
    targetDate.setDate(startDate.getDate() + currentDay);

    schedule.push({
      topicId: topic.id,
      order: i,
      targetDate,
    });
  }

  const daysNeeded = currentDay + 1;
  const lastDate = schedule.length > 0 ? schedule[schedule.length - 1]!.targetDate : startDate;

  let feasible = true;
  let message: string | undefined;

  if (deadline && lastDate > deadline) {
    feasible = false;
    const daysAvailable = Math.ceil((deadline.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    message = `At ${dailyHours}h/day, this roadmap needs about ${daysNeeded} days, but your deadline gives you ${daysAvailable}. Consider increasing daily hours or extending the deadline.`;
  }

  if (dailyHours <= 0) {
    feasible = false;
    message = "Daily study hours must be greater than 0.";
  }

  return { schedule, totalHours, feasible, message };
}

function topologicalSort(topics: TopicNode[]): TopicNode[] {
  const topicMap = new Map(topics.map((t) => [t.id, t]));
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const topic of topics) {
    inDegree.set(topic.id, 0);
    dependents.set(topic.id, []);
  }

  for (const topic of topics) {
    for (const prereqId of topic.prerequisiteIds) {
      if (!topicMap.has(prereqId)) continue; // prereq outside selected set, ignore
      inDegree.set(topic.id, (inDegree.get(topic.id) ?? 0) + 1);
      dependents.get(prereqId)?.push(topic.id);
    }
  }

  const available: TopicNode[] = topics.filter((t) => inDegree.get(t.id) === 0);
  const sortByOrder = (a: TopicNode, b: TopicNode) =>
    a.regionOrder - b.regionOrder || a.chapterOrder - b.chapterOrder;
  available.sort(sortByOrder);

  const result: TopicNode[] = [];

  while (available.length > 0) {
    const next = available.shift()!;
    result.push(next);

    for (const depId of dependents.get(next.id) ?? []) {
      const newDegree = (inDegree.get(depId) ?? 0) - 1;
      inDegree.set(depId, newDegree);
      if (newDegree === 0) {
        const depTopic = topicMap.get(depId)!;
        available.push(depTopic);
        available.sort(sortByOrder);
      }
    }
  }

  if (result.length !== topics.length) {
    throw new Error("Cycle detected in prerequisite graph — cannot generate roadmap.");
  }

  return result;
}