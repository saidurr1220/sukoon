/**
 * Merge short verses that don't make sense without previous verse
 * This creates combined verse entries like "94:5-6" for better context
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Verses that should be merged (verse_id -> should merge with next)
const versesToMerge: Record<string, boolean> = {
    // Surah 94 - verses 5 and 6 together
    "94:5": true,
    // Add more as needed
};

async function mergeShortVerses() {
    console.log("🔗 Merging short verses for better context...\n");

    let merged = 0;
    let errors = 0;

    for (const [verseId, shouldMerge] of Object.entries(versesToMerge)) {
        if (!shouldMerge) continue;

        try {
            const [surahStr, ayahStr] = verseId.split(":");
            const surah = parseInt(surahStr);
            const ayah = parseInt(ayahStr);
            const nextAyah = ayah + 1;

            // Get current verse
            const currentVerse = await prisma.verse.findUnique({
                where: { id: verseId },
                include: {
                    translations: {
                        where: { language: "bn" },
                        include: { translator: true },
                    },
                },
            });

            // Get next verse
            const nextVerseId = `${surah}:${nextAyah}`;
            const nextVerse = await prisma.verse.findUnique({
                where: { id: nextVerseId },
                include: {
                    translations: {
                        where: { language: "bn" },
                    },
                },
            });

            if (!currentVerse || !nextVerse) {
                console.log(`⚠️  Verses not found: ${verseId} or ${nextVerseId}`);
                errors++;
                continue;
            }

            if (
                currentVerse.translations.length === 0 ||
                nextVerse.translations.length === 0
            ) {
                console.log(`⚠️  Missing translations: ${verseId}`);
                errors++;
                continue;
            }

            // Create merged verse ID
            const mergedId = `${surah}:${ayah}-${nextAyah}`;

            // Check if merged verse already exists
            const existingMerged = await prisma.verse.findUnique({
                where: { id: mergedId },
            });

            if (existingMerged) {
                console.log(`✓ Merged verse already exists: ${mergedId}`);
                continue;
            }

            // Combine Arabic text
            const mergedArabicText = `${currentVerse.arabicText} ۝ ${nextVerse.arabicText}`;

            // Combine Bengali translation
            const currentTranslation = currentVerse.translations[0];
            const nextTranslation = nextVerse.translations[0];
            const mergedBengaliText = `${currentTranslation.text} ${nextTranslation.text}`;

            // Create merged verse with a unique ayah number (use negative to avoid conflicts)
            await prisma.verse.create({
                data: {
                    id: mergedId,
                    surah: surah,
                    ayah: -(ayah * 1000 + nextAyah), // Negative unique number
                    arabicText: mergedArabicText,
                    audioUrl: currentVerse.audioUrl, // Use first verse's audio
                    checksum: `merged-${verseId}-${nextVerseId}`,
                    translations: {
                        create: {
                            language: "bn",
                            text: mergedBengaliText,
                            translatorId: currentTranslation.translatorId,
                        },
                    },
                },
            });

            console.log(`✓ Created merged verse: ${mergedId}`);
            console.log(`  ${mergedBengaliText.substring(0, 80)}...`);
            merged++;
        } catch (error) {
            console.error(`❌ Error merging ${verseId}:`, error);
            errors++;
        }
    }

    console.log(`\n\n📊 Summary:`);
    console.log(`Merged: ${merged}`);
    console.log(`Errors: ${errors}`);
}

mergeShortVerses()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
