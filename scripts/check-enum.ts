import { prisma } from "@/config/prisma";

async function main() {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT unnest(enum_range(NULL::"ProcessingStatus")) as status`
  );
  console.log("Current DB processing statuses:");
  for (const r of rows as { status: string }[]) {
    console.log("  " + r.status);
  }
  await prisma.$disconnect();
}

main();
