/**
 * Check for incomplete verses in the database
 * Incomplete verses are those that don't end with proper punctuation
 * or are too short to be complete sentences
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkIncompleteVerses() {
    console.log("🔍 Checking for incomplete verses...\n");

    try {
        // Get all verses with Bengali translations
        const verses = await prisma.verse.findMany({
            include: {
                translations: {
                    where: { language: "bn" },
                    include: {
                        translator: true,
                    },
                },
            },
            orderBy: [{ surah: "asc" }, { ayah: "asc" }],
        });

        console.log(`Found ${verses.length} verses to check\n`);

        const incompleteVerses = [];

        for (const verse of verses) {
            if (verse.translations.length === 0) {
                console.log(`⚠️  No Bengali translation: ${verse.id}`);
                continue;
            }

            const translation = verse.translations[0];
            const text = translation.text.trim();

            // Check if verse seems incomplete
            // Bengali sentences should end with । or । or be reasonably long
            const endsWithPunctuation = text.endsWith("।") ||
                text.endsWith(".") ||
                text.endsWith("?") ||
                text.endsWith("!") ||
                text.endsWith("।");

            const isTooShort = text.length < 30; // Very short might be incomplete

            if (!endsWithPunctuation || isTooShort) {
                incompleteVerses.push({
                    id: verse.id,
                    surah: verse.surah,
                    ayah: verse.ayah,
                    arabicText: verse.arabicText,
                    translation: text,
                    reason: !endsWithPunctuation ? "No proper ending" : "Too short",
                });

                console.log(`\n❌ Incomplete: ${verse.id} (Surah ${verse.surah}, Ayah ${verse.ayah})`);
                console.log(`   Arabic: ${verse.arabicText.substring(0, 50)}...`);
                console.log(`   Bengali: ${text}`);
                console.log(`   Reason: ${!endsWithPunctuation ? "No proper ending" : "Too short"}`);
            }
        }

        console.log(`\n\n📊 Summary:`);
        console.log(`Total verses: ${verses.length}`);
        console.log(`Incomplete verses: ${incompleteVerses.length}`);

        if (incompleteVerses.length > 0) {
            console.log(`\n\n📝 List of incomplete verses:`);
            incompleteVerses.forEach((v) => {
                console.log(`${v.id} - ${v.translation.substring(0, 60)}...`);
            });
        }

    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkIncompleteVerses();
