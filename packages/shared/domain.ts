import { z } from "zod";

export const categories = [
  "meals",
  "commute",
  "study",
  "personal",
  "other",
] as const;
export type Category = (typeof categories)[number];
export type Role = "owner" | "supporter";
export const categoryLabels: Record<Category, string> = {
  meals: "Meals",
  commute: "Commute",
  study: "Study",
  personal: "Your choice",
  other: "Outside the pact",
};
export const categoryDescriptions: Record<Category, string> = {
  meals: "Mess, groceries & everyday meals",
  commute: "Bus, metro & getting to class",
  study: "Books, printing & college supplies",
  personal: "Coffee, outings & whatever you choose",
  other: "Something you haven’t planned for",
};
export const person = { owner: "Ananya", supporter: "Kunal" };
export const money = (paise: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);
export const amountSchema = z.number().int().min(1).max(10_000_000);
export const budgetsSchema = z.object({
  meals: z.number().int().min(0),
  commute: z.number().int().min(0),
  study: z.number().int().min(0),
  personal: z.number().int().min(0),
});
export type Budgets = z.infer<typeof budgetsSchema>;

export type Expense = {
  id: string;
  merchant: string;
  amount: number;
  category: Category;
  date: string;
  note: string;
  source: "manual" | "gemini" | "sample";
  evidence: "receipt" | "photo" | "none";
  receiptId?: string;
  shareReceipt: boolean;
  fastFood: boolean;
  flags: string[];
  acknowledged: boolean;
  reply: string;
  createdAt: string;
};
export type PactState = {
  version: number;
  weekStart: string;
  budgets: Budgets;
  pactVersion: number;
  fastFoodLimit: number | null;
  contributions: { id: string; amount: number; note: string; at: string }[];
  expenses: Expense[];
  proposal: {
    id: string;
    by: Role;
    budgets: Budgets;
    note: string;
    baseVersion: number;
    fastFoodLimit: number | null;
  } | null;
};

export const expenseSchema = z.object({
  id: z.string().uuid(),
  merchant: z.string().trim().min(1, "Add a name for this expense.").max(100),
  amount: amountSchema,
  category: z.enum(categories),
  date: z.string().date(),
  note: z.string().trim().max(600).default(""),
  source: z.enum(["manual", "gemini", "sample"]).default("manual"),
  evidence: z.enum(["receipt", "photo", "none"]).default("none"),
  receiptId: z.string().uuid().optional(),
  shareReceipt: z.boolean().default(false),
  fastFood: z.boolean().default(false),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;
export const actionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("add-expense"), expense: expenseSchema }),
  z.object({
    type: z.literal("add-context"),
    id: z.string(),
    note: z.string().trim().min(1).max(600),
  }),
  z.object({
    type: z.literal("acknowledge"),
    id: z.string(),
    reply: z.string().trim().max(600),
  }),
  z.object({
    type: z.literal("propose"),
    id: z.string().uuid(),
    budgets: budgetsSchema,
    note: z.string().trim().min(1).max(600),
    baseVersion: z.number().int(),
    fastFoodLimit: z.number().int().min(0).max(21).nullable(),
  }),
  z.object({ type: z.literal("accept-pact"), id: z.string() }),
  z.object({ type: z.literal("dismiss-pact"), id: z.string() }),
  z.object({
    type: z.literal("top-up"),
    id: z.string().uuid(),
    amount: amountSchema,
    note: z.string().trim().max(200),
  }),
]);
export type PactAction = z.infer<typeof actionSchema>;
export const totalBudget = (budgets: Budgets) =>
  Object.values(budgets).reduce((sum, value) => sum + value, 0);
export const funded = (state: PactState) =>
  state.contributions.reduce((sum, entry) => sum + entry.amount, 0);
export const spent = (state: PactState) =>
  state.expenses.reduce((sum, entry) => sum + entry.amount, 0);
export const categorySpent = (state: PactState, category: Category) =>
  state.expenses
    .filter((entry) => entry.category === category)
    .reduce((sum, entry) => sum + entry.amount, 0);
export const pendingExpenses = (state: PactState) =>
  state.expenses.filter((entry) => entry.flags.length && !entry.acknowledged);

