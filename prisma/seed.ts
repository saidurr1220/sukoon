import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create translators
    console.log('Creating translators...');
    const sahihInternational = await prisma.translator.upsert({
        where: { id: 'sahih-international' },
        update: {},
        create: {
            id: 'sahih-international',
            name: 'Sahih International',
            license: 'Public Domain',
            sourceUrl: 'https://quran.com',
        },
    });

    const clearQuran = await prisma.translator.upsert({
        where: { id: 'clear-quran' },
        update: {},
        create: {
            id: 'clear-quran',
            name: 'Dr. Mustafa Khattab (Clear Quran)',
            license: 'CC BY-NC-ND 4.0',
            sourceUrl: 'https://theclearquran.org',
        },
    });

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

    console.log('✓ Translators created');

    // Create moods
    console.log('Creating moods...');
    const moods = [
        { slug: 'happy', name: 'Happy', colorHex: '#F59E0B' },
        { slug: 'sad', name: 'Sad', colorHex: '#3B82F6' },
        { slug: 'angry', name: 'Angry', colorHex: '#EF4444' },
        { slug: 'anxious', name: 'Anxious', colorHex: '#8B5CF6' },
        { slug: 'depressed', name: 'Depressed', colorHex: '#64748B' },
        { slug: 'grateful', name: 'Grateful', colorHex: '#10B981' },
    ];

    const createdMoods = await Promise.all(
        moods.map((mood) =>
            prisma.mood.upsert({
                where: { slug: mood.slug },
                update: {},
                create: mood,
            })
        )
    );

    console.log('✓ Moods created');

    // Create sample verses
    console.log('Creating sample verses...');
    const verses = [
        {
            id: '2:186',
            surah: 2,
            ayah: 186,
            arabicText:
                'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا لِي وَلْيُؤْمِنُوا بِي لَعَلَّهُمْ يَرْشُدُونَ',
            audioUrl: 'https://verses.quran.com/Abdul_Basit/Murattal/mp3/002186.mp3',
            checksum: 'sample',
            translations: [
                {
                    language: 'bn',
                    translatorId: bengaliTranslator.id,
                    text: 'আর আমার বান্দারা যখন তোমার কাছে আমার সম্পর্কে জিজ্ঞেস করে, (তাদেরকে বলে দাও) আমি তো সন্নিকটেই আছি। যারা প্রার্থনা করে আমি তাদের প্রার্থনা কবুল করি যখন তারা আমার কাছে প্রার্থনা করে। কাজেই তারা যেন আমার হুকুম মান্য করে এবং আমার প্রতি ঈমান আনে, যাতে তারা সঠিক পথে চলতে পারে।',
                },
            ],
        },
        {
            id: '13:28',
            surah: 13,
            ayah: 28,
            arabicText:
                'الَّذِينَ آمَنُوا وَتَطْمَئِنُّ قُلُوبُهُم بِذِكْرِ اللَّهِ ۗ أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
            audioUrl: 'https://verses.quran.com/Abdul_Basit/Murattal/mp3/013028.mp3',
            checksum: 'sample',
            translations: [
                {
                    language: 'bn',
                    translatorId: bengaliTranslator.id,
                    text: 'যারা ঈমান এনেছে এবং আল্লাহর যিকির দ্বারা যাদের অন্তর প্রশান্ত হয়। জেনে রাখ, আল্লাহর যিকির দ্বারাই অন্তরসমূহ প্রশান্ত হয়।',
                },
            ],
        },
        {
            id: '94:5-6',
            surah: 94,
            ayah: 5,
            arabicText: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا ۝ إِنَّ مَعَ الْعُسْرِ يُسْرًا',
            audioUrl: 'https://verses.quran.com/Abdul_Basit/Murattal/mp3/094005.mp3',
            checksum: 'sample',
            translations: [
                {
                    language: 'bn',
                    translatorId: bengaliTranslator.id,
                    text: 'নিশ্চয়ই কষ্টের সাথে স্বস্তি আছে। নিশ্চয়ই কষ্টের সাথে স্বস্তি আছে।',
                },
            ],
        },
        {
            id: '3:139',
            surah: 3,
            ayah: 139,
            arabicText: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
            audioUrl: 'https://verses.quran.com/Abdul_Basit/Murattal/mp3/003139.mp3',
            checksum: 'sample',
            translations: [
                {
                    language: 'bn',
                    translatorId: bengaliTranslator.id,
                    text: 'তোমরা হীনবল হয়ো না এবং দুঃখিত হয়ো না, তোমরাই বিজয়ী হবে যদি তোমরা মুমিন হও।',
                },
            ],
        },
        {
            id: '16:97',
            surah: 16,
            ayah: 97,
            arabicText:
                'مَنْ عَمِلَ صَالِحًا مِّن ذَكَرٍ أَوْ أُنثَىٰ وَهُوَ مُؤْمِنٌ فَلَنُحْيِيَنَّهُ حَيَاةً طَيِّبَةً ۖ وَلَنَجْزِيَنَّهُمْ أَجْرَهُم بِأَحْسَنِ مَا كَانُوا يَعْمَلُونَ',
            audioUrl: 'https://verses.quran.com/Abdul_Basit/Murattal/mp3/016097.mp3',
            checksum: 'sample',
            translations: [
                {
                    language: 'bn',
                    translatorId: bengaliTranslator.id,
                    text: 'যে কেউ সৎকাজ করবে, পুরুষ হোক বা নারী, যদি সে মুমিন হয়, তাহলে আমি তাকে অবশ্যই উত্তম জীবন দান করব এবং তাদেরকে তাদের কর্মের উত্তম প্রতিদান দেব।',
                },
            ],
        },
        {
            id: '39:53',
            surah: 39,
            ayah: 53,
            arabicText:
                'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ ۚ إِنَّ اللَّهَ يَغْفِرُ الذُّنُوبَ جَمِيعًا ۚ إِنَّهُ هُوَ الْغَفُورُ الرَّحِيمُ',
            audioUrl: 'https://verses.quran.com/Abdul_Basit/Murattal/mp3/039053.mp3',
            checksum: 'sample',
            translations: [
                {
                    language: 'bn',
                    translatorId: bengaliTranslator.id,
                    text: 'বলো, হে আমার বান্দারা! যারা নিজেদের উপর বাড়াবাড়ি করেছ, তোমরা আল্লাহর রহমত থেকে নিরাশ হয়ো না। নিশ্চয়ই আল্লাহ সমস্ত পাপ ক্ষমা করে দেন। নিশ্চয়ই তিনি ক্ষমাশীল, পরম দয়ালু।',
                },
            ],
        },
        {
            id: '55:13',
            surah: 55,
            ayah: 13,
            arabicText: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
            audioUrl: 'https://verses.quran.com/Abdul_Basit/Murattal/mp3/055013.mp3',
            checksum: 'sample',
            translations: [
                {
                    language: 'bn',
                    translatorId: bengaliTranslator.id,
                    text: 'অতএব তোমাদের প্রতিপালকের কোন অনুগ্রহকে তোমরা অস্বীকার করবে?',
                },
            ],
        },
        {
            id: '65:3',
            surah: 65,
            ayah: 3,
            arabicText:
                'وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ ۚ وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ ۚ قَدْ جَعَلَ اللَّهُ لِكُلِّ شَيْءٍ قَدْرًا',
            audioUrl: 'https://verses.quran.com/Abdul_Basit/Murattal/mp3/065003.mp3',
            checksum: 'sample',
            translations: [
                {
                    language: 'bn',
                    translatorId: bengaliTranslator.id,
                    text: 'এবং তাকে এমন উৎস থেকে রিযিক দেবেন যা সে কল্পনাও করতে পারে না। যে আল্লাহর উপর ভরসা করে, তার জন্য তিনিই যথেষ্ট। নিশ্চয়ই আল্লাহ তাঁর কাজ সম্পন্ন করবেন। আল্লাহ প্রতিটি বিষয়ের জন্য একটি পরিমাণ নির্ধারণ করে রেখেছেন।',
                },
            ],
        },
    ];

    for (const verseData of verses) {
        const { translations, ...verse } = verseData;
        await prisma.verse.upsert({
            where: { id: verse.id },
            update: {},
            create: {
                ...verse,
                translations: {
                    create: translations,
                },
            },
        });
    }

    console.log('✓ Sample verses created');

    // Create MoodVerse relationships with weights
    console.log('Creating mood-verse relationships...');
    const moodVerseRelationships = [
        // Happy mood
        { moodSlug: 'happy', verseId: '16:97', weight: 0.9 },
        { moodSlug: 'happy', verseId: '55:13', weight: 0.85 },
        { moodSlug: 'happy', verseId: '13:28', weight: 0.8 },

        // Sad mood
        { moodSlug: 'sad', verseId: '94:5-6', weight: 0.95 },
        { moodSlug: 'sad', verseId: '2:186', weight: 0.9 },
        { moodSlug: 'sad', verseId: '3:139', weight: 0.85 },

        // Angry mood
        { moodSlug: 'angry', verseId: '13:28', weight: 0.9 },
        { moodSlug: 'angry', verseId: '3:139', weight: 0.85 },
        { moodSlug: 'angry', verseId: '2:186', weight: 0.8 },

        // Anxious mood
        { moodSlug: 'anxious', verseId: '65:3', weight: 0.95 },
        { moodSlug: 'anxious', verseId: '2:186', weight: 0.9 },
        { moodSlug: 'anxious', verseId: '13:28', weight: 0.85 },

        // Depressed mood
        { moodSlug: 'depressed', verseId: '39:53', weight: 0.95 },
        { moodSlug: 'depressed', verseId: '94:5-6', weight: 0.9 },
        { moodSlug: 'depressed', verseId: '2:186', weight: 0.85 },

        // Grateful mood
        { moodSlug: 'grateful', verseId: '55:13', weight: 0.95 },
        { moodSlug: 'grateful', verseId: '16:97', weight: 0.9 },
        { moodSlug: 'grateful', verseId: '13:28', weight: 0.85 },
    ];

    for (const relationship of moodVerseRelationships) {
        const mood = createdMoods.find((m) => m.slug === relationship.moodSlug);
        if (mood) {
            await prisma.moodVerse.upsert({
                where: {
                    moodId_verseId: {
                        moodId: mood.id,
                        verseId: relationship.verseId,
                    },
                },
                update: {},
                create: {
                    moodId: mood.id,
                    verseId: relationship.verseId,
                    weight: relationship.weight,
                },
            });
        }
    }

    console.log('✓ Mood-verse relationships created');
    console.log('✅ Database seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
