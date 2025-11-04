/**
 * Check if mood verses exist in database
 */

import { prisma } from "../src/lib/prisma";

async function checkMoodVerses() {
    console.log("🔍 Checking mood verses in database...\n");

    try {
        // Check moods
        const moods = await prisma.mood.findMany({
            select: {
                id: true,
                slug: true,
                name: true,
                _count: {
                    select: {
                        moodVerses: true,
                    },
                },
            },
        });

        console.log("📊 Moods in database:");
        for (const mood of moods) {
            console.log(`  ${mood.slug}: ${mood._count.moodVerses} verses`);
        }

        if (moods.length === 0) {
            console.log("\n❌ No moods found in database!");
            console.log("   You need to seed the database with moods and mood_verses");
            return;
        }

        // Check a specific mood
        const anxiousMood = moods.find((m) => m.slug === "anxious");
        if (anxiousMood && anxiousMood._count.moodVerses > 0) {
            console.log(`\n✅ Found ${anxiousMood._count.moodVerses} verses for 'anxious' mood`);

            // Get sample verses
            const sampleVerses = await prisma.moodVerse.findMany({
                where: { moodId: anxiousMood.id },
                take: 5,
                include: {
                    verse: {
                        select: {
                            id: true,
                            surah: true,
                            ayah: true,
                        },
                    },
                },
                orderBy: { weight: "desc" },
            });

            console.log("\n📖 Sample verses:");
            for (const mv of sampleVerses) {
                console.log(`  ${mv.verse.id} (weight: ${mv.weight})`);
            }
        } else {
            console.log("\n❌ No verses found for 'anxious' mood!");
            console.log("   Database needs to be seeded with mood_verses data");
        }

        // Check total verses
        const totalVerses = await prisma.verse.count();
        console.log(`\n📚 Total verses in database: ${totalVerses}`);

        if (totalVerses === 0) {
            console.log("❌ No verses in database! Run seed script first.");
        }
    } catch (error) {
        console.error("❌ Error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkMoodVerses();
