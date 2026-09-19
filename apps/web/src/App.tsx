import { Link, Route, Routes } from "react-router-dom";
import { PactProvider } from "./state";
import { Shell } from "./components/shell";
import { Overview } from "./pages/overview";
import { Expenses } from "./pages/expenses";
import { Pact } from "./pages/pact";
import { Family } from "./pages/family";
import { About } from "./pages/about";

export function App() {
  return (
    <PactProvider>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Overview />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="pact" element={<Pact />} />
          <Route path="family" element={<Family />} />
          <Route path="about" element={<About />} />
          <Route
            path="*"
            element={
              <div className="page">
                <h1>A little off the path.</h1>
                <p>That page isn’t part of your pact.</p>
                <Link className="button primary" to="/">
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
