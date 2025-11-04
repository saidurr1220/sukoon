/**
 * Add more verses to each mood for variety
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function addMoreVerses() {
    console.log("🌱 Adding more mood-verse relationships...\n");

    // Get random verses from database
    const allVerses = await prisma.verse.findMany({
        select: { id: true, surah: true, ayah: true },
        take: 100,
    });

    console.log(`Found ${allVerses.length} verses to work with\n`);

    const moods = await prisma.mood.findMany();
    const moodMap = new Map(moods.map((m) => [m.slug, m.id]));

    let added = 0;

    // Add 10 random verses to each mood
    for (const mood of moods) {
        console.log(`Adding verses to ${mood.slug}...`);

        // Get random 10 verses
        const randomVerses = allVerses
            .sort(() => Math.random() - 0.5)
            .slice(0, 10);

        for (let i = 0; i < randomVerses.length; i++) {
            const verse = randomVerses[i];
            const weight = 0.8 - (i * 0.05); // Decreasing weights

            try {
                await prisma.moodVerse.upsert({
                    where: {
                        moodId_verseId: {
                            moodId: mood.id,
                            verseId: verse.id,
                        },
                    },
                    update: {},
                    create: {
                        moodId: mood.id,
                        verseId: verse.id,
                        weight,
                    },
                });
                added++;
            } catch (error) {
                // Skip if already exists
            }
        }
    }

    console.log(`\n✅ Added ${added} new relationships\n`);

    // Show summary
    console.log("📊 Final Summary:");
    for (const mood of moods) {
        const count = await prisma.moodVerse.count({
            where: { moodId: mood.id },
        });
        console.log(`  ${mood.slug}: ${count} verses`);
    }

    await prisma.$disconnect();
}

addMoreVerses();
