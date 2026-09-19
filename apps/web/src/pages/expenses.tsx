import { useState } from "react";
import { Download, Plus, Search } from "lucide-react";
import {
  categories,
  categoryLabels,
  money,
  spent,
  type Category,
} from "@shared/domain";
import { usePact } from "../state";
import { ExpenseList } from "../components/expense-list";
import { ExpenseDetail } from "../components/expense-detail";

export function Expenses() {
  const { state, role, openCapture } = usePact();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category | "all">("all");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<string | null>(null);
  const filtered = state.expenses.filter(
    (e) =>
      (category === "all" || e.category === category) &&
      (status === "all" ||
        (status === "pending"
          ? e.flags.length && !e.acknowledged
          : !e.flags.length || e.acknowledged)) &&
      `${e.merchant} ${e.note} ${categoryLabels[e.category]}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  function download() {
    const escape = (text: string) =>
      `"${text.replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
    const rows = [
      ["Date", "Expense", "Category", "Amount INR", "Status", "Context"],
      ...filtered.map((e) => [
        e.date,
        e.merchant,
        categoryLabels[e.category],
        (e.amount / 100).toFixed(2),
        e.flags.length
          ? e.acknowledged
            ? "Acknowledged"
            : "Needs a conversation"
          : "Within plan",
        e.note,
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob([rows.map((row) => row.map(escape).join(",")).join("\n")], {
        type: "text/csv;charset=utf-8",
      }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "pocket-pact-expenses.csv";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <h1>Little entries. The whole picture.</h1>
          <p>
            {role === "daughter"
              ? "Everything you’ve recorded, with your side of the story."
              : "Ananya’s week, in her own words."}
          </p>
        </div>
        {role === "daughter" && (
          <button
            className="button primary"
            onClick={() => openCapture("manual")}
          >
            <Plus size={18} />
            Add expense
          </button>
        )}
      </header>
      <div className="ledger-summary">
        <span>
          <strong>{money(spent(state))}</strong>
          <small>recorded this week</small>
        </span>
        <span>
          <strong>{state.expenses.length}</strong>
          <small>little moments</small>
        </span>
        <button className="text-button" onClick={download}>
          <Download size={17} />
          Download CSV
        </button>
      </div>
      <div className="ledger-toolbar">
        <label className="search-field">
          <Search size={18} />
          <input
            aria-label="Search expenses"
            placeholder="Find an expense or a note…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter expense status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All expenses</option>
          <option value="pending">Needs a conversation</option>
          <option value="settled">Within plan & acknowledged</option>
        </select>
      </div>
      <div className="filter-tabs" aria-label="Filter by category">
        {(["all", ...categories] as const).map((key) => (
          <button
            key={key}
            className={category === key ? "active" : ""}
            aria-pressed={category === key}
            onClick={() => setCategory(key)}
          >
            {key === "all" ? "Everything" : categoryLabels[key]}
          </button>
        ))}
      </div>
      <div className="ledger-list">
        <ExpenseList expenses={filtered} onSelect={(e) => setSelected(e.id)} />
      </div>
      <p className="ledger-count">
        {filtered.length} of {state.expenses.length} expenses · Amounts are
        recorded by Ananya.
      </p>
      {selected && (
        <ExpenseDetail id={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
