/**
 * Quick seed for mood_verses relationships
 * Run this if main seed fails but moods are created
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedMoodVerses() {
    console.log("🌱 Seeding mood-verse relationships...\n");

    try {
        // Get all moods
        const moods = await prisma.mood.findMany();
        console.log(`Found ${moods.length} moods\n`);

        if (moods.length === 0) {
            console.log("❌ No moods found! Run main seed first.");
            return;
        }

        // Get all verses
        const verses = await prisma.verse.findMany({
            select: { id: true, surah: true, ayah: true },
        });
        console.log(`Found ${verses.length} verses\n`);

        if (verses.length === 0) {
            console.log("❌ No verses found! Need to seed verses first.");
            return;
        }

        // Create mood-verse relationships
        // For now, assign random verses to each mood with weights
        console.log("Creating relationships...\n");

        const moodMap = new Map(moods.map((m) => [m.slug, m.id]));

        // Sample relationships - you can expand this
        const relationships = [
            // Anxious mood - comfort and peace verses
            { mood: "anxious", verseId: "13:28", weight: 0.95 },
            { mood: "anxious", verseId: "2:186", weight: 0.9 },
            { mood: "anxious", verseId: "94:5-6", weight: 0.85 },

            // Sad mood - hope and comfort
            { mood: "sad", verseId: "94:5-6", weight: 0.95 },
            { mood: "sad", verseId: "2:186", weight: 0.9 },
            { mood: "sad", verseId: "13:28", weight: 0.85 },

            // Happy mood - gratitude
            { mood: "happy", verseId: "2:186", weight: 0.9 },
            { mood: "happy", verseId: "13:28", weight: 0.85 },

            // Grateful mood
            { mood: "grateful", verseId: "2:186", weight: 0.95 },
            { mood: "grateful", verseId: "13:28", weight: 0.9 },

            // Angry mood - patience
            { mood: "angry", verseId: "13:28", weight: 0.9 },
            { mood: "angry", verseId: "2:186", weight: 0.85 },

            // Depressed mood - hope
            { mood: "depressed", verseId: "94:5-6", weight: 0.95 },
            { mood: "depressed", verseId: "13:28", weight: 0.9 },
            { mood: "depressed", verseId: "2:186", weight: 0.85 },
        ];

        let created = 0;
        let skipped = 0;

        for (const rel of relationships) {
            const moodId = moodMap.get(rel.mood);
            if (!moodId) {
                console.log(`⚠️  Mood not found: ${rel.mood}`);
                skipped++;
                continue;
            }

            // Check if verse exists
            const verseExists = verses.some((v) => v.id === rel.verseId);
            if (!verseExists) {
                console.log(`⚠️  Verse not found: ${rel.verseId}`);
                skipped++;
                continue;
            }

            try {
                await prisma.moodVerse.upsert({
                    where: {
                        moodId_verseId: {
                            moodId,
                            verseId: rel.verseId,
                        },
                    },
                    update: {
                        weight: rel.weight,
                    },
                    create: {
                        moodId,
                        verseId: rel.verseId,
                        weight: rel.weight,
                    },
                });
                created++;
                console.log(`✓ ${rel.mood} → ${rel.verseId} (${rel.weight})`);
            } catch (error) {
                console.error(`❌ Failed: ${rel.mood} → ${rel.verseId}`, error);
                skipped++;
            }
        }

        console.log(`\n✅ Created ${created} mood-verse relationships`);
        if (skipped > 0) {
            console.log(`⚠️  Skipped ${skipped} relationships`);
        }

        // Show summary
        console.log("\n📊 Summary:");
        for (const mood of moods) {
            const count = await prisma.moodVerse.count({
                where: { moodId: mood.id },
            });
            console.log(`  ${mood.slug}: ${count} verses`);
        }
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedMoodVerses();
