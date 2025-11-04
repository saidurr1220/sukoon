"use server";

import { prisma } from "@/lib/prisma";
import type { VerseWithTranslation } from "@/lib/verse-selection";

/**
 * Get adjacent verse (previous or next) in the same surah
 */
export async function getAdjacentVerse(
    currentSurah: number,
    currentAyah: number,
    direction: "prev" | "next",
    language: string = "bn"
): Promise<{ success: boolean; verse?: VerseWithTranslation; error?: string }> {
    try {
        const targetAyah = direction === "prev" ? currentAyah - 1 : currentAyah + 1;

        // Check if target ayah exists
        const verse = await prisma.verse.findFirst({
            where: {
                surah: currentSurah,
                ayah: targetAyah,
            },
            include: {
                translations: {
                    where: { language },
                    include: {
                        translator: true,
                    },
                    take: 1,
                },
            },
        });

        if (!verse || verse.translations.length === 0) {
            return {
                success: false,
                error: direction === "prev" ? "এটি সূরার প্রথম আয়াত" : "এটি সূরার শেষ আয়াত",
            };
        }

        const translation = verse.translations[0];

        return {
            success: true,
            verse: {
                id: verse.id,
                surah: verse.surah,
                ayah: verse.ayah,
                arabicText: verse.arabicText,
                audioUrl: verse.audioUrl,
                translation: translation.text,
                translatorName: translation.translator.name,
            },
        };
    } catch (error) {
        console.error("Navigation error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to navigate",
        };
    }
}

/**
 * Check if adjacent verses exist
 */
export async function checkAdjacentVerses(
    surah: number,
    ayah: number
): Promise<{ hasPrevious: boolean; hasNext: boolean }> {
    try {
        const [previous, next] = await Promise.all([
            prisma.verse.findFirst({
                where: { surah, ayah: ayah - 1 },
                select: { id: true },
            }),
            prisma.verse.findFirst({
                where: { surah, ayah: ayah + 1 },
                select: { id: true },
            }),
        ]);

        return {
            hasPrevious: !!previous,
            hasNext: !!next,
        };
    } catch (error) {
        console.error("Check adjacent verses error:", error);
        return {
            hasPrevious: false,
            hasNext: false,
        };
    }
}
