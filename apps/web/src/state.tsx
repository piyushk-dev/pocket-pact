import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { seedState, type PactAction, type Role } from "@shared/domain";
import type { SessionState } from "@shared/api";
import { api } from "./api";

type Store = SessionState & {
  ready: boolean;
  busy: boolean;
  toast: string;
  connectionError: string;
  switchRole: (role: Role) => Promise<void>;
  act: (action: PactAction, message?: string) => Promise<void>;
  notify: (message: string) => void;
  refresh: () => Promise<void>;
  updateSession: (session: SessionState) => void;
  capture: "manual" | "photo" | "voice" | null;
  openCapture: (mode: Store["capture"]) => void;
};
const Context = createContext<Store | null>(null);
export function PactProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>({
    state: seedState(),
    role: "owner",
    demo: true,
    profile: {
      title: "Ananya’s week",
      owner: "Ananya",
      supporter: "Kunal",
      relationship: "Parent",
    },
    account: null,
    wallets: [],
    walletId: "",
    connected: false,
  });
  const [ready, setReady] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [capture, openCapture] = useState<Store["capture"]>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const requestSequence = useRef(0);
  const notify = useCallback((message: string) => {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 5000);
  }, []);
  const updateSession = useCallback((next: SessionState) => {
    requestSequence.current++;
    setSession(next);
    setReady(true);
    setConnectionError("");
    openCapture(null);
  }, []);
  const refresh = useCallback(async () => {
    const sequence = ++requestSequence.current;
    try {
      const next = await api<SessionState>("/session", {});
      if (sequence === requestSequence.current) {
        setSession(next);
        setReady(true);
        setConnectionError("");
      }
    } catch (e) {
      if (sequence === requestSequence.current)
        setConnectionError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    const sequence = ++requestSequence.current;
    let active = true;
    void api<SessionState>("/session", {})
      .then((next) => {
        if (active && sequence === requestSequence.current) {
          setSession(next);
          setReady(true);
          setConnectionError("");
        }
      })
      .catch((e) => {
        if (active) setConnectionError((e as Error).message);
      });
    return () => {
      active = false;
      clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (!ready || busy) return;
    const sync = async () => {
      if (document.hidden) return;
      const sequence = ++requestSequence.current;
      try {
        const next = await api<SessionState>("/state");
        if (sequence === requestSequence.current) {
          setSession(next);
          setConnectionError("");
        }
      } catch (e) {
        if (sequence === requestSequence.current)
          setConnectionError((e as Error).message);
      }
    };
    const interval = setInterval(() => void sync(), 10000);
    window.addEventListener("focus", sync);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", sync);
    };
  }, [ready, busy]);
  async function act(action: PactAction, message = "Saved.") {
    requestSequence.current++;
    setBusy(true);
    try {
      const next = await api<SessionState>("/actions", {
        action,
        version: session.state.version,
        walletId: session.walletId,
      });
      requestSequence.current++;
      setSession(next);
      setConnectionError("");
      notify(message);
    } catch (e) {
      if ((e as { status?: number }).status === 409) await refresh();
      throw e;
    } finally {
      setBusy(false);
    }
  }
  async function switchRole(role: Role) {
    setBusy(true);
    try {
      updateSession(await api<SessionState>("/demo/role", { role }));
    } catch (e) {
      notify((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Context.Provider
      value={{
        ...session,
        ready,
        busy,
        toast,
        connectionError,
        capture,
        openCapture,
        act,
        switchRole,
        notify,
        refresh,
        updateSession,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function usePact() {
  const store = useContext(Context);
  if (!store) throw new Error("PactProvider is missing.");
  return store;
}
