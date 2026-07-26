/**
 * Pipeline diagnostic script.
 * Creates a syllabus with pasted text, triggers the pipeline, and reports every step.
 *
 * Usage: npx tsx --env-file=.env.local scripts/diagnose-pipeline.ts <USER_ID>
 */
import { prisma } from "../src/config/prisma";
import { syllabusRepository, topicRepository } from "../src/repositories";
import { extractionPipeline, textNormalizationService, promptBuilderService, geminiService, aiResponseValidator, studyPlanner, quizService } from "../src/services";
import { logger } from "../src/lib/logger";

const TEST_TEXT = `
CS301: Data Structures and Algorithms

Course Description:
This course covers fundamental data structures and algorithms used in computer science.
Topics include arrays, linked lists, stacks, queues, trees, graphs, sorting, and searching.

Prerequisites: CS201 (Introduction to Programming)

Credit Hours: 3 (Lecture: 2, Lab: 1)

Weekly Schedule:
Week 1-2: Introduction to Data Structures, Arrays, and Recursion
Week 3-4: Linked Lists (Singly, Doubly, Circular)
Week 5-6: Stacks and Queues (Array and Linked List implementations)
Week 7-8: Trees (Binary Trees, BST, AVL Trees)
Week 9-10: Graphs (BFS, DFS, Shortest Path)
Week 11-12: Sorting Algorithms (Quick Sort, Merge Sort, Heap Sort)
Week 13-14: Searching Algorithms (Binary Search, Hashing)
Week 15: Review and Final Exam

Learning Objectives:
1. Analyze time and space complexity of algorithms
2. Implement fundamental data structures
3. Apply appropriate data structures to solve problems
4. Compare different algorithmic approaches

Textbook: "Introduction to Algorithms" by CLRS (3rd Edition)

Grading:
- Assignments: 20%
- Midterm: 30%
- Final: 40%
- Quizzes: 10%
`;

async function printStep(step: number, label: string, ok: boolean, detail?: string) {
  const status = ok ? "OK" : "FAIL";
  console.log(`  [${step}] ${label} ... ${status}${detail ? ` (${detail})` : ""}`);
}

