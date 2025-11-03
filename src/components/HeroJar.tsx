"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AnimationState } from "@/types";
import Image from "next/image";

interface HeroJarProps {
  selectedMood: string | null;
  onAnimationComplete: () => void;
  reducedMotion?: boolean;
}

export default function HeroJar({
  selectedMood,
  onAnimationComplete,
  reducedMotion: reducedMotionProp,
}: HeroJarProps) {
  const [animationState, setAnimationState] = useState<AnimationState>("idle");
  const prefersReducedMotion = useReducedMotion();

  // Use prop if provided, otherwise use system preference
  const shouldReduceMotion = reducedMotionProp ?? prefersReducedMotion ?? false;

  useEffect(() => {
    if (!selectedMood) {
      setAnimationState("idle");
      return;
    }

    // Start animation sequence when mood is selected
    const runAnimationSequence = async () => {
      // 1. Chip selected state
      setAnimationState("chipSelected");
      await delay(shouldReduceMotion ? 10 : 100);

      // 2. Lid opening
      setAnimationState("lidOpening");
      await delay(shouldReduceMotion ? 15 : 300);

      // 3. Slip rising
      setAnimationState("slipRising");
      await delay(shouldReduceMotion ? 15 : 250);

      // 4. Card unfold
      setAnimationState("cardUnfold");
      await delay(shouldReduceMotion ? 10 : 150);

      // Animation complete
      onAnimationComplete();
    };

    runAnimationSequence();
  }, [selectedMood, onAnimationComplete, shouldReduceMotion]);

  return (
    <div className="relative w-full max-w-md mx-auto h-[400px] flex items-center justify-center">
      {/* Jar Body - Static */}
      <motion.div
        className="absolute"
        initial={{ opacity: 1 }}
        animate={{
          opacity: animationState === "cardUnfold" ? 0 : 1,
        }}
        transition={{
          duration: shouldReduceMotion ? 0.01 : 0.15,
        }}
      >
        <Image
          src="/JarBody.svg"
          alt=""
          width={240}
          height={320}
          priority
          aria-hidden="true"
        />
      </motion.div>

      {/* Paper Slip - Rises from jar */}
      <motion.div
        className="absolute overflow-hidden"
        style={{
          zIndex: 1,
        }}
        initial={{
          y: 0,
          scale: 1,
          opacity: 0,
          clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        }}
        animate={{
          y:
            animationState === "slipRising" || animationState === "cardUnfold"
              ? -40
              : 0,
          scale:
            animationState === "slipRising" || animationState === "cardUnfold"
              ? 1.06
              : 1,
          opacity:
            animationState === "slipRising" || animationState === "cardUnfold"
              ? 1
              : 0,
          clipPath:
            animationState === "cardUnfold"
              ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
              : animationState === "slipRising"
                ? "polygon(0 0, 100% 0, 100% 100%, 0 100%)"
                : "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
        }}
        transition={{
          duration: shouldReduceMotion ? 0.015 : 0.25,
          ease: "easeOut",
          clipPath: {
            duration: shouldReduceMotion ? 0.01 : 0.15,
            ease: "easeInOut",
          },
        }}
      >
        <Image
          src="/PaperSlip.svg"
          alt=""
          width={180}
          height={240}
          priority
          aria-hidden="true"
        />
      </motion.div>

      {/* Jar Lid - Opens and moves up */}
      <motion.div
        className="absolute top-[40px]"
        style={{
          zIndex: 2,
          transformOrigin: "center bottom",
        }}
        initial={{ rotate: 0, y: 0 }}
        animate={{
          rotate:
            animationState === "lidOpening" ||
            animationState === "slipRising" ||
            animationState === "cardUnfold"
              ? shouldReduceMotion
                ? 0
                : 15
              : 0,
          y:
            animationState === "lidOpening" ||
            animationState === "slipRising" ||
            animationState === "cardUnfold"
              ? -6
              : 0,
          opacity: animationState === "cardUnfold" ? 0 : 1,
        }}
        transition={{
          duration: shouldReduceMotion ? 0.015 : 0.3,
          ease: shouldReduceMotion ? "linear" : [0.34, 1.56, 0.64, 1], // Spring-like easing for normal, linear for reduced motion
        }}
      >
        <Image
          src="/JarLid.svg"
          alt=""
          width={240}
          height={80}
          priority
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
}

// Helper function for delays
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
