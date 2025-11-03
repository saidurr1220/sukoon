import { MoodType } from '@/types'

// Mood configuration as specified in requirements
export const MOODS: Record<MoodType, { name: string; color: string; colorClass: string }> = {
    happy: {
        name: 'Happy',
        color: '#F59E0B',
        colorClass: 'bg-mood-happy text-white'
    },
    sad: {
        name: 'Sad',
        color: '#3B82F6',
        colorClass: 'bg-mood-sad text-white'
    },
    angry: {
        name: 'Angry',
        color: '#EF4444',
        colorClass: 'bg-mood-angry text-white'
    },
    anxious: {
        name: 'Anxious',
        color: '#8B5CF6',
        colorClass: 'bg-mood-anxious text-white'
    },
    depressed: {
        name: 'Depressed',
        color: '#64748B',
        colorClass: 'bg-mood-depressed text-white'
    },
    grateful: {
        name: 'Grateful',
        color: '#10B981',
        colorClass: 'bg-mood-grateful text-white'
    }
}

// Animation timing constants (as per requirements)
export const ANIMATION_DURATIONS = {
    CHIP_SELECTED: 100,
    LID_OPENING: 300,
    SLIP_RISING: 250,
    CARD_UNFOLD: 150,
    TOTAL_MAX: 800,
    REDUCED_MOTION: 50,
    HAPTIC_FEEDBACK: 10
} as const

// Accessibility constants
export const ACCESSIBILITY = {
    MIN_TOUCH_TARGET: 44, // pixels
    MIN_CONTRAST_RATIO: 4.5,
    FOCUS_RING_WIDTH: 2 // pixels
} as const

// Email configuration
export const EMAIL_CONFIG = {
    DUPLICATE_PREVENTION_DAYS: 30,
    DAILY_SEND_HOUR_UTC: 6,
    CONFIRMATION_TOKEN_EXPIRY_HOURS: 24
} as const

// App configuration
export const APP_CONFIG = {
    NAME: 'Sukoon',
    DESCRIPTION: 'Find peace and guidance through carefully selected Qur\'an verses',
    MIN_MOBILE_WIDTH: 390, // pixels
    MAX_CONTENT_WIDTH: 448 // pixels (max-w-md)
} as const