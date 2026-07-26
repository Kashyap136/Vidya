import { prisma } from "@/config/prisma";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

// Add missing enum values directly via SQL
async function main() {
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TYPE "ProcessingStatus" ADD VALUE IF NOT EXISTS 'GENERATING_PLAN'`
    );
    console.log("✓ Added GENERATING_PLAN to ProcessingStatus enum");
  } catch (e) {
    console.log("GENERATING_PLAN may already exist:", (e as Error).message);
  }

  try {
    await prisma.$executeRawUnsafe(
      `ALTER TYPE "ProcessingStatus" ADD VALUE IF NOT EXISTS 'GENERATING_QUIZ'`
    );
    console.log("✓ Added GENERATING_QUIZ to ProcessingStatus enum");
  } catch (e) {
    console.log("GENERATING_QUIZ may already exist:", (e as Error).message);
  }

  // Verify
  const rows = await prisma.$queryRawUnsafe(
    `SELECT unnest(enum_range(NULL::"ProcessingStatus")) as status`
  );
  console.log("\nUpdated processing statuses:");
  for (const r of rows as { status: string }[]) {
    console.log("  " + r.status);
  }

  await prisma.$disconnect();
}

main();
