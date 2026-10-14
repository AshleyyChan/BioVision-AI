import React, { useEffect } from "react";

/**
 * Modal
 * -----
 * Generic reusable modal wrapper.
 *
 * Responsibilities:
 * - Render content in an overlay
 * - Trap interaction inside modal
 * - Close on overlay click or ESC
 *
 * NO business logic.
 */
const Modal = ({ isOpen, onClose, children }) => {
  /* ------------------------------------------------------------------ */
  /* Escape key handling                                                 */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>

      {/* local animation */}
      <style>
        {`
          @keyframes modalIn {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Modal;

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "20px",
  },

  modal: {
    backgroundColor: "var(--bg-card)",
    color: "var(--text-main)",
    borderRadius: "16px",

    padding: "26px 28px",
    width: "100%",
    maxWidth: "520px",
    maxHeight: "90vh",
    overflowY: "auto",

    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow:
      "0 25px 50px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)",

    animation: "modalIn 0.18s ease-out",
  },
};
