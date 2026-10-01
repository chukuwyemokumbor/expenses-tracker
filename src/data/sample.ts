import type { Transaction } from "@/types/transaction";

/** Small deterministic PRNG so the sample data is the same on every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const MONTHS: [year: number, month: number, days: number][] = [
  [2024, 11, 30],
  [2024, 12, 31],
  [2025, 1, 31],
];

const GROCERY_STORES = ["Trader Joe's", "Whole Foods", "Farmers market", "Costco"];
const RESTAURANTS = ["Thai Basil", "Pizza night", "Coffee with Sam", "Sushi Zen", "Taco Tuesday", "Brunch"];
const FUN = ["Movie tickets", "Concert", "Streaming subscription", "Bowling", "Museum"];
const SHOPS = ["New running shoes", "Books", "Winter jacket", "Kitchen supplies", "Gift for mom"];

export function createSampleTransactions(): Transaction[] {
  const rand = mulberry32(2025);
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)];
  const money = (min: number, max: number) => Math.round((min + rand() * (max - min)) * 100) / 100;
  const list: Transaction[] = [];

  for (const [year, month, days] of MONTHS) {
    const date = (day: number) => `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const add = (t: Omit<Transaction, "id">) => list.push({ ...t, id: `sample-${list.length + 1}` });

    add({ type: "income", amount: 3200, category: "Salary", description: "Monthly salary", date: date(1) });
    add({ type: "expense", amount: 1250, category: "Housing", description: "Rent", date: date(1) });
    add({ type: "expense", amount: money(95, 140), category: "Utilities", description: "Electricity & water", date: date(14) });
    add({ type: "expense", amount: 59.99, category: "Utilities", description: "Internet", date: date(18) });
    add({ type: "expense", amount: 45, category: "Health", description: "Gym membership", date: date(5) });
    if (rand() < 0.7) {
      add({ type: "income", amount: money(300, 900), category: "Freelance", description: "Website project", date: date(20) });
    }
    if (month === 12) {
      add({ type: "income", amount: 150, category: "Gifts", description: "Holiday gift", date: date(25) });
      add({ type: "expense", amount: money(180, 260), category: "Shopping", description: "Holiday presents", date: date(19) });
    }
    for (let day = 3; day <= days; day += 7) {
      add({ type: "expense", amount: money(55, 115), category: "Groceries", description: pick(GROCERY_STORES), date: date(day) });
    }
    for (let i = 0; i < 6; i++) {
      add({ type: "expense", amount: money(2.75, 32), category: "Transport", description: rand() < 0.6 ? "Metro card top-up" : "Ride share", date: date(1 + Math.floor(rand() * days)) });
    }
    for (let i = 0; i < 4; i++) {
      add({ type: "expense", amount: money(14, 68), category: "Dining out", description: pick(RESTAURANTS), date: date(1 + Math.floor(rand() * days)) });
    }
    for (let i = 0; i < 2; i++) {
      add({ type: "expense", amount: money(10, 75), category: "Entertainment", description: pick(FUN), date: date(1 + Math.floor(rand() * days)) });
    }
    if (rand() < 0.6) {
      add({ type: "expense", amount: money(25, 120), category: "Shopping", description: pick(SHOPS), date: date(1 + Math.floor(rand() * days)) });
    }
  }

  return list;
}
