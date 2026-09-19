import { ChevronRight, MessageCircle, Paperclip } from "lucide-react";
import { categoryLabels, money, type Expense } from "@shared/domain";
import { CategoryIcon, Empty, Status } from "./ui";

export function ExpenseList({
  expenses,
  onSelect,
  compact = false,
}: {
  expenses: Expense[];
  onSelect: (expense: Expense) => void;
  compact?: boolean;
}) {
  if (!expenses.length)
    return (
      <Empty title="A clean page.">
        No expenses here yet. Your next little entry will show up here.
      </Empty>
    );
  return (
    <div className={`expense-list ${compact ? "compact" : ""}`}>
      {expenses.map((expense) => (
        <button
          className="expense-row"
          key={expense.id}
          onClick={() => onSelect(expense)}
        >
          <CategoryIcon category={expense.category} />
          <span className="expense-main">
            <strong>{expense.merchant}</strong>
            <small>
              {categoryLabels[expense.category]} <span>·</span>{" "}
              {new Date(`${expense.date}T12:00:00`).toLocaleDateString(
                "en-IN",
                { day: "numeric", month: "short" },
              )}
              {expense.note && (
                <MessageCircle size={12} aria-label="Has context" />
              )}
              {expense.receiptId && (
                <Paperclip size={12} aria-label="Has attachment" />
              )}
            </small>
          </span>
          <strong className="expense-amount">{money(expense.amount)}</strong>
          <Status expense={expense} />
          <ChevronRight className="expense-chevron" size={16} />
        </button>
      ))}
    </div>
  );
}