export function weekBounds(date = new Date()) {
  const local = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  );
  local.setHours(12, 0, 0, 0);
  local.setDate(local.getDate() - ((local.getDay() + 6) % 7));
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, "0")}-${String(local.getDate()).padStart(2, "0")}`;
}
export function weekEnd(start: string) {
  const d = new Date(`${start}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 6);
  return d.toISOString().slice(0, 10);
}
export function weekLabel(start: string) {
  const a = new Date(`${start}T12:00:00Z`);
  const b = new Date(`${weekEnd(start)}T12:00:00Z`);
  const first = a.toLocaleDateString("en-IN", {
    day: "numeric",
    ...(a.getUTCMonth() !== b.getUTCMonth() ? { month: "short" as const } : {}),
  });
  return `${first}–${b.toLocaleDateString("en-IN", { day: "numeric", month: "long" })}`;
}
export function seedState(now = new Date()): PactState {
  const start = weekBounds(now);
  const samples: [string, number, Category][] = [
    ["Campus mess", 12000, "meals"],
    ["Auto to college", 6000, "commute"],
    ["Campus print shop", 12000, "study"],
    ["Chai & Co.", 12000, "personal"],
  ];
  return {
    version: 1,
    weekStart: start,
    budgets: { meals: 45000, commute: 20000, study: 20000, personal: 15000 },
    pactVersion: 1,
    fastFoodLimit: 2,
    proposal: null,
    contributions: [
      {
        id: "sample-funding",
        amount: 100000,
        note: "For your week. Make it a good one! — Dad",
        at: `${start}T08:00:00Z`,
      },
    ],
    expenses: samples.map(([merchant, amount, category], index) => ({
      id: `sample-${index}`,
      merchant,
      amount,
      category,
      date: start,
      note: "",
      source: "sample",
      evidence: "none",
      shareReceipt: false,
      fastFood: false,
      flags: [],
      acknowledged: false,
      reply: "",
      createdAt: `${start}T${10 + index}:00:00Z`,
    })),
  };
}

export function reviewExpense(
  state: PactState,
  expense: Pick<ExpenseInput, "amount" | "category"> & { fastFood?: boolean },
): string[] {
  const flags: string[] = [];
  if (expense.category === "other")
    flags.push("This category is outside your agreed plan.");
  else {
    const limit = state.budgets[expense.category];
    const after = categorySpent(state, expense.category) + expense.amount;
    if (after > limit)
      flags.push(
        `${categoryLabels[expense.category]} would be ${money(after - limit)} over the ${money(limit)} weekly plan.`,
      );
  }
  if (spent(state) + expense.amount > funded(state))
    flags.push(
      `Recorded spending would exceed this week’s funds by ${money(spent(state) + expense.amount - funded(state))}.`,
    );
  if (
    expense.fastFood &&
    state.fastFoodLimit !== null &&
    state.expenses.filter((e) => e.fastFood).length >= state.fastFoodLimit
  )
    flags.push(
      `This is above your agreed ${state.fastFoodLimit} fast-food meals this week. Add context for your supporter.`,
    );
  return flags;
}

export function applyAction(
  current: PactState,
  raw: unknown,
  role: Role,
  now = new Date(),
): PactState {
  const action = actionSchema.parse(raw);
  const state = structuredClone(current);
  if (action.type === "add-expense") {
    if (role !== "owner")
      throw new Error("Only the wallet owner can record expenses.");
    if (state.expenses.some((e) => e.id === action.expense.id)) return current;
    if (
      action.expense.date < state.weekStart ||
      action.expense.date > weekEnd(state.weekStart)
    )
      throw new Error("Choose a date within this week’s pact.");
    state.expenses.unshift({
      ...action.expense,
      flags: reviewExpense(state, action.expense),
      acknowledged: false,
      reply: "",
      createdAt: now.toISOString(),
    });
  } else if (action.type === "add-context" || action.type === "acknowledge") {
    const expense = state.expenses.find((e) => e.id === action.id);
    if (!expense) throw new Error("Expense not found.");
    if (action.type === "add-context") {
      if (role !== "owner")
        throw new Error("Only the wallet owner can add context.");
      expense.note = action.note;
      if (expense.flags.length) expense.acknowledged = false;
    } else {
      if (role !== "supporter")
        throw new Error("Only a supporter can acknowledge an expense.");
      if (!expense.flags.length)
        throw new Error("This expense does not need a review.");
      expense.acknowledged = true;
      expense.reply = action.reply;
    }
  } else if (action.type === "propose") {
    if (action.baseVersion !== state.pactVersion)
      throw new Error("The pact changed. Refresh and try again.");
    if (state.proposal)
      throw new Error("There is already a proposal to review.");
    if (totalBudget(action.budgets) !== totalBudget(state.budgets))
      throw new Error(
        "Keep the total weekly plan unchanged when moving money between categories.",
      );
    state.proposal = {
      id: action.id,
      by: role,
      budgets: action.budgets,
      note: action.note,
      baseVersion: state.pactVersion,
      fastFoodLimit: action.fastFoodLimit,
    };
  } else if (action.type === "accept-pact" || action.type === "dismiss-pact") {
    if (!state.proposal || state.proposal.id !== action.id)
      throw new Error("This proposal is no longer pending.");
    if (action.type === "accept-pact") {
      if (state.proposal.by === role)
        throw new Error("The other person needs to accept this change.");
      if (state.proposal.baseVersion !== state.pactVersion)
        throw new Error("The pact has changed. Make a fresh proposal.");
      state.budgets = state.proposal.budgets;
      state.fastFoodLimit = state.proposal.fastFoodLimit;
      state.pactVersion += 1;
    }
    state.proposal = null;
  } else if (action.type === "top-up") {
    if (role !== "supporter")
      throw new Error("Only a supporter can record a contribution.");
    if (state.contributions.some((e) => e.id === action.id)) return current;
    state.contributions.push({
      id: action.id,
      amount: action.amount,
      note: action.note,
      at: now.toISOString(),
    });
  }
  state.version += 1;
  return state;
}
