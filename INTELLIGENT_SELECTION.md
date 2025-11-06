# 🧠 Super Intelligent Context-Aware Verse Selection

## 🎯 Overview

Sukoon এখন একটি **super intelligent verse selection system** ব্যবহার করে যা user এর সম্পূর্ণ context বুঝে perfect আয়াত select করে।

## 📊 Data Sources (Browser থেকে নেওয়া)

### 1. **Time Context**

- ✅ Current hour & minute
- ✅ Timezone (auto-detected)
- ✅ Day of week
- ✅ Time of day (dawn/morning/noon/afternoon/evening/night/lateNight)

### 2. **Islamic Context**

- ✅ Jummah detection (Friday)
- ✅ Prayer time detection (approximate)
- ✅ Which prayer (Fajr/Dhuhr/Asr/Maghrib/Isha)
- ⏳ Ramadan detection (TODO: Islamic calendar)

### 3. **Device & Browser**

- ✅ Device type (mobile/tablet/desktop)
- ✅ Browser (Chrome/Firefox/Safari/Edge)
- ✅ Operating System (Android/iOS/Windows/Mac/Linux)
- ✅ Language preference

### 4. **User Behavior (Inferred)**

- ✅ Likely activity (waking/working/break/evening_family/night_reflection/sleep_prep)
- ✅ Session type (first visit / returning)

### 5. **Cultural Context (Asian/Bengali)**

- ✅ Meal times (7-9 AM, 1-3 PM, 8-10 PM)
- ✅ Work hours (9 AM - 6 PM weekdays)
- ✅ Family time (6-10 PM)
- ✅ Personal reflection time (10 PM - 2 AM)

## 🎨 Intelligence Logic

### Time-Based Priority

#### 🌅 Dawn/Morning (4-11 AM)

**Context**: New day, fresh start, hope

- **Grateful/Happy mood**: +25 priority
- **Depressed/Sad mood**: +15 priority (hope for new day)
- **Surah Duha (93)**: +20 priority
- **Surah Inshirah (94)**: +20 priority
- **Surah Shams (91:1-10)**: +15 priority

#### ☀️ Noon (11 AM - 1 PM)

**Context**: Peak energy, busy time

