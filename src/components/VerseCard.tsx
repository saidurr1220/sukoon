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
  moodColor?: string;
  onReadComplete?: () => void;
}

export default function VerseCard({
  verse,
  moodColor,
  onReadComplete,
}: VerseCardProps) {
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
      className="w-full max-w-2xl mx-auto px-6 py-8 rounded-2xl shadow-2xl transition-all duration-500"
      style={{
        backgroundColor: moodColor ? `${moodColor}15` : "#ffffff",
        borderLeft: moodColor ? `4px solid ${moodColor}` : "none",
      }}
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
      <div className="text-center px-2">
        <p className="text-xs text-sukoon-muted/80 leading-relaxed">
          এই আয়াতটি চিন্তাভাবনার জন্য প্রদান করা হয়েছে। বিস্তারিত ব্যাখ্যার
          জন্য, দয়া করে প্রামাণিক তাফসীর সম্পদের সাথে পরামর্শ করুন।
        </p>
      </div>
    </article>
  );
}
