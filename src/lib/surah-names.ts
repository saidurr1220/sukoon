/**
 * Surah names in Bengali and English
 */

export const SURAH_NAMES: Record<number, { bn: string; en: string; transliteration: string }> = {
    1: { bn: "আল-ফাতিহা", en: "Al-Fatihah", transliteration: "The Opening" },
    2: { bn: "আল-বাকারাহ", en: "Al-Baqarah", transliteration: "The Cow" },
    3: { bn: "আলে-ইমরান", en: "Ali 'Imran", transliteration: "Family of Imran" },
    4: { bn: "আন-নিসা", en: "An-Nisa", transliteration: "The Women" },
    5: { bn: "আল-মায়িদাহ", en: "Al-Ma'idah", transliteration: "The Table Spread" },
    6: { bn: "আল-আনআম", en: "Al-An'am", transliteration: "The Cattle" },
    7: { bn: "আল-আরাফ", en: "Al-A'raf", transliteration: "The Heights" },
    8: { bn: "আল-আনফাল", en: "Al-Anfal", transliteration: "The Spoils of War" },
    9: { bn: "আত-তাওবাহ", en: "At-Tawbah", transliteration: "The Repentance" },
    10: { bn: "ইউনুস", en: "Yunus", transliteration: "Jonah" },
    11: { bn: "হুদ", en: "Hud", transliteration: "Hud" },
    12: { bn: "ইউসুফ", en: "Yusuf", transliteration: "Joseph" },
    13: { bn: "আর-রাদ", en: "Ar-Ra'd", transliteration: "The Thunder" },
    14: { bn: "ইবরাহীম", en: "Ibrahim", transliteration: "Abraham" },
    15: { bn: "আল-হিজর", en: "Al-Hijr", transliteration: "The Rocky Tract" },
    16: { bn: "আন-নাহল", en: "An-Nahl", transliteration: "The Bee" },
    17: { bn: "আল-ইসরা", en: "Al-Isra", transliteration: "The Night Journey" },
    18: { bn: "আল-কাহফ", en: "Al-Kahf", transliteration: "The Cave" },
    19: { bn: "মারইয়াম", en: "Maryam", transliteration: "Mary" },
    20: { bn: "ত্বা-হা", en: "Taha", transliteration: "Ta-Ha" },
    21: { bn: "আল-আম্বিয়া", en: "Al-Anbya", transliteration: "The Prophets" },
    22: { bn: "আল-হাজ্জ", en: "Al-Hajj", transliteration: "The Pilgrimage" },
    23: { bn: "আল-মুমিনুন", en: "Al-Mu'minun", transliteration: "The Believers" },
    24: { bn: "আন-নূর", en: "An-Nur", transliteration: "The Light" },
    25: { bn: "আল-ফুরকান", en: "Al-Furqan", transliteration: "The Criterion" },
    26: { bn: "আশ-শুআরা", en: "Ash-Shu'ara", transliteration: "The Poets" },
    27: { bn: "আন-নামল", en: "An-Naml", transliteration: "The Ant" },
    28: { bn: "আল-কাসাস", en: "Al-Qasas", transliteration: "The Stories" },
    29: { bn: "আল-আনকাবুত", en: "Al-'Ankabut", transliteration: "The Spider" },
    30: { bn: "আর-রূম", en: "Ar-Rum", transliteration: "The Romans" },
    31: { bn: "লুকমান", en: "Luqman", transliteration: "Luqman" },
    32: { bn: "আস-সাজদাহ", en: "As-Sajdah", transliteration: "The Prostration" },
    33: { bn: "আল-আহযাব", en: "Al-Ahzab", transliteration: "The Combined Forces" },
    34: { bn: "সাবা", en: "Saba", transliteration: "Sheba" },
    35: { bn: "ফাতির", en: "Fatir", transliteration: "Originator" },
    36: { bn: "ইয়া-সীন", en: "Ya-Sin", transliteration: "Ya Sin" },
    37: { bn: "আস-সাফফাত", en: "As-Saffat", transliteration: "Those who set the Ranks" },
    38: { bn: "সোয়াদ", en: "Sad", transliteration: "The Letter 'Saad'" },
    39: { bn: "আয-যুমার", en: "Az-Zumar", transliteration: "The Troops" },
    40: { bn: "গাফির", en: "Ghafir", transliteration: "The Forgiver" },
    41: { bn: "ফুসসিলাত", en: "Fussilat", transliteration: "Explained in Detail" },
    42: { bn: "আশ-শূরা", en: "Ash-Shuraa", transliteration: "The Consultation" },
    43: { bn: "আয-যুখরুফ", en: "Az-Zukhruf", transliteration: "The Ornaments of Gold" },
    44: { bn: "আদ-দুখান", en: "Ad-Dukhan", transliteration: "The Smoke" },
    45: { bn: "আল-জাসিয়াহ", en: "Al-Jathiyah", transliteration: "The Crouching" },
    46: { bn: "আল-আহকাফ", en: "Al-Ahqaf", transliteration: "The Wind-Curved Sandhills" },
    47: { bn: "মুহাম্মাদ", en: "Muhammad", transliteration: "Muhammad" },
    48: { bn: "আল-ফাতহ", en: "Al-Fath", transliteration: "The Victory" },
    49: { bn: "আল-হুজুরাত", en: "Al-Hujurat", transliteration: "The Rooms" },
    50: { bn: "কাফ", en: "Qaf", transliteration: "The Letter 'Qaf'" },
    51: { bn: "আয-যারিয়াত", en: "Adh-Dhariyat", transliteration: "The Winnowing Winds" },
    52: { bn: "আত-তূর", en: "At-Tur", transliteration: "The Mount" },
    53: { bn: "আন-নাজম", en: "An-Najm", transliteration: "The Star" },
    54: { bn: "আল-কামার", en: "Al-Qamar", transliteration: "The Moon" },
    55: { bn: "আর-রাহমান", en: "Ar-Rahman", transliteration: "The Beneficent" },
    56: { bn: "আল-ওয়াকিয়াহ", en: "Al-Waqi'ah", transliteration: "The Inevitable" },
    57: { bn: "আল-হাদীদ", en: "Al-Hadid", transliteration: "The Iron" },
    58: { bn: "আল-মুজাদালাহ", en: "Al-Mujadila", transliteration: "The Pleading Woman" },
    59: { bn: "আল-হাশর", en: "Al-Hashr", transliteration: "The Exile" },
    60: { bn: "আল-মুমতাহিনাহ", en: "Al-Mumtahanah", transliteration: "She that is to be examined" },
    61: { bn: "আস-সফ", en: "As-Saf", transliteration: "The Ranks" },
    62: { bn: "আল-জুমুআহ", en: "Al-Jumu'ah", transliteration: "The Congregation, Friday" },
    63: { bn: "আল-মুনাফিকুন", en: "Al-Munafiqun", transliteration: "The Hypocrites" },
    64: { bn: "আত-তাগাবুন", en: "At-Taghabun", transliteration: "The Mutual Disillusion" },
    65: { bn: "আত-তালাক", en: "At-Talaq", transliteration: "The Divorce" },
    66: { bn: "আত-তাহরীম", en: "At-Tahrim", transliteration: "The Prohibition" },
    67: { bn: "আল-মুলক", en: "Al-Mulk", transliteration: "The Sovereignty" },
    68: { bn: "আল-কলম", en: "Al-Qalam", transliteration: "The Pen" },
    69: { bn: "আল-হাক্কাহ", en: "Al-Haqqah", transliteration: "The Reality" },
    70: { bn: "আল-মাআরিজ", en: "Al-Ma'arij", transliteration: "The Ascending Stairways" },
    71: { bn: "নূহ", en: "Nuh", transliteration: "Noah" },
    72: { bn: "আল-জিন", en: "Al-Jinn", transliteration: "The Jinn" },
    73: { bn: "আল-মুযযাম্মিল", en: "Al-Muzzammil", transliteration: "The Enshrouded One" },
    74: { bn: "আল-মুদ্দাসসির", en: "Al-Muddaththir", transliteration: "The Cloaked One" },
    75: { bn: "আল-কিয়ামাহ", en: "Al-Qiyamah", transliteration: "The Resurrection" },
    76: { bn: "আল-ইনসান", en: "Al-Insan", transliteration: "The Man" },
    77: { bn: "আল-মুরসালাত", en: "Al-Mursalat", transliteration: "The Emissaries" },
    78: { bn: "আন-নাবা", en: "An-Naba", transliteration: "The Tidings" },
    79: { bn: "আন-নাযিআত", en: "An-Nazi'at", transliteration: "Those who drag forth" },
    80: { bn: "আবাসা", en: "'Abasa", transliteration: "He Frowned" },
    81: { bn: "আত-তাকভীর", en: "At-Takwir", transliteration: "The Overthrowing" },
    82: { bn: "আল-ইনফিতার", en: "Al-Infitar", transliteration: "The Cleaving" },
    83: { bn: "আল-মুতাফফিফীন", en: "Al-Mutaffifin", transliteration: "The Defrauding" },
    84: { bn: "আল-ইনশিকাক", en: "Al-Inshiqaq", transliteration: "The Sundering" },
    85: { bn: "আল-বুরূজ", en: "Al-Buruj", transliteration: "The Mansions of the Stars" },
    86: { bn: "আত-তারিক", en: "At-Tariq", transliteration: "The Nightcommer" },
    87: { bn: "আল-আলা", en: "Al-A'la", transliteration: "The Most High" },
    88: { bn: "আল-গাশিয়াহ", en: "Al-Ghashiyah", transliteration: "The Overwhelming" },
    89: { bn: "আল-ফাজর", en: "Al-Fajr", transliteration: "The Dawn" },
    90: { bn: "আল-বালাদ", en: "Al-Balad", transliteration: "The City" },
    91: { bn: "আশ-শামস", en: "Ash-Shams", transliteration: "The Sun" },
    92: { bn: "আল-লাইল", en: "Al-Layl", transliteration: "The Night" },
    93: { bn: "আদ-দুহা", en: "Ad-Duhaa", transliteration: "The Morning Hours" },
    94: { bn: "আশ-শারহ", en: "Ash-Sharh", transliteration: "The Relief" },
    95: { bn: "আত-তীন", en: "At-Tin", transliteration: "The Fig" },
    96: { bn: "আল-আলাক", en: "Al-'Alaq", transliteration: "The Clot" },
    97: { bn: "আল-কদর", en: "Al-Qadr", transliteration: "The Power" },
    98: { bn: "আল-বাইয়্যিনাহ", en: "Al-Bayyinah", transliteration: "The Clear Proof" },
    99: { bn: "আয-যালযালাহ", en: "Az-Zalzalah", transliteration: "The Earthquake" },
    100: { bn: "আল-আদিয়াত", en: "Al-'Adiyat", transliteration: "The Courser" },
    101: { bn: "আল-কারিআহ", en: "Al-Qari'ah", transliteration: "The Calamity" },
    102: { bn: "আত-তাকাসুর", en: "At-Takathur", transliteration: "The Rivalry in world increase" },
    103: { bn: "আল-আসর", en: "Al-'Asr", transliteration: "The Declining Day" },
    104: { bn: "আল-হুমাযাহ", en: "Al-Humazah", transliteration: "The Traducer" },
    105: { bn: "আল-ফীল", en: "Al-Fil", transliteration: "The Elephant" },
    106: { bn: "কুরাইশ", en: "Quraysh", transliteration: "Quraysh" },
    107: { bn: "আল-মাউন", en: "Al-Ma'un", transliteration: "The Small kindnesses" },
    108: { bn: "আল-কাওসার", en: "Al-Kawthar", transliteration: "The Abundance" },
    109: { bn: "আল-কাফিরূন", en: "Al-Kafirun", transliteration: "The Disbelievers" },
    110: { bn: "আন-নাসর", en: "An-Nasr", transliteration: "The Divine Support" },
    111: { bn: "আল-মাসাদ", en: "Al-Masad", transliteration: "The Palm Fiber" },
    112: { bn: "আল-ইখলাস", en: "Al-Ikhlas", transliteration: "The Sincerity" },
    113: { bn: "আল-ফালাক", en: "Al-Falaq", transliteration: "The Daybreak" },
    114: { bn: "আন-নাস", en: "An-Nas", transliteration: "Mankind" },
};

// Convert English numbers to Bengali
export function toBengaliNumber(num: number): string {
    const bengaliDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return num
        .toString()
        .split("")
        .map((digit) => bengaliDigits[parseInt(digit)])
        .join("");
}

export function getSurahName(surahNumber: number, language: "bn" | "en" = "bn"): string {
    const surah = SURAH_NAMES[surahNumber];
    return surah ? surah[language] : `Surah ${surahNumber}`;
}

export function formatVerseReference(surah: number, ayah: number, language: "bn" | "en" = "bn"): string {
    const surahName = getSurahName(surah, language);
    if (language === "bn") {
        return `সূরা ${surahName} (${toBengaliNumber(surah)}), আয়াত ${toBengaliNumber(ayah)}`;
    }
    return `Surah ${surahName} (${surah}), Ayah ${ayah}`;
}