- **Anxious mood**: +15 priority (calm during busy time)
- **2:286** (Allah doesn't burden): +15 priority

#### 🌤️ Afternoon (1-5 PM)

**Context**: Patience needed, staying strong

- **Angry/Anxious mood**: +20 priority
- **Surah Asr (103)**: +15 priority
- **3:200** (Be patient): +15 priority

#### 🌆 Evening (5-8 PM)

**Context**: Reflection, family, gratitude

- **Grateful/Happy mood**: +20 priority
- **Family time**: +10 priority
- **Surah Rahman (55)**: +15 priority

#### 🌙 Night (8 PM - 12 AM)

**Context**: Peace, forgiveness, closeness to Allah

- **Anxious/Sad/Depressed mood**: +25 priority
- **2:186** (Allah is near): +20 priority
- **39:53** (Don't despair): +20 priority
- **17:79** (Night prayer): +15 priority

#### 🌃 Late Night (12-4 AM)

**Context**: Deep reflection, tahajjud time, seeking forgiveness

- **Depressed/Anxious mood**: +30 priority
- **39:53** (Mercy of Allah): +25 priority
- **Surah Muzzammil (73)**: +20 priority
- **17:79** (Tahajjud): +20 priority
- **3:17** (Seek forgiveness at dawn): +15 priority

### Prayer Time Intelligence

#### 🕌 Fajr (4-6 AM)

- New beginning, hope
- Surah Duha/Inshirah: +20 priority

#### 🕌 Dhuhr (12-2 PM)

- Midday, seeking help
- 2:186: +15 priority

#### 🕌 Asr (3-5 PM)

- Patience, time passing
- Surah Asr (103): +20 priority

#### 🕌 Maghrib (5-7 PM)

- Gratitude for day
- Grateful mood: +20 priority
- Surah Rahman (55): +15 priority

#### 🕌 Isha (7-9 PM)

- Peace, rest
- Anxious/Sad mood: +15 priority

**All prayer times**: +15 base priority
**Dua verses** (2:186, 40:60): +15 extra priority

### Day-Based Intelligence

#### 📅 Jummah (Friday)

- +20 base priority
- Surah Jummah (62): +25 priority
- 2:186 (Dua acceptance): +15 priority

#### 🎉 Weekend (Friday/Saturday)

- More personal time
- Grateful/Happy mood: +10 priority

### Cultural Context (Asian/Bengali)

#### 👨‍👩‍👧‍👦 Family Time (6-10 PM)

- Verses about family, relationships, gratitude
- Grateful/Happy mood: +15 priority
- Surah Luqman (31:14-19): +15 priority

#### 🧘 Personal Reflection Time (10 PM - 2 AM)

- Deep, meaningful verses
- Depressed/Anxious/Sad mood: +20 priority
- +10 bonus for all moods

#### 💼 Work Hours (9 AM - 6 PM, weekdays)

- Shorter, impactful verses
- Verses < 150 chars: +10 priority
- Anxious/Angry mood: +10 priority

### Activity-Based Intelligence

#### 🌅 Waking Up

- Energizing, hopeful verses
- Surah Duha/Inshirah: +25 priority
- Grateful mood: +15 priority

#### 💼 Working

- Focus, patience, shorter verses
- Verses < 150 chars: +15 priority
- Anxious/Angry mood: +15 priority

#### ☕ Break Time

- Refreshing, moderate length
- Verses 100-200 chars: +10 priority

#### 👨‍👩‍👧 Evening with Family

- Gratitude, peace
- Grateful/Happy mood: +20 priority
- Surah Rahman (55): +15 priority

#### 🌙 Night Reflection

- Deep, meaningful
- Depressed/Anxious/Sad mood: +25 priority
- 39:53: +20 priority

#### 😴 Sleep Preparation

- Calming, peaceful
- Anxious mood: +25 priority
- 2:186: +15 priority

### Device Optimization

#### 📱 Mobile

- Prefer shorter verses for easier reading
- Verses < 200 chars: +10 priority

#### 💻 Desktop/Tablet

- Can handle longer verses
- No penalty for length

### Verse Length Optimization

- **Perfect (80-250 chars)**: +15 priority
- **Acceptable short (50-80 chars)**: +5 priority
- **Acceptable long (250-350 chars)**: +5 priority
- **Too short (< 50 chars)**: -20 priority
- **Too long (> 400 chars)**: -15 priority

### Mood-Specific Matching

#### 😰 Anxious

- 2:186 (Allah is near): +20
- 13:28 (Hearts find peace): +20
- Surah Inshirah (94): +20
- 65:3 (Allah provides): +15

#### 😢 Sad

- Surah Inshirah (94): +25
- 39:53 (Don't despair): +20
- 2:186 (Allah is near): +20

#### 😔 Depressed

- 39:53 (Allah forgives all): +30
- Surah Inshirah (94): +25
- 2:186 (Allah is near): +20
- 16:97 (Good life): +15

#### 😠 Angry

- 3:134 (Control anger): +25
- 25:63 (Walk humbly): +20
- 41:34-35 (Repel evil with good): +20

#### 😊 Happy

- 16:97 (Good life): +25
- 55:13 (Which favors): +20
- 14:7 (If grateful): +20

#### 🙏 Grateful

- 14:7 (If grateful, Allah increases): +30
- 55:13 (Which favors): +25
- 93:11 (Proclaim blessings): +20

## 🎯 Selection Algorithm

1. **Get user context** (time, device, activity, etc.)
2. **Fetch mood candidates** (50 verses)
3. **Calculate intelligent priority** for each verse
4. **Filter** by length (40-400 chars) and recently shown
5. **Sort** by priority (0-100 scale)
6. **Select** from top 5 with weighted randomness

## 📈 Example Scenarios

### Scenario 1: Anxious at 2 AM

```
Context:
- Time: 2:00 AM (lateNight)
- Activity: night_reflection
- Device: mobile
- Mood: anxious

Priority Boosts:
- Late night + anxious: +30
- Night reflection + anxious: +25
- 39:53 (Don't despair): +25
- Personal time: +20
- Mobile (short verse): +10

Result: 39:53 selected (priority: 95)
```

### Scenario 2: Grateful at 7 AM Friday

```
Context:
- Time: 7:00 AM (morning)
- Day: Friday (Jummah)
- Activity: waking
- Mood: grateful

Priority Boosts:
- Morning + grateful: +25
- Jummah: +20
- Waking + grateful: +15
- 14:7 (If grateful): +30

Result: 14:7 selected (priority: 90)
```

### Scenario 3: Sad at 6 PM

```
Context:
- Time: 6:00 PM (evening)
- Activity: evening_family
- Cultural: family_time
- Mood: sad

Priority Boosts:
- Evening + sad: +15
- Family time: +10
- 94:5-6 (With hardship): +25
- Personal time starting: +10

Result: 94:5-6 selected (priority: 85)
```

## 🚀 Benefits

1. **Highly Personalized**: Every user gets different verses based on their context
2. **Time-Aware**: Morning verses different from night verses
3. **Culture-Aware**: Understands Asian/Bengali lifestyle patterns
4. **Activity-Aware**: Knows if you're working, with family, or reflecting
5. **Device-Optimized**: Shorter verses on mobile, longer on desktop
6. **Prayer-Conscious**: Special verses during prayer times
7. **Length-Optimized**: No too-short or too-long verses
8. **Mood-Matched**: Perfect verses for each emotional state

## 🔮 Future Enhancements

- [ ] Proper Islamic calendar integration for Ramadan
- [ ] User preference learning (ML-based)
- [ ] Location-based prayer times (accurate)
- [ ] Weather-based selection (rainy day verses)
- [ ] Historical pattern analysis
- [ ] A/B testing for optimization

---

**Note**: All data is collected from browser APIs only. No personal data is stored or tracked.
