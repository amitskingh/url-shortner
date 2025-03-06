import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config({ path: ".env.test" });

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

// afterEach(async () => {
//   // Clear database after each test
//   const tables = await prisma.$queryRaw<
//     { tablename: string }[]
//   >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

//   for (const { tablename } of tables) {
//     if (tablename !== "_prisma_migrations") {
//       await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
//     }
//   }
// });

afterAll(async () => {
  await prisma.$disconnect();
});

export { prisma };
