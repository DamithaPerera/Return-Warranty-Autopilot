import { PrismaClient } from "@prisma/client";
import { loadDemoData } from "../lib/demo/load";

const prisma = new PrismaClient();

async function main() {
  await loadDemoData(prisma);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed complete.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
