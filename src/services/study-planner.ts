import { Prisma } from "@prisma/client";
import { prisma } from "@/config/prisma";
import { topicRepository, syllabusRepository } from "@/repositories";
import { logger } from "@/lib/logger";
import { NotFoundError, UnauthorizedError, ValidationError } from "./errors";
import type { AuditContext } from "@/repositories/types";

type StudyPlanRecord = Record<string, unknown>;
type TopicRecord = Record<string, unknown>;

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

interface PlannerInput {
  syllabusId: string;
  userId: string;
  dailyMinutes: number;
  targetDate: string;
  preferredDays?: number[];
  audit?: AuditContext;
}

interface PlannerTopic {
  id: string;
  title: string;
  estimatedMinutes: number;
  priority: string;
  difficulty: string;
  score: number;
}

function scoreTopic(topic: PlannerTopic): number {
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
      if (currentMinutes > 0) {
        dayIndex++;
        currentMinutes = 0;
      }
      if (dayIndex < activeDays) {
        if (!studyDays[dayIndex]) {
          studyDays[dayIndex] = { dayIndex, topicIds: [], minutes: 0 };
        }
        studyDays[dayIndex].topicIds.push(topic.id);
        studyDays[dayIndex].minutes += topic.estimatedMinutes;
        dayIndex++;
        currentMinutes = 0;
      }
    } else {
      if (!studyDays[dayIndex]) {
        studyDays[dayIndex] = { dayIndex, topicIds: [], minutes: 0 };
      }
      studyDays[dayIndex].topicIds.push(topic.id);
      studyDays[dayIndex].minutes += topic.estimatedMinutes;
      currentMinutes += topic.estimatedMinutes;
    }
  }

  return studyDays;
}

