"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { isValidEmail, cn } from "@/lib/utils";

interface PopupSubscribeProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (email: string) => Promise<void>;
}

export default function PopupSubscribe({
  isOpen,
  onClose,
  onSubscribe,
}: PopupSubscribeProps) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Focus management - focus email input when modal opens
  useEffect(() => {
    if (isOpen && emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard accessibility - close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Trap focus within modal
  useEffect(() => {
    if (!isOpen) return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      await onSubscribe(email);
      setSuccess(true);
      setEmail("");

      // Close modal after showing success message
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to subscribe. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="subscribe-title"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-lg shadow-xl p-6 relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-sukoon-muted hover:text-sukoon-text transition-colors focus:outline-none focus:ring-2 focus:ring-sukoon-primary rounded-full p-1"
          aria-label="Close dialog"
        >
          <CloseIcon />
        </button>

        {success ? (
          // Success state
          <div className="text-center py-4">
            <div className="mb-4 flex justify-center">
              <CheckIcon />
            </div>
            <h2 className="text-xl font-semibold text-sukoon-text mb-2">
              Check your email!
            </h2>
            <p className="text-sukoon-muted">
              We've sent you a confirmation link. Please check your inbox.
            </p>
          </div>
        ) : (
          // Form state
          <>
            <h2
              id="subscribe-title"
              className="text-2xl font-semibold text-sukoon-text mb-2 pr-8"
            >
              Get a daily ayah like this?
            </h2>
            <p className="text-sukoon-muted mb-6">
              Receive a carefully selected verse each day, delivered to your
              inbox.
            </p>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="email" className="sr-only">
                  Email address
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  disabled={isLoading}
                  className={cn(
                    "w-full px-4 py-3 rounded-lg border",
                    "focus:outline-none focus:ring-2 focus:ring-sukoon-primary focus:border-transparent",
                    "transition-all duration-150",
                    error
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300 bg-white",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                  aria-invalid={!!error}
                  aria-describedby={error ? "email-error" : undefined}
                />
                {error && (
                  <p
                    id="email-error"
                    className="mt-2 text-sm text-red-600"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 min-h-[44px] px-6 py-3 rounded-lg font-medium",
                    "border border-gray-300 text-sukoon-text bg-white",
                    "hover:bg-gray-50 active:bg-gray-100",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sukoon-primary",
                    "transition-all duration-150",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  Maybe later
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "flex-1 min-h-[44px] px-6 py-3 rounded-lg font-medium",
                    "bg-sukoon-primary text-white",
                    "hover:bg-sukoon-primary/90 active:scale-95",
                    "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sukoon-primary",
                    "transition-all duration-150",
                    "flex items-center justify-center gap-2",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner />
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    "Subscribe"
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// Icon components
function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-green-600"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.1" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="8"
        cy="8"
        r="7"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M8 1a7 7 0 0 1 7 7h-2a5 5 0 0 0-5-5V1z"
      />
    </svg>
  );
}
