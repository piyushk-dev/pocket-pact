import { useState } from "react";
import { ArrowRight, Copy, LogOut, Plus, Users, Wallet } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { SessionState, WalletProfile } from "@shared/api";
import type { Role } from "@shared/domain";
import { api } from "../api";
import { usePact } from "../state";
import { ErrorMessage } from "../components/ui";

export function Account() {
  const {
    account,
    demo,
    profile,
    wallets,
    walletId,
    role,
    connected,
    updateSession,
    refresh,
    notify,
  } = usePact();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"register" | "login" | "wallet">(
    demo ? "register" : "wallet",
  );
  const [editing, setEditing] = useState(demo);
  const [name, setName] = useState(account?.name || "");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [myRole, setMyRole] = useState<Role>("supporter");
  const [otherName, setOtherName] = useState("");
  const [title, setTitle] = useState("");
  const [relationship, setRelationship] =
    useState<WalletProfile["relationship"]>("Parent");
  const [amount, setAmount] = useState("1000");
  const [invite, setInvite] = useState(
    () => new URLSearchParams(location.hash.slice(1)).get("invite") || "",
  );
  const [inviteLink, setInviteLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const wallet = {
      title: title || `${myRole === "owner" ? name : otherName}’s wallet`,
      role: myRole,
      owner: myRole === "owner" ? name : otherName,
      supporter: myRole === "supporter" ? name : otherName,
      relationship,
      weeklyAmount: Math.round(Number(amount) * 100),
    };
    try {
      let result = await api<SessionState>(
        mode === "login" ? "/auth/login" : demo ? "/auth/register" : "/wallets",
        mode === "login"
          ? { username, password }
          : demo
            ? { name, username, password, wallet }
            : wallet,
      );
      if (invite) {
        try {
          result = await api<SessionState>("/invites/join", { token: invite });
        } catch (e) {
          updateSession(result);
          notify((e as Error).message);
          navigate("/account" + location.hash);
          return;
        }
        setInvite("");
        history.replaceState(null, "", "/account");
      }
      updateSession(result);
      setEditing(false);
      setPassword("");
      notify(mode === "login" ? "Welcome back." : "Your wallet is ready.");
      navigate("/app");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function join() {
    setBusy(true);
    setError("");
    try {
      updateSession(
        await api<SessionState>("/invites/join", { token: invite }),
      );
      setInvite("");
      history.replaceState(null, "", "/account");
      notify("You’re connected. Make your plan together.");
      navigate("/family");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function inviteOther() {
    setBusy(true);
    setError("");
    try {
      const result = await api<{ token: string }>("/invites", {});
      setInviteLink(`${location.origin}/account#invite=${result.token}`);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page account-page">
      <header className="page-heading">
        <div>
          <h1>
            {demo
              ? "Make a little space of your own."
              : "Your wallets. Your people."}
          </h1>
          <p>
            For children finding their feet, students starting out, and mentors
            helping them along.
          </p>
        </div>
        {!demo && (
          <button
            className="button secondary"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await api("/auth/logout", {});
                await refresh();
                navigate("/app");
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <LogOut size={17} />
            Sign out
          </button>
        )}
      </header>
      <div className="account-grid">
        <section className="account-card">
          <span className="account-icon">
            <Wallet size={26} />
          </span>
          <h2>{demo ? "Real people. A shared plan." : profile.title}</h2>
          <p>
            {demo
              ? "Keep exploring Ananya and Kunal’s example, or create a wallet with your own account."
              : `${profile.owner} · Wallet owner / ${profile.supporter} · ${profile.relationship}`}
          </p>
          <div className="account-principle">
            <Users size={21} />
            <div>
              <strong>Owner & supporter</strong>
              <p>
                The owner records spending. A parent, guardian or mentor
                contributes and checks in. Changes to the plan take both people.
              </p>
            </div>
          </div>
          <p className="subtle-note">
            Pocket Pact tracks money sent outside the app. It doesn’t hold funds
            or make payments.
          </p>
          {!demo && (
            <>
              <label className="field">
                Your wallets
                <select
                  value={walletId}
                  disabled={busy}
                  onChange={async (e) => {
                    setBusy(true);
                    try {
                      updateSession(
                        await api<SessionState>("/wallets/select", {
                          id: e.target.value,
                        }),
                      );
                      setInviteLink("");
                    } catch (e) {
                      setError((e as Error).message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title} · {w.role === "owner" ? "Owner" : "Supporter"}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="text-button"
                onClick={() => {
                  setMode("wallet");
                  setEditing(true);
                  setName(account?.name || "");
                }}
              >
                <Plus size={17} />
                Create another wallet
              </button>
              <hr />
              <h3>
                {connected
                  ? "You’re connected."
                  : `Invite your ${role === "owner" ? profile.relationship.toLowerCase() : "wallet owner"}.`}
              </h3>
              <p>
                {connected
                  ? "Your shared expenses, notes and agreement appear on both accounts."
                  : "They’ll sign in with their own account. This one-use link expires after 24 hours."}
              </p>
              {!connected && (
                <button
                  className="button primary"
                  disabled={busy}
                  onClick={() => void inviteOther()}
                >
                  Create invite link <ArrowRight size={16} />
                </button>
              )}
              {inviteLink && (
                <div className="invite-result">
                  <label className="field">
                    Invite link
                    <input
                      readOnly
                      value={inviteLink}
                      onFocus={(e) => e.target.select()}
                    />
                  </label>
                  <button
                    className="text-button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(inviteLink);
                        notify("Invite link copied.");
                      } catch {
                        notify("Select the link above and copy it.");
                      }
                    }}
                  >
                    <Copy size={16} />
                    Copy link
                  </button>
                  <small>
                    Share this privately with the person you want to invite.
                    Creating another link replaces this one.
                  </small>
                </div>
              )}
              {invite && (
                <div className="invite-result">
                  <h3>You have an invitation.</h3>
                  <p>
                    Join using your account, {account?.name}. The inviter will
                    see your name and shared activity.
                  </p>
                  <button
                    className="button primary"
                    disabled={busy}
                    onClick={() => void join()}
                  >
                    Accept invitation
                  </button>
                </div>
              )}
            </>
          )}
          {demo && (
            <Link className="text-link" to="/app">
              Keep exploring the example <ArrowRight size={16} />
            </Link>
          )}
        </section>
        {demo || editing ? (
          <section className="account-card account-setup">
            {demo && (
              <div className="filter-tabs">
                <button
                  className={mode === "register" ? "active" : ""}
                  onClick={() => setMode("register")}
                >
                  Create account
                </button>
                <button
                  className={mode === "login" ? "active" : ""}
                  onClick={() => setMode("login")}
                >
                  Sign in
                </button>
              </div>
            )}
            <h2>
              {mode === "login"
                ? "Welcome back."
                : demo
                  ? "Start your shared wallet."
                  : "A new wallet, a new pact."}
            </h2>
            {invite && (
              <p className="analysis-note">
                You have an invite.{" "}
                {demo
                  ? "Sign in or create an account to accept it."
                  : "You can accept it from the card alongside."}
              </p>
            )}
            <form onSubmit={(e) => void submit(e)}>
              {mode !== "login" && (
                <label className="field">
                  Your name
                  <input
                    required
                    maxLength={60}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                  />
                </label>
              )}
              {demo && (
                <>
                  <label className="field">
                    Username
                    <input
                      required
                      minLength={3}
                      maxLength={40}
                      pattern="[a-zA-Z0-9_.\-]+"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                    />
                  </label>
                  <label className="field">
                    Password
                    <input
                      type="password"
                      required
                      minLength={10}
                      maxLength={200}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                    />
                    <small>
                      At least 10 characters. Keep your password safe; password
                      recovery isn’t available yet.
                    </small>
                  </label>
                </>
              )}
              {mode !== "login" && (
                <>
                  <label className="field">
                    Your role
                    <select
                      value={myRole}
                      onChange={(e) => setMyRole(e.target.value as Role)}
                    >
                      <option value="supporter">
                        Supporter — parent, guardian or mentor
                      </option>
                      <option value="owner">
                        Wallet owner — child, student or mentee
                      </option>
                    </select>
                  </label>
                  <div className="form-grid">
                    <label className="field">
                      {myRole === "supporter"
                        ? "Wallet owner’s name"
                        : "Supporter’s name"}
                      <input
                        required
                        maxLength={60}
                        value={otherName}
                        onChange={(e) => setOtherName(e.target.value)}
                      />
                    </label>
                    <label className="field">
                      Supporter’s relationship
                      <select
                        value={relationship}
                        onChange={(e) =>
                          setRelationship(
                            e.target.value as WalletProfile["relationship"],
                          )
                        }
                      >
                        {["Parent", "Guardian", "Mentor", "Other"].map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <label className="field">
                    Wallet name (optional)
                    <input
                      maxLength={70}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. College week"
                    />
                  </label>
                  <label className="field">
                    Starting weekly plan (₹)
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      step="0.01"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                    <small>
                      Split across meals, commute, study and personal spending.
                      You can propose changes together.
                    </small>
                  </label>
                  <p className="subtle-note">
                    Creating an account starts an empty wallet. Invite your
                    person next; example expenses aren’t copied.
                  </p>
                </>
              )}
              <ErrorMessage message={error} />
              <button className="button primary" disabled={busy}>
                {busy
                  ? "One moment…"
                  : mode === "login"
                    ? "Sign in"
                    : demo
                      ? "Create account & wallet"
                      : "Create wallet"}
                <ArrowRight size={17} />
              </button>
            </form>
          </section>
        ) : (
          <section className="account-card">
            <h2>A plan that leaves room to grow.</h2>
            <p>
              Each wallet has its own owner, supporter, weekly agreement and
              expense history. You can support more than one person without
              mixing their balances.
            </p>
            <Link className="button primary" to="/pact">
              See your agreement <ArrowRight size={17} />
            </Link>
            <ErrorMessage message={error} />
          </section>
        )}
      </div>
    </div>
  );
}
