"use client";

import { MoodType } from "@/types";
import { cn, triggerHapticFeedback } from "@/lib/utils";

interface MoodChipsProps {
  onMoodSelect: (mood: MoodType) => void;
  disabled?: boolean;
}

const MOODS: Array<{
  type: MoodType;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  hoverColor: string;
  activeColor: string;
}> = [
  {
    type: "happy",
    label: "খুশি",
    icon: "😊",
    color: "text-amber-900",
    bgColor: "bg-amber-100",
    hoverColor: "hover:bg-amber-200",
    activeColor: "active:bg-amber-300",
  },
  {
    type: "sad",
    label: "দুঃখিত",
    icon: "😢",
    color: "text-blue-900",
    bgColor: "bg-blue-100",
    hoverColor: "hover:bg-blue-200",
    activeColor: "active:bg-blue-300",
  },
  {
    type: "angry",
    label: "রাগান্বিত",
    icon: "😠",
    color: "text-red-900",
    bgColor: "bg-red-100",
    hoverColor: "hover:bg-red-200",
    activeColor: "active:bg-red-300",
  },
  {
    type: "anxious",
    label: "উদ্বিগ্ন",
    icon: "😰",
    color: "text-violet-900",
    bgColor: "bg-violet-100",
    hoverColor: "hover:bg-violet-200",
    activeColor: "active:bg-violet-300",
  },
  {
    type: "depressed",
    label: "বিষণ্ণ",
    icon: "😔",
    color: "text-slate-900",
    bgColor: "bg-slate-100",
    hoverColor: "hover:bg-slate-200",
    activeColor: "active:bg-slate-300",
  },
  {
    type: "grateful",
    label: "কৃতজ্ঞ",
    icon: "🙏",
    color: "text-green-900",
    bgColor: "bg-green-100",
    hoverColor: "hover:bg-green-200",
    activeColor: "active:bg-green-300",
  },
];

export default function MoodChips({
  onMoodSelect,
  disabled = false,
}: MoodChipsProps) {
  const handleMoodClick = (mood: MoodType) => {
    if (disabled) return;

    // Trigger haptic feedback on supported devices (10ms as per requirements)
    triggerHapticFeedback(10);

    onMoodSelect(mood);
  };

  return (
    <div
      className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto px-4"
      role="group"
      aria-label="Select your current mood"
    >
      {MOODS.map((mood) => (
        <button
          key={mood.type}
          onClick={() => handleMoodClick(mood.type)}
          disabled={disabled}
          className={cn(
            // Base styles
            "min-h-[44px] px-6 py-3 rounded-full font-medium text-base",
            "transition-all duration-150 ease-out",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sukoon-primary",
            // Mood-specific colors
            mood.color,
            mood.bgColor,
            !disabled && mood.hoverColor,
            !disabled && mood.activeColor,
            // Disabled state
            disabled && "opacity-50 cursor-not-allowed",
            // Active state animation
            !disabled && "active:scale-95"
          )}
          aria-label={`${mood.label} নির্বাচন করুন`}
          aria-pressed={false}
        >
          <span className="flex items-center justify-center gap-2">
            <span className="text-xl" aria-hidden="true">
              {mood.icon}
            </span>
            <span>{mood.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
