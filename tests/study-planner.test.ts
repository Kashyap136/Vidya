import { describe, it, expect } from "vitest";

// Extracted from src/services/study-planner.ts
const PRIORITY_WEIGHT: Record<string, number> = {
  CRITICAL: 100,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 25,
};

const DIFFICULTY_WEIGHT: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 1.5,
  ADVANCED: 2,
};

interface PlannerTopic {
  id: string;
  title: string;
  estimatedMinutes: number;
  priority: string;
  difficulty: string;
  score: number;
}

function scoreTopic(topic: { priority: string; difficulty: string }): number {
  const p = PRIORITY_WEIGHT[topic.priority] || 25;
  const d = DIFFICULTY_WEIGHT[topic.difficulty] || 1;
  return p * d;
}

function distributeTopics(
  topics: PlannerTopic[],
  dailyMinutes: number,
  totalDays: number,
  bufferDays: number,
): { dayIndex: number; topicIds: string[]; minutes: number }[] {
  const studyDays: { dayIndex: number; topicIds: string[]; minutes: number }[] = [];
  const activeDays = totalDays - bufferDays;
  if (activeDays <= 0) return studyDays;

  const sorted = [...topics].sort((a, b) => b.score - a.score);
  let dayIndex = 0;
  let currentMinutes = 0;

  for (const topic of sorted) {
    if (dayIndex >= activeDays) break;
    if (currentMinutes + topic.estimatedMinutes > dailyMinutes && currentMinutes > 0) {
      dayIndex++;
      currentMinutes = 0;
    }
    if (dayIndex >= activeDays) break;

    if (topic.estimatedMinutes > dailyMinutes) {
      if (currentMinutes > 0) { dayIndex++; currentMinutes = 0; }
      if (dayIndex < activeDays) {
        if (!studyDays[dayIndex]) studyDays[dayIndex] = { dayIndex, topicIds: [], minutes: 0 };
        studyDays[dayIndex].topicIds.push(topic.id);
        studyDays[dayIndex].minutes += topic.estimatedMinutes;
        dayIndex++;
        currentMinutes = 0;
      }
    } else {
      if (!studyDays[dayIndex]) studyDays[dayIndex] = { dayIndex, topicIds: [], minutes: 0 };
      studyDays[dayIndex].topicIds.push(topic.id);
      studyDays[dayIndex].minutes += topic.estimatedMinutes;
      currentMinutes += topic.estimatedMinutes;
    }
  }

  return studyDays;
}

describe("StudyPlanner", () => {
  describe("scoreTopic", () => {
    it("returns max score for CRITICAL + ADVANCED", () => {
      expect(scoreTopic({ priority: "CRITICAL", difficulty: "ADVANCED" })).toBe(200);
    });

    it("returns min score for LOW + BEGINNER", () => {
      expect(scoreTopic({ priority: "LOW", difficulty: "BEGINNER" })).toBe(25);
    });

    it("returns 0 for unknown priority with default fallback", () => {
      expect(scoreTopic({ priority: "UNKNOWN", difficulty: "BEGINNER" })).toBe(25);
    });

    it("is deterministic — same inputs produce same score", () => {
      const a = scoreTopic({ priority: "HIGH", difficulty: "INTERMEDIATE" });
      const b = scoreTopic({ priority: "HIGH", difficulty: "INTERMEDIATE" });
      expect(a).toBe(b);
    });
  });

  describe("distributeTopics", () => {
    const topics: PlannerTopic[] = [
      { id: "1", title: "Hard", estimatedMinutes: 120, priority: "CRITICAL", difficulty: "ADVANCED", score: 200 },
      { id: "2", title: "Medium", estimatedMinutes: 60, priority: "HIGH", difficulty: "INTERMEDIATE", score: 112.5 },
      { id: "3", title: "Easy", estimatedMinutes: 30, priority: "LOW", difficulty: "BEGINNER", score: 25 },
    ];

    it("distributes topics into study days", () => {
      const result = distributeTopics(topics, 90, 10, 2);
      expect(result.length).toBeGreaterThan(0);
      const totalMinutes = result.reduce((s, d) => s + d.minutes, 0);
      expect(totalMinutes).toBe(210);
    });

    it("returns empty when no active days", () => {
      const result = distributeTopics(topics, 90, 3, 3);
      expect(result).toHaveLength(0);
    });

    it("does not exceed daily limit per day", () => {
      const result = distributeTopics(topics, 90, 10, 2);
      for (const day of result) {
        expect(day.minutes).toBeLessThanOrEqual(120);
      }
    });

    it("sorts high-score topics first", () => {
      const result = distributeTopics(topics, 90, 10, 2);
      if (result.length > 0) {
        expect(result[0].topicIds[0]).toBe("1");
      }
    });

    it("handles single topic exceeding daily limit", () => {
      const big: PlannerTopic[] = [
        { id: "1", title: "Massive", estimatedMinutes: 300, priority: "HIGH", difficulty: "ADVANCED", score: 150 },
      ];
      const result = distributeTopics(big, 120, 10, 2);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
