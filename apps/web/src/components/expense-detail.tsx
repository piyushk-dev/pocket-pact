import { useState } from "react";
import { Check, MessageCircle, ShieldCheck } from "lucide-react";
import { categoryLabels, money } from "@shared/domain";
import { usePact } from "../state";
import { CategoryIcon, ErrorMessage, Modal, Status } from "./ui";

export function ExpenseDetail({
  id,
  onClose,
}: {
  id: string;
  onClose: () => void;
}) {
  const { state, role, act, busy, profile } = usePact();
  const expense = state.expenses.find((e) => e.id === id)!;
  const [note, setNote] = useState(role === "owner" ? expense.note : "");
  const [error, setError] = useState("");
  async function save() {
    setError("");
    try {
      await act(
        role === "owner"
          ? { type: "add-context", id, note }
          : { type: "acknowledge", id, reply: note },
        role === "owner"
          ? `Your context is shared with ${profile.supporter}.`
          : `${profile.owner} can see your acknowledgement.`,
      );
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Modal title="The story behind it" onClose={onClose}>
      <div className="detail-heading">
        <CategoryIcon category={expense.category} />
        <div>
          <h3>{expense.merchant}</h3>
          <p>
            {categoryLabels[expense.category]} ·{" "}
            {new Date(`${expense.date}T12:00:00`).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <strong>{money(expense.amount)}</strong>
      </div>
      <Status expense={expense} />
      {expense.source === "sample" &&
        (expense.category === "meals" || expense.category === "commute") && (
          <figure className="expense-photo">
            <img
              src={`/images/${expense.category === "commute" ? "auto" : "thali"}-example.webp`}
              alt={
                expense.category === "commute"
                  ? "A yellow and black auto rickshaw on an Indian street"
                  : "An Indian thali with rice, chapati and small bowls of dal and curry"
              }
              width="900"
              height="480"
            />
            <figcaption>
              Example photo ·{" "}
              {expense.category === "commute"
                ? "An everyday ride to college"
                : "A little taste of home"}
              <a
                href={
                  expense.category === "commute"
                    ? "https://unsplash.com/photos/1XJt1RpU5FI"
                    : "https://unsplash.com/photos/dncjnYtmWHo"
                }
                target="_blank"
                rel="noreferrer"
              >
                Photo credit ↗
              </a>
            </figcaption>
          </figure>
        )}
      {expense.fastFood && (
        <p className="subtle-note">
          Fast-food meal · confirmed by {profile.owner}
        </p>
      )}
      {!!expense.flags.length && (
        <div className="review-box">
          <MessageCircle size={20} />
          <div>
            <strong>A little context helps.</strong>
            {expense.flags.map((flag) => (
              <p key={flag}>{flag}</p>
            ))}
            <small>
              This records an expense. It never blocks access to money.
            </small>
          </div>
        </div>
      )}
      {expense.note && (
        <div className="message-note">
          <span className="avatar owner small">
            {profile.owner.slice(0, 1)}
          </span>
          <div>
            <strong>{profile.owner}’s note</strong>
            <p>{expense.note}</p>
          </div>
        </div>
      )}
      {expense.acknowledged && (
        <div className="message-note supporter-note">
          <span className="avatar supporter small">
            {profile.supporter.slice(0, 1)}
          </span>
          <div>
            <strong>
              {profile.supporter} acknowledged this <Check size={14} />
            </strong>
            <p>{expense.reply || "Thanks for keeping me in the loop."}</p>
          </div>
        </div>
      )}
      {expense.receiptId && (
        <div className="receipt-detail">
          <strong>
            {expense.evidence === "receipt" ? "Receipt" : "Photo"}
          </strong>
          {role === "owner" || expense.shareReceipt ? (
            <img
              src={`/api/receipts/${expense.receiptId}`}
              alt={`Attachment for ${expense.merchant}`}
            />
          ) : (
            <p>{profile.owner} has kept this attachment private.</p>
          )}
        </div>
      )}
      <p className="subtle-note">
        <ShieldCheck size={15} />{" "}
        {expense.source === "gemini"
          ? `AI-assisted details, confirmed by ${profile.owner}.`
          : expense.source === "sample"
            ? "Sample expense for this demo household."
            : `Details entered and confirmed by ${profile.owner}.`}
      </p>
      {(role === "owner" ||
        (!!expense.flags.length && !expense.acknowledged)) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label className="field">
            {role === "owner"
              ? `Add a little context for ${profile.supporter}`
              : `A note for ${profile.owner} (optional)`}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={600}
              rows={3}
              placeholder={
                role === "owner"
                  ? "What would you like them to know?"
                  : "Thanks for explaining. Glad you got home safely."
              }
              required={role === "owner"}
            />
          </label>
          <ErrorMessage message={error} />
          <div className="modal-actions">
            <button
              type="button"
              className="button secondary"
              onClick={onClose}
            >
              Close
            </button>
            <button className="button primary" disabled={busy}>
              {role === "owner" ? "Share context" : "Acknowledge expense"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
