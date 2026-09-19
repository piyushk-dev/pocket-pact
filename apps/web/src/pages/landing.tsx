import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  BusFront,
  Camera,
  Check,
  CheckCheck,
  ChevronDown,
  Coffee,
  Flag,
  Handshake,
  Menu,
  MessageCircle,
  Play,
  Plus,
  ReceiptText,
  SlidersHorizontal,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import { PhoneDemo, PhoneScreen } from "../components/phone-demo";
import "../landing.css";

const faqs = [
  [
    "What is Pocket Pact?",
    "A shared pocket-money planner for a student and their parent. Set a weekly plan, record expenses, and add context when something falls outside it. Ananya and Kunal are the fictional family in our demo.",
  ],
  [
    "Can a parent control or block spending?",
    "No. Ananya makes her own spending decisions. An expense outside the shared plan opens a conversation. It never blocks a purchase or takes money back.",
  ],
  [
    "What happens when an expense is outside the plan?",
    "The app compares it with the agreed categories and budgets. Ananya can add a note before saving. Kunal sees the exception and her context in the Family inbox, where he can reply and acknowledge it.",
  ],
  [
    "Can I upload a receipt or use my voice?",
    "You can explore the capture screens and preview a receipt upload. AI extraction and voice transcription are planned integrations and are not connected in this UI preview. Use manual entry or a sample expense to try the full flow.",
  ],
  [
    "Does the demo use real money?",
    "No. It uses sample funds and stores your demo changes in this browser. No bank account is connected and no payment is made. Switch between Ananya and Kunal to explore both perspectives.",
  ],
  [
    "Can we change the weekly plan?",
    "Yes. Either person can propose moving money between categories. The other person reviews and accepts the change, so the plan remains something you agree on together.",
  ],
];

