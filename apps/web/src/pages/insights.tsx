import { useEffect, useState } from "react";
import { BarChart3, MessageCircle } from "lucide-react";
import type { MonthlyReport } from "@shared/api";
import { categoryLabels, money, type Category } from "@shared/domain";
import { usePact } from "../state";
import { api } from "../api";
import { ErrorMessage } from "../components/ui";
export function Insights() {
  const { state, walletId, profile } = usePact();
  const [month, setMonth] = useState(() =>
    new Date()
      .toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
      .slice(0, 7),
  );
  return (
    <Monthly
      key={`${walletId}:${month}`}
      month={month}
      setMonth={setMonth}
      version={state.version}
      owner={profile.owner}
    />
  );
}
function Monthly({
  month,
  setMonth,
  version,
  owner,
}: {
  month: string;
  setMonth: (month: string) => void;
  version: number;
  owner: string;
}) {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void api<MonthlyReport>(`/monthly?month=${month}`)
      .then((r) => {
        if (active) {
          setReport(r);
          setError("");
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [month, version]);
  return (
    <div className="page insights-page">
      <header className="page-heading">
        <div>
          <h1>The month, with a little perspective.</h1>
          <p>
            {owner}’s recorded spending. Patterns you can talk about together.
          </p>
        </div>
        <label className="field">
          Month
          <input
            type="month"
            value={month}
            onChange={(e) => {
              if (e.target.value) setMonth(e.target.value);
            }}
          />
        </label>
      </header>
      <ErrorMessage message={error} />
      {!report ? (
        <p role="status">Loading your month…</p>
      ) : (
        <>
          <div className="insight-stats">
            <section>
              <small>Recorded spending</small>
              <strong>{money(report.spent)}</strong>
              <span>
                {report.expenses}{" "}
                {report.expenses === 1 ? "expense" : "expenses"}
              </span>
            </section>
            <section>
              <small>Contributions recorded</small>
              <strong>{money(report.funded)}</strong>
              <span>Money sent outside the app</span>
            </section>
            <section>
              <small>Conversations opened</small>
              <strong>{report.flagged}</strong>
              <span>{report.acknowledged} acknowledged</span>
            </section>
          </div>
          <div className="account-grid">
            <section className="account-card">
              <BarChart3 size={25} />
              <h2>Where the month went.</h2>
              {report.expenses ? (
                report.categories
                  .filter((c) => c.amount > 0)
                  .map((c) => (
                    <div className="insight-category" key={c.category}>
                      <div>
                        <span>{categoryLabels[c.category as Category]}</span>
                        <strong>{money(c.amount)}</strong>
                      </div>
                      <div className="mini-progress">
                        <span
                          style={{
                            width: `${(c.amount / Math.max(report.spent, 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
              ) : (
                <p>
                  No expenses recorded for this month yet. Your entries will
                  build this picture.
                </p>
              )}
            </section>
            <section className="account-card">
              <MessageCircle size={25} />
              <h2>A reason to check in.</h2>
              <p>
                {report.flagged - report.acknowledged
                  ? `${report.flagged - report.acknowledged} expenses still need a conversation.`
                  : "No open conversations in this month’s recorded expenses."}
              </p>
              <p>
                {report.fastFood}{" "}
                {report.fastFood === 1 ? "entry marked" : "entries marked"} as
                fast food by the wallet owner. This is a spending preference,
                not a nutrition assessment.
              </p>
              <h3>Week by week</h3>
              {report.weeks.length ? (
                report.weeks.map((w) => (
                  <div className="insight-week" key={w.week}>
                    <span>
                      Week of{" "}
                      {new Date(w.week + "T12:00:00").toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short" },
                      )}
                    </span>
                    <strong>{money(w.amount)}</strong>
                  </div>
                ))
              ) : (
                <p>Your first entry will appear here.</p>
              )}
            </section>
          </div>
          <p className="subtle-note">
            Based on saved entries, including archived weeks. Only expenses
            dated in the selected month are included.
          </p>
        </>
      )}
    </div>
  );
}
