import { Link, Route, Routes } from "react-router-dom";
import { PactProvider } from "./state";
import { Shell } from "./components/shell";
import { Overview } from "./pages/overview";
import { Expenses } from "./pages/expenses";
import { Pact } from "./pages/pact";
import { Family } from "./pages/family";
import { Landing } from "./pages/landing";
import { About } from "./pages/about";

import { Account } from "./pages/account";
import { Insights } from "./pages/insights";

export function App() {
  return (
    <PactProvider>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Shell />}>
          <Route path="app" element={<Overview />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="pact" element={<Pact />} />
          <Route path="family" element={<Family />} />
          <Route path="about" element={<About />} />
          <Route path="account" element={<Account />} />
          <Route path="insights" element={<Insights />} />
          <Route
            path="*"
            element={
              <div className="page">
                <h1>A little off the path.</h1>
                <p>That page isn’t part of your pact.</p>
                <Link className="button primary" to="/app">
                  Back to your week
                </Link>
              </div>
            }
          />
        </Route>
      </Routes>
    </PactProvider>
  );
}