function getDateRange(start: Date, target: Date, preferredDays?: number[]): Date[] {
  const days: Date[] = [];
  const current = new Date(start);

  while (current <= target) {
    if (!preferredDays || preferredDays.length === 0 || preferredDays.includes(current.getDay())) {
      days.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return days;
}

async function verifySyllabusOwnership(syllabusId: string, userId: string): Promise<void> {
  const syllabus = await syllabusRepository.findById(syllabusId);
  if (!syllabus) throw new NotFoundError("Syllabus", syllabusId);
  if (syllabus.userId as string !== userId) throw new UnauthorizedError();
}

export const studyPlanner = {
  async getPlan(syllabusId: string, userId: string): Promise<StudyPlanRecord | null> {
    await verifySyllabusOwnership(syllabusId, userId);

    const plan = await prisma.studyPlan.findFirst({
      where: { syllabusId, deletedAt: null, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: {
            tasks: {
              orderBy: { order: "asc" },
              include: {
                topic: { select: { id: true, title: true, difficulty: true, priority: true, estimatedMinutes: true } },
              },
            },
          },
        },
      },
    });

    return (plan as unknown as StudyPlanRecord) ?? null;
  },

  async generate(input: PlannerInput): Promise<StudyPlanRecord> {
    const { syllabusId, userId, dailyMinutes, targetDate, preferredDays, audit } = input;

    await verifySyllabusOwnership(syllabusId, userId);

    const existing = await prisma.studyPlan.findFirst({
      where: { syllabusId, deletedAt: null, status: "ACTIVE" },
    });

    if (existing) {
      throw new ValidationError("An active study plan already exists for this syllabus. Update it instead.");
    }

    const topics = (await topicRepository.findBySyllabusId(syllabusId)) as TopicRecord[];
    if (topics.length === 0) {
      throw new ValidationError("Cannot generate plan: syllabus has no topics");
    }

    const incompleteTopics = topics.filter((t) => t.completedAt == null) as unknown as PlannerTopic[];
    if (incompleteTopics.length === 0) {
      throw new ValidationError("All topics are already completed. No plan needed.");
    }

    const target = new Date(targetDate);
    if (isNaN(target.getTime())) {
      throw new ValidationError("Invalid target date");
    }

    const start = new Date();
    const calendarDays = getDateRange(start, target, preferredDays);
    if (calendarDays.length === 0) {
      throw new ValidationError("No available study days between start and target date");
    }

    const scoredTopics = incompleteTopics.map((t) => ({
      ...t,
      score: scoreTopic(t),
    }));

    const totalMinutes = scoredTopics.reduce((s, t) => s + (t.estimatedMinutes || 0), 0);
    const bufferDays = Math.max(1, Math.round(calendarDays.length * 0.2));
    const studyDays = distributeTopics(scoredTopics, dailyMinutes, calendarDays.length, bufferDays);

    if (studyDays.length === 0) {
      throw new ValidationError("Cannot fit topics into the available study days. Try increasing daily hours.");
    }

    const plan = await prisma.$transaction(async (tx) => {
      const created = await tx.studyPlan.create({
        data: {
          syllabusId,
          userId,
          dailyMinutes,
          ...(preferredDays !== undefined && { preferredDays }),
          targetDate: target,
          totalDays: calendarDays.length,
          bufferDays,
          status: "ACTIVE",
          createdBy: audit?.userId ?? null,
          updatedBy: audit?.userId ?? null,
        },
      });

      for (let i = 0; i < studyDays.length; i++) {
        const sd = studyDays[i];
        const date = calendarDays[sd.dayIndex];
        if (!date) continue;

        const day = await tx.studyDay.create({
          data: {
            studyPlanId: created.id,
            date,
            dayNumber: i + 1,
            totalMinutes: sd.minutes,
            createdBy: audit?.userId ?? null,
            updatedBy: audit?.userId ?? null,
          },
        });

        const topicMap = new Map(scoredTopics.map((t) => [t.id, t]));

        const tasksData = sd.topicIds.map((topicId, j) => {
          const topic = topicMap.get(topicId);
          return {
            studyDayId: day.id,
            topicId,
            minutes: topic?.estimatedMinutes || 30,
            order: j,
            createdBy: audit?.userId ?? null,
            updatedBy: audit?.userId ?? null,
          };
        });

        if (tasksData.length > 0) {
          await tx.studyTask.createMany({
            data: tasksData,
          });
        }
      }

      return created;
    });

    logger.info("Study plan generated", {
      planId: plan.id,
      syllabusId,
      totalDays: studyDays.length,
      totalMinutes,
    });

    return plan as unknown as StudyPlanRecord;
  },

  async regenerate(syllabusId: string, userId: string, input: Partial<PlannerInput>): Promise<StudyPlanRecord> {
    await verifySyllabusOwnership(syllabusId, userId);

    const existing = await prisma.studyPlan.findFirst({
      where: { syllabusId, deletedAt: null, status: "ACTIVE" },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: {
            tasks: true,
          },
        },
      },
    });

    if (!existing) {
      throw new NotFoundError("StudyPlan", syllabusId);
    }

    const currentTopics = await topicRepository.findBySyllabusId(syllabusId);

    const completedTaskTopicIds = new Set<string>();
    for (const day of existing.days) {
      for (const task of day.tasks) {
        if (task.isComplete) {
          completedTaskTopicIds.add(task.topicId);
        }
      }
    }

    const dailyMinutes = input.dailyMinutes ?? existing.dailyMinutes;
    const targetDate = input.targetDate ?? (existing.targetDate ? existing.targetDate.toISOString() : "");
    const preferredDays = input.preferredDays ?? (existing.preferredDays ? (existing.preferredDays as unknown as number[]) : undefined);
    const target = new Date(targetDate);

    const incompleteTopics = currentTopics.filter(
      (t) => !completedTaskTopicIds.has(t.id as string) && t.completedAt == null,
    ) as unknown as PlannerTopic[];

    if (incompleteTopics.length === 0) {
      await prisma.studyPlan.update({
        where: { id: existing.id },
        data: { status: "COMPLETED", updatedBy: userId },
      });
      throw new ValidationError("All topics completed. Plan marked as complete.");
    }

    const start = new Date();
    const calendarDays = getDateRange(start, target, preferredDays);
    if (calendarDays.length === 0) {
      throw new ValidationError("No available study days");
    }

    const scoredTopics = incompleteTopics.map((t) => ({ ...t, score: scoreTopic(t) }));
    const bufferDays = Math.max(1, Math.round(calendarDays.length * 0.2));
    const studyDays = distributeTopics(scoredTopics, dailyMinutes, calendarDays.length, bufferDays);

    await prisma.$transaction(async (tx) => {
      await tx.studyPlan.update({
        where: { id: existing.id },
        data: {
          dailyMinutes,
          targetDate: target,
          preferredDays: preferredDays ?? Prisma.DbNull,
          totalDays: calendarDays.length,
          bufferDays,
          updatedBy: userId,
        },
      });

      const newDayIds: string[] = [];
      for (let i = 0; i < studyDays.length; i++) {
        const sd = studyDays[i];
        const date = calendarDays[sd.dayIndex];
        if (!date) continue;

        const day = await tx.studyDay.create({
          data: {
            studyPlanId: existing.id,
            date,
            dayNumber: i + 1,
            totalMinutes: sd.minutes,
            createdBy: userId,
            updatedBy: userId,
          },
        });
        newDayIds.push(day.id);

        const topicMap = new Map(scoredTopics.map((t) => [t.id, t]));

        const tasksData = sd.topicIds.map((topicId, j) => {
          const topic = topicMap.get(topicId);
          return {
            studyDayId: day.id,
            topicId,
            minutes: topic?.estimatedMinutes || 30,
            order: j,
            createdBy: userId,
            updatedBy: userId,
          };
        });

        if (tasksData.length > 0) {
          await tx.studyTask.createMany({
            data: tasksData,
          });
        }
      }

      const oldDayIds = existing.days
        .filter((d) => d.tasks.some((t) => !t.isComplete))
        .map((d) => d.id);

      if (oldDayIds.length > 0) {
        await tx.studyTask.deleteMany({
          where: { studyDayId: { in: oldDayIds }, isComplete: false },
        });
        await tx.studyDay.deleteMany({
          where: { id: { in: oldDayIds } },
        });
      }
    });

    const updated = await prisma.studyPlan.findUnique({
      where: { id: existing.id },
    });

    logger.info("Study plan regenerated", { planId: existing.id, syllabusId });
    return (updated ?? existing) as unknown as StudyPlanRecord;
  },

  async updateSettings(
    syllabusId: string,
    userId: string,
    settings: { dailyMinutes?: number; targetDate?: string; preferredDays?: number[] },
    audit?: AuditContext,
  ): Promise<StudyPlanRecord> {
    await verifySyllabusOwnership(syllabusId, userId);

    const existing = await prisma.studyPlan.findFirst({
      where: { syllabusId, deletedAt: null, status: "ACTIVE" },
    });

    if (!existing) {
      throw new NotFoundError("StudyPlan", syllabusId);
    }

    const updated = await prisma.studyPlan.update({
      where: { id: existing.id },
      data: {
        ...(settings.dailyMinutes != null && { dailyMinutes: settings.dailyMinutes }),
        ...(settings.targetDate && { targetDate: new Date(settings.targetDate) }),
        ...(settings.preferredDays !== undefined && { preferredDays: settings.preferredDays }),
        updatedBy: audit?.userId ?? userId,
      },
    });

    logger.info("Study plan settings updated", {
      planId: existing.id,
      syllabusId,
      settings,
    });

    return updated as unknown as StudyPlanRecord;
  },

  async toggleTask(taskId: string, userId: string): Promise<StudyPlanRecord> {
    const task = await prisma.studyTask.findUnique({
      where: { id: taskId },
      include: {
        day: {
          include: { plan: true },
        },
      },
    });

    if (!task) throw new NotFoundError("StudyTask", taskId);
    if (task.day.plan.userId !== userId) throw new UnauthorizedError();

    const now = task.isComplete ? null : new Date();
    await prisma.studyTask.update({
      where: { id: taskId },
      data: {
        isComplete: !task.isComplete,
        completedAt: now,
        updatedBy: userId,
      },
    });

    const allTasks = await prisma.studyTask.findMany({
      where: { studyDayId: task.studyDayId },
    });

    const allComplete = allTasks.length > 0 && allTasks.every((t) => t.isComplete);

    if (allComplete) {
      await prisma.studyDay.update({
        where: { id: task.studyDayId },
        data: { isComplete: true, updatedBy: userId },
      });
    } else {
      await prisma.studyDay.update({
        where: { id: task.studyDayId },
        data: { isComplete: false, updatedBy: userId },
      });
    }

    const plan = await prisma.studyPlan.findUnique({
      where: { id: task.day.studyPlanId },
      include: {
        days: {
          orderBy: { dayNumber: "asc" },
          include: {
            tasks: {
              orderBy: { order: "asc" },
              include: {
                topic: { select: { id: true, title: true, difficulty: true, priority: true, estimatedMinutes: true } },
              },
            },
          },
        },
      },
    });

    return plan as unknown as StudyPlanRecord;
  },

  async getToday(userId: string): Promise<{
    plan: StudyPlanRecord | null;
    day: Record<string, unknown> | null;
    overallProgress: number;
    streak: number;
    syllabusTitle: string | null;
  }> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    const day = await prisma.studyDay.findFirst({
      where: {
        date: { gte: todayStart, lt: todayEnd },
        plan: { userId, deletedAt: null, status: "ACTIVE" },
      },
      include: {
        tasks: {
          orderBy: { order: "asc" },
          include: {
            topic: { select: { id: true, title: true, difficulty: true, priority: true, estimatedMinutes: true } },
          },
        },
        plan: {
          include: {
            syllabus: { select: { id: true, title: true } },
          },
        },
      },
    });

    if (!day) {
      return { plan: null, day: null, overallProgress: 0, streak: 0, syllabusTitle: null };
    }

    const allDays = await prisma.studyDay.findMany({
      where: { studyPlanId: day.studyPlanId },
      include: { _count: { select: { tasks: true } } },
      orderBy: { date: "asc" },
    });

    const totalTasks = allDays.reduce(
      (sum, d) => sum + d._count.tasks,
      0,
    );
    const completedTasks = allDays.reduce(
      (sum, d) => (d.isComplete ? sum + d._count.tasks : sum),
      0,
    );
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const sd = allDays.find(
        (d) => d.date.toISOString().slice(0, 10) === cursor.toISOString().slice(0, 10),
      );
      if (sd?.isComplete) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      plan: day.plan as unknown as StudyPlanRecord,
      day: day as unknown as Record<string, unknown>,
      overallProgress,
      streak,
      syllabusTitle: (day.plan.syllabus?.title as string) ?? null,
    };
  },

  async getStats(syllabusId: string, userId: string): Promise<{
    totalMinutes: number;
    completedMinutes: number;
    totalTasks: number;
    completedTasks: number;
    totalDays: number;
    completedDays: number;
    streak: number;
    daysRemaining: number;
  }> {
    await verifySyllabusOwnership(syllabusId, userId);

    const plan = await prisma.studyPlan.findFirst({
      where: { syllabusId, deletedAt: null, status: "ACTIVE" },
      include: {
        days: {
          include: { _count: { select: { tasks: true } } },
        },
      },
    });

    if (!plan) {
      return {
        totalMinutes: 0, completedMinutes: 0, totalTasks: 0, completedTasks: 0,
        totalDays: 0, completedDays: 0, streak: 0, daysRemaining: 0,
      };
    }

    const tasks = await prisma.studyTask.findMany({
      where: {
        studyDayId: { in: plan.days.map((d) => d.id) },
      },
    });

    const totalMinutes = tasks.reduce((s, t) => s + t.minutes, 0);
    const completedMinutes = tasks.filter((t) => t.isComplete).reduce((s, t) => s + t.minutes, 0);
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.isComplete).length;
    const totalDays = plan.days.length;
    const completedDays = plan.days.filter((d) => d.isComplete).length;

    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    for (let i = 0; i < 365; i++) {
      const sd = plan.days.find(
        (d) => d.date.toISOString().slice(0, 10) === cursor.toISOString().slice(0, 10),
      );
      if (sd?.isComplete) {
        streak++;
      } else {
        break;
      }
      cursor.setDate(cursor.getDate() - 1);
    }

    const now = new Date();
    const target = plan.targetDate;
    const daysRemaining = target
      ? Math.max(0, Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      totalMinutes,
      completedMinutes,
      totalTasks,
      completedTasks,
      totalDays,
      completedDays,
      streak,
      daysRemaining,
    };
  },
};
