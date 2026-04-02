import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { beforeAll, afterAll } from 'vitest';

import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Unique DB per process to avoid race conditions and data leakage
const testDbName = `dev_test_${process.pid}.db`;
const testDbPath = path.resolve(__dirname, `../prisma/${testDbName}`);
process.env.DATABASE_URL = `file:${testDbPath}`;

console.log(`[Test Worker ${process.pid}] Using database: ${testDbPath}`);

// Ensure a clean state for this worker
if (fs.existsSync(testDbPath)) {
  fs.unlinkSync(testDbPath);
}

// Sync schema for this fresh DB
execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

export const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }
});
