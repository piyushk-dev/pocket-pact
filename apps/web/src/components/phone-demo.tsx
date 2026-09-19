import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  BookOpen,
  BusFront,
  Camera,
  ChartNoAxesCombined,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Flag,
  Handshake,
  Maximize2,
  MessageCircle,
  Pause,
  Play,
  Plus,
  Signal,
  Sparkles,
  Utensils,
  Wallet,
  Wifi,
  X,
} from "lucide-react";

export const demoSteps = [
  {
    title: "Make a plan together",
    short: "Plan",
    description:
      "Kunal sends ₹1,000 for the week. Together, they agree on meals, travel, books, and their own food preferences. Ananya stays in charge of her spending.",
    note: "A shared plan. Her own choices.",
    detail: "Weekly budgets + food preferences",
    Icon: Handshake,
  },
  {
    title: "Snap what you bought",
    short: "Capture",
    description:
      "A burger after a late class. Ananya adds a photo and enters ₹180. A photo adds context; she confirms the amount and category before sharing.",
    note: "More than a line on a statement.",
    detail: "A photo, an amount, her story",
    Icon: Camera,
  },
  {
    title: "Review the exception",
    short: "Review",
    description:
      "The photo suggests fast food. This would be the third fast-food meal against their agreed two-per-week preference. Ananya can correct the suggestion and explain what happened.",
    note: "Flag the pattern. Hear the context.",
    detail: "An AI suggestion to review",
    Icon: Flag,
  },
  {
    title: "Keep Kunal in the loop",
    short: "Share",
    description:
      "Kunal sees the expense alongside Ananya’s note: the mess was closed after lab. He can acknowledge it and respond. The next conversation starts with understanding.",
    note: "The expense and the explanation.",
    detail: "Shared with Kunal, after review",
    Icon: MessageCircle,
  },
  {
    title: "Plan a better month",
    short: "Reflect",
    description:
      "See where the month’s money went, which patterns repeated, and what to change. More late classes? Make room for a few extra meals next month—together.",
    note: "Small entries. Useful patterns.",
    detail: "Monthly spending + the next plan",
    Icon: ChartNoAxesCombined,
  },
];
const categories = [
  { Icon: Utensils, label: "Meals", amount: 450 },
  { Icon: BusFront, label: "Commute", amount: 200 },
  { Icon: BookOpen, label: "Study", amount: 200 },
  { Icon: Wallet, label: "Your choice", amount: 150 },
];

