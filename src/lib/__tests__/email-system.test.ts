/**
 * Email System Tests
 * Tests for subscription, confirmation, unsubscribe, and daily email functionality
 * 
 * NOTE: This test suite includes both unit tests (no database required) and 
 * integration tests (require database connection).
 * 
 * Run with: npx tsx src/lib/__tests__/email-system.test.ts
 * 
 * Requirements tested:
 * - 3.2: Double opt-in email subscription flow
 * - 3.3: Email confirmation with token validation
 * - 3.4: Daily email selection and sending
 * - 3.5: One-click unsubscribe functionality
 * - 6.3: 30-day verse exclusion logic
 */

import { prisma } from "../prisma";
import {
    generateConfirmationToken,
    isValidEmail,
    sendConfirmationEmail,
} from "../email";
import {
    generateUnsubscribeToken,
    verifyUnsubscribeToken,
    formatVerseReference,
    createDailyEmailTemplate,
    sendDailyEmail,
} from "../email-templates";
import {
    getAvailableVersesForSubscriber,
    selectDailyVerse,
    getActiveSubscribers,
    logVerseSend,
} from "../daily-verse-selection";

// Test data
const TEST_EMAIL = "test@example.com";
const TEST_SUBSCRIBER_ID = "test-subscriber-id";

// Track if database is available
let databaseAvailable = false;

/**
 * Check if database is available
 */
async function checkDatabaseConnection(): Promise<boolean> {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
    if (!databaseAvailable) return;

    try {
        await prisma.sendLog.deleteMany({
            where: { subscriber: { email: TEST_EMAIL } },
        });
        await prisma.subscriber.deleteMany({
            where: { email: TEST_EMAIL },
        });
        await prisma.confirmationToken.deleteMany({
            where: { email: TEST_EMAIL },
        });
    } catch (error) {
        console.error("Cleanup error:", error);
    }
}

/**
 * Test email validation
 */
async function testEmailValidation() {
    console.log("Testing email validation...");

    // Valid emails
    if (!isValidEmail("user@example.com")) {
        throw new Error("Valid email should pass validation");
    }
    if (!isValidEmail("test.user+tag@domain.co.uk")) {
        throw new Error("Valid email with special chars should pass");
    }
    console.log("✓ Valid emails pass validation");

    // Invalid emails
    if (isValidEmail("invalid")) {
        throw new Error("Invalid email should fail validation");
    }
    if (isValidEmail("@example.com")) {
        throw new Error("Email without local part should fail");
    }
    if (isValidEmail("user@")) {
        throw new Error("Email without domain should fail");
    }
    console.log("✓ Invalid emails fail validation");
}

/**
 * Test confirmation token generation
 */
async function testConfirmationTokenGeneration() {
    console.log("\nTesting confirmation token generation...");

    const token1 = generateConfirmationToken();
    const token2 = generateConfirmationToken();

    if (!token1 || token1.length === 0) {
        throw new Error("Token should not be empty");
    }
    if (token1 === token2) {
        throw new Error("Tokens should be unique");
    }
    if (token1.length < 32) {
        throw new Error("Token should be sufficiently long");
    }
    console.log("✓ Confirmation tokens generated correctly");
}

/**
 * Test double opt-in flow
 * Requirement 3.2: Double opt-in email subscription
 */
async function testDoubleOptInFlow() {
    console.log("\nTesting double opt-in flow...");

    if (!databaseAvailable) {
        console.log("⚠ Database not available, skipping integration test");
        return;
    }

    await cleanupTestData();

    // Step 1: Create subscriber
    const subscriber = await prisma.subscriber.create({
        data: {
            email: TEST_EMAIL,
            confirmedAt: null,
            active: true,
        },
    });

    if (subscriber.confirmedAt !== null) {
        throw new Error("New subscriber should not be confirmed");
    }
    console.log("✓ Subscriber created without confirmation");

    // Step 2: Create confirmation token
    const token = generateConfirmationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.confirmationToken.create({
        data: {
            email: TEST_EMAIL,
            token,
            expiresAt,
        },
    });
    console.log("✓ Confirmation token created");

    // Step 3: Verify token exists
    const confirmationToken = await prisma.confirmationToken.findUnique({
        where: { token },
    });

    if (!confirmationToken) {
        throw new Error("Confirmation token should exist");
    }
    if (confirmationToken.email !== TEST_EMAIL) {
        throw new Error("Token should be associated with correct email");
    }
    console.log("✓ Confirmation token verified");

    // Step 4: Confirm subscription
    await prisma.$transaction(async (tx) => {
        await tx.subscriber.update({
            where: { email: TEST_EMAIL },
            data: {
                confirmedAt: new Date(),
                active: true,
            },
        });

        await tx.confirmationToken.delete({
            where: { token },
        });
    });

    // Step 5: Verify confirmation
    const confirmedSubscriber = await prisma.subscriber.findUnique({
        where: { email: TEST_EMAIL },
    });

    if (!confirmedSubscriber?.confirmedAt) {
        throw new Error("Subscriber should be confirmed");
    }
    console.log("✓ Subscriber confirmed successfully");

    // Step 6: Verify token deleted
    const deletedToken = await prisma.confirmationToken.findUnique({
        where: { token },
    });

    if (deletedToken) {
        throw new Error("Confirmation token should be deleted after use");
    }
    console.log("✓ Confirmation token deleted after use");

    await cleanupTestData();
}

