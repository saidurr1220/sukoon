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
                    language: 'en',
                    translatorId: sahihInternational.id,
                    text: 'And when My servants ask you, [O Muhammad], concerning Me - indeed I am near. I respond to the invocation of the supplicant when he calls upon Me. So let them respond to Me [by obedience] and believe in Me that they may be [rightly] guided.',
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
                    language: 'en',
                    translatorId: sahihInternational.id,
                    text: 'Those who have believed and whose hearts are assured by the remembrance of Allah. Unquestionably, by the remembrance of Allah hearts are assured.',
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
                    language: 'en',
                    translatorId: sahihInternational.id,
                    text: 'For indeed, with hardship [will be] ease. Indeed, with hardship [will be] ease.',
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
                    language: 'en',
                    translatorId: sahihInternational.id,
                    text: 'So do not weaken and do not grieve, and you will be superior if you are [true] believers.',
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
                    language: 'en',
                    translatorId: sahihInternational.id,
                    text: 'Whoever does righteousness, whether male or female, while he is a believer - We will surely cause him to live a good life, and We will surely give them their reward [in the Hereafter] according to the best of what they used to do.',
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
                    language: 'en',
                    translatorId: sahihInternational.id,
                    text: 'Say, "O My servants who have transgressed against themselves [by sinning], do not despair of the mercy of Allah. Indeed, Allah forgives all sins. Indeed, it is He who is the Forgiving, the Merciful."',
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
                    language: 'en',
                    translatorId: sahihInternational.id,
                    text: 'So which of the favors of your Lord would you deny?',
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
                    language: 'en',
                    translatorId: sahihInternational.id,
                    text: 'And will provide for him from where he does not expect. And whoever relies upon Allah - then He is sufficient for him. Indeed, Allah will accomplish His purpose. Allah has already set for everything a [decreed] extent.',
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
