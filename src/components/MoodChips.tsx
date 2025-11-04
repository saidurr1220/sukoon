"use client";

import { MoodType } from "@/types";
import { cn, triggerHapticFeedback } from "@/lib/utils";

interface MoodChipsProps {
  onMoodSelect: (mood: MoodType) => void;
  disabled?: boolean;
}

// SVG Icon components
const HappyIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const SadIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

const AngryIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
    />
  </svg>
);

const AnxiousIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const DepressedIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
    />
  </svg>
);

const GratefulIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

const MOODS: Array<{
  type: MoodType;
  label: string;
  icon: React.ComponentType;
  color: string;
  bgColor: string;
  hoverColor: string;
  activeColor: string;
}> = [
  {
    type: "happy",
    label: "খুশি",
    icon: HappyIcon,
    color: "text-amber-900",
    bgColor: "bg-amber-100",
    hoverColor: "hover:bg-amber-200",
    activeColor: "active:bg-amber-300",
  },
  {
    type: "sad",
    label: "দুঃখিত",
    icon: SadIcon,
    color: "text-blue-900",
    bgColor: "bg-blue-100",
    hoverColor: "hover:bg-blue-200",
    activeColor: "active:bg-blue-300",
  },
  {
    type: "angry",
    label: "রাগান্বিত",
    icon: AngryIcon,
    color: "text-red-900",
    bgColor: "bg-red-100",
    hoverColor: "hover:bg-red-200",
    activeColor: "active:bg-red-300",
  },
  {
    type: "anxious",
    label: "উদ্বিগ্ন",
    icon: AnxiousIcon,
    color: "text-violet-900",
    bgColor: "bg-violet-100",
    hoverColor: "hover:bg-violet-200",
    activeColor: "active:bg-violet-300",
  },
  {
    type: "depressed",
    label: "বিষণ্ণ",
    icon: DepressedIcon,
    color: "text-slate-900",
    bgColor: "bg-slate-100",
    hoverColor: "hover:bg-slate-200",
    activeColor: "active:bg-slate-300",
  },
  {
    type: "grateful",
    label: "কৃতজ্ঞ",
    icon: GratefulIcon,
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
            <span aria-hidden="true">
              <mood.icon />
            </span>
            <span>{mood.label}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
