export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Always positive; `type` decides whether it adds or subtracts. */
  amount: number;
  category: string;
  description: string;
  /** ISO date, YYYY-MM-DD */
  date: string;
}

/** The fields a user fills in; the id is set by the app. */
export type TransactionInput = Omit<Transaction, "id">;
