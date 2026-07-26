/**
 * DIAGNOSTIC: Trace the full pipeline execution with a real PDF.
 *
 * Usage: npx tsx --env-file=.env scripts/trace-pipeline.ts
 */

import { prisma } from "@/config/prisma";
import { storageService } from "@/services/storage";
import { pdfExtractionService } from "@/services/pdf-extraction";
import { textNormalizationService } from "@/services/text-normalization";
import { promptBuilderService } from "@/services/prompt-builder";
import { geminiService } from "@/services/gemini";
import { aiResponseValidator } from "@/services/ai-response-validator";
import { processingStatusService } from "@/services/processing-status";
import { studyPlanner } from "@/services/study-planner";
import { quizService } from "@/services/quiz";

// ── Helpers ──────────────────────────────────────────────────────────

let stepNum = 0;

function step(name: string): void {
  stepNum++;
  console.log(`\n═══ STEP ${stepNum}: ${name} ═══`);
}

function ok(label: string, val?: unknown): void {
  const extra = val !== undefined ? ` → ${JSON.stringify(val)}` : "";
  console.log(`  ✓ ${label}${extra}`);
}

function fail(label: string, err: unknown): never {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`  ✗ ${label}: ${msg}`);
  if (err instanceof Error && err.stack) {
    console.error(`    Stack: ${err.stack.split("\n").slice(1, 4).join("\n    ")}`);
  }
  console.log(`\n❌ PIPELINE FAILED at step ${stepNum}: ${label}`);
  process.exit(1);
}

async function printTableCounts(label: string) {
  const [topics, plans, days, tasks, quizzes, questions] = await Promise.all([
    prisma.topic.count(),
    prisma.studyPlan.count(),
    prisma.studyDay.count(),
    prisma.studyTask.count(),
    prisma.quiz.count(),
    prisma.quizQuestion.count(),
  ]);
  console.log(`  📊 [${label}] DB counts: topics=${topics} plans=${plans} days=${days} tasks=${tasks} quizzes=${quizzes} questions=${questions}`);
}



// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("╔══════════════════════════════════════════════════╗");
  console.log("║   PIPELINE TRACE — REAL PDF + REAL DATABASE     ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  await printTableCounts("BEFORE TEST");

  // ── 1. Find user ──────────────────────────────────────────────────
  step("Find a user in the database");
  const user = await prisma.user.findFirst({
    where: { deletedAt: null },
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true },
  });
  if (!user) fail("No user found in database", new Error("No user found"));
  ok("Found user", { id: user.id, email: user.email });

  // ── 2. Create a real PDF ──────────────────────────────────────────
  step("Create a real test PDF");
  const PDFDocument = require("pdfkit");
  const doc = new PDFDocument({ size: "A4" });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  await new Promise<void>((resolve) => {
    doc.on("end", () => resolve());
    doc.fontSize(20).text("CS301: Data Structures and Algorithms", { align: "center" });
    doc.moveDown(2);
    doc.fontSize(14).text("Course Syllabus", { align: "center" });
    doc.moveDown();
    doc.fontSize(11).text("University: Massachusetts Institute of Technology");
    doc.text("Department: Computer Science");
    doc.text("Credits: 4");
    doc.text("Instructor: Prof. John Smith");
    doc.moveDown(2);
    doc.fontSize(14).text("Course Description");
    doc.moveDown();
    doc.fontSize(11).text("This course covers fundamental data structures and algorithms used in computer science. Topics include arrays, linked lists, trees, graphs, sorting algorithms, and dynamic programming. Students will implement these data structures in Python and analyze their time and space complexity.");
    doc.moveDown(2);
    doc.fontSize(14).text("Weekly Schedule");
    doc.moveDown();
    const topics = [
      "Week 1: Introduction to Data Structures — Arrays and Linked Lists (3 hours)",
      "Week 2: Stacks and Queues — Applications and Implementations (3 hours)",
      "Week 3: Trees — Binary Trees, BSTs, and Tree Traversals (3 hours)",
      "Week 4: Heaps and Priority Queues (3 hours)",
      "Week 5: Graphs — BFS, DFS, and Shortest Paths (3 hours)",
      "Week 6: Sorting — QuickSort, MergeSort, HeapSort (3 hours)",
      "Week 7: Searching — Binary Search, Hashing, Hash Tables (3 hours)",
      "Week 8: Dynamic Programming — Memoization and Tabulation (3 hours)",
      "Week 9: Greedy Algorithms — Activity Selection, Huffman Coding (3 hours)",
      "Week 10: Advanced Topics — NP-Completeness and Approximation Algorithms (3 hours)",
    ];
    topics.forEach((t) => doc.text(t));
    doc.end();
  });
  const pdfBuffer = Buffer.concat(chunks);
  ok("PDF created", { sizeBytes: pdfBuffer.length });

  // ── 3. Create syllabus ────────────────────────────────────────────
  step("Create a syllabus record in the database");
  const syllabus = await prisma.syllabus.create({
    data: {
      title: "CS301: Data Structures and Algorithms (DIAGNOSTIC " + Date.now() + ")",
      filePath: "pending",
      userId: user.id,
      processingStatus: "UPLOADED",
      createdBy: user.id,
      updatedBy: user.id,
    },
  });
  ok("Syllabus created", { id: syllabus.id, title: syllabus.title });

  // ── 4. Upload to Supabase ─────────────────────────────────────────
  step("Upload PDF to Supabase storage");
  const pdfFile = new File([pdfBuffer], "cs301-syllabus.pdf", { type: "application/pdf" });
  const filePath = await storageService.upload(syllabus.id, user.id, pdfFile);
  ok("PDF uploaded", { filePath });

  // ── 5. Update filePath ────────────────────────────────────────────
  step("Update syllabus filePath");
  await prisma.syllabus.update({
    where: { id: syllabus.id },
    data: { filePath, fileName: "cs301-syllabus.pdf", fileSize: pdfBuffer.length, mimeType: "application/pdf", uploadedAt: new Date() },
  });
  ok("Syllabus filePath updated");

  // ── 6. Verify ─────────────────────────────────────────────────────
  step("Verify syllabus in database");
  const savedSyllabus = await prisma.syllabus.findUnique({ where: { id: syllabus.id } });
  ok("Syllabus state", { processingStatus: savedSyllabus?.processingStatus, filePath: savedSyllabus?.filePath });

  // ═══════════════════════════════════════════════════════════════════
  // EXECUTING PIPELINE STEPS
  // ═══════════════════════════════════════════════════════════════════

  // ── 7. Download PDF ──────────────────────────────────────────────
  step("DOWNLOAD PDF from Supabase storage");
  let buffer: Buffer;
  try {
    buffer = await storageService.download(filePath);
    ok("PDF downloaded", { sizeBytes: buffer.length });
  } catch (e) {
    fail("DOWNLOAD PDF failed", e);
  }

  // ── 8. Extract text ──────────────────────────────────────────────
  step("EXTRACT text from PDF");
  let extracted: Awaited<ReturnType<typeof pdfExtractionService.extract>>;
  try {
    extracted = await pdfExtractionService.extract(buffer);
    ok("Text extracted", { charCount: extracted.text.length, pageCount: extracted.pageCount });
    console.log(`  First 300 chars: "${extracted.text.slice(0, 300)}"`);
    if (extracted.text.length === 0) {
      fail("EXTRACTION returned empty string", new Error("empty text"));
    }
  } catch (e) {
    fail("EXTRACT text failed", e);
  }

  // ── 9. Save rawText ─────────────────────────────────────────────
  step("SAVE rawText to syllabus (EXTRACTED)");
  try {
    await processingStatusService.update(syllabus.id, "EXTRACTED", {
      rawText: extracted.text,
      pageCount: extracted.pageCount,
      audit: { userId: user.id },
    });
    ok("EXTRACTED status + rawText saved");

    const verify = await prisma.syllabus.findUnique({
      where: { id: syllabus.id },
      select: { rawText: true, processingStatus: true },
    });
    if (verify?.rawText) {
      ok("rawText persisted in DB", { length: verify.rawText.length, first100: verify.rawText.slice(0, 100) });
    } else {
      fail("rawText is EMPTY after save — BUG in processingStatusService.update()", new Error("rawText not persisted"));
    }
  } catch (e) {
    fail("SAVE rawText failed", e);
  }

  // ── 10. Normalize text ──────────────────────────────────────────
  step("NORMALIZE text");
  const normalized = textNormalizationService.normalize(extracted.text);
  ok("Text normalized", { charCount: normalized.charCount, lineCount: normalized.lineCount });

  // ── 11. Build prompt ────────────────────────────────────────────
  step("BUILD prompt");
  const prompt = promptBuilderService.build(normalized.text);
  ok("Prompt built", { systemInstructionLen: prompt.systemInstruction.length, contentsLen: prompt.contents.length });

  // ── 12. Call Gemini ─────────────────────────────────────────────
  step("CALL Gemini AI");
  await processingStatusService.update(syllabus.id, "GENERATING_TOPICS", { audit: { userId: user.id } });
  let aiRaw: object;
  try {
    aiRaw = await geminiService.generate(prompt);
    const asStr = JSON.stringify(aiRaw);
    ok("Gemini responded", { responseLength: asStr.length });
    console.log(`  Response: "${asStr.slice(0, 300)}..."`);
  } catch (e) {
    fail("Gemini API call failed", e);
  }

  // ── 13. Validate AI response ────────────────────────────────────
  step("VALIDATE AI response");
  await processingStatusService.update(syllabus.id, "GENERATING_TOPICS", { audit: { userId: user.id } });
  let validated: ReturnType<typeof aiResponseValidator.validate>;
  try {
    validated = aiResponseValidator.validate(aiRaw);
    ok("Validation passed", { topicCount: validated.topics.length, title: validated.syllabusTitle });
    validated.topics.forEach((t, i) => {
      console.log(`    ${i + 1}. ${t.title} (${t.priority}/${t.difficulty}, ${t.estimatedHours}h)`);
    });
  } catch (e) {
    fail("AI response validation failed", e);
  }

  // ── 14. Persist topics ──────────────────────────────────────────
  step("PERSIST topics via prisma.$transaction");
  await processingStatusService.update(syllabus.id, "TOPICS_CREATED", { audit: { userId: user.id } });
  try {
    await prisma.$transaction(async (tx) => {
      // Delete old topics
      const existingTopics = await tx.topic.findMany({
        where: { syllabusId: syllabus.id, deletedAt: null },
      });
      if (existingTopics.length > 0) {
        await tx.topic.deleteMany({ where: { syllabusId: syllabus.id } });
        ok(`Deleted ${existingTopics.length} existing topics`);
      }

      // Create new topics
      for (let i = 0; i < validated.topics.length; i++) {
        const t = validated.topics[i];
        const created = await tx.topic.create({
          data: {
            title: t.title,
            summary: t.description,
            priority: t.priority as any,
            difficulty: t.difficulty as any,
            order: i,
            estimatedMinutes: t.estimatedHours * 60,
            syllabusId: syllabus.id,
            createdBy: user.id,
            updatedBy: user.id,
          },
        });
        console.log(`    Created topic: ${created.id} — ${created.title}`);
      }
    });
    ok("Topics persisted", { count: validated.topics.length });

    const topicCount = await prisma.topic.count({ where: { syllabusId: syllabus.id } });
    ok("Topic rows in DB", topicCount);
    if (topicCount === 0) {
      fail("0 topics despite successful insert", new Error("Topic count is 0"));
    }
  } catch (e) {
    fail("PERSIST topics failed", e);
  }

  await printTableCounts("AFTER TOPICS");

  // ── 15. Generate study plan ──────────────────────────────────────
  step("GENERATE study plan");
  await processingStatusService.update(syllabus.id, "GENERATING_PLAN", { audit: { userId: user.id } });
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + 30);
  try {
    const plan = await studyPlanner.generate({
      syllabusId: syllabus.id,
      userId: user.id,
      dailyMinutes: 120,
      targetDate: targetDate.toISOString().slice(0, 10),
      audit: { userId: user.id },
    });
    ok("Study plan generated", { planId: (plan as any).id });
  } catch (e) {
    fail("Study plan generation failed", e);
  }

  await printTableCounts("AFTER STUDY PLAN");

  // ── 16. Verify plan, days, tasks ─────────────────────────────────
  step("VERIFY plan, days, tasks in DB");
  const planCount = await prisma.studyPlan.count({ where: { syllabusId: syllabus.id } });
  const planRec = await prisma.studyPlan.findFirst({ where: { syllabusId: syllabus.id } });
  const dayCount = planRec ? await prisma.studyDay.count({ where: { studyPlanId: planRec.id } }) : 0;
  const allDays = planRec ? await prisma.studyDay.findMany({ where: { studyPlanId: planRec.id }, select: { id: true } }) : [];
  const taskCount = allDays.length > 0 ? await prisma.studyTask.count({ where: { studyDayId: { in: allDays.map(d => d.id) } } }) : 0;
  ok("StudyPlan rows", planCount);
  ok("StudyDay rows", dayCount);
  ok("StudyTask rows", taskCount);
  if (planCount === 0) fail("StudyPlan has 0 rows — BUG: study plan not created", new Error("Plan not created"));
  if (dayCount === 0) fail("StudyDay has 0 rows — BUG: days not created", new Error("Days not created"));
  if (taskCount === 0) fail("StudyTask has 0 rows — BUG: tasks not created", new Error("Tasks not created"));

  // ── 17. Generate quiz ────────────────────────────────────────────
  step("GENERATE quiz");
  await processingStatusService.update(syllabus.id, "GENERATING_QUIZ", { audit: { userId: user.id } });
  try {
    const quiz = await quizService.generate(syllabus.id, user.id, { userId: user.id });
    ok("Quiz generated", { quizId: (quiz as any).id, questionCount: (quiz as any).questionCount });
  } catch (e) {
    fail("Quiz generation failed", e);
  }

  await printTableCounts("AFTER QUIZ");

  // ── 18. Verify quiz, questions ───────────────────────────────────
  step("VERIFY quiz and questions in DB");
  const quizCount = await prisma.quiz.count({ where: { syllabusId: syllabus.id } });
  const quizRec = await prisma.quiz.findFirst({ where: { syllabusId: syllabus.id } });
  const questionCount = quizRec ? await prisma.quizQuestion.count({ where: { quizId: quizRec.id } }) : 0;
  ok("Quiz rows", quizCount);
  ok("QuizQuestion rows", questionCount);
  if (quizCount === 0) fail("Quiz has 0 rows — BUG: quiz not created", new Error("Quiz not created"));
  if (questionCount === 0) fail("QuizQuestion has 0 rows — BUG: questions not created", new Error("Questions not created"));

  // ── 19. Mark COMPLETED ───────────────────────────────────────────
  step("MARK COMPLETED");
  await processingStatusService.update(syllabus.id, "COMPLETED", { audit: { userId: user.id } });
  const final = await prisma.syllabus.findUnique({
    where: { id: syllabus.id },
    select: { processingStatus: true, rawText: true, pageCount: true },
  });
  ok("Final status", final?.processingStatus);
  ok("rawText length", final?.rawText?.length ?? 0);
  ok("pageCount", final?.pageCount);

  // ── FINAL VERIFICATION ───────────────────────────────────────────
  console.log("\n╔══════════════════════════════════════════════════╗");
  console.log("║           FINAL DATABASE VERIFICATION           ║");
  console.log("╚══════════════════════════════════════════════════╝\n");

  await printTableCounts("FINAL");

  const finalTopics = await prisma.topic.findMany({
    where: { syllabusId: syllabus.id },
    select: { id: true, title: true, priority: true, difficulty: true, estimatedMinutes: true },
    orderBy: { order: "asc" },
  });
  const finalPlan = await prisma.studyPlan.findFirst({
    where: { syllabusId: syllabus.id, status: "ACTIVE" },
    include: { days: { orderBy: { dayNumber: "asc" }, include: { tasks: { orderBy: { order: "asc" } } } } },
  });
  const finalQuiz = await prisma.quiz.findFirst({
    where: { syllabusId: syllabus.id },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  console.log(`\n✅ FINAL VERIFICATION for syllabus "${syllabus.title}" (${syllabus.id})`);
  console.log(`   Status: ${final?.processingStatus}`);
  console.log(`   rawText: ${final?.rawText?.length ?? 0} chars`);
  console.log(`   Topics: ${finalTopics.length}`);
  finalTopics.forEach((t) => console.log(`     ${t.id}: ${t.title} (${t.priority}/${t.difficulty}, ${t.estimatedMinutes}min)`));
  console.log(`   StudyPlan: ${finalPlan ? finalPlan.id : "NONE"}`);
  if (finalPlan) {
    console.log(`   StudyDays: ${finalPlan.days.length}`);
    finalPlan.days.forEach((d) => console.log(`     Day ${d.dayNumber}: ${d.totalMinutes}min, ${d.tasks.length} tasks`));
    const totalTasks = finalPlan.days.reduce((s, d) => s + d.tasks.length, 0);
    console.log(`   StudyTasks: ${totalTasks}`);
  }
  console.log(`   Quiz: ${finalQuiz ? finalQuiz.id : "NONE"}`);
  console.log(`   Questions: ${finalQuiz ? finalQuiz.questions.length : 0}`);

  await prisma.$disconnect();
  console.log(`\n✅ TRACE COMPLETE`);
}

main().catch((e) => {
  console.error("\n💥 UNHANDLED ERROR:", e);
  process.exit(1);
});
