import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

// Utility for generating secure random tokens
export function generateToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

// Utility for email validation
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

// Utility for formatting Surah:Ayah references
export function formatVerseReference(surah: number, ayah: number): string {
    return `${surah}:${ayah}`
}

// Utility for detecting reduced motion preference
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Utility for haptic feedback (mobile devices)
export function triggerHapticFeedback(duration: number = 10): void {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(duration)
    }
}

// Utility for safe JSON parsing
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json)
    } catch {
        return fallback
    }
}

// Utility for creating delay promises
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}