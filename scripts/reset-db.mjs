// Restores data/db.json from data/seed.json (the sample transactions and budgets).
import { copyFileSync } from "node:fs";

copyFileSync(new URL("../data/seed.json", import.meta.url), new URL("../data/db.json", import.meta.url));
console.log("data/db.json restored from data/seed.json");
