import { expect, it } from "vitest";
import { authorized } from "./policy";
it("Cedar grants only matching wallet roles and denies unknown actions by default", () => {
  expect(authorized("owner", "a", "a", "add-expense")).toBe(true);
  expect(authorized("supporter", "a", "a", "add-expense")).toBe(false);
  expect(authorized("owner", "a", "b", "add-expense")).toBe(false);
  expect(authorized("supporter", "a", "a", "top-up")).toBe(true);
  expect(authorized("owner", "a", "a", "acknowledge")).toBe(false);
  expect(authorized("owner", "a", "a", "accept-pact")).toBe(true);
  expect(authorized("supporter", "a", "a", "accept-pact")).toBe(true);
  expect(authorized("owner", "a", "a", "withdraw-money")).toBe(false);
});
