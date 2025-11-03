import { NextRequest, NextResponse } from "next/server";
import {
    getActiveSubscribers,
    selectDailyVerse,
    logVerseSend,
} from "@/lib/daily-verse-selection";
import { sendDailyEmail } from "@/lib/email-templates";

/**
 * Daily email cron job endpoint
 * Called by Vercel Cron at 6:00 AM UTC
 * Sends daily ayah to all active confirmed subscribers
 */
export async function POST(request: NextRequest) {
    try {
        // Verify cron secret for security (optional but recommended)
        const authHeader = request.headers.get("authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Get all active confirmed subscribers
        const subscribers = await getActiveSubscribers();

        if (subscribers.length === 0) {
            return NextResponse.json({
                success: true,
                message: "No active subscribers",
                sent: 0,
            });
        }

        const results = {
            sent: 0,
            failed: 0,
            errors: [] as string[],
        };

        // Process each subscriber
        for (const subscriber of subscribers) {
            try {
                // Select a verse for this subscriber
                const verse = await selectDailyVerse(subscriber.id, subscriber.locale);

                // Send the email
                const emailResult = await sendDailyEmail(
                    subscriber.email,
                    verse,
                    subscriber.id
                );

                if (emailResult.success) {
                    // Log the send
                    await logVerseSend(subscriber.id, verse.id);
                    results.sent++;
                } else {
                    results.failed++;
                    results.errors.push(
                        `${subscriber.email}: ${emailResult.error || "Unknown error"}`
                    );
                }
            } catch (error) {
                results.failed++;
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                results.errors.push(`${subscriber.email}: ${errorMessage}`);
                console.error(`Failed to send to ${subscriber.email}:`, error);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Daily emails processed`,
            sent: results.sent,
            failed: results.failed,
            total: subscribers.length,
            errors: results.errors.length > 0 ? results.errors : undefined,
        });
    } catch (error) {
        console.error("Daily cron job error:", error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Internal server error",
            },
            { status: 500 }
        );
    }
}

// Allow GET for testing purposes (remove in production)
export async function GET(request: NextRequest) {
    // Only allow in development
    if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
            { success: false, error: "Method not allowed" },
            { status: 405 }
        );
    }

    return POST(request);
}
