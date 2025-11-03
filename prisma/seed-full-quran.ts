/**
 * Full Quran Database Seeding Script
 * 
 * This script fetches the complete Quran text and Bengali translations
 * from Quran.com API and seeds the database.
 * 
 * Usage: npx tsx prisma/seed-full-quran.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Quran.com API endpoints
const QURAN_API_BASE = 'https://api.quran.com/api/v4';

// Translation IDs from Quran.com
const BENGALI_TRANSLATION_ID = 161; // Taisirul Quran - Zakaria Abul Hussain
const AUDIO_RECITER_ID = 7; // Abdul Basit

interface QuranVerse {
    verse_number: number;
    verse_key: string;
    text_uthmani: string;
}

interface Translation {
    resource_id: number;
    text: string;
}

interface VerseData {
    verse: QuranVerse;
    translations: Translation[];
}

async function fetchWithRetry(url: string, retries = 3): Promise<any> {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            if (i === retries - 1) throw error;
            console.log(`Retry ${i + 1}/${retries} for ${url}`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

async function fetchChapter(chapterNumber: number): Promise<VerseData[]> {
    const url = `${QURAN_API_BASE}/verses/by_chapter/${chapterNumber}?language=bn&words=false&translations=${BENGALI_TRANSLATION_ID}&per_page=300`;

    console.log(`Fetching Chapter ${chapterNumber}...`);
    const data = await fetchWithRetry(url);

    return data.verses || [];
}

async function seedFullQuran() {
    console.log('🌱 Starting full Quran database seeding...\n');

    // Create Bengali translator
    console.log('Creating translator...');
    const bengaliTranslator = await prisma.translator.upsert({
        where: { id: 'bengali-taisirul' },
        update: {},
        create: {
            id: 'bengali-taisirul',
            name: 'তাইসিরুল কুরআন (Taisirul Quran)',
            license: 'Public Domain',
            sourceUrl: 'https://quran.com',
        },
    });
    console.log('✓ Translator created\n');

    // Seed all 114 chapters
    let totalVerses = 0;
    const batchSize = 5; // Process 5 chapters at a time to avoid rate limiting

    for (let chapter = 1; chapter <= 114; chapter += batchSize) {
        const endChapter = Math.min(chapter + batchSize - 1, 114);
        console.log(`\n📖 Processing Chapters ${chapter}-${endChapter}...`);

        const chapterPromises = [];
        for (let i = chapter; i <= endChapter; i++) {
            chapterPromises.push(fetchChapter(i));
        }

        const chaptersData = await Promise.all(chapterPromises);

        // Process each chapter's verses
        for (let i = 0; i < chaptersData.length; i++) {
            const chapterNum = chapter + i;
            const verses = chaptersData[i];

            console.log(`  Seeding Chapter ${chapterNum} (${verses.length} verses)...`);

            for (const verseData of verses) {
                const [surah, ayah] = verseData.verse.verse_key.split(':').map(Number);
                const verseId = `${surah}:${ayah}`;

                // Get Bengali translation
                const bengaliTranslation = verseData.translations.find(
                    t => t.resource_id === BENGALI_TRANSLATION_ID
                );

                if (!bengaliTranslation) {
                    console.warn(`  ⚠ No Bengali translation for ${verseId}`);
                    continue;
                }

                // Audio URL
                const audioUrl = `https://verses.quran.com/Abdul_Basit/Murattal/mp3/${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`;

                // Create verse with translation
                await prisma.verse.upsert({
                    where: { id: verseId },
                    update: {},
                    create: {
                        id: verseId,
                        surah,
                        ayah,
                        arabicText: verseData.verse.text_uthmani,
                        audioUrl,
                        checksum: 'quran-com-api',
                        translations: {
                            create: {
                                language: 'bn',
                                translatorId: bengaliTranslator.id,
                                text: bengaliTranslation.text,
                            },
                        },
                    },
                });

                totalVerses++;
            }

            console.log(`  ✓ Chapter ${chapterNum} completed`);
        }

        // Rate limiting delay between batches
        if (endChapter < 114) {
            console.log('  ⏳ Waiting 2 seconds before next batch...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    console.log(`\n✅ Full Quran seeding completed!`);
    console.log(`📊 Total verses seeded: ${totalVerses}`);
    console.log(`📖 Total chapters: 114`);
}

async function main() {
    try {
        await seedFullQuran();
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
