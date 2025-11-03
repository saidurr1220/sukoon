import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(
                new URL("/?error=missing-token", request.url)
            );
        }

        // Find the confirmation token
        const confirmationToken = await prisma.confirmationToken.findUnique({
            where: { token },
        });

        if (!confirmationToken) {
            return NextResponse.redirect(
                new URL("/?error=invalid-token", request.url)
            );
        }

        // Check if token is expired
        if (confirmationToken.expiresAt < new Date()) {
            // Delete expired token
            await prisma.confirmationToken.delete({
                where: { token },
            });

            return NextResponse.redirect(
                new URL("/?error=expired-token", request.url)
            );
        }

        // Find the subscriber
        const subscriber = await prisma.subscriber.findUnique({
            where: { email: confirmationToken.email },
        });

        if (!subscriber) {
            return NextResponse.redirect(
                new URL("/?error=subscriber-not-found", request.url)
            );
        }

        // Update subscriber confirmation status and delete token in a transaction
        await prisma.$transaction(async (tx) => {
            await tx.subscriber.update({
                where: { email: confirmationToken.email },
                data: {
                    confirmedAt: new Date(),
                    active: true,
                },
            });

            await tx.confirmationToken.delete({
                where: { token },
            });
        });

        // Redirect to success page
        return NextResponse.redirect(
            new URL("/?confirmed=true", request.url)
        );
    } catch (error) {
        console.error("Confirmation error:", error);
        return NextResponse.redirect(
            new URL("/?error=confirmation-failed", request.url)
        );
    }
}
