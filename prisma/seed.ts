import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { hash } from "argon2";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ?? "",
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const ADMIN_ID = "11111111-1111-1111-1111-111111111111";
const STUDENT_ID = "22222222-2222-2222-2222-222222222222";
const SYLLABUS_ID = "33333333-3333-3333-3333-333333333333";

async function main() {
  console.log("Seeding database...");

  const password = await hash("password123");

  const admin = await prisma.user.upsert({
    where: { email: "admin@vidya.local" },
    update: {},
    create: {
      id: ADMIN_ID,
      email: "admin@vidya.local",
      name: "Admin User",
      role: "ADMIN",
      password,
      emailVerified: new Date(),
    },
  });

  const student = await prisma.user.upsert({
    where: { email: "student@vidya.local" },
    update: {},
    create: {
      id: STUDENT_ID,
      email: "student@vidya.local",
      name: "Student User",
      role: "STUDENT",
      password,
      emailVerified: new Date(),
    },
  });

  const syllabus = await prisma.syllabus.upsert({
    where: {
      userId_title: { userId: STUDENT_ID, title: "Introduction to Computer Science" },
    },
    update: {},
    create: {
      id: SYLLABUS_ID,
      title: "Introduction to Computer Science",
      rawText: "This course covers the fundamentals of computer science including algorithms, data structures, and programming concepts.",
      processingStatus: "COMPLETED",
      filePath: `${STUDENT_ID}/syllabi/2026/sample_syllabus.pdf`,
      pageCount: 10,
      userId: STUDENT_ID,
    },
  });

  const topics = [
    { title: "Algorithms and Complexity", summary: "Study of algorithm design and analysis", priority: "HIGH" as const, difficulty: "INTERMEDIATE" as const, order: 1, estimatedMinutes: 120 },
    { title: "Data Structures", summary: "Arrays, linked lists, trees, and graphs", priority: "HIGH" as const, difficulty: "INTERMEDIATE" as const, order: 2, estimatedMinutes: 150 },
    { title: "Programming Paradigms", summary: "Object-oriented, functional, and procedural programming", priority: "MEDIUM" as const, difficulty: "BEGINNER" as const, order: 3, estimatedMinutes: 90 },
  ];

  for (const topic of topics) {
    await prisma.topic.upsert({
      where: {
        id: `topic-${topic.order}-${SYLLABUS_ID}`,
      },
      update: {},
      create: {
        id: `topic-${topic.order}-${SYLLABUS_ID}`,
        ...topic,
        syllabusId: SYLLABUS_ID,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`  Admin:    admin@vidya.local / password123`);
  console.log(`  Student:  student@vidya.local / password123`);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
