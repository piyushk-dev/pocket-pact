import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ImagePlus,
  LoaderCircle,
  Mic,
  PencilLine,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import {
  money,
  reviewExpense,
  weekEnd,
  type Category,
  type ExpenseInput,
} from "@shared/domain";
import { usePact } from "../state";
import { CategorySelect, ErrorMessage, Modal } from "./ui";

type CaptureMode = "manual" | "photo" | "voice";
type Analysis = {
  merchant: string;
  amount: number | null;
  category: Category;
  explanation: string;
  evidence: "receipt" | "photo" | "none";
  source: "gemini" | "manual";
  receiptId?: string;
  warning?: string;
  fastFood: boolean;
};

export function ExpenseDialog({
  mode: initialMode,
  onClose,
}: {
  mode: CaptureMode;
  onClose: () => void;
}) {
  const { state, act, busy, profile } = usePact();
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState<"capture" | "review">("capture");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [merchant, setMerchant] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<Category>("personal");
  const [date, setDate] = useState(() => {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Asia/Kolkata",
    });
    return today >= state.weekStart && today <= weekEnd(state.weekStart)
      ? today
      : state.weekStart;
  });
  const [note, setNote] = useState("");
  const [shareReceipt, setShareReceipt] = useState(false);
  const [fastFood, setFastFood] = useState(false);
  const attachedId = useRef<string | undefined>(undefined);
  const [recording, setRecording] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const recordTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const aborted = useRef(false);
  const id = useRef(crypto.randomUUID());
  const upload = useRef<HTMLInputElement>(null);
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview);
    },
    [preview],
  );
  useEffect(() => {
    aborted.current = false;
    return () => {
      aborted.current = true;
      clearTimeout(recordTimer.current);
      if (recorder.current?.state === "recording") recorder.current.stop();
      stream.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);
  const amountPaise = Math.round(Number(amount) * 100);
  const flags =
    Number.isFinite(amountPaise) && amountPaise > 0
      ? reviewExpense(state, { amount: amountPaise, category, fastFood })
      : [];

  function selectFile(next?: File) {
    if (!next) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(next.type) ||
      next.size > 5 * 1024 * 1024
    ) {
      setError("Choose a JPG, PNG or WebP image under 5 MB.");
      return;
    }
    setFile(next);
    attachedId.current = undefined;
    setAnalysis(null);
    setPreview(URL.createObjectURL(next));
    setError("");
  }
  function reviewManually() {
    setStep("review");
    setError("");
    if (!merchant && description.length < 100) setMerchant(description);
  }
  async function analyze() {
    setLoading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("description", description);
      if (file) body.append("image", file);
      const response = await fetch("/api/analyze", { method: "POST", body });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error ||
            "Could not read this expense. You can still enter the details yourself.",
        );
      setAnalysis(data);
      attachedId.current = data.receiptId;
      setFastFood(data.fastFood ?? false);
      setMerchant(data.merchant || "");
      setAmount(data.amount === null ? "" : String(data.amount / 100));
      setCategory(data.category);
      setStep("review");
    } catch (e) {
      setError(
        e instanceof Error && !e.message.includes("JSON")
          ? e.message
          : "AI reading is unavailable right now. You can enter the details yourself.",
      );
    } finally {
      setLoading(false);
    }
  }
  async function toggleRecording() {
    if (recording) {
      recorder.current?.stop();
      return;
    }
    setError("");
    try {
      if (!navigator.mediaDevices?.getUserMedia)
        throw new Error(
          "Recording is unavailable in this browser. Try typing your expense.",
        );
      stream.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (aborted.current) {
        stream.current.getTracks().forEach((track) => track.stop());
        return;
      }
      const mimeType = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4",
      ].find((type) => MediaRecorder.isTypeSupported(type));
      const rec = new MediaRecorder(
        stream.current,
        mimeType ? { mimeType } : {},
      );
      recorder.current = rec;
      const chunks: BlobPart[] = [];
      rec.ondataavailable = (e) => {
        if (e.data.size) chunks.push(e.data);
      };
      rec.onstop = async () => {
        clearTimeout(recordTimer.current);
        stream.current?.getTracks().forEach((track) => track.stop());
        if (aborted.current) return;
        setRecording(false);
        setLoading(true);
        try {
          const form = new FormData();
          form.append(
            "audio",
            new Blob(chunks, { type: rec.mimeType }),
            rec.mimeType.includes("mp4") ? "expense.m4a" : "expense.webm",
          );
          const response = await fetch("/api/speech/transcribe", {
            method: "POST",
            body: form,
          });
          const data = await response.json();
          if (!response.ok)
            throw new Error(
              data.error || "Could not understand that recording.",
            );
          setDescription(data.transcript);
        } catch (e) {
          setError(
            e instanceof Error && !e.message.includes("JSON")
              ? e.message
              : "Voice is unavailable right now. You can type your expense instead.",
          );
        } finally {
          if (!aborted.current) setLoading(false);
        }
      };
      rec.start();
      setRecording(true);
      recordTimer.current = setTimeout(() => {
        if (rec.state === "recording") rec.stop();
      }, 25_000);
    } catch (e) {
      stream.current?.getTracks().forEach((track) => track.stop());
      setError(
        (e as Error).name === "NotAllowedError"
          ? "Microphone access was declined. You can type the same details below."
          : (e as Error).message,
      );
    }
  }
  async function save() {
    setError("");
    const expense: ExpenseInput = {
      id: id.current,
      merchant,
      amount: amountPaise,
      category,
      date,
      note,
      shareReceipt,
      fastFood,
      source: analysis?.source ?? "manual",
      evidence: analysis?.evidence ?? (file ? "photo" : "none"),
      ...(analysis?.receiptId ? { receiptId: analysis.receiptId } : {}),
    };
    try {
      setLoading(true);
      if (file && !attachedId.current) {
        const body = new FormData();
        body.append("image", file);
        const response = await fetch("/api/receipts", { method: "POST", body });
        const uploaded = await response.json();
        if (!response.ok)
          throw new Error(
            uploaded.error || "Could not attach the photo. Try again.",
          );
        attachedId.current = uploaded.receiptId;
      }
      if (attachedId.current) expense.receiptId = attachedId.current;
      await act(
        { type: "add-expense", expense },
        flags.length
          ? `Expense saved. ${profile.supporter} can see the exception and your context.`
          : "Expense saved. Your week is up to date.",
      );
      onClose();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <Modal
      title={
        step === "capture"
          ? "A little entry. A clearer week."
          : "Does this look right?"
      }
      onClose={onClose}
    >
      <div className="step-indicator">
        <span className={step === "capture" ? "current" : "complete"}>
          1 <span>Capture</span>
        </span>
        <i />
        <span className={step === "review" ? "current" : ""}>
          2 <span>Review & save</span>
        </span>
      </div>
      {step === "capture" ? (
        <>
          <p className="modal-intro">
            A receipt, a photo, or a few words. Start wherever is easiest.
          </p>
          <div
            className="capture-tabs"
            role="tablist"
            aria-label="Expense entry method"
          >
            {(
              [
                { id: "manual", icon: PencilLine, label: "Type it" },
                { id: "photo", icon: Camera, label: "Snap it" },
                { id: "voice", icon: Mic, label: "Say it" },
              ] as const
            ).map(({ id: tab, icon: Icon, label }) => (
              <button
                role="tab"
                aria-selected={mode === tab}
                key={tab}
                disabled={recording || loading}
                className={mode === tab ? "active" : ""}
                onClick={() => {
                  setMode(tab);
                  setError("");
                }}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
          {mode === "photo" && (
            <>
              <input
                ref={upload}
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                aria-label="Upload expense photo"
                onChange={(e) => selectFile(e.target.files?.[0])}
              />
              {preview ? (
                <div className="upload-preview">
                  <img src={preview} alt="Your expense attachment" />
                  <div>
                    <strong>{file?.name}</strong>
                    <small>
                      Ready to read · {Math.round((file?.size ?? 0) / 1024)} KB
                    </small>
                    <button
                      className="text-button"
                      onClick={() => {
                        setFile(null);
                        attachedId.current = undefined;
                        setAnalysis(null);
                        setPreview("");
                        if (upload.current) upload.current.value = "";
                      }}
                    >
                      <X size={14} />
                      Remove photo
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="upload-zone"
                  onClick={() => upload.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    selectFile(e.dataTransfer.files[0]);
                  }}
                >
                  <ImagePlus size={32} />
                  <strong>Drop a receipt or choose a photo</strong>
                  <span>JPG, PNG or WebP · up to 5 MB</span>
                </button>
              )}
              <p className="subtle-note">
                A receipt can show a price. A food photo alone can’t—we’ll ask
                you for the amount.
              </p>
            </>
          )}
          {mode === "voice" && (
            <div className={`voice-zone ${recording ? "recording" : ""}`}>
              <button
                className="record-button"
                onClick={() => void toggleRecording()}
                disabled={loading}
                aria-label={recording ? "Stop recording" : "Start recording"}
              >
                {loading ? (
                  <LoaderCircle className="spin" />
                ) : recording ? (
                  <span className="stop-square" />
                ) : (
                  <Mic size={27} />
                )}
              </button>
              <strong>
                {recording
                  ? "Listening. Tap to finish."
                  : loading
                    ? "Turning your words into text…"
                    : "Your words are enough."}
              </strong>
              <span>Hindi, Hinglish or English · up to 25 seconds</span>
            </div>
          )}
          <label className="field">
            {mode === "voice"
              ? "Your words, ready to review"
              : mode === "photo"
                ? "Anything else to add? (optional)"
                : "What did you spend on?"}
            <textarea
              placeholder="Coffee with friends at Chai & Co., ₹90"
              rows={3}
              value={description}
              maxLength={1200}
              onChange={(e) => setDescription(e.target.value)}
              disabled={recording}
            />
          </label>
          {mode === "manual" && (
            <div className="examples">
              <span>Try an example</span>
              <button
                onClick={() => {
                  setMerchant("Coffee with friends");
                  setAmount("90");
                  setCategory("personal");
                  setNote("Caught up after our last class.");
                  setStep("review");
                }}
              >
                Coffee with friends · ₹90 <ArrowRight size={13} />
              </button>
              <button
                onClick={() => {
                  setMerchant("Auto home");
                  setAmount("180");
                  setCategory("commute");
                  setNote("Lab ended late and I missed the bus.");
                  setStep("review");
                }}
              >
                A late ride home · ₹180 <ArrowRight size={13} />
              </button>
            </div>
          )}
          <ErrorMessage message={error} />
          <p className="privacy-note">
            <ShieldCheck size={15} />
            Nothing is shared with {profile.supporter} until you review and
            save.
          </p>
          <div className="modal-actions">
            <button
              className="text-button"
              disabled={loading || recording}
              onClick={reviewManually}
            >
              Enter details myself
            </button>
            <button
              className="button primary"
              disabled={loading || recording || (!description.trim() && !file)}
              onClick={() => void analyze()}
            >
              {loading ? (
                <LoaderCircle size={17} className="spin" />
              ) : (
                <Sparkles size={17} />
              )}
              Read my expense
            </button>
          </div>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
        >
          <p className="modal-intro">
            You have the final say. Check the details before adding this to your
            week.
          </p>
          {analysis && (
            <div className="analysis-note">
              <Sparkles size={17} />
              <p>
                <strong>
                  {analysis.source === "gemini"
                    ? "Suggested by AI"
                    : "Ready for your details"}
                </strong>
                <span>{analysis.warning || analysis.explanation}</span>
              </p>
            </div>
          )}
          <label className="field">
            Where or what?
            <input
              autoFocus
              value={merchant}
              onChange={(e) => setMerchant(e.target.value)}
              placeholder="e.g. Campus bookshop"
              maxLength={100}
              required
            />
          </label>
          <div className="form-grid">
            <label className="field">
              Amount (₹)
              <input
                type="number"
                inputMode="decimal"
                min="0.01"
                max="100000"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </label>
            <label className="field">
              Category
              <CategorySelect value={category} onChange={setCategory} />
            </label>
          </div>
          <label className="field">
            Date
            <input
              type="date"
              value={date}
              min={state.weekStart}
              max={weekEnd(state.weekStart)}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={fastFood}
              onChange={(e) => setFastFood(e.target.checked)}
            />
            <span>
              This was a fast-food meal
              <small>
                {analysis ? "Check this suggestion before saving. " : ""}Used
                only for your agreed weekly preference.
              </small>
            </span>
          </label>
          {flags.length > 0 ? (
            <div className="review-box">
              <span className="review-symbol">!</span>
              <div>
                <strong>Let’s leave room for context.</strong>
                {flags.map((flag) => (
                  <p key={flag}>{flag}</p>
                ))}
                <small>
                  Save it with a note. {profile.supporter} will see it in
                  Together.
                </small>
              </div>
            </div>
          ) : (
            amountPaise > 0 && (
              <div className="within-plan">
                <Check size={17} />
                This fits your shared plan.
              </div>
            )
          )}
          <label className="field">
            {flags.length
              ? `What would you like ${profile.supporter} to know? (optional)`
              : "A note for later (optional)"}
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={600}
              placeholder="A little context goes a long way."
            />
          </label>
          {(file || analysis?.receiptId) && (
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={shareReceipt}
                onChange={(e) => setShareReceipt(e.target.checked)}
              />
              <span>
                Share this attachment with {profile.supporter}
                <small>
                  Your amount, category and note are already part of the shared
                  pact.
                </small>
              </span>
            </label>
          )}
          {file && !analysis?.receiptId && (
            <p className="subtle-note">
              Your photo will be attached when you save. You can enter details
              without AI.
            </p>
          )}
          <ErrorMessage message={error} />
          <div className="modal-actions">
            <button
              type="button"
              className="text-button"
              disabled={loading || busy}
              onClick={() => {
                setStep("capture");
                setError("");
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <button className="button primary" disabled={busy || loading}>
              {busy || loading ? (
                <LoaderCircle size={16} className="spin" />
              ) : (
                <Check size={17} />
              )}
              Save {amountPaise > 0 ? money(amountPaise) : "expense"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
