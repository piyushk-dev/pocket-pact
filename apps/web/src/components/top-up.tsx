import { useRef, useState } from "react";
import { ArrowDownLeft } from "lucide-react";
import { money } from "@shared/domain";
import { usePact } from "../state";
import { ErrorMessage, Modal } from "./ui";
export function TopUpDialog({ onClose }: { onClose: () => void }) {
  const { act, busy, profile } = usePact();
  const [amount, setAmount] = useState("500");
  const [note, setNote] = useState("A little extra for this week.");
  const [error, setError] = useState("");
  const id = useRef(crypto.randomUUID());
  async function save() {
    try {
      await act(
        {
          type: "top-up",
          id: id.current,
          amount: Math.round(Number(amount) * 100),
          note,
        },
        `${profile.owner}’s recorded balance is updated.`,
      );
      onClose();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Modal title="A little extra support." onClose={onClose}>
      <p className="modal-intro">
        Record money you’ve sent {profile.owner}. It adds to their balance
        without changing your category agreement.
      </p>
      <div className="demo-callout">
        <ArrowDownLeft size={18} />
        <span>
          Record a transfer you made outside Pocket Pact. No money moves here.
        </span>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <label className="field">
          Amount (₹)
          <input
            type="number"
            min="1"
            max="100000"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <label className="field">
          A note from you
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            maxLength={200}
          />
        </label>
        <ErrorMessage message={error} />
        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={onClose}>
            Cancel
          </button>
          <button className="button primary" disabled={busy}>
            Record {money(Math.round(Number(amount || 0) * 100))}
          </button>
        </div>
      </form>
    </Modal>
  );
}