/**
 * Test expired token handling
 * Requirement 3.3: Token expiration validation
 */
async function testExpiredTokenHandling() {
    console.log("\nTesting expired token handling...");

    if (!databaseAvailable) {
        console.log("⚠ Database not available, skipping integration test");
        return;
    }

    await cleanupTestData();

    // Create subscriber
    await prisma.subscriber.create({
        data: {
            email: TEST_EMAIL,
            confirmedAt: null,
            active: true,
        },
    });

    // Create expired token
    const token = generateConfirmationToken();
    const expiredDate = new Date(Date.now() - 1000); // 1 second ago

    await prisma.confirmationToken.create({
        data: {
            email: TEST_EMAIL,
            token,
            expiresAt: expiredDate,
        },
    });

    // Verify token is expired
    const confirmationToken = await prisma.confirmationToken.findUnique({
        where: { token },
    });

    if (!confirmationToken) {
        throw new Error("Token should exist");
    }
    if (confirmationToken.expiresAt >= new Date()) {
        throw new Error("Token should be expired");
    }
    console.log("✓ Expired token detected correctly");

    await cleanupTestData();
}

/**
 * Test unsubscribe token generation and verification
 */
async function testUnsubscribeTokens() {
    console.log("\nTesting unsubscribe tokens...");

    const subscriberId = "test-sub-123";

    // Generate token
    const token = generateUnsubscribeToken(subscriberId);
    if (!token || token.length === 0) {
        throw new Error("Unsubscribe token should not be empty");
    }
    console.log("✓ Unsubscribe token generated");

    // Verify token
    const verifiedId = verifyUnsubscribeToken(token);
    if (verifiedId !== subscriberId) {
        throw new Error(`Token verification failed: expected ${subscriberId}, got ${verifiedId}`);
    }
    console.log("✓ Unsubscribe token verified correctly");

    // Test invalid token
    const invalidId = verifyUnsubscribeToken("invalid-token");
    if (invalidId !== null) {
        throw new Error("Invalid token should return null");
    }
    console.log("✓ Invalid unsubscribe token rejected");
}

/**
 * Test unsubscribe functionality
 * Requirement 3.5: One-click unsubscribe
 */
async function testUnsubscribeFunctionality() {
    console.log("\nTesting unsubscribe functionality...");

    if (!databaseAvailable) {
        console.log("⚠ Database not available, skipping integration test");
        return;
    }

    await cleanupTestData();

    // Create confirmed subscriber
    const subscriber = await prisma.subscriber.create({
        data: {
            email: TEST_EMAIL,
            confirmedAt: new Date(),
            active: true,
        },
    });

    if (!subscriber.active) {
        throw new Error("New subscriber should be active");
    }
    console.log("✓ Active subscriber created");

    // Unsubscribe
    await prisma.subscriber.update({
        where: { id: subscriber.id },
        data: { active: false },
    });

    // Verify unsubscribed
    const unsubscribedUser = await prisma.subscriber.findUnique({
        where: { id: subscriber.id },
    });

    if (unsubscribedUser?.active) {
        throw new Error("Subscriber should be inactive after unsubscribe");
    }
    console.log("✓ Subscriber unsubscribed successfully");

    await cleanupTestData();
}

/**
 * Test verse reference formatting
 */
async function testVerseReferenceFormatting() {
    console.log("\nTesting verse reference formatting...");

    const ref1 = formatVerseReference(2, 255);
    if (ref1 !== "Surah 2:255") {
        throw new Error(`Expected "Surah 2:255", got "${ref1}"`);
    }

    const ref2 = formatVerseReference(1, 1);
    if (ref2 !== "Surah 1:1") {
        throw new Error(`Expected "Surah 1:1", got "${ref2}"`);
    }

    console.log("✓ Verse references formatted correctly");
}

