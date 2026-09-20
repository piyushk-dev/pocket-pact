import { useLayoutEffect, useRef, type ReactNode } from "react";
import {
  BookOpen,
  BusFront,
  Camera,
  Check,
  CircleHelp,
  Coffee,
  Utensils,
  X,
} from "lucide-react";
import { categoryLabels, type Category, type Expense } from "@shared/domain";

export const categoryIcons = {
  meals: Utensils,
  commute: BusFront,
  study: BookOpen,
  personal: Coffee,
  other: CircleHelp,
};
export function CategoryIcon({ category }: { category: Category }) {
  const Icon = categoryIcons[category];
  return (
    <span className={`category-icon ${category}`}>
      <Icon size={21} aria-hidden="true" />
    </span>
  );
}
export function Status({ expense }: { expense: Expense }) {
  return (
    <span
      className={`status ${expense.flags.length ? (expense.acknowledged ? "noted" : "review") : "okay"}`}
    >
      {expense.flags.length ? (
        expense.acknowledged ? (
          <>
            <Check size={12} /> Acknowledged
          </>
        ) : (
          "Needs a conversation"
        )
      ) : (
        "Within plan"
      )}
    </span>
  );
}
export function Modal({
  children,
  title,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  title: string;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current!;
    const trigger = document.activeElement;
    dialog.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
      if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      aria-label={title}
    >
      <div className="modal-inner">
        <header className="modal-header">
          <h2>{title}</h2>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={21} />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}
export function Empty({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Camera size={25} />
      </span>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}
export function ErrorMessage({ message }: { message: string }) {
  return message ? (
    <p className="form-error" role="alert">
      {message}
    </p>
  ) : null;
}
export function CategorySelect({
  value,
  onChange,
}: {
  value: Category;
  onChange: (category: Category) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Category)}
    >
      {Object.entries(categoryLabels).map(([key, label]) => (
        <option value={key} key={key}>
          {label}
        </option>
      ))}
    </select>
  );
}
