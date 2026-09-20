import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowRight,
  CheckCheck,
  Heart,
  MessageCircle,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { funded, money, pendingExpenses, spent } from "@shared/domain";
import { usePact } from "../state";
import { ExpenseDetail } from "../components/expense-detail";
import { ExpenseList } from "../components/expense-list";
import { TopUpDialog } from "../components/top-up";

export function Family() {
  const { state, role, profile, demo, connected } = usePact();
  const [selected, setSelected] = useState<string | null>(null);
  const [tab, setTab] = useState("pending");
  const [topUp, setTopUp] = useState(false);
  const pending = pendingExpenses(state);
  const reviewed = state.expenses.filter(
    (e) => e.flags.length && e.acknowledged,
  );
  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <h1>Money talk. With a little heart.</h1>
          <p>
            {role === "owner"
              ? "The things you share, and the understanding you build."
              : "Start with their story. Keep the conversation open."}
          </p>
        </div>
        {role === "supporter" && (
          <button className="button primary" onClick={() => setTopUp(true)}>
            <Plus size={18} />
            Record top-up
          </button>
        )}
      </header>
      <div className="family-grid">
        <div>
          <section className="family-connection">
            <div className="family-avatars">
              <span className="avatar owner">{profile.owner.slice(0, 1)}</span>
              <span className="connection-line">
                <Heart size={16} />
              </span>
              <span className="avatar supporter">
                {profile.supporter.slice(0, 1)}
              </span>
            </div>
            <h2>
              {profile.owner} & {profile.supporter}
            </h2>
            <p>
              A little independence. A little understanding.
              <br />
              {profile.relationship} & wallet owner ·{" "}
              {connected ? "Connected" : "Waiting to connect"}
            </p>
            <div className="connection-stats">
              <span>
                <strong>{money(funded(state))}</strong>
                <small>From {profile.supporter}</small>
              </span>
              <span>
                <strong>{money(spent(state))}</strong>
                <small>Recorded</small>
              </span>
              <span>
                <strong>{money(funded(state) - spent(state))}</strong>
                <small>Remaining</small>
              </span>
            </div>
          </section>
          <section className="sharing-panel">
            <ShieldCheck size={23} />
            <h3>Here’s what you share.</h3>
            <p>
              Recorded amounts, categories and notes are visible to both of you.
              {profile.owner} chooses whether to include each receipt or photo.
            </p>
            <p>
              Nothing is sent to email or WhatsApp. Check-ins stay here, in your
              Together view.
            </p>
            <Link to="/pact" className="text-link">
              Read your pact <ArrowRight size={15} />
            </Link>
          </section>
        </div>
        <div className="family-feed">
          {state.proposal && (
            <Link className="proposal-notification" to="/pact">
              <MessageCircle size={21} />
              <span>
                <strong>A change to your pact</strong>
                <small>
                  {profile[state.proposal.by]} has a suggestion. Take a look
                  together.
                </small>
              </span>
              <ArrowRight size={17} />
            </Link>
          )}
          <div className="section-heading">
            <h2>A little check-in</h2>
            <span className="count-label">{pending.length} to talk about</span>
          </div>
          <div className="filter-tabs">
            <button
              className={tab === "pending" ? "active" : ""}
              onClick={() => setTab("pending")}
            >
              To talk about <span>{pending.length}</span>
            </button>
            <button
              className={tab === "reviewed" ? "active" : ""}
              onClick={() => setTab("reviewed")}
            >
              Acknowledged <span>{reviewed.length}</span>
            </button>
          </div>
          {(tab === "pending" ? pending : reviewed).length > 0 ? (
            <ExpenseList
              expenses={tab === "pending" ? pending : reviewed}
              onSelect={(e) => setSelected(e.id)}
            />
          ) : (
            <div className="all-clear">
              <span>
                <CheckCheck size={32} />
              </span>
              <h3>
                {tab === "pending"
                  ? "All caught up."
                  : "Understanding, kept here."}
              </h3>
              <p>
                {tab === "pending"
                  ? "No expenses need a conversation right now. When something falls outside the plan, its story will appear here."
                  : `When ${profile.supporter} acknowledges an expense, you can find the reply here.`}
              </p>
              {role === "owner" && tab === "pending" && (
                <Link className="text-link" to="/expenses">
                  See your week <ArrowRight size={16} />
                </Link>
              )}
            </div>
          )}
          <section className="contributions">
            <div className="section-heading">
              <h2>A little support from {profile.supporter}</h2>
            </div>
            {[...state.contributions].reverse().map((entry) => (
              <div className="contribution-row" key={entry.id}>
                <span className="category-icon meals">
                  <ArrowDownLeft size={20} />
                </span>
                <div>
                  <strong>
                    {entry.id === "sample-funding"
                      ? "This week’s pocket money"
                      : "A little extra for the week"}
                  </strong>
                  <p>{entry.note || `From ${profile.supporter}, with care.`}</p>
                  <small>
                    {entry.id === "sample-funding"
                      ? "Sample funding"
                      : demo
                        ? "Demo top-up"
                        : "Recorded contribution"}{" "}
                    ·{" "}
                    {new Date(entry.at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </small>
                </div>
                <strong>+{money(entry.amount)}</strong>
              </div>
            ))}
          </section>
        </div>
      </div>
      {selected && (
        <ExpenseDetail id={selected} onClose={() => setSelected(null)} />
      )}
      {topUp && <TopUpDialog onClose={() => setTopUp(false)} />}
    </div>
  );
}
