import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CursorGlow } from "@/components/effects/cursor";
import { Entrance } from "@/components/effects/entrance";
import { themeScript } from "@/lib/theme";
import { site } from "@/data/site";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://securinets-isetch.tn";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Securinets ISET Charguia — Cybersecurity Club, Tunis",
    template: "%s · Securinets ISET Charguia",
  },
  description: site.description,
  keywords: [
    "cybersecurity club Tunisia",
    "Securinets",
    "ISET Charguia",
    "CTF Tunisia",
    "ethical hacking",
    "sécurité informatique Tunis",
    "club cybersécurité",
  ],
  authors: [{ name: site.name, url: siteUrl }],
  creator: site.name,
  publisher: site.name,
  alternates: {
    canonical: "/",
    languages: { "en-GB": "/", "fr-FR": "/", ar: "/" },
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Securinets ISET Charguia — Cybersecurity Club, Tunis",
    description: site.description,
    url: siteUrl,
    locale: "en_GB",
    alternateLocale: ["fr_FR"],
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "Securinets ISET Charguia — student cybersecurity club",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Securinets ISET Charguia — Cybersecurity Club, Tunis",
    description: site.description,
    images: ["/og.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/apple-icon.png", sizes: "180x180" }],
  },
  manifest: "/manifest.webmanifest",
  category: "education",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08080b" },
    { media: "(prefers-color-scheme: light)", color: "#faf9fb" },
  ],
  width: "device-width",
  initialScale: 1,
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: site.name,
  alternateName: site.legalName,
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  description: site.description,
  foundingDate: site.founded,
  parentOrganization: { "@type": "Organization", name: "Securinets", url: site.parentUrl },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tunis",
    addressRegion: "Tunis",
    addressCountry: "TN",
    streetAddress: "ISET Charguia, Charguia II",
  },
  email: site.email,
  sameAs: site.socials.map((s) => s.href),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      dir="ltr"
      data-theme="dark"
      className={`${inter.variable} ${display.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
      </head>
      <body className="min-h-dvh bg-canvas font-sans text-ink antialiased">
        <Providers>
          <Navbar />
          <main id="main" className="pt-[68px]">
            {children}
          </main>
          <Footer />
        <CursorGlow />
        <Entrance />
        </Providers>
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[80] noise opacity-[0.035] mix-blend-soft-light"
        />
      </body>
    </html>
  );
}
