import {
  Bell,
  BarChart3,
  ChevronDown,
  Handshake,
  House,
  ReceiptText,
  Users,
  CircleHelp,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { pendingExpenses, type Role } from "@shared/domain";
import { usePact } from "../state";
import { ExpenseDialog } from "./expense-dialog";
import { useEffect } from "react";
import "../app-theme.css";

const navigation = [
  { to: "/app", label: "Overview", icon: House },
  { to: "/expenses", label: "Expenses", icon: ReceiptText },
  { to: "/pact", label: "Our pact", icon: Handshake },
  { to: "/family", label: "Together", icon: Users },
  { to: "/insights", label: "Insights", icon: BarChart3 },
];
export function Shell() {
  const {
    role,
    switchRole,
    state,
    toast,
    capture,
    openCapture,
    profile,
    demo,
    ready,
    busy,
    connectionError,
    refresh,
    walletId,
  } = usePact();
  const location = useLocation();
  const pending =
    pendingExpenses(state).length +
    (state.proposal && state.proposal.by !== role ? 1 : 0);
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${navigation.find((item) => item.to === location.pathname)?.label ?? "About"} · Pocket Pact`;
  }, [location.pathname]);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="app-header">
        <div className="app-header-inner">
          <Link className="app-brand" to="/" aria-label="Pocket Pact home">
            <img src="/icon.svg" alt="" />
            <span>
              POCKET<span>PACT</span>
            </span>
          </Link>
          <nav className="app-navigation" aria-label="Main navigation">
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}>
                <Icon size={18} />
                <span>{label}</span>
                {to === "/family" && pending > 0 && (
                  <span className="nav-count">{pending}</span>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="app-header-actions">
            <Link
              to="/family"
              className="notification-button"
              aria-label={
                pending ? `${pending} updates in Together` : "Shared updates"
              }
            >
              <Bell size={19} />
              {pending > 0 && <span />}
            </Link>
            <div className="persona">
              <span className={`avatar ${role}`}>
                {profile[role].slice(0, 1)}
              </span>
              <label className="sr-only" htmlFor="persona">
                Demo perspective
              </label>
              {demo ? (
                <select
                  disabled={busy}
                  id="persona"
                  value={role}
                  onChange={(e) => void switchRole(e.target.value as Role)}
                >
                  <option value="owner">Ananya · Owner</option>
                  <option value="supporter">Kunal · Parent</option>
                </select>
              ) : (
                <Link to="/account">
                  {profile[role]} ·{" "}
                  {role === "owner" ? "Owner" : profile.relationship}
                </Link>
              )}
              {demo && <ChevronDown size={15} aria-hidden="true" />}
            </div>
          </div>
        </div>
      </header>
      <div className="main-shell">
        <div className="app-context">
          <span>
            <span className="context-dot" />
            {profile.owner} & {profile.supporter}’s shared space{" "}
            {demo && <span className="demo-tag">DEMO</span>}
          </span>
          <Link to="/account">
            <CircleHelp size={15} />{" "}
            {demo ? "Create your wallet / Sign in" : "Manage wallets"}
          </Link>
        </div>
        <main id="main" tabIndex={-1}>
          {connectionError && (
            <div className="connection-error" role="alert">
              {connectionError}{" "}
              <button className="text-button" onClick={() => void refresh()}>
                Retry connection
              </button>
            </div>
          )}
          {ready ? (
            <Outlet key={`${walletId}:${role}`} />
          ) : (
            !connectionError && (
              <div className="page" role="status">
                Opening your shared space…
              </div>
            )
          )}
        </main>
        <footer className="page-footer">
          <span>Made for a little more understanding.</span>
          <span>
            {demo ? "Example wallet" : "Expense tracking"} · No bank account
            connected
          </span>
        </footer>
      </div>
      {toast && (
        <div className="toast" role="status">
          <span className="toast-check">✓</span>
          {toast}
        </div>
      )}
      {capture && (
        <ExpenseDialog mode={capture} onClose={() => openCapture(null)} />
      )}
    </div>
  );
}
