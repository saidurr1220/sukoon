/**
 * Check if Arabic and Bengali text is stored correctly in database
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function checkEncoding() {
    console.log('Checking database text encoding...\n');

    // Fetch a few verses with translations
    const verses = await prisma.verse.findMany({
        take: 3,
        include: {
            translations: true,
        },
        orderBy: {
            id: 'asc',
        },
    });

    // Write to file to avoid console encoding issues
    const output: string[] = [];
    output.push('=== Database Encoding Check ===\n');
    output.push(`Total verses checked: ${verses.length}\n\n`);

    for (const verse of verses) {
        output.push(`Verse ID: ${verse.id}`);
        output.push(`Surah: ${verse.surah}, Ayah: ${verse.ayah}`);
        output.push(`Arabic Text: ${verse.arabicText}`);
        output.push(`Arabic Text Length: ${verse.arabicText.length} characters`);

        // Check if Arabic text contains proper Unicode characters
        const hasArabicChars = /[\u0600-\u06FF]/.test(verse.arabicText);
        output.push(`Contains Arabic Unicode: ${hasArabicChars ? '✓ YES' : '✗ NO'}`);

        if (verse.translations.length > 0) {
            const translation = verse.translations[0];
            output.push(`\nTranslation (${translation.language}):`);
            output.push(translation.text);
            output.push(`Translation Length: ${translation.text.length} characters`);

            // Check if Bengali text contains proper Unicode characters
            const hasBengaliChars = /[\u0980-\u09FF]/.test(translation.text);
            output.push(`Contains Bengali Unicode: ${hasBengaliChars ? '✓ YES' : '✗ NO'}`);
        }

        output.push('\n' + '-'.repeat(60) + '\n');
    }

    // Write to file
    const outputText = output.join('\n');
    fs.writeFileSync('encoding-check-result.txt', outputText, 'utf8');

    console.log('✓ Check complete! Results written to: encoding-check-result.txt');
    console.log('\nSummary:');
    console.log(`- Checked ${verses.length} verses`);
    console.log('- Open encoding-check-result.txt to see the actual text');
    console.log('- If you see proper Arabic/Bengali in the file, your data is correct!');
    console.log('- The console garbled text is just a Windows terminal display issue');
}

checkEncoding()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
