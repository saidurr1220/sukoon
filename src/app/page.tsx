"use client";

import { useState, lazy, Suspense } from "react";
import { MoodType } from "@/types";
import HeroJar from "@/components/HeroJar";
import MoodChips from "@/components/MoodChips";
import VerseCard from "@/components/VerseCard";
import Disclaimer from "@/components/Disclaimer";
import Footer from "@/components/Footer";
import { selectVerseByMood } from "./actions/verse-actions";

// Lazy load PopupSubscribe for better initial bundle size
const PopupSubscribe = lazy(() => import("@/components/PopupSubscribe"));

type PageState = "idle" | "loading" | "animating" | "displaying" | "error";

export default function HomePage() {
  const [pageState, setPageState] = useState<PageState>("idle");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [verse, setVerse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSubscribePopup, setShowSubscribePopup] = useState(false);

  const handleMoodSelect = async (mood: MoodType) => {
    setSelectedMood(mood);
    setPageState("loading");
    setError(null);

    try {
      // Fetch verse while animation plays
      const result = await selectVerseByMood(mood);

      if (!result.success || !result.verse) {
        throw new Error(result.error || "Failed to load verse");
      }

      setVerse(result.verse);
      setPageState("animating");
    } catch (err) {
      console.error("Error selecting verse:", err);
      setError(err instanceof Error ? err.message : "Failed to load verse");
      setPageState("error");
      setSelectedMood(null);
    }
  };

  const handleAnimationComplete = () => {
    if (verse) {
      setPageState("displaying");
    }
  };

  const handleVerseReadComplete = () => {
    setShowSubscribePopup(true);
  };

  const handleSubscribe = async (email: string) => {
    const response = await fetch("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Failed to subscribe");
    }
  };

  const handleClosePopup = () => {
    setShowSubscribePopup(false);
  };

  const handleReset = () => {
    setPageState("idle");
    setSelectedMood(null);
    setVerse(null);
    setError(null);
    setShowSubscribePopup(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      {/* Skip to main content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sukoon-primary focus:text-white focus:rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sukoon-primary"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-sukoon-primary mb-2">Sukoon</h1>
        <p className="text-sukoon-muted max-w-sm px-4">
          Find peace through Qur'an verses selected for your mood
        </p>
      </header>

      {/* Disclaimer */}
      <div className="w-full max-w-2xl mx-auto mb-6">
        <Disclaimer />
      </div>

      {/* Main Content Area */}
      <div id="main-content" className="w-full max-w-2xl" role="main">
        {/* Error State */}
        {pageState === "error" && (
          <div
            className="text-center px-4 mb-8"
            role="alert"
            aria-live="assertive"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 font-medium mb-2">
                Something went wrong
              </p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="min-h-[44px] px-6 py-3 bg-sukoon-primary text-white rounded-full hover:bg-sukoon-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sukoon-primary"
              aria-label="Try selecting a mood again"
            >
              Try again
            </button>
          </div>
        )}

        {/* Idle or Loading State - Show Jar and Mood Chips */}
        {(pageState === "idle" ||
          pageState === "loading" ||
          pageState === "animating") && (
          <>
            <div role="img" aria-label="Decorative jar animation">
              <HeroJar
                selectedMood={selectedMood}
                onAnimationComplete={handleAnimationComplete}
              />
            </div>

            <div className="mt-8">
              <p
                className="text-center text-sukoon-muted mb-4 text-sm"
                id="mood-selection-label"
              >
                How are you feeling today?
              </p>
              <MoodChips
                onMoodSelect={handleMoodSelect}
                disabled={pageState !== "idle"}
              />
            </div>

            {pageState === "loading" && (
              <div
                className="text-center mt-6"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                <div className="inline-flex items-center gap-2 text-sukoon-muted">
                  <LoadingSpinner />
                  <span className="text-sm">Selecting a verse for you...</span>
                </div>
              </div>
            )}
          </>
        )}

        {/* Displaying State - Show Verse Card */}
        {pageState === "displaying" && verse && (
          <div
            className="animate-fadeIn"
            role="region"
            aria-label="Selected verse"
          >
            <VerseCard
              verse={{
                id: verse.id,
                surah: verse.surah,
                ayah: verse.ayah,
                arabicText: verse.arabicText,
                translation:
                  verse.translations?.[0]?.text || "Translation not available",
                translatorName:
                  verse.translations?.[0]?.translator?.name || "Unknown",
                audioUrl: verse.audioUrl,
              }}
              onReadComplete={handleVerseReadComplete}
            />

            <div className="text-center mt-6">
              <button
                onClick={handleReset}
                className="min-h-[44px] text-sukoon-primary hover:text-sukoon-primary/80 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sukoon-primary rounded px-4 py-2"
                aria-label="Return to mood selection"
              >
                Select another mood
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Popup - Lazy loaded */}
      {showSubscribePopup && (
        <Suspense fallback={null}>
          <PopupSubscribe
            isOpen={showSubscribePopup}
            onClose={handleClosePopup}
            onSubscribe={handleSubscribe}
          />
        </Suspense>
      )}

      {/* Footer with attribution and licensing */}
      <Footer />
    </div>
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
