import { useState } from "react";
import {
  ArrowRight,
  Check,
  Handshake,
  LockKeyhole,
  PencilLine,
} from "lucide-react";
import {
  categoryDescriptions,
  categoryLabels,
  categorySpent,
  money,
  totalBudget,
  weekLabel,
  type Budgets,
} from "@shared/domain";
import { usePact } from "../state";
import { CategoryIcon, ErrorMessage, Modal } from "../components/ui";

export function Pact() {
  const { state, role, act, busy, profile } = usePact();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  async function decide(accept: boolean) {
    if (!state.proposal) return;
    try {
      await act(
        {
          type: accept ? "accept-pact" : "dismiss-pact",
          id: state.proposal.id,
        },
        accept
          ? "Your new pact is agreed. Future expenses use the new limits."
          : "Proposal closed. Your current pact stays in place.",
      );
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <div className="page">
      <header className="page-heading">
        <div>
          <h1>On the same page.</h1>
          <p>A plan you made together. Room to change it together, too.</p>
        </div>
        <button
          className="button secondary"
          onClick={() => setEditing(true)}
          disabled={!!state.proposal}
        >
          <PencilLine size={17} />
          Suggest a change
        </button>
      </header>
      <div className="agreement-banner">
        <span className="agreement-icon">
          <Handshake size={30} />
        </span>
        <div>
          <h2>{money(totalBudget(state.budgets))}, a week of possibilities.</h2>
          <p>
            {weekLabel(state.weekStart)} · Shared by {profile.owner} and{" "}
            {profile.supporter}
          </p>
        </div>
        <span className="status okay">
          <Check size={13} /> Our agreement
        </span>
      </div>
      {state.proposal && (
        <section className="proposal-panel">
          <div className="section-heading">
            <h2>{profile[state.proposal.by]} suggested a little reshuffle.</h2>
            <span className="status review">
              Waiting for{" "}
              {profile[state.proposal.by === "owner" ? "supporter" : "owner"]}
            </span>
          </div>
          <p>“{state.proposal.note}”</p>
          <div className="proposal-diff">
            {Object.entries(state.proposal.budgets)
              .filter(
                ([key, value]) => value !== state.budgets[key as keyof Budgets],
              )
              .map(([key, value]) => (
                <div key={key}>
                  <span>{categoryLabels[key as keyof Budgets]}</span>
                  <span>
                    {money(state.budgets[key as keyof Budgets])}
                    <ArrowRight size={14} />
                    <strong>{money(value)}</strong>
                  </span>
                </div>
              ))}
          </div>
          <p>
            Fast-food preference:{" "}
            {state.proposal.fastFoodLimit === null
              ? "No weekly limit"
              : `${state.proposal.fastFoodLimit} meals per week`}
          </p>
          <div className="proposal-actions">
            <button
              className="button secondary"
              disabled={busy}
              onClick={() => void decide(false)}
            >
              {state.proposal.by === role
                ? "Withdraw proposal"
                : "Keep our current plan"}
            </button>
            {state.proposal.by !== role && (
              <button
                className="button primary"
                disabled={busy}
                onClick={() => void decide(true)}
              >
                <Check size={16} />
                Agree to this change
              </button>
            )}
          </div>
        </section>
      )}
      <ErrorMessage message={error} />
      <section className="budget-table" aria-label="Agreed category budgets">
        <div className="budget-table-heading">
          <span>What your week makes room for</span>
          <span>Spent / planned</span>
        </div>
        {Object.entries(state.budgets).map(([key, limit]) => {
          const category = key as keyof Budgets;
          const used = categorySpent(state, category);
          return (
            <div className="budget-row" key={key}>
              <CategoryIcon category={category} />
              <div className="budget-description">
                <h3>{categoryLabels[category]}</h3>
                <p>{categoryDescriptions[category]}</p>
              </div>
              <div className="budget-progress">
                <div>
                  <span>
                    {money(used)} <small>/ {money(limit)}</small>
                  </span>
                  <strong className={used > limit ? "over" : ""}>
                    {used > limit
                      ? `${money(used - limit)} over`
                      : `${money(limit - used)} left`}
                  </strong>
                </div>
                <div className="mini-progress">
                  <span
                    className={`${category} ${used > limit ? "over" : ""}`}
                    style={{
                      width: `${Math.min(100, (used / Math.max(limit, 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </section>
      <section className="food-preference">
        <h2>Room for your food preferences.</h2>
        <p>
          {state.fastFoodLimit === null
            ? "No fast-food limit in your agreement."
            : `Your shared preference: up to ${state.fastFoodLimit} fast-food meals a week.`}{" "}
          Suggestions from photos are confirmed by the owner. A flag starts a
          conversation; it never blocks spending.
        </p>
      </section>
      <div className="pact-principles">
        <div>
          <LockKeyhole size={23} />
          <h3>Your money stays yours.</h3>
          <p>
            This pact helps you plan. It cannot freeze a balance, stop a
            purchase or move money.
          </p>
        </div>
        <div>
          <Handshake size={24} />
          <h3>Changes take two.</h3>
          <p>
            Either of you can suggest a change. It only becomes the new plan
            when the other agrees.
          </p>
        </div>
        <div>
          <PencilLine size={23} />
          <h3>Context comes with it.</h3>
          <p>
            Unexpected expenses happen. A note helps turn an exception into a
            conversation.
          </p>
        </div>
      </div>
      <p className="subtle-note">
        Changes apply to future entries. Earlier flags stay as a record of the
        plan at that time.
      </p>
      {editing && <PactEditor onClose={() => setEditing(false)} />}
    </div>
  );
}
function PactEditor({ onClose }: { onClose: () => void }) {
  const { state, act, busy } = usePact();
  const [values, setValues] = useState<Record<keyof Budgets, string>>({
    meals: String(state.budgets.meals / 100),
    commute: String(state.budgets.commute / 100),
    study: String(state.budgets.study / 100),
    personal: String(state.budgets.personal / 100),
  });
  const [note, setNote] = useState("");
  const [fastFoodLimit, setFastFoodLimit] = useState(
    state.fastFoodLimit === null ? "" : String(state.fastFoodLimit),
  );
  const [error, setError] = useState("");
  const budgets = Object.fromEntries(
    Object.entries(values).map(([key, value]) => [
      key,
      Math.round(Number(value || 0) * 100),
    ]),
  ) as Budgets;
  const difference = totalBudget(budgets) - totalBudget(state.budgets);
  async function save() {
    try {
      await act(
        {
          type: "propose",
          id: crypto.randomUUID(),
          budgets,
          note,
          baseVersion: state.pactVersion,
          fastFoodLimit: fastFoodLimit === "" ? null : Number(fastFoodLimit),
        },
        "Proposal shared. Your current plan stays until you both agree.",
      );
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Modal title="Make room for what’s next." onClose={onClose}>
      <p className="modal-intro">
        Move money between categories. Keep the total at{" "}
        {money(totalBudget(state.budgets))}, and tell each other why.
      </p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="form-grid">
          {Object.entries(values).map(([key, value]) => (
            <label className="field" key={key}>
              {categoryLabels[key as keyof Budgets]} (₹)
              <input
                type="number"
                min="0"
                max={totalBudget(state.budgets) / 100}
                step="0.01"
                value={value}
                required
                onChange={(e) =>
                  setValues({ ...values, [key]: e.target.value })
                }
              />
            </label>
          ))}
        </div>
        <div className={`plan-total ${difference !== 0 ? "unbalanced" : ""}`}>
          <span>Weekly total</span>
          <strong>{money(totalBudget(budgets))}</strong>
        </div>
        {difference !== 0 && (
          <p className="form-error">
            {difference > 0 ? "Reduce" : "Add"} {money(Math.abs(difference))} to
            keep the same weekly total.
          </p>
        )}
        <label className="field">
          Fast-food meals per week (optional)
          <input
            type="number"
            min="0"
            max="21"
            step="1"
            value={fastFoodLimit}
            onChange={(e) => setFastFoodLimit(e.target.value)}
            placeholder="No limit"
          />
          <small>Leave blank for no limit. The other person must agree.</small>
        </label>
        <label className="field">
          What’s changing this week?
          <textarea
            rows={3}
            value={note}
            maxLength={600}
            required
            onChange={(e) => setNote(e.target.value)}
            placeholder="I need an extra lab manual, so I’ll spend a little less on coffee."
          />
        </label>
        <ErrorMessage message={error} />
        <div className="modal-actions">
          <button className="button secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="button primary"
            disabled={busy || difference !== 0}
          >
            Share proposal <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
