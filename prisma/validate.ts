/**
 * Database Validation Script
 * Tests model relationships, constraints, and seed data integrity
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function validateDatabase() {
    console.log('🔍 Starting database validation...\n');

    let errors = 0;

    try {
        // Test 1: Validate unique indexes
        console.log('Test 1: Validating unique indexes...');
        try {
            const verses = await prisma.verse.findMany({
                select: { surah: true, ayah: true },
            });
            const uniqueKeys = new Set(verses.map((v) => `${v.surah}:${v.ayah}`));
            if (uniqueKeys.size !== verses.length) {
                console.error('❌ FAIL: Duplicate surah:ayah combinations found');
                errors++;
            } else {
                console.log('✓ PASS: Verse surah:ayah uniqueness validated');
            }
        } catch (e) {
            console.error('❌ FAIL: Error checking verse uniqueness:', e);
            errors++;
        }

        // Test 2: Validate foreign key constraints (Translation -> Verse)
        console.log('\nTest 2: Validating Translation -> Verse relationships...');
        try {
            const translations = await prisma.translation.findMany({
                include: { verse: true, translator: true },
            });
            const invalidTranslations = translations.filter(
                (t) => !t.verse || !t.translator
            );
            if (invalidTranslations.length > 0) {
                console.error(
                    `❌ FAIL: Found ${invalidTranslations.length} translations with invalid relationships`
                );
                errors++;
            } else {
                console.log(
                    `✓ PASS: All ${translations.length} translations have valid verse and translator relationships`
                );
            }
        } catch (e) {
            console.error('❌ FAIL: Error checking translation relationships:', e);
            errors++;
        }

        // Test 3: Validate MoodVerse relationships
        console.log('\nTest 3: Validating MoodVerse relationships...');
        try {
            const moodVerses = await prisma.moodVerse.findMany({
                include: { mood: true, verse: true },
            });
            const invalidMoodVerses = moodVerses.filter((mv) => !mv.mood || !mv.verse);
            if (invalidMoodVerses.length > 0) {
                console.error(
                    `❌ FAIL: Found ${invalidMoodVerses.length} mood-verse relationships with invalid references`
                );
                errors++;
            } else {
                console.log(
                    `✓ PASS: All ${moodVerses.length} mood-verse relationships are valid`
                );
            }

            // Validate weights are between 0 and 1
            const invalidWeights = moodVerses.filter(
                (mv) => mv.weight < 0 || mv.weight > 1
            );
            if (invalidWeights.length > 0) {
                console.error(
                    `❌ FAIL: Found ${invalidWeights.length} mood-verse relationships with invalid weights`
                );
                errors++;
            } else {
                console.log('✓ PASS: All mood-verse weights are valid (0-1)');
            }
        } catch (e) {
            console.error('❌ FAIL: Error checking mood-verse relationships:', e);
            errors++;
        }

        // Test 4: Validate seed data integrity
        console.log('\nTest 4: Validating seed data integrity...');
        try {
            const moodCount = await prisma.mood.count();
            const expectedMoods = 6; // Happy, Sad, Angry, Anxious, Depressed, Grateful
            if (moodCount < expectedMoods) {
                console.error(
                    `❌ FAIL: Expected at least ${expectedMoods} moods, found ${moodCount}`
                );
                errors++;
            } else {
                console.log(`✓ PASS: Found ${moodCount} moods (expected ${expectedMoods})`);
            }

            const verseCount = await prisma.verse.count();
            if (verseCount === 0) {
                console.error('❌ FAIL: No verses found in database');
                errors++;
            } else {
                console.log(`✓ PASS: Found ${verseCount} verses`);
            }

            const translatorCount = await prisma.translator.count();
            if (translatorCount === 0) {
                console.error('❌ FAIL: No translators found in database');
                errors++;
            } else {
                console.log(`✓ PASS: Found ${translatorCount} translators`);
            }
        } catch (e) {
            console.error('❌ FAIL: Error checking seed data:', e);
            errors++;
        }

        // Test 5: Validate unique constraints
        console.log('\nTest 5: Validating unique constraints...');
        try {
            const moods = await prisma.mood.findMany({ select: { slug: true } });
            const uniqueSlugs = new Set(moods.map((m) => m.slug));
            if (uniqueSlugs.size !== moods.length) {
                console.error('❌ FAIL: Duplicate mood slugs found');
                errors++;
            } else {
                console.log('✓ PASS: Mood slug uniqueness validated');
            }

            const subscribers = await prisma.subscriber.findMany({
                select: { email: true },
            });
            const uniqueEmails = new Set(subscribers.map((s) => s.email));
            if (uniqueEmails.size !== subscribers.length) {
                console.error('❌ FAIL: Duplicate subscriber emails found');
                errors++;
            } else {
                console.log('✓ PASS: Subscriber email uniqueness validated');
            }
        } catch (e) {
            console.error('❌ FAIL: Error checking unique constraints:', e);
            errors++;
        }

        // Summary
        console.log('\n' + '='.repeat(50));
        if (errors === 0) {
            console.log('✅ All validation tests passed!');
            process.exit(0);
        } else {
            console.log(`❌ Validation failed with ${errors} error(s)`);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Fatal error during validation:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

validateDatabase();
