import { useEffect, useState } from "react";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowRight,
  BatteryFull,
  BookOpen,
  BusFront,
  Camera,
  Check,
  CheckCheck,
  ChevronRight,
  Coffee,
  Flag,
  ImagePlus,
  Pause,
  Play,
  Plus,
  ReceiptText,
  Signal,
  Utensils,
  Wifi,
} from "lucide-react";

export const demoSteps = [
  "Your weekly balance",
  "Add an expense",
  "Review with context",
  "Keep each other in the loop",
];

export function PhoneScreen({ step }: { step: number }) {
  return (
    <div className={`phone-screen screen-${step}`}>
      <div className="phone-status">
        <strong>9:41</strong>
        <span>
          <Signal size={12} />
          <Wifi size={12} />
          <BatteryFull size={17} />
        </span>
      </div>
      {step === 0 ? (
        <>
          <div className="phone-brand">
            <img src="/icon.svg" alt="" />
            POCKET PACT
          </div>
          <div className="phone-greeting">
            <span>
              Hey, Ananya <span aria-hidden="true">✦</span>
            </span>
            <span className="mini-avatar">A</span>
          </div>
          <div className="phone-balance">
            <span>Left this week</span>
            <strong>
              ₹580<span>.00</span>
            </strong>
            <small>of ₹1,000 from Dad</small>
            <div className="phone-balance-line">
              <i />
            </div>
            <div className="phone-balance-bottom">
              <span>₹420 spent</span>
              <ArrowDownLeft size={16} />
            </div>
          </div>
          <div className="phone-section-title">
            Your weekly pact <span>View all</span>
          </div>
          <div className="phone-budgets">
            <div>
              <Utensils />
              <span>Meals</span>
              <strong>₹450</strong>
            </div>
            <div>
              <BusFront />
              <span>Commute</span>
              <strong>₹200</strong>
            </div>
            <div>
              <BookOpen />
              <span>Study</span>
              <strong>₹200</strong>
            </div>
          </div>
          <div className="phone-section-title">
            Recent activity <ChevronRight size={15} />
          </div>
          <div className="phone-transaction">
            <span className="mini-icon">
              <Coffee size={17} />
            </span>
            <div>
              <strong>Chai & Co</strong>
              <small>Your choice · Today</small>
            </div>
            <b>−₹120</b>
          </div>
          <div className="phone-primary">
            <Plus size={16} /> Add expense
          </div>
        </>
      ) : step === 1 ? (
        <>
          <div className="phone-title">
            <ArrowLeft size={18} />
            Add an expense
            <Camera size={18} />
          </div>
          <p className="phone-instruction">A receipt. A photo. A few words.</p>
          <div className="phone-capture-tabs">
            <span>Type it</span>
            <span className="selected">Snap it</span>
            <span>Say it</span>
          </div>
          <div className="receipt-scene">
            <div className="scan-corner tl" />
            <div className="scan-corner tr" />
            <div className="scan-corner bl" />
            <div className="scan-corner br" />
            <div className="paper-receipt">
              <Coffee size={23} />
              <strong>CAMPUS COFFEE</strong>
              <small>A little break between classes</small>
              <hr />
              <div>
                <span>Iced coffee</span>
                <span>₹90</span>
              </div>
              <div className="receipt-total">
                <b>Total paid</b>
                <b>₹90</b>
              </div>
              <div className="receipt-barcode" />
            </div>
            <div className="receipt-scan-line" />
          </div>
          <div className="phone-upload">
            <ImagePlus size={16} /> Receipt attached <Check size={15} />
          </div>
          <div className="phone-primary">
            Review expense <ArrowRight size={16} />
          </div>
          <small className="phone-footnote">
            Sample receipt · Illustrative walkthrough
          </small>
        </>
      ) : step === 2 ? (
        <>
          <div className="phone-title">
            <ArrowLeft size={18} />
            Review expense<span>2 of 2</span>
          </div>
          <div className="phone-review-amount">
            <span className="mini-icon">
              <Coffee size={24} />
            </span>
            <span>Coffee with friends</span>
            <strong>
              ₹90<span>.00</span>
            </strong>
            <small>Your choice</small>
          </div>
          <div className="phone-flag">
            <Flag size={17} />
            <div>
              <strong>A little outside the plan</strong>
              <p>₹60 over your “Your choice” budget.</p>
            </div>
          </div>
          <label className="phone-note-label">Add your side of the story</label>
          <div className="phone-note">
            Caught up with friends after our last class. I’ll plan for it next
            week.
          </div>
          <div className="phone-sharing">
            <CheckCheck size={16} /> You review it before Dad sees it.
          </div>
          <div className="phone-primary">
            Save & share <ArrowRight size={16} />
          </div>
        </>
      ) : (
        <>
          <div className="phone-success">
            <div className="success-ring">
              <Check size={44} strokeWidth={2.5} />
            </div>
            <h3>Saved & shared.</h3>
            <p>A little context goes a long way.</p>
            <strong>
              ₹90<span>.00</span>
            </strong>
            <span>Coffee with friends</span>
          </div>
          <div className="phone-dad-message">
            <span className="mini-avatar">K</span>
            <div>
              <strong>Kunal can see your note</strong>
              <p>An exception starts a conversation.</p>
            </div>
            <CheckCheck size={16} />
          </div>
          <div className="phone-after-balance">
            <span>Left this week</span>
            <strong>₹490</strong>
          </div>
          <div className="phone-primary">
            Back to my week <ArrowRight size={16} />
          </div>
        </>
      )}
      <div className="phone-home-bar" />
    </div>
  );
}

export function PhoneDemo({ restart }: { restart: number }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(
    () =>
      restart > 0 ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(
      () => setStep((current) => (current + 1) % demoSteps.length),
      4800,
    );
    return () => window.clearInterval(timer);
  }, [playing, restart]);
  return (
    <div
      className={`phone-demo ${playing ? "playing" : "paused"}`}
      id="walkthrough"
    >
      <div className="device-grid">
        <div className="floating-note note-top">
          <span className="mini-icon">
            <CheckCheck size={19} />
          </span>
          <div>
            <strong>A plan you share.</strong>
            <span>Space to make it your own.</span>
          </div>
        </div>
        <div
          className="phone-device"
          aria-label={`Sample app screen: ${demoSteps[step]}`}
        >
          <div className="phone-island" />
          <PhoneScreen key={step} step={step} />
        </div>
        <div className="floating-note note-bottom">
          <span className="mini-icon">
            <ReceiptText size={20} />
          </span>
          <div>
            <strong>Every expense has a story.</strong>
            <span>Make room for yours.</span>
          </div>
        </div>
      </div>
      <div className="demo-controls">
        <button
          className="demo-play"
          onClick={() => setPlaying(!playing)}
          aria-label={playing ? "Pause walkthrough" : "Play walkthrough"}
        >
          {playing ? <Pause size={15} /> : <Play size={15} />}
        </button>
        <div className="demo-step-dots">
          {demoSteps.map((label, index) => (
            <button
              key={label}
              className={index === step ? "active" : ""}
              onClick={() => {
                setStep(index);
                setPlaying(false);
              }}
              aria-label={`Show step ${index + 1}: ${label}`}
              aria-pressed={index === step}
            />
          ))}
        </div>
        <span>{String(step + 1).padStart(2, "0")} / 04</span>
      </div>
      <p className="demo-caption">{demoSteps[step]}</p>
    </div>
  );
}
