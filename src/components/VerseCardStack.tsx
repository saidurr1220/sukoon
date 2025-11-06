"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoodType } from "@/types";

interface VerseCardData {
  id: string;
  surah: number;
  ayah: number;
  arabicText: string;
  translation: string;
  translatorName: string;
  audioUrl: string | null;
  timeContext: string; // "morning", "afternoon", "evening", "night", "prayer"
  priority: number; // Higher = more relevant for current context
}

interface VerseCardStackProps {
  mood: MoodType;
  verses: VerseCardData[];
  onCardSelect: (verse: VerseCardData) => void;
}

const moodColors: Record<
  MoodType,
  { primary: string; light: string; dark: string }
> = {
  happy: { primary: "#F59E0B", light: "#FEF3C7", dark: "#D97706" },
  sad: { primary: "#3B82F6", light: "#DBEAFE", dark: "#2563EB" },
  angry: { primary: "#EF4444", light: "#FEE2E2", dark: "#DC2626" },
  anxious: { primary: "#8B5CF6", light: "#EDE9FE", dark: "#7C3AED" },
  depressed: { primary: "#64748B", light: "#F1F5F9", dark: "#475569" },
  grateful: { primary: "#10B981", light: "#D1FAE5", dark: "#059669" },
};

export default function VerseCardStack({
  mood,
  verses,
  onCardSelect,
}: VerseCardStackProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const colors = moodColors[mood];

  // Sort verses by priority (pre-selected based on time/context)
  const sortedVerses = [...verses].sort((a, b) => b.priority - a.priority);

  const handleCardClick = (index: number) => {
    setSelectedIndex(index);
    setTimeout(() => {
      onCardSelect(sortedVerses[index]);
    }, 600);
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: colors.primary }}
        >
          আপনার জন্য নির্বাচিত আয়াত
        </h2>
        <p className="text-sm text-gray-600">একটি কার্ড নির্বাচন করুন</p>
      </div>

      {/* Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <AnimatePresence>
          {sortedVerses.slice(0, 20).map((verse, index) => (
            <motion.div
              key={verse.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{
                opacity:
                  selectedIndex === null || selectedIndex === index ? 1 : 0.3,
                y: 0,
                scale:
                  selectedIndex === index
                    ? 1.05
                    : hoveredIndex === index
                      ? 1.02
                      : 1,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              className="relative"
            >
              <motion.button
                onClick={() => handleCardClick(index)}
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                disabled={selectedIndex !== null}
                className="w-full aspect-[3/4] rounded-2xl shadow-lg overflow-hidden relative group cursor-pointer disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${colors.light} 0%, ${colors.primary}20 100%)`,
                  border: `2px solid ${colors.primary}40`,
                }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Priority Badge */}
                {index < 3 && (
                  <div
                    className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white z-10"
                    style={{ backgroundColor: colors.primary }}
                  >
                    {index + 1}
                  </div>
                )}

                {/* Card Content - Folded State */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  {/* Decorative Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <pattern
                        id={`pattern-${index}`}
                        x="0"
                        y="0"
                        width="20"
                        height="20"
                        patternUnits="userSpaceOnUse"
                      >
                        <circle cx="10" cy="10" r="1" fill={colors.primary} />
                      </pattern>
                      <rect
                        width="100"
                        height="100"
                        fill={`url(#pattern-${index})`}
                      />
                    </svg>
                  </div>

                  {/* Surah:Ayah */}
                  <div className="relative z-10 text-center">
                    <div
                      className="text-3xl font-bold mb-2"
                      style={{ color: colors.primary }}
                    >
                      {verse.surah}:{verse.ayah}
                    </div>

                    {/* Time Context Icon */}
                    <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      {getTimeIcon(verse.timeContext)}
                      <span>{getTimeLabel(verse.timeContext)}</span>
                    </div>
                  </div>

                  {/* Hover Effect - Preview */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                    className="absolute inset-0 bg-white/95 backdrop-blur-sm p-4 flex items-center justify-center"
                  >
                    <p className="text-xs text-center text-gray-700 line-clamp-6">
                      {verse.translation}
                    </p>
                  </motion.div>
                </div>

                {/* Selection Animation */}
                {selectedIndex === index && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.6, ease: "easeInOut" }}
                    >
                      <svg
                        className="w-16 h-16"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke={colors.primary}
                          strokeWidth="2"
                        />
                        <path
                          d="M9 12l2 2 4-4"
                          stroke={colors.primary}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  </motion.div>
                )}
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function getTimeIcon(context: string) {
  const icons: Record<string, string> = {
    morning: "🌅",
    afternoon: "☀️",
    evening: "🌆",
    night: "🌙",
    prayer: "🕌",
  };
  return icons[context] || "📖";
}

function getTimeLabel(context: string) {
  const labels: Record<string, string> = {
    morning: "সকাল",
    afternoon: "দুপুর",
    evening: "সন্ধ্যা",
    night: "রাত",
    prayer: "নামাজ",
  };
  return labels[context] || "সাধারণ";
}
