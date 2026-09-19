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
  const { state, role, act, busy } = usePact();
  const expense = state.expenses.find((e) => e.id === id)!;
  const [note, setNote] = useState(role === "daughter" ? expense.note : "");
  const [error, setError] = useState("");
  async function save() {
    setError("");
    try {
      await act(
        role === "daughter"
          ? { type: "add-context", id, note }
          : { type: "acknowledge", id, reply: note },
        role === "daughter"
          ? "Your context is shared with Kunal."
          : "Ananya can see your acknowledgement.",
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
          <span className="avatar daughter small">A</span>
          <div>
            <strong>Ananya’s note</strong>
            <p>{expense.note}</p>
          </div>
        </div>
      )}
      {expense.acknowledged && (
        <div className="message-note father-note">
          <span className="avatar father small">K</span>
          <div>
            <strong>
              Kunal acknowledged this <Check size={14} />
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
          {role === "daughter" || expense.shareReceipt ? (
            <img
              src={`/api/receipts/${expense.receiptId}`}
              alt={`Attachment for ${expense.merchant}`}
            />
          ) : (
            <p>Ananya has kept this attachment private.</p>
          )}
        </div>
      )}
      <p className="subtle-note">
        <ShieldCheck size={15} />{" "}
        {expense.source === "gemini"
          ? "AI-assisted details, confirmed by Ananya."
          : expense.source === "sample"
            ? "Sample expense for this demo household."
            : "Details entered and confirmed by Ananya."}
      </p>
      {(role === "daughter" ||
        (!!expense.flags.length && !expense.acknowledged)) && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <label className="field">
            {role === "daughter"
              ? "Add a little context for Dad"
              : "A note for Ananya (optional)"}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={600}
              rows={3}
              placeholder={
                role === "daughter"
                  ? "What would you like him to know?"
                  : "Thanks for explaining. Glad you got home safely."
              }
              required={role === "daughter"}
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
              {role === "daughter" ? "Share context" : "Acknowledge expense"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
