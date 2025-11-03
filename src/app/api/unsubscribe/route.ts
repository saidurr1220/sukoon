import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubscribeToken } from "@/lib/email-templates";

export const dynamic = 'force-dynamic';

/**
 * Unsubscribe endpoint
 * Handles one-click unsubscribe from daily emails
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(
                new URL("/?error=missing-unsubscribe-token", request.url)
            );
        }

        // Verify and extract subscriber ID from token
        const subscriberId = verifyUnsubscribeToken(token);

        if (!subscriberId) {
            return NextResponse.redirect(
                new URL("/?error=invalid-unsubscribe-token", request.url)
            );
        }

        // Find the subscriber
        const subscriber = await prisma.subscriber.findUnique({
            where: { id: subscriberId },
        });

        if (!subscriber) {
            return NextResponse.redirect(
                new URL("/?error=subscriber-not-found", request.url)
            );
        }

        // Deactivate the subscriber
        await prisma.subscriber.update({
            where: { id: subscriberId },
            data: { active: false },
        });

        // Redirect to success page
        return NextResponse.redirect(
            new URL("/?unsubscribed=true", request.url)
        );
    } catch (error) {
        console.error("Unsubscribe error:", error);
        return NextResponse.redirect(
            new URL("/?error=unsubscribe-failed", request.url)
        );
    }
}

/**
 * POST endpoint for one-click unsubscribe (RFC 8058)
 */
export async function POST(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { success: false, error: "Missing token" },
                { status: 400 }
            );
        }

        // Verify and extract subscriber ID from token
        const subscriberId = verifyUnsubscribeToken(token);

        if (!subscriberId) {
            return NextResponse.json(
                { success: false, error: "Invalid token" },
                { status: 400 }
            );
        }

        // Find the subscriber
        const subscriber = await prisma.subscriber.findUnique({
            where: { id: subscriberId },
        });

        if (!subscriber) {
            return NextResponse.json(
                { success: false, error: "Subscriber not found" },
                { status: 404 }
            );
        }

        // Deactivate the subscriber
        await prisma.subscriber.update({
            where: { id: subscriberId },
            data: { active: false },
        });

        return NextResponse.json({
            success: true,
            message: "Successfully unsubscribed",
        });
    } catch (error) {
        console.error("Unsubscribe error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
