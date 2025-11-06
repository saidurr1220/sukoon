/**
 * Add comprehensive mood-verse mappings
 * Uses meaningful, longer verses that match each mood
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Comprehensive mood-verse mappings with better verses
const moodVerseMap: Record<string, Array<{ verseId: string; weight: number }>> = {
    anxious: [
        { verseId: "2:186", weight: 0.95 }, // Allah is near, answers prayers
        { verseId: "13:28", weight: 0.93 }, // Hearts find peace in remembrance
        { verseId: "94:5-6", weight: 0.92 }, // With hardship comes ease (merged)
        { verseId: "65:3", weight: 0.90 }, // Allah provides from unexpected sources
        { verseId: "3:139", weight: 0.88 }, // Don't lose hope, you will prevail
        { verseId: "2:286", weight: 0.87 }, // Allah doesn't burden beyond capacity
        { verseId: "29:2-3", weight: 0.85 }, // People will be tested
        { verseId: "3:173-174", weight: 0.83 }, // Trust in Allah
    ],

    sad: [
        { verseId: "94:5-6", weight: 0.95 }, // With hardship comes ease
        { verseId: "2:186", weight: 0.93 }, // Allah is near
        { verseId: "39:53", weight: 0.92 }, // Don't despair of Allah's mercy
        { verseId: "3:139", weight: 0.90 }, // Don't grieve, you will prevail
        { verseId: "13:28", weight: 0.88 }, // Hearts find peace
        { verseId: "21:87-88", weight: 0.86 }, // Story of Yunus - hope in darkness
        { verseId: "12:87", weight: 0.84 }, // Don't despair of Allah's mercy
    ],

    depressed: [
        { verseId: "39:53", weight: 0.95 }, // Allah forgives all sins
        { verseId: "94:5-6", weight: 0.93 }, // With hardship comes ease
        { verseId: "2:186", weight: 0.91 }, // Allah is near
        { verseId: "13:28", weight: 0.89 }, // Hearts find peace
        { verseId: "16:97", weight: 0.87 }, // Good life for believers
        { verseId: "29:2-3", weight: 0.85 }, // Tests are part of faith
        { verseId: "2:286", weight: 0.83 }, // Allah doesn't burden beyond capacity
    ],

    angry: [
        { verseId: "3:134", weight: 0.95 }, // Control anger, forgive
        { verseId: "25:63", weight: 0.93 }, // Servants of Rahman walk humbly
        { verseId: "41:34-35", weight: 0.91 }, // Repel evil with good
        { verseId: "13:28", weight: 0.89 }, // Hearts find peace
        { verseId: "2:186", weight: 0.87 }, // Allah is near
        { verseId: "16:126-127", weight: 0.85 }, // Be patient
        { verseId: "42:37", weight: 0.83 }, // Avoid major sins and anger
    ],

    happy: [
        { verseId: "16:97", weight: 0.95 }, // Good life for believers
        { verseId: "55:13", weight: 0.93 }, // Which favors will you deny?
        { verseId: "13:28", weight: 0.91 }, // Hearts find peace
        { verseId: "2:186", weight: 0.89 }, // Allah is near
        { verseId: "14:7", weight: 0.87 }, // If grateful, Allah increases
        { verseId: "93:11", weight: 0.85 }, // Proclaim Allah's blessings
        { verseId: "3:191", weight: 0.83 }, // Remember Allah standing/sitting
    ],

    grateful: [
        { verseId: "14:7", weight: 0.95 }, // If grateful, Allah increases
        { verseId: "55:13", weight: 0.93 }, // Which favors will you deny?
        { verseId: "16:97", weight: 0.91 }, // Good life for believers
        { verseId: "2:152", weight: 0.89 }, // Remember Me, I'll remember you
        { verseId: "93:11", weight: 0.87 }, // Proclaim Allah's blessings
        { verseId: "13:28", weight: 0.85 }, // Hearts find peace
        { verseId: "2:186", weight: 0.83 }, // Allah is near
    ],
};

async function addComprehensiveMoodVerses() {
    console.log("📚 Adding comprehensive mood-verse mappings...\n");

    const moods = await prisma.mood.findMany();
    const moodMap = new Map(moods.map((m) => [m.slug, m.id]));

    let added = 0;
    let skipped = 0;
    let errors = 0;

    for (const [moodSlug, verses] of Object.entries(moodVerseMap)) {
        const moodId = moodMap.get(moodSlug);
        if (!moodId) {
            console.log(`⚠️  Mood not found: ${moodSlug}`);
            errors++;
            continue;
        }

        console.log(`\n📝 Processing mood: ${moodSlug}`);

        for (const { verseId, weight } of verses) {
            try {
                // Check if verse exists
                const verse = await prisma.verse.findUnique({
                    where: { id: verseId },
                });

                if (!verse) {
                    console.log(`  ⚠️  Verse not found: ${verseId}`);
                    skipped++;
                    continue;
                }

                // Create or update mood-verse relationship
                await prisma.moodVerse.upsert({
                    where: {
                        moodId_verseId: {
                            moodId,
                            verseId,
                        },
                    },
                    update: {
                        weight,
                    },
                    create: {
                        moodId,
                        verseId,
                        weight,
                    },
                });

                console.log(`  ✓ ${verseId} (weight: ${weight})`);
                added++;
            } catch (error) {
                console.error(`  ❌ Error adding ${verseId}:`, error);
                errors++;
            }
        }
    }

    console.log(`\n\n📊 Summary:`);
    console.log(`Added/Updated: ${added}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Errors: ${errors}`);

    // Show final counts per mood
    console.log(`\n📈 Verses per mood:`);
    for (const mood of moods) {
        const count = await prisma.moodVerse.count({
            where: { moodId: mood.id },
        });
        console.log(`  ${mood.slug}: ${count} verses`);
    }
}

addComprehensiveMoodVerses()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
