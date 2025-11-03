/**
 * PWA functionality tests
 * Run with: npx tsx src/app/__tests__/pwa.test.ts
 */

import fs from "fs";
import path from "path";

function testManifestExists() {
    console.log("Testing manifest.json exists...");

    const manifestPath = path.join(process.cwd(), "public", "manifest.json");

    if (!fs.existsSync(manifestPath)) {
        throw new Error("manifest.json not found in public directory");
    }

    console.log("✓ manifest.json exists");
}

function testManifestStructure() {
    console.log("Testing manifest.json structure...");

    const manifestPath = path.join(process.cwd(), "public", "manifest.json");
    const manifestContent = fs.readFileSync(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestContent);

    // Check required fields
    const requiredFields = [
        "name",
        "short_name",
        "start_url",
        "display",
        "background_color",
        "theme_color",
        "icons",
    ];

    for (const field of requiredFields) {
        if (!manifest[field]) {
            throw new Error(`Missing required field in manifest: ${field}`);
        }
    }

    console.log("✓ All required manifest fields present");

    // Check icons
    if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
        throw new Error("Manifest must have at least one icon");
    }

    for (const icon of manifest.icons) {
        if (!icon.src || !icon.sizes || !icon.type) {
            throw new Error("Icon missing required fields (src, sizes, type)");
        }
    }

    console.log(`✓ Manifest has ${manifest.icons.length} icon(s) configured`);

    // Check display mode
    if (manifest.display !== "standalone" && manifest.display !== "fullscreen") {
        console.warn(`⚠ Display mode is "${manifest.display}", consider "standalone" for PWA`);
    } else {
        console.log(`✓ Display mode is "${manifest.display}"`);
    }

    // Check theme color
    if (manifest.theme_color !== "#2D5A87") {
        console.warn(`⚠ Theme color is "${manifest.theme_color}", expected "#2D5A87"`);
    } else {
        console.log("✓ Theme color matches Sukoon branding");
    }
}

function testPWAConfiguration() {
    console.log("Testing PWA configuration in next.config.js...");

    const configPath = path.join(process.cwd(), "next.config.js");

    if (!fs.existsSync(configPath)) {
        throw new Error("next.config.js not found");
    }

    const configContent = fs.readFileSync(configPath, "utf-8");

    if (!configContent.includes("next-pwa") && !configContent.includes("withPWA")) {
        throw new Error("PWA configuration not found in next.config.js");
    }

    console.log("✓ PWA configuration found in next.config.js");

    // Check for runtime caching
    if (configContent.includes("runtimeCaching")) {
        console.log("✓ Runtime caching configured");
    } else {
        console.warn("⚠ Runtime caching not configured");
    }
}

function testOfflinePage() {
    console.log("Testing offline page exists...");

    const offlinePagePath = path.join(
        process.cwd(),
        "src",
        "app",
        "offline",
        "page.tsx"
    );

    if (!fs.existsSync(offlinePagePath)) {
        console.warn("⚠ Offline fallback page not found");
        return;
    }

    console.log("✓ Offline fallback page exists");

    const offlineContent = fs.readFileSync(offlinePagePath, "utf-8");

    if (!offlineContent.includes("offline") || !offlineContent.includes("connection")) {
        console.warn("⚠ Offline page may not have proper messaging");
    } else {
        console.log("✓ Offline page has appropriate messaging");
    }
}

function testMetaTags() {
    console.log("Testing PWA meta tags in layout...");

    const layoutPath = path.join(process.cwd(), "src", "app", "layout.tsx");

    if (!fs.existsSync(layoutPath)) {
        throw new Error("layout.tsx not found");
    }

    const layoutContent = fs.readFileSync(layoutPath, "utf-8");

    // Check for manifest reference
    if (!layoutContent.includes("manifest")) {
        console.warn("⚠ Manifest reference not found in metadata");
    } else {
        console.log("✓ Manifest reference found in metadata");
    }

    // Check for theme color
    if (!layoutContent.includes("themeColor") && !layoutContent.includes("theme_color")) {
        console.warn("⚠ Theme color not found in viewport/metadata");
    } else {
        console.log("✓ Theme color configured");
    }

    // Check for viewport configuration
    if (!layoutContent.includes("viewport")) {
        console.warn("⚠ Viewport configuration not found");
    } else {
        console.log("✓ Viewport configuration found");
    }
}

async function runAllTests() {
    console.log("\n╔════════════════════════════════════════════════════╗");
    console.log("║     Sukoon PWA Tests                               ║");
    console.log("╚════════════════════════════════════════════════════╝\n");

    try {
        testManifestExists();
        testManifestStructure();
        testPWAConfiguration();
        testOfflinePage();
        testMetaTags();

        console.log("\n╔════════════════════════════════════════════════════╗");
        console.log("║     ✓ All PWA Tests Passed                        ║");
        console.log("╚════════════════════════════════════════════════════╝\n");

        console.log("📝 Additional PWA Testing Recommendations:");
        console.log("   1. Test on actual mobile devices");
        console.log("   2. Run Lighthouse PWA audit (target score ≥90)");
        console.log("   3. Test 'Add to Home Screen' functionality");
        console.log("   4. Test offline behavior with DevTools");
        console.log("   5. Verify service worker registration in browser\n");
    } catch (error) {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

export {
    testManifestExists,
    testManifestStructure,
    testPWAConfiguration,
    testOfflinePage,
    testMetaTags,
};
