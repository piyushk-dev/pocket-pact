import type { PactState, Role } from "./domain";
export type WalletProfile = {
  title: string;
  owner: string;
  supporter: string;
  relationship: "Parent" | "Guardian" | "Mentor" | "Other";
};
export type SessionState = {
  state: PactState;
  role: Role;
  demo: boolean;
  profile: WalletProfile;
  account: { name: string; username: string } | null;
  wallets: { id: string; title: string; role: Role }[];
  walletId: string;
  connected: boolean;
};
export type MonthlyReport = {
  month: string;
  spent: number;
  funded: number;
  expenses: number;
  flagged: number;
  acknowledged: number;
  fastFood: number;
  categories: { category: string; amount: number }[];
  weeks: { week: string; amount: number }[];
};
