import {
  ArrowDownLeft,
  ArrowRight,
  Camera,
  Heart,
  Leaf,
  MessageCircle,
  Mic,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  categoryLabels,
  categorySpent,
  funded,
  money,
  pendingExpenses,
  spent,
  weekLabel,
  type Budgets,
} from "@shared/domain";
import { usePact } from "../state";
import { categoryIcons } from "../components/ui";
import { ExpenseList } from "../components/expense-list";
import { ExpenseDetail } from "../components/expense-detail";
import { TopUpDialog } from "../components/top-up";

export function Overview() {
  const { state, role, openCapture, profile } = usePact();
  const [selected, setSelected] = useState<string | null>(null);
  const [topUp, setTopUp] = useState(false);
  const total = funded(state);
  const used = spent(state);
  const remaining = total - used;
  const pending = pendingExpenses(state);
  return (
    <div className="page overview-page">
      <header className="page-heading">
        <div>
          <h1>
            {role === "owner"
              ? "Your week. Your way."
              : `A little closer to ${profile.owner}’s week.`}
          </h1>
          <p>
            {role === "owner"
              ? `Your week, your choices. A little support from ${profile.supporter}.`
              : "A shared picture of the week. Space to make their own choices."}
          </p>
        </div>
        <button
          className="button primary"
          onClick={() =>
            role === "owner" ? openCapture("manual") : setTopUp(true)
          }
        >
          <Plus size={19} />
          {role === "owner" ? "Add expense" : "Record top-up"}
        </button>
      </header>
      <div className="overview-grid">
        <div className="overview-main">
          <section
            className={`balance-panel ${remaining < 0 ? "over-budget" : ""}`}
            aria-label="Weekly balance"
          >
            <div className="balance-label">
              <span>
                {remaining >= 0 ? "Left this week" : "Over this week’s funds"}
              </span>
              <span className="balance-motif">
                <ArrowDownLeft size={20} />
              </span>
            </div>
            <div className="balance-number">{money(Math.abs(remaining))}</div>
            <p className="balance-subtitle">
              of {money(total)} from {profile.supporter}
            </p>
            <div
              className="spending-bar"
              role="meter"
              aria-label="Weekly budget spent"
              aria-valuenow={used / 100}
              aria-valuemin={0}
              aria-valuemax={Math.max(total, used) / 100}
            >
              {(
                ["meals", "commute", "study", "personal", "other"] as const
              ).map((category) => (
                <span
                  key={category}
                  className={category}
                  style={{
                    width: `${(categorySpent(state, category) / Math.max(total, used, 1)) * 100}%`,
                  }}
                />
              ))}
            </div>
            <div className="balance-foot">
              <span>{money(used)} spent</span>
              <span>{weekLabel(state.weekStart)}</span>
            </div>
          </section>
          <section className="recent-section">
            <div className="section-heading">
              <h2>Recent expenses</h2>
              <Link className="text-link" to="/expenses">
                View all <ArrowRight size={16} />
              </Link>
            </div>
            <ExpenseList
              expenses={state.expenses.slice(0, 4)}
              onSelect={(expense) => setSelected(expense.id)}
              compact
            />
          </section>
        </div>
        <aside className="overview-aside">
          <section className="pact-summary">
            <h2>
              {role === "owner"
                ? `Your pact with ${profile.supporter}`
                : `Your pact with ${profile.owner}`}
            </h2>
            <p>A plan you made together.</p>
            <div className="pact-mini-list">
              {Object.entries(state.budgets).map(([key, value]) => {
                const category = key as keyof Budgets;
                const Icon = categoryIcons[category];
                return (
                  <div key={key}>
                    <Icon size={21} />
                    <span>{categoryLabels[category]}</span>
                    <strong>{money(value)}</strong>
                  </div>
                );
              })}
            </div>
            <Link className="text-link" to="/pact">
              See our agreement <ArrowRight size={17} />
            </Link>
          </section>
          {pending.length ? (
            <section className="context-panel has-review">
              <MessageCircle size={23} />
              <h2>A little check-in.</h2>
              <p>
                {pending.length}{" "}
                {pending.length === 1 ? "expense needs" : "expenses need"} a
                conversation.{" "}
                {role === "owner"
                  ? "Your context is part of the story."
                  : `Start with ${profile.owner}’s side of the story.`}
              </p>
              <Link className="text-link" to="/family">
                {role === "owner" ? "See what’s shared" : "Open your inbox"}{" "}
                <ArrowRight size={16} />
              </Link>
            </section>
          ) : (
            <section className="context-panel">
              <h2>Room for real life.</h2>
              <p>
                An unexpected cab. A book you needed. Add a little context, and
                work it out together.
              </p>
              <Leaf className="context-leaf" size={40} strokeWidth={1.2} />
            </section>
          )}
        </aside>
      </div>
      {role === "owner" ? (
        <section className="capture-strip">
          <span className="capture-symbol">
            <Camera size={28} />
          </span>
          <div>
            <h2>A receipt, a photo, or a few words.</h2>
            <p>Log it your way. Review it before you share.</p>
          </div>
          <div className="capture-actions">
            <button
              className="button primary"
              onClick={() => openCapture("photo")}
            >
              Upload receipt
            </button>
            <button
              className="button secondary"
              onClick={() => openCapture("voice")}
            >
              <Mic size={16} />
              Say it instead
            </button>
          </div>
        </section>
      ) : (
        <section className="capture-strip supporter-strip">
          <span className="capture-symbol">
            <Heart size={27} />
          </span>
          <div>
            <h2>Support, with space to grow.</h2>
            <p>
              {profile.owner} makes the choices. Your pact keeps the
              conversation open.
            </p>
          </div>
          <Link to="/family" className="text-link">
            Check in together <ArrowRight size={17} />
          </Link>
        </section>
      )}
      {selected && (
        <ExpenseDetail id={selected} onClose={() => setSelected(null)} />
      )}
      {topUp && <TopUpDialog onClose={() => setTopUp(false)} />}
    </div>
  );
}
