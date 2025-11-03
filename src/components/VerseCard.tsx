"use client";

import { useState, useRef, useEffect } from "react";
import { formatVerseReference, cn } from "@/lib/utils";

interface VerseCardProps {
  verse: {
    id: string;
    surah: number;
    ayah: number;
    arabicText: string;
    translation: string;
    translatorName: string;
    audioUrl?: string;
  };
  onReadComplete?: () => void;
}

export default function VerseCard({ verse, onReadComplete }: VerseCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Cleanup audio on unmount
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayAudio = async () => {
    if (!verse.audioUrl) return;

    try {
      if (isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
        return;
      }

      setIsLoading(true);
      setHasError(false);

      if (!audioRef.current) {
        audioRef.current = new Audio(verse.audioUrl);

        audioRef.current.addEventListener("ended", () => {
          setIsPlaying(false);
        });

        audioRef.current.addEventListener("error", () => {
          setHasError(true);
          setIsLoading(false);
          setIsPlaying(false);
        });
      }

      await audioRef.current.play();
      setIsPlaying(true);
      setIsLoading(false);
    } catch (error) {
      setHasError(true);
      setIsLoading(false);
      setIsPlaying(false);
    }
  };

  // Trigger onReadComplete when user has likely read the verse
  useEffect(() => {
    if (onReadComplete) {
      // Wait 5 seconds before triggering (assuming user has read the verse)
      const timer = setTimeout(() => {
        onReadComplete();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [onReadComplete]);

  return (
    <article
      className="w-full max-w-2xl mx-auto px-4 py-6 bg-white rounded-lg shadow-lg"
      aria-labelledby="verse-reference"
      role="article"
    >
      {/* Surah:Ayah Reference */}
      <div className="text-center mb-4">
        <span
          id="verse-reference"
          className="text-sm font-medium text-sukoon-muted"
          aria-label={`Surah ${verse.surah}, Ayah ${verse.ayah}`}
        >
          {formatVerseReference(verse.surah, verse.ayah)}
        </span>
      </div>

      {/* Arabic Text - RTL with proper font */}
      <div
        className="text-center mb-6 px-2"
        dir="rtl"
        lang="ar"
        role="text"
        aria-label="Arabic text of the verse"
      >
        <p className="font-arabic text-arabic-lg leading-loose text-sukoon-text">
          {verse.arabicText}
        </p>
      </div>

      {/* Translation */}
      <div className="text-center mb-4 px-2">
        <p
          className="text-base leading-relaxed text-sukoon-text font-serif"
          lang="en"
          aria-label="English translation"
        >
          {verse.translation}
        </p>
      </div>

      {/* Translator Attribution */}
      <div className="text-center mb-4">
        <p
          className="text-sm text-sukoon-muted italic"
          aria-label={`Translation by ${verse.translatorName}`}
        >
          — {verse.translatorName}
        </p>
      </div>

      {/* Content Notice */}
      <div className="text-center mb-6 px-2">
        <p className="text-xs text-sukoon-muted/80 leading-relaxed">
          This verse is provided for reflection. For detailed interpretation,
          please consult authentic tafsir resources.
        </p>
      </div>

      {/* Audio Controls */}
      {verse.audioUrl && (
        <div className="flex justify-center">
          <button
            onClick={handlePlayAudio}
            disabled={isLoading}
            className={cn(
              "min-h-[44px] px-6 py-3 rounded-full font-medium text-sm",
              "transition-all duration-150 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sukoon-primary",
              "flex items-center gap-2",
              hasError
                ? "bg-red-100 text-red-900 cursor-not-allowed"
                : isLoading
                  ? "bg-sukoon-secondary text-sukoon-muted cursor-wait"
                  : "bg-sukoon-primary text-white hover:bg-sukoon-primary/90 active:scale-95"
            )}
            aria-label={
              isPlaying ? "Pause audio recitation" : "Play audio recitation"
            }
            aria-pressed={isPlaying}
          >
            {isLoading ? (
              <>
                <LoadingSpinner />
                <span>Loading...</span>
              </>
            ) : hasError ? (
              <span>Audio unavailable</span>
            ) : isPlaying ? (
              <>
                <PauseIcon />
                <span>Pause</span>
              </>
            ) : (
              <>
                <PlayIcon />
                <span>Listen</span>
              </>
            )}
          </button>
        </div>
      )}
    </article>
  );
}

// Icon components
function PlayIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 2.5v11l10-5.5L3 2.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M5 3h2v10H5V3zm4 0h2v10H9V3z" />
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