export function PhoneScreen({ step }: { step: number }) {
  return (
    <div className={`story-screen story-screen-${step}`}>
      <div className="story-status">
        <strong>9:41</strong>
        <span>
          <Signal size={12} />
          <Wifi size={12} />
          <BatteryFull size={16} />
        </span>
      </div>
      <div className="story-appbar">
        {step === 0 ? <img src="/icon.svg" alt="" /> : <ArrowLeft size={17} />}
        <strong>
          {
            [
              "Your weekly pact",
              "Add a photo",
              "Review suggestion",
              "Family check-in",
              "Your month",
            ][step]
          }
        </strong>
        <span className="story-avatar">{step === 3 ? "K" : "A"}</span>
      </div>
      <div className="story-content" key={step}>
        {step === 0 ? (
          <>
            <div className="story-balance">
              <span>This week, from Dad</span>
              <strong>₹1,000</strong>
              <span>
                <CheckCheck size={14} /> Planned together. Yours to spend.
              </span>
            </div>
            <div className="story-budget-list">
              {categories.map(({ Icon, label, amount }) => (
                <div key={label}>
                  <Icon size={17} />
                  <span>{label}</span>
                  <strong>₹{amount}</strong>
                </div>
              ))}
            </div>
            <div className="story-preference">
              <Utensils size={16} />
              <div>
                <strong>A preference we share</strong>
                <span>Fast food · up to 2 meals / week</span>
              </div>
            </div>
            <div className="story-action">
              <Plus size={16} /> Add an expense
            </div>
          </>
        ) : step === 1 ? (
          <>
            <p className="story-lead">A quick snap. The full picture.</p>
            <div className="story-photo">
              <img
                src="/images/meal-example.webp"
                alt="Sample photo of a burger and fries on a plate"
              />
              <span>
                <Camera size={14} /> Photo added
              </span>
              <i className="story-scan" />
            </div>
            <div className="story-entry">
              <span>
                Lunch after class<small>Amount entered by Ananya</small>
              </span>
              <strong>₹180</strong>
            </div>
            <div className="story-suggestion">
              <Sparkles size={17} />
              <span>
                Suggested category<strong>Food & dining</strong>
              </span>
              <Check size={16} />
            </div>
            <div className="story-action">
              Review expense <ArrowRight size={16} />
            </div>
          </>
        ) : step === 2 ? (
          <>
            <div className="story-expense">
              <img src="/images/meal-example.webp" alt="" />
              <span>
                Lunch after class<small>Meals · ₹180</small>
              </span>
            </div>
            <div className="story-alert">
              <span>
                <Flag size={17} />
                <strong>Possible fast food</strong>
              </span>
              <p>
                3rd meal this week.
                <br />
                Your pact says up to 2.
              </p>
              <small>AI suggestion · You can correct it</small>
            </div>
            <div className="story-context">
              <strong>Ananya’s side of the story</strong>
              <p>
                “The mess was closed after lab. Grabbed a burger with my
                friends.”
              </p>
            </div>
            <span className="story-inline-note">
              <CheckCheck size={15} /> Review first. Then share.
            </span>
            <div className="story-action">
              Save with my note <ArrowRight size={16} />
            </div>
          </>
        ) : step === 3 ? (
          <>
            <div className="story-notification">
              <span className="story-avatar">A</span>
              <div>
                <strong>Ananya shared an expense</strong>
                <span>Lunch after class · ₹180</span>
              </div>
            </div>
            <div className="story-shared-photo">
              <img
                src="/images/meal-example.webp"
                alt="Sample meal shared with Kunal"
              />
              <span>
                <Flag size={13} /> Outside our food preference
              </span>
            </div>
            <div className="story-chat ananya">
              <strong>Ananya</strong>
              <p>
                The mess was closed after lab. Grabbed a burger with friends.
              </p>
            </div>
            <div className="story-chat kunal">
              <strong>
                Kunal <CheckCheck size={13} />
              </strong>
              <p>Got it. Let’s plan for those late classes next week.</p>
            </div>
            <div className="story-ack">
              <Check size={17} /> Seen, understood, acknowledged.
            </div>
          </>
        ) : (
          <>
            <div className="story-month-title">
              <span>September · Sample month</span>
              <strong>
                ₹3,240<span> / ₹4,000</span>
              </strong>
              <small>₹760 left to carry forward</small>
            </div>
            <div
              className="story-chart"
              role="img"
              aria-label="Sample weekly spending: week 1 ₹780, week 2 ₹860, week 3 ₹740, week 4 ₹860"
            >
              {[780, 860, 740, 860].map((value, i) => (
                <div key={i}>
                  <span>₹{value}</span>
                  <i
                    style={
                      { "--bar-height": `${value / 10}px` } as CSSProperties
                    }
                  />
                  <small>W{i + 1}</small>
                </div>
              ))}
            </div>
            <div className="story-month-stats">
              <span>
                <strong>3</strong>check-ins
              </span>
              <span>
                <strong>2</strong>talked through
              </span>
              <span>
                <strong>1</strong>to discuss
              </span>
            </div>
            <div className="story-insight">
              <Sparkles size={16} />
              <p>
                Late classes, extra meals.
                <br />
                <strong>Make room in next month’s plan.</strong>
              </p>
            </div>
            <div className="story-action">
              Plan next month <ArrowRight size={16} />
            </div>
          </>
        )}
      </div>
      <div className="story-home-bar" />
    </div>
  );
}