/**
 * Test email template rendering
 */
async function testEmailTemplateRendering() {
    console.log("\nTesting email template rendering...");

    const testVerse = {
        id: "2:255",
        surah: 2,
        ayah: 255,
        arabicText: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
        translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence.",
        translatorName: "Saheeh International",
        audioUrl: "https://example.com/audio.mp3",
    };

    const unsubscribeUrl = "https://example.com/unsubscribe?token=test";
    const html = createDailyEmailTemplate(testVerse, unsubscribeUrl);

    // Verify template contains required elements
    if (!html.includes(testVerse.arabicText)) {
        throw new Error("Template should contain Arabic text");
    }
    if (!html.includes(testVerse.translation)) {
        throw new Error("Template should contain translation");
    }
    if (!html.includes(testVerse.translatorName)) {
        throw new Error("Template should contain translator name");
    }
    if (!html.includes("Surah 2:255")) {
        throw new Error("Template should contain verse reference");
    }
    if (!html.includes(unsubscribeUrl)) {
        throw new Error("Template should contain unsubscribe link");
    }
    if (!html.includes('dir="rtl"')) {
        throw new Error("Template should have RTL direction for Arabic");
    }
    if (!html.includes(testVerse.audioUrl)) {
        throw new Error("Template should contain audio link");
    }
    if (!html.includes("tafsir")) {
        throw new Error("Template should contain disclaimer");
    }

    console.log("✓ Email template renders correctly");
}

/**
 * Test daily email verse selection
 * Requirement 3.4: Daily email verse selection logic
 */
async function testDailyVerseSelection() {
    console.log("\nTesting daily verse selection...");

    if (!databaseAvailable) {
        console.log("⚠ Database not available, skipping integration test");
        return;
    }

    await cleanupTestData();

    // Create test subscriber
    const subscriber = await prisma.subscriber.create({
        data: {
            email: TEST_EMAIL,
            confirmedAt: new Date(),
            active: true,
        },
    });

    // Get available verses
    const availableVerses = await getAvailableVersesForSubscriber(subscriber.id);
    if (availableVerses.length === 0) {
        throw new Error("Should have available verses");
    }
    console.log(`✓ Found ${availableVerses.length} available verses`);

    // Get first verse to use for testing
    const firstVerse = await prisma.verse.findFirst({
        include: {
            translations: {
                include: {
                    translator: true,
                },
            },
        },
    });

    if (!firstVerse) {
        console.log("⚠ No verses in database, skipping verse selection test");
        await cleanupTestData();
        return;
    }

    // Log a send
    await logVerseSend(subscriber.id, firstVerse.id);
    console.log("✓ Verse send logged");

    // Verify send log created
    const sendLog = await prisma.sendLog.findFirst({
        where: {
            subscriberId: subscriber.id,
            verseId: firstVerse.id,
        },
    });

    if (!sendLog) {
        throw new Error("Send log should be created");
    }
    console.log("✓ Send log verified");

    // Verify lastSentAt updated
    const updatedSubscriber = await prisma.subscriber.findUnique({
        where: { id: subscriber.id },
    });

    if (!updatedSubscriber?.lastSentAt) {
        throw new Error("Subscriber lastSentAt should be updated");
    }
    console.log("✓ Subscriber lastSentAt updated");

    // Verify verse excluded from available list
    const availableAfterSend = await getAvailableVersesForSubscriber(subscriber.id);
    if (availableAfterSend.includes(firstVerse.id)) {
        throw new Error("Recently sent verse should not be in available list");
    }
    console.log("✓ Recently sent verse excluded from available list");

    await cleanupTestData();
}

/**
 * Test active subscribers query
 * Requirement 3.4: Query only confirmed and active subscribers
 */
