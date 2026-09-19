import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applyAction,
  seedState,
  type PactAction,
  type PactState,
  type Role,
} from "@shared/domain";

type Store = {
  state: PactState;
  role: Role;
  ready: boolean;
  busy: boolean;
  toast: string;
  switchRole: (role: Role) => Promise<void>;
  act: (action: PactAction, message?: string) => Promise<void>;
  notify: (message: string) => void;
  capture: "manual" | "photo" | "voice" | null;
  openCapture: (mode: "manual" | "photo" | "voice" | null) => void;
};
const Context = createContext<Store | null>(null);
const storageKey = "pocket-pact:ui-demo:v1";

export function PactProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (saved?.state?.budgets)
        return saved as { state: PactState; role: Role };
    } catch {
      /* Use a fresh demo. */
    }
    return { state: seedState(), role: "daughter" as Role };
  });
  const [state, setState] = useState<PactState>(initial.state);
  const [role, setRole] = useState<Role>(initial.role);
  const ready = true;
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [capture, openCapture] = useState<Store["capture"]>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const notify = useCallback((message: string) => {
    setToast(message);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 5000);
  }, []);
  useEffect(() => () => clearTimeout(timer.current), []);
  async function act(action: PactAction, message = "Saved.") {
    setBusy(true);
    try {
      const next = applyAction(state, action, role);
      localStorage.setItem(storageKey, JSON.stringify({ state: next, role }));
      setState(next);
      notify(message);
    } finally {
      setBusy(false);
    }
  }
  async function switchRole(next: Role) {
    localStorage.setItem(storageKey, JSON.stringify({ state, role: next }));
    setRole(next);
    openCapture(null);
  }
  return (
    <Context.Provider
      value={{
        state,
        role,
        ready,
        busy,
        toast,
        act,
        switchRole,
        notify,
        capture,
        openCapture,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function usePact() {
  const value = useContext(Context);
  if (!value) throw new Error("PactProvider is missing.");
  return value;
}
