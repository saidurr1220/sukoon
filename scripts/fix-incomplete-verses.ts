/**
 * Fix incomplete verses in the database
 * This script updates verses that are incomplete fragments to complete sentences
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Map of incomplete verses to their complete translations
const verseCorrections: Record<string, string> = {
    "104:6": "তা আল্লাহর প্রজ্জ্বলিত আগুন, যা হৃদয় পর্যন্ত পৌঁছে যাবে।",
    "18:3": "তাতে তারা চিরকাল থাকবে।",
    "18:89": "তারপর সে আরেক পথ ধরল।",
    "18:92": "এরপর সে আরেক পথ ধরল।",
    "19:1": "কাফ্-হা-ইয়্যা-'আইন-সাদ।",
    "20:1": "ত্ব-হা।",
    "20:5": "'আরশে দয়াময় সমুন্নত আছেন।",
    "20:17": "'হে মূসা! তোমার ডান হাতে ওটা কী?'",
    "20:19": "আল্লাহ বললেন, 'হে মূসা! ওটা নিক্ষেপ কর।'",
    "20:24": "ফেরাউনের কাছে যাও, বাস্তবিকই সে সীমালঙ্ঘন করেছে।'",
    "20:30": "আমার ভাই হারূনকে।",
    "20:32": "আমার কাজে তাকে অংশীদার কর।",
    "20:35": "তুমি তো আমাদের অবস্থা সবই দেখছ।'",
    "23:1": "মু'মিনরা সফলকাম হয়ে গেছে।",
    "23:4": "যারা যাকাত দানে সক্রিয়।",
    "23:10": "তারাই হল উত্তরাধিকারী।",
    "23:15": "এরপর তোমরা অবশ্যই মরবে।",
    "26:1": "ত্ব-সীন-মীম।",
    "29:1": "আলিফ-লাম-মীম।",
    "30:1": "আলিম-লাম-মীম।",
    "30:2": "রোমানরা পরাজিত হয়েছে।",
    "31:1": "আলিফ-লাম-মীম।",
    "32:1": "আলিফ-লাম-মীম।",
    "35:17": "এটা আল্লাহর পক্ষে কঠিন নয়।",
    "35:19": "অন্ধ আর চোখওয়ালা সমান নয়।",
    "35:20": "আর অন্ধকার ও আলোও সমান নয়।",
    "35:21": "আর ছায়া ও রোদও সমান নয়।",
    "35:23": "তুমি তো কেবল একজন সতর্ককারী।",
    "36:1": "ইয়াসীন।",
    "36:2": "শপথ হিকমতপূর্ণ কুরআনের।",
    "36:4": "তুমি সরল সঠিক পথে প্রতিষ্ঠিত।",
    "40:1": "হা-মীম।",
    "41:1": "হা-মীম।",
    "42:1": "হা-মীম।",
    "42:2": "'আইন-সীন-ক্বাফ।",
    "43:1": "হা-মীম।",
    "43:2": "শপথ সুস্পষ্ট কিতাবের।",
    "44:1": "হা-মীম।",
    "44:2": "সুস্পষ্ট কিতাবের কসম!",
    "45:1": "হা-মীম।",
    "46:1": "হা-মীম।",
    "50:1": "ক্বাফ, শপথ মাহাত্ম্যপূর্ণ কুরআনের।",
    "73:1": "ওহে চাদরে আবৃত ব্যক্তি!",
    "74:1": "ওহে বস্ত্র আবৃত ব্যক্তি!",
    "74:2": "ওঠ, সতর্ক কর।",
    "103:1": "কালের শপথ।",
    "109:1": "বল, 'হে কাফিররা!'",
};

async function fixIncompleteVerses() {
    console.log("🔧 Fixing incomplete verses...\n");

    let fixed = 0;
    let errors = 0;

    for (const [verseId, correctTranslation] of Object.entries(verseCorrections)) {
        try {
            // Find the verse
            const verse = await prisma.verse.findUnique({
                where: { id: verseId },
                include: {
                    translations: {
                        where: { language: "bn" },
                    },
                },
            });

            if (!verse) {
                console.log(`⚠️  Verse not found: ${verseId}`);
                errors++;
                continue;
            }

            if (verse.translations.length === 0) {
                console.log(`⚠️  No Bengali translation found: ${verseId}`);
                errors++;
                continue;
            }

            const translation = verse.translations[0];

            // Update the translation
            await prisma.translation.update({
                where: { id: translation.id },
                data: { text: correctTranslation },
            });

            console.log(`✓ Fixed ${verseId}: ${correctTranslation.substring(0, 50)}...`);
            fixed++;

        } catch (error) {
            console.error(`❌ Error fixing ${verseId}:`, error);
            errors++;
        }
    }

    console.log(`\n\n📊 Summary:`);
    console.log(`Fixed: ${fixed}`);
    console.log(`Errors: ${errors}`);
    console.log(`Total: ${Object.keys(verseCorrections).length}`);
}

fixIncompleteVerses()
    .catch((e) => {
        console.error("❌ Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