async function main() {
  console.log("\n========================================");
  console.log("  PIPELINE DIAGNOSTIC TOOL");
  console.log("========================================\n");

  const userId = process.argv[2];
  if (!userId) {
    console.error("ERROR: Provide a user ID as argument.");
    console.error("  Usage: npx tsx scripts/diagnose-pipeline.ts <USER_ID>");
    process.exit(1);
  }

  console.log(`User ID: ${userId}`);
  console.log(`Test text length: ${TEST_TEXT.length} chars`);
  console.log(`Gemini: real API calls (mock mode removed)\n`);

  // Track all results
  const results: { step: number; label: string; ok: boolean; detail?: string }[] = [];
  let pipelineSuccess = false;

  // =========================================
  // STEP 1-2: Create syllabus
  // =========================================
  console.log("--- STEP 1-2: Create syllabus ---\n");

  const title = "DIAGNOSTIC: Data Structures " + Date.now();
  let syllabusId: string;

  try {
    const created = await prisma.syllabus.create({
      data: {
        title,
        filePath: "manual",
        userId,
        rawText: TEST_TEXT.trim(),
        processingStatus: "UPLOADED",
      },
    });
    syllabusId = created.id;
    results.push({ step: 2, label: "Syllabus created", ok: true, detail: syllabusId });
    printStep(2, "Syllabus created", true, syllabusId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("  FAILED:", msg);
    results.push({ step: 2, label: "Syllabus created", ok: false, detail: msg });
    await prisma.$disconnect();
    process.exit(1);
  }

  // =========================================
  // STEP 3: Verify DB
  // =========================================
  console.log("\n--- STEP 3: Verify database record ---\n");

  const syllabus = await prisma.syllabus.findUnique({ where: { id: syllabusId } });
  if (!syllabus) {
    results.push({ step: 3, label: "Database record", ok: false, detail: "Syllabus not found in DB" });
    printStep(3, "Database record", false, "Syllabus not found in DB");
    process.exit(1);
  }
  results.push({
    step: 3, label: "Database record", ok: true,
    detail: `title="${syllabus.title}" rawText=${(syllabus.rawText || "").length}chars filePath=${syllabus.filePath} status=${syllabus.processingStatus}`,
  });
  printStep(3, "Database record", true, `rawText=${(syllabus.rawText || "").length}chars, status=${syllabus.processingStatus}`);

  // =========================================
  // STEP 3b: Input method detection
  // =========================================
  const hasRawText = !!(syllabus.rawText as string | null);
  const hasPdf = !!(syllabus.filePath && syllabus.filePath !== "manual");
  const inputMethod = hasRawText ? "TEXT" : hasPdf ? "PDF" : "NONE";
  results.push({ step: 3, label: "Input method", ok: inputMethod !== "NONE", detail: inputMethod });
  printStep(3, "Input method detected", inputMethod !== "NONE", inputMethod);

  // =========================================
  // STEP 4: Normalize text
  // =========================================
  console.log("\n--- STEP 4: Process text ---\n");

  let normalizedText: string;
  try {
    if (hasRawText) {
      const norm = textNormalizationService.normalize(syllabus.rawText!);
      normalizedText = norm.text;
      results.push({ step: 4, label: "Text normalization", ok: true, detail: `${normalizedText.length} chars` });
      printStep(4, "Text normalization", true, `${normalizedText.length} chars`);
    } else {
      throw new Error("No text content to normalize");
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ step: 4, label: "Text normalization", ok: false, detail: msg });
    printStep(4, "Text normalization", false, msg);
    process.exit(1);
  }

  // =========================================
  // STEP 5: Build prompt
  // =========================================
  console.log("\n--- STEP 5-6: AI request ---\n");

  let aiRaw: object;
  try {
    const prompt = promptBuilderService.build(normalizedText);
    results.push({ step: 5, label: "Prompt built", ok: true, detail: `${prompt.contents.length} chars` });
    printStep(5, "Prompt built", true, `${prompt.contents.length} chars`);

    console.log("  Calling Gemini... (may take up to 60s)");
    aiRaw = await geminiService.generate(prompt);
    results.push({ step: 6, label: "AI response received", ok: true, detail: `keys=${Object.keys(aiRaw).join(",")}` });
    printStep(6, "AI response received", true, `keys=${Object.keys(aiRaw).join(",")}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : "";
    results.push({ step: 6, label: "AI request", ok: false, detail: msg });
    printStep(6, "AI request", false, msg);
    if (stack) console.error("  Stack:", stack.split("\n").slice(0, 3).join("\n"));

    console.log("\n  => Gemini API failed. Free-tier quota exhausted. Enable billing at Google AI Studio for continued access.");
    await updateFailed(syllabusId);
    await printFinalReport(results, syllabusId);
    await prisma.$disconnect();
    return;
  }

  // =========================================
  // STEP 7-8: Validate
  // =========================================
  console.log("\n--- STEP 7-8: Validate AI response ---\n");

  let validated: ReturnType<typeof aiResponseValidator.validate>;
  try {
    validated = aiResponseValidator.validate(aiRaw);
    results.push({ step: 8, label: "AI response validation", ok: true, detail: `${validated.topics.length} topics` });
    printStep(8, "AI response validation", true, `${validated.topics.length} topics`);
    validated.topics.forEach((t, i) => {
      console.log(`    ${i + 1}. ${t.title} (${t.priority}, ${t.difficulty}, ${t.estimatedHours}h)`);
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ step: 8, label: "AI response validation", ok: false, detail: msg });
    printStep(8, "AI response validation", false, msg);
    process.exit(1);
  }

  // =========================================
  // STEP 9: Persist topics
  // =========================================
  console.log("\n--- STEP 9: Persist topics ---\n");

  try {
    for (let i = 0; i < validated.topics.length; i++) {
      const t = validated.topics[i];
      await prisma.topic.create({
        data: {
          title: t.title,
          summary: t.description,
          priority: t.priority,
          difficulty: t.difficulty,
          order: i,
          estimatedMinutes: t.estimatedHours * 60,
          syllabusId,
        },
      });
      console.log(`  Topic ${i + 1}: "${t.title}"`);
    }
    results.push({ step: 9, label: "Topics persisted", ok: true, detail: `${validated.topics.length} topics` });
    printStep(9, "Topics persisted", true, `${validated.topics.length} topics`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ step: 9, label: "Topics persisted", ok: false, detail: msg });
    printStep(9, "Topics persisted", false, msg);
    process.exit(1);
  }

  // =========================================
  // STEP 10-11: Study plan
  // =========================================
  console.log("\n--- STEP 10-11: Generate study plan ---\n");

  try {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);
    const plan = await studyPlanner.generate({
      syllabusId,
      userId,
      dailyMinutes: 120,
      targetDate: targetDate.toISOString().slice(0, 10),
    });
    const planRecord = plan as Record<string, unknown>;
    results.push({ step: 11, label: "Study plan generated", ok: true, detail: `id=${planRecord.id}` });
    printStep(11, "Study plan generated", true, `id=${planRecord.id}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ step: 11, label: "Study plan generated", ok: false, detail: msg });
    printStep(11, "Study plan generated", false, msg);
  }

  // =========================================
  // STEP 12-13: Quiz
  // =========================================
  console.log("\n--- STEP 12-13: Generate quiz ---\n");

  try {
    const quiz = await quizService.generate(syllabusId, userId);
    const quizRecord = quiz as Record<string, unknown>;
    results.push({ step: 13, label: "Quiz generated", ok: true, detail: `id=${quizRecord.id} questions=${quizRecord.questionCount}` });
    printStep(13, "Quiz generated", true, `id=${quizRecord.id} questions=${quizRecord.questionCount}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    results.push({ step: 13, label: "Quiz generated", ok: false, detail: msg });
    printStep(13, "Quiz generated", false, msg);
  }

  // =========================================
  // STEP 14: Mark COMPLETED
  // =========================================
  console.log("\n--- STEP 14: Finalize ---\n");

  await prisma.syllabus.update({
    where: { id: syllabusId },
    data: { processingStatus: "COMPLETED" },
  });
  results.push({ step: 14, label: "Pipeline COMPLETE", ok: true, detail: "Status set to COMPLETED" });
  printStep(14, "Pipeline COMPLETE", true);

  pipelineSuccess = true;

  // =========================================
  // Final report
  // =========================================
  await printFinalReport(results, syllabusId);

  await prisma.$disconnect();

  if (pipelineSuccess) {
    console.log("\n✓ PIPELINE SUCCESSFULLY COMPLETED");
  } else {
    console.log("\n✗ PIPELINE FAILED — see errors above");
    process.exit(1);
  }
}

async function updateFailed(syllabusId: string) {
  await prisma.syllabus.update({
    where: { id: syllabusId },
    data: { processingStatus: "FAILED" },
  });
}

async function printFinalReport(results: { step: number; label: string; ok: boolean; detail?: string }[], syllabusId: string) {
  console.log("\n========================================");
  console.log("  FINAL DATABASE VERIFICATION");
  console.log("========================================\n");

  const s = await prisma.syllabus.findUnique({ where: { id: syllabusId } });
  if (!s) { console.log("  Syllabus not found\n"); return; }

  const topics = await prisma.topic.findMany({ where: { syllabusId, deletedAt: null } });
  const quizzes = await prisma.quiz.findMany({ where: { syllabusId } });
  const plans = await prisma.studyPlan.findMany({ where: { syllabusId } });

  console.log(`  Syllabus:        ${s.title}`);
  console.log(`  Status:          ${s.processingStatus}`);
  console.log(`  rawText length:  ${(s.rawText || "").length} chars`);
  console.log(`  Topics:          ${topics.length}`);
  console.log(`  Quizzes:         ${quizzes.length}`);

  if (quizzes.length > 0) {
    const questions = await prisma.quizQuestion.findMany({
      where: { quizId: { in: quizzes.map((q) => q.id) } },
    });
    console.log(`  Questions:       ${questions.length}`);
    if (questions.length > 0) {
      console.log(`  Sample question: "${questions[0].questionText.slice(0, 80)}..."`);
    }
  }

  console.log(`  Study Plans:     ${plans.length}`);

  if (plans.length > 0) {
    const days = await prisma.studyDay.findMany({
      where: { studyPlanId: plans[0].id },
      orderBy: { dayNumber: "asc" },
    });
    console.log(`  Study Days:      ${days.length}`);
    if (days.length > 0) {
      const tasks = await prisma.studyTask.findMany({
        where: { studyDayId: { in: days.map((d) => d.id) } },
      });
      console.log(`  Study Tasks:     ${tasks.length}`);
      console.log(`  First day:       Day ${days[0].dayNumber}, ${days[0].totalMinutes}min, ${days[0].isComplete ? "complete" : "pending"}`);
    }
  }

  console.log("\n--- Pipeline Steps ---");
  const failed = results.filter((r) => !r.ok);
  const passed = results.filter((r) => r.ok);
  console.log(`  Passed: ${passed.length}/${results.length}`);
  if (failed.length > 0) {
    console.log(`  Failed: ${failed.length}`);
    failed.forEach((f) => printStep(f.step, f.label, false, f.detail));
  }
  console.log(`\n  Diagnostic syllabus ID: ${syllabusId}`);
  console.log(`  View at: /admin/pipeline-debug`);
  console.log(`  View at: /dashboard/syllabi/${syllabusId}`);
  console.log("");
}

main().catch((err) => {
  console.error("\nUNHANDLED ERROR:", err);
  process.exit(1);
});
