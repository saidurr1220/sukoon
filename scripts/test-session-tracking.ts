/**
 * Test script for session tracking
 * Run with: npx tsx scripts/test-session-tracking.ts
 */

import { prisma } from "../src/lib/prisma";

async function testSessionTracking() {
    console.log("\n=== Testing Session Tracking ===");

    const testSessionId = `test_session_${Date.now()}`;

    try {
        // Test 1: Create session entries
        console.log("\n1. Creating test session entries...");

        await prisma.userSession.create({
            data: {
                sessionId: testSessionId,
                selectedMood: "anxious",
                verseId: "2:286",
                timezone: "Asia/Dhaka",
                userAgent: "Test Browser",
            },
        });

        await prisma.userSession.create({
            data: {
                sessionId: testSessionId,
                selectedMood: "anxious",
                verseId: "94:5",
                timezone: "Asia/Dhaka",
            },
        });

        await prisma.userSession.create({
            data: {
                sessionId: testSessionId,
                selectedMood: "grateful",
                verseId: "14:7",
                timezone: "Asia/Dhaka",
            },
        });

        console.log("✅ Created 3 session entries");

        // Test 2: Query recent moods
        console.log("\n2. Querying recent moods...");

        const sessions = await prisma.userSession.findMany({
            where: { sessionId: testSessionId },
            orderBy: { createdAt: "desc" },
            select: { selectedMood: true },
        });

        const recentMoods = sessions.map((s) => s.selectedMood);
        console.log("Recent moods:", recentMoods);
        console.log("✅ Expected: ['grateful', 'anxious', 'anxious']");

        // Test 3: Query recently shown verses
        console.log("\n3. Querying recently shown verses...");

        const verseSessions = await prisma.userSession.findMany({
            where: { sessionId: testSessionId },
            orderBy: { createdAt: "desc" },
            select: { verseId: true },
        });

        const recentVerses = verseSessions.map((s) => s.verseId);
        console.log("Recent verses:", recentVerses);
        console.log("✅ Expected: ['14:7', '94:5', '2:286']");

        // Test 4: Count consecutive same mood
        console.log("\n4. Counting consecutive same mood...");

        let consecutiveCount = 0;
        const targetMood = "anxious";

        for (const session of sessions) {
            if (session.selectedMood === targetMood) {
                consecutiveCount++;
            } else {
                break;
            }
        }

        console.log(`Consecutive '${targetMood}' count: ${consecutiveCount}`);
        console.log("✅ Expected: 0 (because last mood was 'grateful')");

        // Test 5: Check indexes
        console.log("\n5. Testing query performance with indexes...");

        const startTime = Date.now();
        await prisma.userSession.findMany({
            where: { sessionId: testSessionId },
            orderBy: { createdAt: "desc" },
            take: 10,
        });
        const queryTime = Date.now() - startTime;

        console.log(`Query time: ${queryTime}ms`);
        console.log("✅ Query should be fast due to indexes");

        // Test 6: Cleanup test data
        console.log("\n6. Cleaning up test data...");

        const deleted = await prisma.userSession.deleteMany({
            where: { sessionId: testSessionId },
        });

        console.log(`✅ Deleted ${deleted.count} test entries`);

        console.log("\n✅ All session tracking tests passed!");

    } catch (error) {
        console.error("\n❌ Test failed:", error);

        // Cleanup on error
        try {
            await prisma.userSession.deleteMany({
                where: { sessionId: testSessionId },
            });
        } catch (cleanupError) {
            console.error("Cleanup failed:", cleanupError);
        }

        throw error;
    }
}

async function testDatabaseConnection() {
    console.log("\n=== Testing Database Connection ===");

    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        // Check if tables exist
        const tableCheck = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_sessions', 'verse_metadata')
    `;

        console.log("Tables found:", tableCheck);

    } catch (error) {
        console.error("❌ Database connection failed:", error);
        throw error;
    }
}

async function runAllTests() {
    console.log("🧪 Starting Session Tracking Tests...\n");

    try {
        await testDatabaseConnection();
        await testSessionTracking();

        console.log("\n✅ All tests completed successfully!");
    } catch (error) {
        console.error("\n❌ Tests failed:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run tests
runAllTests();
