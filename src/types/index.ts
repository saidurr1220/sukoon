// Core application types

export type MoodType =
    | 'happy'
    | 'sad'
    | 'angry'
    | 'anxious'
    | 'depressed'
    | 'grateful'

export interface Verse {
    id: string
    surah: number
    ayah: number
    arabicText: string
    audioUrl?: string
    page?: number
    hizb?: number
    juz?: number
    checksum: string
}

export interface Translation {
    id: string
    verseId: string
    language: string
    translatorId: string
    text: string
    translator: Translator
}

export interface Translator {
    id: string
    name: string
    license?: string
    sourceUrl?: string
}

export interface Mood {
    id: string
    slug: string
    name: string
    colorHex: string
}

export interface MoodVerse {
    id: string
    moodId: string
    verseId: string
    weight: number
    reviewedAt: Date
}

export interface Subscriber {
    id: string
    email: string
    confirmedAt?: Date
    locale: string
    lastSentAt?: Date
    active: boolean
    createdAt: Date
}

export interface SendLog {
    id: string
    subscriberId: string
    verseId: string
    sentAt: Date
}

// Animation states for the jar component
export type AnimationState =
    | 'idle'
    | 'chipSelected'
    | 'lidOpening'
    | 'slipRising'
    | 'cardUnfold'

// API response types
export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
}

export interface VerseWithTranslation extends Verse {
    translations: (Translation & { translator: Translator })[]
}

// Form types
export interface SubscriptionForm {
    email: string
}