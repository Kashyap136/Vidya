import { prisma } from "../src/config/prisma";

async function main() {
  const users = await prisma.user.findMany({ take: 5, select: { id: true, email: true, name: true } });
  console.log("Users:", JSON.stringify(users, null, 2));
  if (users.length > 0) {
    console.log("\nFirst user ID:", users[0].id);
  } else {
    console.log("No users found. Register an account first.");
  }
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
