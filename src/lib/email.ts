import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate a secure confirmation token
 */
export function generateConfirmationToken(): string {
    return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Send confirmation email to new subscriber
 */
export async function sendConfirmationEmail(
    email: string,
    token: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const confirmUrl = `${appUrl}/api/confirm?token=${token}`;

        await resend.emails.send({
            from: "Sukoon <noreply@sukoon.app>",
            to: email,
            subject: "Confirm your Sukoon subscription",
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #4F46E5; margin: 0;">Sukoon</h1>
            </div>
            
            <div style="background: #F9FAFB; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
              <h2 style="margin-top: 0; color: #111827;">Confirm Your Subscription</h2>
              <p style="margin-bottom: 20px;">Thank you for subscribing to daily ayahs from Sukoon. Click the button below to confirm your email address:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmUrl}" style="background: #4F46E5; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Confirm Subscription</a>
              </div>
              
              <p style="font-size: 14px; color: #6B7280; margin-bottom: 0;">If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="font-size: 14px; color: #4F46E5; word-break: break-all;">${confirmUrl}</p>
            </div>
            
            <div style="font-size: 12px; color: #9CA3AF; text-align: center;">
              <p>If you didn't request this subscription, you can safely ignore this email.</p>
            </div>
          </body>
        </html>
      `,
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send confirmation email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to send email",
        };
    }
}
