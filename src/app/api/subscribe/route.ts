import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidEmail, generateConfirmationToken, sendConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        // Validate email
        if (!email || typeof email !== "string") {
            return NextResponse.json(
                { success: false, error: "Email is required" },
                { status: 400 }
            );
        }

        if (!isValidEmail(email)) {
            return NextResponse.json(
                { success: false, error: "Invalid email format" },
                { status: 400 }
            );
        }

        const normalizedEmail = email.toLowerCase();

        // Check if subscriber already exists
        const existingSubscriber = await prisma.subscriber.findUnique({
            where: { email: normalizedEmail },
        });

        if (existingSubscriber) {
            // If already confirmed, inform user
            if (existingSubscriber.confirmedAt) {
                return NextResponse.json(
                    { success: false, error: "This email is already subscribed" },
                    { status: 409 }
                );
            }

            // If not confirmed, resend confirmation email with new token
            const token = generateConfirmationToken();
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            // Delete old tokens for this email
            await prisma.confirmationToken.deleteMany({
                where: { email: normalizedEmail },
            });

            // Create new token
            await prisma.confirmationToken.create({
                data: {
                    email: normalizedEmail,
                    token,
                    expiresAt,
                },
            });

            const emailResult = await sendConfirmationEmail(normalizedEmail, token);

            if (!emailResult.success) {
                return NextResponse.json(
                    { success: false, error: "Failed to send confirmation email" },
                    { status: 500 }
                );
            }

            return NextResponse.json({
                success: true,
                message: "Confirmation email resent. Please check your inbox.",
            });
        }

        // Create new subscriber and token in a transaction
        const token = generateConfirmationToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.$transaction(async (tx) => {
            await tx.subscriber.create({
                data: {
                    email: normalizedEmail,
                    confirmedAt: null,
                    active: true,
                },
            });

            await tx.confirmationToken.create({
                data: {
                    email: normalizedEmail,
                    token,
                    expiresAt,
                },
            });
        });

        // Send confirmation email
        const emailResult = await sendConfirmationEmail(normalizedEmail, token);

        if (!emailResult.success) {
            // Rollback subscriber and token creation
            await prisma.$transaction(async (tx) => {
                await tx.subscriber.delete({
                    where: { email: normalizedEmail },
                });
                await tx.confirmationToken.deleteMany({
                    where: { email: normalizedEmail },
                });
            });

            return NextResponse.json(
                { success: false, error: "Failed to send confirmation email" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Confirmation email sent. Please check your inbox.",
        });
    } catch (error) {
        console.error("Subscription error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
