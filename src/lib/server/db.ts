import { copyFile, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Budgets, Transaction } from "@/types/transaction";

/**
 * A tiny JSON-file database: data/db.json, created from data/seed.json on
 * first use. Fine for a local demo; swap for a real database in production.
 */
export interface Data {
  transactions: Transaction[];
  budgets: Budgets;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const SEED_FILE = path.join(DATA_DIR, "seed.json");

export async function readData(): Promise<Data> {
  try {
    return JSON.parse(await readFile(DB_FILE, "utf8")) as Data;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") throw err;
    await copyFile(SEED_FILE, DB_FILE);
    return JSON.parse(await readFile(DB_FILE, "utf8")) as Data;
  }
}

// Serialise writes so two requests can't interleave read-modify-write.
let queue: Promise<unknown> = Promise.resolve();

export function updateData<T>(change: (data: Data) => T | Promise<T>): Promise<T> {
  const run = queue.then(async () => {
    const data = await readData();
    const result = await change(data);
    // Write to a temp file then rename, so a crash never leaves half a file.
    const tmp = `${DB_FILE}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 2) + "\n");
    await rename(tmp, DB_FILE);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}

export async function resetData(): Promise<Data> {
  return updateData(async (data) => {
    const seed = JSON.parse(await readFile(SEED_FILE, "utf8")) as Data;
    data.transactions = seed.transactions;
    data.budgets = seed.budgets;
    return seed;
  });
}