export function Landing() {
  const [menu, setMenu] = useState(false);
  const [restart, setRestart] = useState(0);
  useEffect(() => {
    document.title = "Pocket Pact · Pocket money. Shared understanding.";
    window.scrollTo(0, 0);
  }, []);
  function watchDemo() {
    setRestart((value) => value + 1);
    document
      .getElementById("walkthrough")
      ?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
        block: "center",
      });
  }
  return (
    <div className="landing">
      <a className="skip-link" href="#landing-main">
        Skip to content
      </a>
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-brand" aria-label="Pocket Pact home">
            <img src="/icon.svg" alt="" />
            <span>
              POCKET<span>PACT</span>
            </span>
          </Link>
          <nav
            className={menu ? "site-nav open" : "site-nav"}
            aria-label="Website navigation"
          >
            <a href="#home" className="current" onClick={() => setMenu(false)}>
              Home
            </a>
            <a href="#how-it-works" onClick={() => setMenu(false)}>
              How it works
            </a>
            <a href="#features" onClick={() => setMenu(false)}>
              Features
            </a>
            <a href="#faq" onClick={() => setMenu(false)}>
              FAQs <ChevronDown size={16} />
            </a>
          </nav>
          <Link className="button site-demo" to="/app">
            Demo <ArrowRight size={17} />
          </Link>
          <button
            className="menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close navigation" : "Open navigation"}
            aria-expanded={menu}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="landing-main">
        <section className="hero site-container" id="home">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <Handshake size={21} />
              <span>A little planning. A lot of freedom.</span>
            </div>
            <h1>
              Pocket money.
              <br />
              <span>Shared understanding.</span>
            </h1>
            <p>
              Plan the week together. Spend independently.
              <br className="desktop-break" /> Keep the conversation open, one
              expense at a time.
            </p>
            <div className="hero-actions">
              <Link className="button site-demo" to="/app">
                Demo <ArrowRight size={19} />
              </Link>
              <button className="button watch-button" onClick={watchDemo}>
                <Play size={18} /> Watch the flow
              </button>
            </div>
            <div className="hero-footnote">
              <span className="family-mini-avatars">
                <i>A</i>
                <i>K</i>
              </span>
              <span>
                Meet Ananya & Kunal.
                <br />
                <strong>One week. ₹1,000. A plan of their own.</strong>
              </span>
            </div>
          </div>
          <PhoneDemo key={restart} restart={restart} />
        </section>
        <section className="story-strip site-container" id="how-it-works">
          <div>
            <span className="section-kicker">THE IDEA IS SIMPLE</span>
            <h2>
              More trust.
              <br />
              Fewer “where did it go?”s.
            </h2>
          </div>
          <p>
            Kunal sends Ananya her weekly pocket money. She has college,
            friends, and a life to figure out. Pocket Pact helps them agree on a
            plan—and understand the moments that don’t fit it.
          </p>
        </section>
        <section className="features-section site-container" id="features">
          <div className="landing-section-heading">
            <span className="section-kicker">
              FROM A PLAN TO A CONVERSATION
            </span>
            <h2>A little clarity for both of you.</h2>
            <p>Everything you need to stay on the same page.</p>
          </div>
          <div className="feature-grid">
            <article className="feature-card">
              <span className="feature-icon">
                <Wallet />
              </span>
              <h3>A week, all in one place</h3>
              <p>See what came in, what went out, and what’s left.</p>
              <div className="wallet-visual visual-grid">
                <div className="wallet-card">
                  <span>
                    <img src="/icon.svg" alt="" />
                    POCKET PACT <Wallet size={20} />
                  </span>
                  <small>This week’s pocket money</small>
                  <strong>
                    ₹1,000<span>.00</span>
                  </strong>
                  <div>
                    <span>From Kunal, with trust.</span>
                    <CheckCheck size={21} />
                  </div>
                </div>
                <div className="wallet-tag">
                  <Check size={17} /> A fresh week. A shared plan.
                </div>
              </div>
            </article>
            <article className="feature-card">
              <span className="feature-icon">
                <Camera />
              </span>
              <h3>Small spends. Full picture.</h3>
              <p>Capture an expense. Check the details. Add your context.</p>
              <div className="feature-phone-scene visual-grid">
                <div className="mini-phone">
                  <div className="phone-island" />
                  <PhoneScreen step={1} />
                </div>
                <span className="feature-visual-label">
                  <ReceiptText size={17} /> Your story belongs with the receipt.
                </span>
              </div>
            </article>
            <article className="feature-card feature-wide">
              <div>
                <span className="feature-icon">
                  <ReceiptText />
                </span>
                <h3>
                  The same picture.
                  <br />
                  Both sides of the story.
                </h3>
                <p>
                  A clear expense history for Ananya.
                  <br />A little reassurance for Kunal.
                </p>
                <Link className="text-link" to="/expenses">
                  Explore expenses <ArrowRight size={17} />
                </Link>
              </div>
              <div className="laptop-scene visual-grid">
                <div className="laptop-screen">
                  <div className="laptop-toolbar">
                    <span>
                      <img src="/icon.svg" alt="" />
                      POCKET PACT
                    </span>
                    <span>
                      Ananya’s week <span className="tiny-avatar">A</span>
                    </span>
                  </div>
                  <div className="laptop-heading">
                    <strong>Little expenses. A clearer week.</strong>
                    <span>₹580 left</span>
                  </div>
                  <div className="sample-ledger">
                    <div className="sample-ledger-head">
                      <span>Expense</span>
                      <span>Category</span>
                      <span>Status</span>
                      <span>Amount</span>
                    </div>
                    {[
                      {
                        Icon: Utensils,
                        name: "Campus mess",
                        category: "Meals",
                        amount: 120,
                      },
                      {
                        Icon: BusFront,
                        name: "Auto to college",
                        category: "Commute",
                        amount: 60,
                      },
                      {
                        Icon: BookOpen,
                        name: "Campus print shop",
                        category: "Study",
                        amount: 120,
                      },
                      {
                        Icon: Coffee,
                        name: "Chai & Co",
                        category: "Your choice",
                        amount: 120,
                      },
                    ].map(({ Icon, name, category, amount }) => (
                      <div key={name}>
                        <span>
                          <Icon size={14} />
                          {name}
                        </span>
                        <span>{category}</span>
                        <span className="ledger-good">
                          <Check size={11} /> Within plan
                        </span>
                        <strong>−₹{amount}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="laptop-bottom">
                    <CheckCheck size={13} /> A shared view, without the
                    guesswork.
                  </div>
                </div>
                <div className="laptop-base" />
              </div>
            </article>
            <article className="feature-card">
              <span className="feature-icon">
                <MessageCircle />
              </span>
              <h3>Context before conclusions</h3>
              <p>An unexpected expense is a reason to talk.</p>
              <div className="conversation-visual visual-grid">
                <div className="expense-proof">
                  <div>
                    <span className="mini-icon">
                      <Coffee size={21} />
                    </span>
                    <div>
                      <small>Your choice</small>
                      <strong>Coffee with friends</strong>
                    </div>
                    <span className="proof-amount">₹90</span>
                  </div>
                  <span className="proof-flag">
                    <Flag size={13} /> ₹60 outside this week’s plan
                  </span>
                </div>
                <div className="sample-message">
                  <span className="mini-avatar">A</span>
                  <p>
                    “Caught up after our last class.
                    <br />
                    I’ll plan for it next week.”
                  </p>
                </div>
                <div className="conversation-footer">
                  <CheckCheck size={16} /> Shared with Kunal, with context.
                </div>
              </div>
            </article>
            <article className="feature-card">
              <span className="feature-icon">
                <SlidersHorizontal />
              </span>
              <h3>Your plan. Made together.</h3>
              <p>Meals, travel, books—and a little room for life.</p>
              <div className="budget-visual visual-grid">
                <div className="budget-visual-card">
                  <div>
                    <span>Your weekly pact</span>
                    <strong>₹1,000</strong>
                  </div>
                  {[
                    { Icon: Utensils, label: "Meals", value: 450 },
                    { Icon: BusFront, label: "Commute", value: 200 },
                    { Icon: BookOpen, label: "Study", value: 200 },
                    { Icon: Coffee, label: "Your choice", value: 150 },
                  ].map(({ Icon, label, value }) => (
                    <div className="visual-budget-row" key={label}>
                      <Icon size={17} />
                      <span>{label}</span>
                      <div>
                        <i style={{ width: `${value / 5}%` }} />
                      </div>
                      <b>₹{value}</b>
                    </div>
                  ))}
                  <footer>
                    <Handshake size={16} /> Changes take two yeses.
                  </footer>
                </div>
              </div>
            </article>
          </div>
        </section>
        <section className="steps-section site-container">
          <div className="landing-section-heading">
            <h2>One week. Three simple steps.</h2>
            <p>Less keeping tabs. More keeping in touch.</p>
          </div>
          <div className="steps-grid">
            {[
              {
                n: "01",
                title: "Make your pact",
                text: "Agree on a weekly amount and where you’d like it to go.",
              },
              {
                n: "02",
                title: "Live your week",
                text: "Add expenses as you go. Leave a note when life happens.",
              },
              {
                n: "03",
                title: "Check in together",
                text: "Understand exceptions and shape a better plan for next week.",
              },
            ].map((step) => (
              <div key={step.n}>
                <span>{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="dark-cta site-container">
          <div className="cta-rays" />
          <div>
            <Handshake size={33} />
            <h2>
              A little pocket money.
              <br />A lot more understanding.
            </h2>
            <p>Take a week in Ananya and Kunal’s shoes.</p>
            <Link className="button" to="/app">
              Demo <ArrowRight size={19} />
            </Link>
            <span className="cta-note">
              No sign-up. Just a shared story to explore.
            </span>
          </div>
        </section>
        <section className="landing-faq site-container" id="faq">
          <div className="landing-section-heading">
            <h2>A few things you might be wondering.</h2>
            <p>Good questions. Straight answers.</p>
          </div>
          <div>
            {faqs.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Plus size={23} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <footer className="site-footer site-container">
        <div className="footer-top">
          <div>
            <Link to="/" className="site-brand">
              <img src="/icon.svg" alt="" />
              <span>
                POCKET<span>PACT</span>
              </span>
            </Link>
            <p>
              A little planning.
              <br />A lot of freedom.
            </p>
          </div>
          <div>
            <strong>Explore</strong>
            <a href="#how-it-works">How it works</a>
            <a href="#features">Features</a>
            <Link to="/app">Demo</Link>
          </div>
          <div>
            <strong>The story</strong>
            <Link to="/about">Meet Ananya & Kunal</Link>
            <a href="#faq">FAQs</a>
            <a
              href="https://github.com/piyushk-dev/pocket-pact"
              target="_blank"
              rel="noreferrer"
            >
              GitHub <ArrowRight size={14} />
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Pocket Pact</span>
          <span>A prototype for clearer money conversations.</span>
          <span>Made with trust in mind.</span>
        </div>
      </footer>
    </div>
  );
}
