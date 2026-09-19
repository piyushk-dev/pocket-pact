import {
  Bell,
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
  { to: "/family", label: "Family", icon: Users },
];
export function Shell() {
  const { role, switchRole, state, toast, capture, openCapture } = usePact();
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
                pending ? `${pending} updates in Family` : "Family updates"
              }
            >
              <Bell size={19} />
              {pending > 0 && <span />}
            </Link>
            <div className="persona">
              <span className={`avatar ${role}`}>
                {role === "daughter" ? "A" : "K"}
              </span>
              <label className="sr-only" htmlFor="persona">
                Demo perspective
              </label>
              <select
                id="persona"
                value={role}
                onChange={(e) => void switchRole(e.target.value as Role)}
              >
                <option value="daughter">Ananya · Daughter</option>
                <option value="father">Kunal · Dad</option>
              </select>
              <ChevronDown size={15} aria-hidden="true" />
            </div>
          </div>
        </div>
      </header>
      <div className="main-shell">
        <div className="app-context">
          <span>
            <span className="context-dot" />
            Ananya & Kunal’s shared space <span className="demo-tag">DEMO</span>
          </span>
          <Link to="/about">
            <CircleHelp size={15} /> How it works
          </Link>
        </div>
        <main id="main" tabIndex={-1}>
          <Outlet />
        </main>
        <footer className="page-footer">
          <span>Made for a little more understanding.</span>
          <span>Demo money · No bank account connected</span>
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
