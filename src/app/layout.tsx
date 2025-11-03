import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ErrorBoundary from "@/components/ErrorBoundary";

// Optimize font loading with display swap and preload
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sukoon - Find Peace Through Qur'an",
  description:
    "Discover relevant Qur'an verses based on your current mood. Find spiritual comfort and guidance.",
  keywords: ["Quran", "Islam", "spiritual", "peace", "guidance", "mood"],
  authors: [{ name: "Sukoon Team" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2D5A87",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Optimized Arabic font loading with display=swap */}
        <link
          href="https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${inter.className} antialiased bg-sukoon-secondary min-h-screen`}
      >
        <ErrorBoundary>
          <main className="container mx-auto px-4 py-8 max-w-md">
            {children}
          </main>
        </ErrorBoundary>
      </body>
    </html>
  );
}
