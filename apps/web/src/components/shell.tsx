import {
  Bell,
  ChevronDown,
  Handshake,
  House,
  Leaf,
  ReceiptText,
  Users,
  CircleHelp,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { pendingExpenses, type Role } from "@shared/domain";
import { usePact } from "../state";
import { ExpenseDialog } from "./expense-dialog";
import { useEffect } from "react";

const navigation = [
  { to: "/", label: "Overview", icon: House },
  { to: "/expenses", label: "Expenses", icon: ReceiptText },
  { to: "/pact", label: "Our pact", icon: Handshake },
  { to: "/family", label: "Family", icon: Users },
];
export function Shell() {
  const { role, switchRole, state, toast, capture, openCapture, ready } =
    usePact();
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
      <aside className="sidebar">
        <Link className="brand" to="/" aria-label="Pocket Pact home">
          <img src="/icon.svg" alt="" />
          <span>Pocket Pact</span>
        </Link>
        <nav className="navigation" aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === "/"}>
              <Icon size={22} />
              <span>{label}</span>
              {to === "/family" && pending > 0 && (
                <span className="nav-count">{pending}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <Link to="/about" className="help-link">
            <CircleHelp size={18} /> How it works
          </Link>
          <div className="household">
            <House size={21} />
            <span>
              <strong>Demo household</strong>
              <small>Ananya & Kunal</small>
            </span>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <span className="breadcrumb">
            {location.pathname === "/"
              ? "My week"
              : (navigation.find((item) => item.to === location.pathname)
                  ?.label ?? "About Pocket Pact")}
            <span className="breadcrumb-dot" />
          </span>
          <div className="topbar-actions">
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
              <ChevronDown size={16} aria-hidden="true" />
            </div>
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          {ready ? (
            <Outlet />
          ) : (
            <div className="loading-state">
              <Leaf size={30} />
              <p>Getting your week together…</p>
            </div>
          )}
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