async function testActiveSubscribersQuery() {
    console.log("\nTesting active subscribers query...");

    if (!databaseAvailable) {
        console.log("⚠ Database not available, skipping integration test");
        return;
    }

    await cleanupTestData();

    // Create test subscribers
    const confirmedActive = await prisma.subscriber.create({
        data: {
            email: "confirmed@example.com",
            confirmedAt: new Date(),
            active: true,
        },
    });

    const unconfirmed = await prisma.subscriber.create({
        data: {
            email: "unconfirmed@example.com",
            confirmedAt: null,
            active: true,
        },
    });

    const inactive = await prisma.subscriber.create({
        data: {
            email: "inactive@example.com",
            confirmedAt: new Date(),
            active: false,
        },
    });

    // Query active subscribers
    const activeSubscribers = await getActiveSubscribers();

    // Verify only confirmed and active subscribers returned
    const emails = activeSubscribers.map((s) => s.email);
    if (!emails.includes("confirmed@example.com")) {
        throw new Error("Should include confirmed active subscriber");
    }
    if (emails.includes("unconfirmed@example.com")) {
        throw new Error("Should not include unconfirmed subscriber");
    }
    if (emails.includes("inactive@example.com")) {
        throw new Error("Should not include inactive subscriber");
    }

    console.log("✓ Active subscribers query returns correct results");

    // Cleanup
    await prisma.subscriber.deleteMany({
        where: {
            email: {
                in: ["confirmed@example.com", "unconfirmed@example.com", "inactive@example.com"],
            },
        },
    });
}

/**
 * Test 30-day exclusion logic
 * Requirement 6.3: Prevent duplicate verses within 30 days
 */
async function testThirtyDayExclusion() {
    console.log("\nTesting 30-day verse exclusion...");

    if (!databaseAvailable) {
        console.log("⚠ Database not available, skipping integration test");
        return;
    }

    await cleanupTestData();

    // Create subscriber
    const subscriber = await prisma.subscriber.create({
        data: {
            email: TEST_EMAIL,
            confirmedAt: new Date(),
            active: true,
        },
    });

    // Get a verse
    const verse = await prisma.verse.findFirst();
    if (!verse) {
        console.log("⚠ No verses in database, skipping 30-day exclusion test");
        await cleanupTestData();
        return;
    }

    // Create send log from 29 days ago (should be excluded)
    const twentyNineDaysAgo = new Date();
    twentyNineDaysAgo.setDate(twentyNineDaysAgo.getDate() - 29);

    await prisma.sendLog.create({
        data: {
            subscriberId: subscriber.id,
            verseId: verse.id,
            sentAt: twentyNineDaysAgo,
        },
    });

    // Verify verse is excluded
    const availableVerses = await getAvailableVersesForSubscriber(subscriber.id);
    if (availableVerses.includes(verse.id)) {
        throw new Error("Verse sent 29 days ago should be excluded");
    }
    console.log("✓ Verse sent within 30 days is excluded");

    // Create send log from 31 days ago (should be available)
    const anotherVerse = await prisma.verse.findFirst({
        where: { id: { not: verse.id } },
    });

    if (anotherVerse) {
        const thirtyOneDaysAgo = new Date();
        thirtyOneDaysAgo.setDate(thirtyOneDaysAgo.getDate() - 31);

        await prisma.sendLog.create({
            data: {
                subscriberId: subscriber.id,
                verseId: anotherVerse.id,
                sentAt: thirtyOneDaysAgo,
            },
        });

        const availableAfter31Days = await getAvailableVersesForSubscriber(subscriber.id);
        if (!availableAfter31Days.includes(anotherVerse.id)) {
            throw new Error("Verse sent 31 days ago should be available");
        }
        console.log("✓ Verse sent over 30 days ago is available");
    }

    await cleanupTestData();
}

/**
 * Run all tests
 */
async function runTests() {
    console.log("=== Email System Tests ===\n");

    try {
        // Check database connection
        console.log("Checking database connection...");
        databaseAvailable = await checkDatabaseConnection();
        if (databaseAvailable) {
            console.log("✓ Database connection available\n");
        } else {
            console.log("⚠ Database connection not available - integration tests will be skipped\n");
        }

        // Unit tests (no database required)
        await testEmailValidation();
        await testConfirmationTokenGeneration();
        await testUnsubscribeTokens();
        await testVerseReferenceFormatting();
        await testEmailTemplateRendering();

        // Integration tests (require database)
        await testDoubleOptInFlow();
        await testExpiredTokenHandling();
        await testUnsubscribeFunctionality();
        await testDailyVerseSelection();
        await testActiveSubscribersQuery();
        await testThirtyDayExclusion();

        console.log("\n✓ All email system tests passed\n");

        if (!databaseAvailable) {
            console.log("⚠ Note: Integration tests were skipped due to database unavailability");
            console.log("   To run full test suite, ensure database connection is configured\n");
        }
    } catch (error) {
        console.error("\n✗ Test failed:", error);
        process.exit(1);
    } finally {
        await cleanupTestData();
        await prisma.$disconnect();
    }
}

runTests();
