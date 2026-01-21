import { execSync } from "child_process";
import prisma from "../lib/prisma";

beforeAll(() => {
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL
    }
  })
})

afterEach(async () => {
  await prisma.historicoStatus.deleteMany();
  await prisma.amostra.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});