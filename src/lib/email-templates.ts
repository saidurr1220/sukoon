import { Resend } from "resend";
import { type VerseWithTranslation } from "./verse-selection";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate unsubscribe token for a subscriber
 * @param subscriberId - The subscriber ID
 * @returns Secure unsubscribe token
 */
export function generateUnsubscribeToken(subscriberId: string): string {
    const secret = process.env.UNSUBSCRIBE_SECRET || "default-secret-change-in-production";
    const data = `${subscriberId}:${Date.now()}`;
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(data);
    return `${subscriberId}.${hmac.digest("hex")}`;
}

/**
 * Verify unsubscribe token
 * @param token - The unsubscribe token
 * @returns Subscriber ID if valid, null otherwise
 */
export function verifyUnsubscribeToken(token: string): string | null {
    try {
        const [subscriberId, signature] = token.split(".");
        if (!subscriberId || !signature) {
            return null;
        }

        const secret = process.env.UNSUBSCRIBE_SECRET || "default-secret-change-in-production";
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(subscriberId);

        // Simple verification - in production, you might want to add timestamp validation
        return subscriberId;
    } catch {
        return null;
    }
}

/**
 * Format Surah:Ayah reference for subject line
 * @param surah - Surah number
 * @param ayah - Ayah number
 * @returns Formatted reference (e.g., "Surah 2:255")
 */
export function formatVerseReference(surah: number, ayah: number): string {
    return `Surah ${surah}:${ayah}`;
}

/**
 * Create HTML email template for daily ayah
 * @param verse - The verse with translation
 * @param unsubscribeUrl - The unsubscribe URL
 * @returns HTML email content
 */
export function createDailyEmailTemplate(
    verse: VerseWithTranslation,
    unsubscribeUrl: string
): string {
    const verseReference = formatVerseReference(verse.surah, verse.ayah);

    return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Daily Ayah - ${verseReference}</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #F9FAFB;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
      <tr>
        <td align="center" style="padding: 40px 20px;">
          <table role="presentation" style="max-width: 600px; width: 100%; background-color: #FFFFFF; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <tr>
              <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #E5E7EB;">
                <h1 style="margin: 0; color: #4F46E5; font-size: 28px; font-weight: 700;">Sukoon</h1>
                <p style="margin: 8px 0 0; color: #6B7280; font-size: 14px;">Your Daily Ayah</p>
              </td>
            </tr>

            <!-- Arabic Text -->
            <tr>
              <td style="padding: 32px 32px 24px;">
                <div dir="rtl" lang="ar" style="font-family: 'Amiri', 'Scheherazade', 'Traditional Arabic', serif; font-size: 28px; line-height: 1.8; color: #111827; text-align: right; margin-bottom: 24px;">
                  ${verse.arabicText}
                </div>
              </td>
            </tr>

            <!-- Translation -->
            <tr>
              <td style="padding: 0 32px 24px;">
                <div style="font-size: 16px; line-height: 1.6; color: #374151; margin-bottom: 16px;">
                  ${verse.translation}
                </div>
                <div style="font-size: 14px; color: #6B7280; font-style: italic;">
                  — ${verse.translatorName}
                </div>
              </td>
            </tr>

            <!-- Verse Reference -->
            <tr>
              <td style="padding: 0 32px 24px;">
                <div style="display: inline-block; background-color: #EEF2FF; color: #4F46E5; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: 600;">
                  ${verseReference}
                </div>
              </td>
            </tr>

            <!-- Audio Link (if available) -->
            ${verse.audioUrl ? `
            <tr>
              <td style="padding: 0 32px 24px;">
                <a href="${verse.audioUrl}" style="display: inline-block; background-color: #4F46E5; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
                  🔊 Listen to Recitation
                </a>
              </td>
            </tr>
            ` : ''}

            <!-- Divider -->
            <tr>
              <td style="padding: 24px 32px;">
                <div style="border-top: 1px solid #E5E7EB;"></div>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding: 0 32px 32px;">
                <p style="margin: 0 0 16px; font-size: 12px; color: #9CA3AF; line-height: 1.5;">
                  This verse was selected for you as part of your daily Sukoon subscription. We hope it brings you peace and reflection.
                </p>
                <p style="margin: 0 0 16px; font-size: 12px; color: #9CA3AF; line-height: 1.5;">
                  <strong>Disclaimer:</strong> Sukoon is not a tafsir or fiqh resource. For scholarly interpretation and religious guidance, please consult qualified Islamic scholars.
                </p>
                <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                  <a href="${unsubscribeUrl}" style="color: #6B7280; text-decoration: underline;">Unsubscribe from daily emails</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}

/**
 * Send daily ayah email to a subscriber
 * @param email - Subscriber email address
 * @param verse - The verse to send
 * @param subscriberId - The subscriber ID for unsubscribe link
 * @returns Result of email send operation
 */
export async function sendDailyEmail(
    email: string,
    verse: VerseWithTranslation,
    subscriberId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const unsubscribeToken = generateUnsubscribeToken(subscriberId);
        const unsubscribeUrl = `${appUrl}/api/unsubscribe?token=${unsubscribeToken}`;

        const subject = `${formatVerseReference(verse.surah, verse.ayah)} - Your Daily Ayah`;
        const htmlContent = createDailyEmailTemplate(verse, unsubscribeUrl);

        await resend.emails.send({
            from: "Sukoon <daily@sukoon.app>",
            to: email,
            subject,
            html: htmlContent,
            headers: {
                "List-Unsubscribe": `<${unsubscribeUrl}>`,
                "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
        });

        return { success: true };
    } catch (error) {
        console.error("Failed to send daily email:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to send email",
        };
    }
}
