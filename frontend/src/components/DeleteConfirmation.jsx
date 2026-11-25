import { useEffect, useRef } from "react";

export default function DeleteConfirmation({ open, loading, onCancel, onConfirm }) {
  const dialogRef = useRef(null);
  const cancelButtonRef = useRef(null);
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    function onKeyDown(event) {
      if (event.key === "Escape" && !loading) {
        onCancel();
        return;
      }

      if (event.key !== "Tab") return;
      const focusableButtons = [cancelButtonRef.current, confirmButtonRef.current]
        .filter((button) => button && !button.disabled);
      if (focusableButtons.length === 0) {
        event.preventDefault();
        dialogRef.current?.focus();
        return;
      }
      const firstButton = focusableButtons[0];
      const lastButton = focusableButtons[focusableButtons.length - 1];

      if (!dialogRef.current?.contains(document.activeElement)) {
        event.preventDefault();
        firstButton?.focus();
      } else if (event.shiftKey && document.activeElement === firstButton) {
        event.preventDefault();
        lastButton?.focus();
      } else if (!event.shiftKey && document.activeElement === lastButton) {
        event.preventDefault();
        firstButton?.focus();
      }
    }

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    if (loading) dialogRef.current?.focus();
    else cancelButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [open, loading, onCancel]);

  if (!open) return null;

  return (
    <div
      className="confirm-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) onCancel();
      }}
    >
      <section
        ref={dialogRef}
        className="confirm-dialog"
        role="alertdialog"
        tabIndex="-1"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <div className="confirm-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M5 7h14M9 7V5h6v2m3 0-.8 11a1.5 1.5 0 0 1-1.5 1.4H8.3A1.5 1.5 0 0 1 6.8 18L6 7m4 4v5m4-5v5" />
          </svg>
        </div>
        <h2 id="delete-dialog-title">Delete this scan?</h2>
        <p id="delete-dialog-description">
          This scan and its saved result will be permanently removed. This action can’t be undone.
        </p>
        <div className="confirm-actions">
          <button
            ref={cancelButtonRef}
            className="cancel-button"
            type="button"
            onClick={onCancel}
            disabled={loading}
          >
            Keep scan
          </button>
          <button
            ref={confirmButtonRef}
            className="confirm-delete-button"
            type="button"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <span className="loading-spinner" aria-hidden="true" />}
            {loading ? "Deleting..." : "Delete scan"}
          </button>
        </div>
      </section>
    </div>
  );
}
