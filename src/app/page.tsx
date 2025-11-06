"use client";

import { useState, lazy, Suspense, useEffect } from "react";
import { MoodType } from "@/types";
import HeroJar from "@/components/HeroJar";
import MoodChips from "@/components/MoodChips";
import VerseCard from "@/components/VerseCard";
import VerseSkeleton from "@/components/VerseSkeleton";
import Disclaimer from "@/components/Disclaimer";
import Footer from "@/components/Footer";
import { selectVerseByMood, getSmartVerseCards } from "./actions/verse-actions";
import VerseCardStack from "@/components/VerseCardStack";
import {
  getAdjacentVerse,
  checkAdjacentVerses,
} from "./actions/navigation-actions";

// Lazy load PopupSubscribe for better initial bundle size
const PopupSubscribe = lazy(() => import("@/components/PopupSubscribe"));

type PageState =
  | "idle"
  | "loading"
  | "cards"
  | "animating"
  | "displaying"
  | "error";

export default function HomePage() {
  const [pageState, setPageState] = useState<PageState>("idle");
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [verse, setVerse] = useState<any>(null);
  const [verseCards, setVerseCards] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSubscribePopup, setShowSubscribePopup] = useState(false);
  const [hasReadVerse, setHasReadVerse] = useState(false);
  const [hasShownPopup, setHasShownPopup] = useState(false);
  const [navigationState, setNavigationState] = useState<{
    hasPrevious: boolean;
    hasNext: boolean;
  }>({ hasPrevious: false, hasNext: false });

  // Check if popup was already shown in this session
  useEffect(() => {
    const popupShown = sessionStorage.getItem("sukoon-popup-shown");
    if (popupShown === "true") {
      setHasShownPopup(true);
    }
  }, []);

  // Mouse exit detection for popup
  useEffect(() => {
    if (!hasReadVerse || pageState !== "displaying" || hasShownPopup) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse is leaving from the top of the viewport
      if (e.clientY <= 0) {
        setShowSubscribePopup(true);
        setHasShownPopup(true);
        sessionStorage.setItem("sukoon-popup-shown", "true");
      }
    };

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, [hasReadVerse, pageState, hasShownPopup]);

  const handleMoodSelect = async (mood: MoodType) => {
    setSelectedMood(mood);
    setPageState("loading");
    setError(null);

    try {
      // Detect user's timezone
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      // Fetch smart verse cards
      const cardsResult = await getSmartVerseCards(mood, timezone);

      if (!cardsResult.success || !cardsResult.verses) {
        throw new Error(cardsResult.error || "Failed to load verse cards");
      }

      setVerseCards(cardsResult.verses);
      setPageState("cards");
    } catch (err) {
      console.error("Error loading verse cards:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load verse cards"
      );
      setPageState("error");
      setSelectedMood(null);
    }
  };

  const handleCardSelect = async (selectedVerse: any) => {
    setVerse(selectedVerse);
    setPageState("animating");

    // Check navigation availability
    const navCheck = await checkAdjacentVerses(
      selectedVerse.surah,
      selectedVerse.ayah
    );
    setNavigationState(navCheck);

    setTimeout(() => {
      setPageState("displaying");
    }, 300);
  };

  const handleVerseNavigation = async (direction: "prev" | "next") => {
    if (!verse) return;

    try {
      const result = await getAdjacentVerse(verse.surah, verse.ayah, direction);

      if (result.success && result.verse) {
        setVerse(result.verse);

        // Update navigation state
        const navCheck = await checkAdjacentVerses(
          result.verse.surah,
          result.verse.ayah
        );
        setNavigationState(navCheck);
      } else {
        // Show error briefly
        console.log(result.error);
      }
    } catch (err) {
      console.error("Navigation error:", err);
    }
  };

  const handleAnimationComplete = () => {
    if (verse) {
      setPageState("displaying");
    }
  };

  const handleVerseReadComplete = () => {
    setHasReadVerse(true);
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
    setVerseCards([]);
    setError(null);
    setShowSubscribePopup(false);
    setHasReadVerse(false);
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
        <h1 className="text-3xl font-bold text-sukoon-primary mb-2">সুকূন</h1>
        <p className="text-sukoon-muted max-w-sm px-4">
          আপনার মনের অবস্থা অনুযায়ী কুরআনের আয়াত থেকে শান্তি খুঁজুন
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
              <p className="text-red-800 font-medium mb-2">কিছু ভুল হয়েছে</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
            <button
              onClick={handleReset}
              className="min-h-[44px] px-6 py-3 bg-sukoon-primary text-white rounded-full hover:bg-sukoon-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sukoon-primary"
              aria-label="আবার চেষ্টা করুন"
            >
              আবার চেষ্টা করুন
            </button>
          </div>
        )}

        {/* Idle State - Show Jar and Mood Chips */}
        {pageState === "idle" && (
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
                আজ আপনার মন কেমন?
              </p>
              <MoodChips onMoodSelect={handleMoodSelect} disabled={false} />
            </div>
          </>
        )}

        {/* Loading State */}
        {pageState === "loading" && (
          <div className="mt-8">
            <VerseSkeleton />
            <div
              className="text-center mt-4"
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              <div className="inline-flex items-center gap-2 text-sukoon-muted">
                <LoadingSpinner />
                <span className="text-sm">
                  আপনার জন্য আয়াত প্রস্তুত করা হচ্ছে...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Card Selection State */}
        {pageState === "cards" && selectedMood && (
          <div className="animate-fadeIn">
            <VerseCardStack
              mood={selectedMood}
              verses={verseCards}
              onCardSelect={handleCardSelect}
            />
            <div className="text-center mt-6">
              <button
                onClick={handleReset}
                className="min-h-[44px] text-sukoon-primary hover:text-sukoon-primary/80 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sukoon-primary rounded px-4 py-2"
              >
                ← মুড পরিবর্তন করুন
              </button>
            </div>
          </div>
        )}

        {/* Animating State */}
        {pageState === "animating" && (
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sukoon-muted">
              <LoadingSpinner />
              <span className="text-sm">আয়াত লোড হচ্ছে...</span>
            </div>
          </div>
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
                translation: verse.translation || "Translation not available",
                translatorName: verse.translatorName || "Unknown",
                audioUrl: verse.audioUrl,
              }}
              moodColor={getMoodColor(selectedMood)}
              onReadComplete={handleVerseReadComplete}
              onNavigate={handleVerseNavigation}
              hasPrevious={navigationState.hasPrevious}
              hasNext={navigationState.hasNext}
            />

            <div className="text-center mt-6">
              <button
                onClick={handleReset}
                className="min-h-[44px] text-sukoon-primary hover:text-sukoon-primary/80 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sukoon-primary rounded px-4 py-2"
                aria-label="আবার মুড নির্বাচন করুন"
              >
                অন্য মুড নির্বাচন করুন
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

// Helper function to get mood color
function getMoodColor(mood: MoodType | null): string {
  const moodColors: Record<MoodType, string> = {
    happy: "#F59E0B",
    sad: "#3B82F6",
    angry: "#EF4444",
    anxious: "#8B5CF6",
    depressed: "#64748B",
    grateful: "#10B981",
  };
  return mood ? moodColors[mood] : "#6366F1";
}