function WalkthroughDialog({
  step,
  onStep,
  origin,
  onClose,
}: {
  step: number;
  onStep: (step: number) => void;
  origin: DOMRect;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const device = useRef<HTMLDivElement>(null);
  const closing = useRef(false);
  useEffect(() => {
    const element = dialog.current!;
    const trigger = document.activeElement;
    const previous = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    let animation: Animation | undefined;
    if (
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      device.current
    ) {
      const target = device.current.getBoundingClientRect();
      animation = device.current.animate(
        [
          {
            transform: `translate(${origin.x - target.x}px,${origin.y - target.y}px) scale(${origin.width / target.width},${origin.height / target.height})`,
          },
          { transform: "none" },
        ],
        { duration: 440, easing: "cubic-bezier(.2,.8,.2,1)" },
      );
    }
    return () => {
      animation?.cancel();
      element.close();
      document.body.style.overflow = previous;
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true });
    };
  }, [origin]);
  function close() {
    if (closing.current) return;
    closing.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onClose();
      return;
    }
    const animation = dialog.current?.animate(
      [
        { opacity: 1, transform: "scale(1)" },
        { opacity: 0, transform: "scale(.97)" },
      ],
      { duration: 160, easing: "ease-in", fill: "forwards" },
    );
    if (animation) void animation.finished.then(onClose, onClose);
    else onClose();
  }
  const current = demoSteps[step];
  return (
    <dialog
      ref={dialog}
      className="walkthrough-modal"
      aria-label="Explore the Pocket Pact story"
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="walkthrough-modal-inner">
        <button
          className="walkthrough-close"
          onClick={close}
          aria-label="Close walkthrough"
          autoFocus
        >
          <X size={23} />
        </button>
        <div className="expanded-device-stage">
          <div className="story-device enlarged" ref={device}>
            <div className="story-island" />
            <PhoneScreen step={step} />
          </div>
        </div>
        <div className="walkthrough-detail">
          <span className="walkthrough-label">
            THE POCKET PACT STORY · {step + 1} / {demoSteps.length}
          </span>
          <h2>{current.title}</h2>
          <p>{current.description}</p>
          <nav
            className="walkthrough-chapters"
            aria-label="Walkthrough chapters"
          >
            {demoSteps.map(({ title, short, Icon }, i) => (
              <button
                key={title}
                onClick={() => onStep(i)}
                aria-current={step === i ? "step" : undefined}
              >
                <Icon size={17} />
                <span>{short}</span>
                {i < step && <Check size={13} />}
              </button>
            ))}
          </nav>
          <div className="walkthrough-page-controls">
            <button disabled={step === 0} onClick={() => onStep(step - 1)}>
              <ChevronLeft size={18} /> Back
            </button>
            {step < demoSteps.length - 1 ? (
              <button className="next" onClick={() => onStep(step + 1)}>
                Next: {demoSteps[step + 1].short}
                <ChevronRight size={18} />
              </button>
            ) : (
              <Link to="/app" className="next">
                Try the web app <ArrowRight size={18} />
              </Link>
            )}
          </div>
          <p className="walkthrough-disclosure">
            Illustrative product preview. AI food suggestions and monthly
            insights are not connected in the current web app.
          </p>
        </div>
      </div>
    </dialog>
  );
}

export function PhoneDemo() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [origin, setOrigin] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(true);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => {
      if (media.matches) setPlaying(false);
    };
    media.addEventListener("change", change);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.25 },
    );
    if (root.current) observer.observe(root.current);
    return () => {
      media.removeEventListener("change", change);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (!playing || origin || !visible) return;
    const timer = window.setTimeout(
      () => setStep((current) => (current + 1) % demoSteps.length),
      9000,
    );
    return () => window.clearTimeout(timer);
  }, [playing, origin, visible, step]);
  const current = demoSteps[step];
  return (
    <div
      ref={root}
      className={`phone-demo ${playing && !origin && visible ? "playing" : "paused"}`}
      id="walkthrough"
    >
      <div className="device-grid">
        <button
          className="phone-launch"
          aria-label="Enlarge product walkthrough"
          onClick={(e) => {
            setPlaying(false);
            setOrigin(e.currentTarget.getBoundingClientRect());
          }}
        >
          <span className="story-device">
            <span className="story-island" />
            <PhoneScreen step={step} />
          </span>
        </button>
        <div className="story-floating-note" key={step}>
          <span>
            <current.Icon size={20} />
          </span>
          <div>
            <strong>{current.note}</strong>
            <small>{current.detail}</small>
          </div>
        </div>
      </div>
      <div className="demo-controls">
        <button
          className="demo-play"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
        >
          {playing ? <Pause size={17} /> : <Play size={17} />}
        </button>
        <div className="demo-step-dots">
          {demoSteps.map(({ title }, i) => (
            <button
              key={title}
              className={i === step ? "active" : ""}
              aria-label={`Show step ${i + 1}: ${title}`}
              aria-pressed={i === step}
              onClick={() => {
                setStep(i);
                setPlaying(false);
              }}
            >
              <span style={{ "--step-duration": "9s" } as CSSProperties} />
            </button>
          ))}
        </div>
        <span>{String(step + 1).padStart(2, "0")} / 05</span>
        <button
          className="demo-expand"
          aria-label="Expand current step"
          onClick={() => {
            const target = root.current?.querySelector(".story-device");
            if (target) {
              setPlaying(false);
              setOrigin(target.getBoundingClientRect());
            }
          }}
        >
          <Maximize2 size={17} />
        </button>
      </div>
      <p className="demo-caption">{current.title}</p>
      {origin && (
        <WalkthroughDialog
          step={step}
          onStep={setStep}
          origin={origin}
          onClose={() => setOrigin(null)}
        />
      )}
    </div>
  );
}
