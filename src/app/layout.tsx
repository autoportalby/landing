import type { Metadata } from "next";
import { Manrope, Unbounded } from "next/font/google";
import "./globals.css";

import Analytics from "@/components/Analytics";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

// Body font -> exposed as --font-manrope, consumed by --font-sans (--ff)
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Display / heading font -> exposed as --font-unbounded, consumed by --font-display (--fd)
const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vrum.by"),
  title: "vrum.by — умный помощник по покупке авто в Беларуси",
  description:
    "vrum.by — AI подберёт автомобиль под ваш бюджет и задачи, проверит объявление на риски и подскажет, стоит ли брать. Скоро в Беларуси — подпишитесь на запуск.",
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: "vrum.by",
    title: "vrum.by — умный помощник по покупке авто",
    description:
      "AI подберёт авто под ваш бюджет, проверит объявление на риски и честно скажет, стоит ли брать. Скоро в Беларуси.",
    url: "/",
    locale: "ru_BY",
    images: [{ url: "/og-cover.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "vrum.by — умный помощник по покупке авто",
    description:
      "AI подберёт авто, проверит риски и подскажет, стоит ли брать. Скоро в Беларуси.",
    images: ["/og-cover.jpg"],
  },
};

// Structured data (Organization + WebSite), mirrors the prototype JSON-LD.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "vrum.by",
      url: "https://vrum.by/",
      logo: "https://vrum.by/og-cover.jpg",
      areaServed: "BY",
      description: "AI-помощник по покупке автомобиля в Беларуси.",
    },
    {
      "@type": "WebSite",
      name: "vrum.by",
      url: "https://vrum.by/",
      inLanguage: "ru-BY",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${unbounded.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
        <VercelAnalytics />
      </body>
    </html>
  );
}
