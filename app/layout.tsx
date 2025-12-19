import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SkipLink } from "@/components/skip-link"
import "./globals.css"

const _geist = Geist({ subsets: ["latin", "latin-ext"] })
const _geistMono = Geist_Mono({ subsets: ["latin", "latin-ext"] })

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#00ff99" },
    { media: "(prefers-color-scheme: dark)", color: "#00ff99" },
  ],
  colorScheme: "dark",
}

export const metadata: Metadata = {
  title: "FormatDisc - Enterprise SaaS u 48 Sata | Zagreb, Hrvatska",
  description:
    "Enterprise SaaS rješenja dostupna u 48 sati. Audit-proof arhitektura, zero-downtime deployment. Sjedište u Zagrebu, usluge širom Europe.",
  generator: "v0.app",
  applicationName: "FormatDisc",
  keywords: [
    "Enterprise SaaS Hrvatska",
    "MVP simulator Zagreb",
    "AI agent platforma Europa",
    "SaaS razvoj 48 sati",
    "Audit-proof arhitektura",
    "Zero-downtime deployment",
    "GDPR compliant SaaS",
    "Multi-tenant izolacija",
    "systems architect",
    "diagnostic engineering",
    "governance pipeline",
    "technical consulting",
  ],
  authors: [{ name: "Mladen Gertner", url: "https://www.formatdisc.hr" }],
  creator: "Mladen Gertner",
  publisher: "FORMATDISC",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.formatdisc.hr"),
  alternates: {
    canonical: "https://www.formatdisc.hr",
    languages: {
      "hr-HR": "https://www.formatdisc.hr",
      hr: "https://www.formatdisc.hr",
      "en-EU": "https://www.formatdisc.hr/en",
      sl: "https://www.formatdisc.hr/sl",
      sr: "https://www.formatdisc.hr/sr",
      bs: "https://www.formatdisc.hr/bs",
      "x-default": "https://www.formatdisc.hr",
    },
  },
  openGraph: {
    type: "website",
    locale: "hr_HR",
    alternateLocale: ["en_EU", "sl_SI", "sr_RS", "bs_BA"],
    url: "https://www.formatdisc.hr",
    siteName: "FormatDisc",
    title: "FormatDisc - Enterprise SaaS u 48 Sata",
    description:
      "Profesionalna SaaS rješenja za europske poslovne subjekte. Audit-proof arhitektura i 99.95% SLA garancija.",
    images: [
      {
        url: "/og-image-hr.jpg",
        width: 1200,
        height: 630,
        alt: "FormatDisc - Enterprise SaaS u 48 Sata",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FormatDisc - Enterprise SaaS u 48 Sata",
    description: "Audit-proof SaaS platforme za europske poslovne subjekte",
    images: ["/twitter-card-hr.jpg"],
    creator: "@djmladengertner",
    site: "@djmladengertner",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [{ rel: "mask-icon", url: "/safari-pinned-tab.svg", color: "#00ff99" }],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FormatDisc",
    startupImage: [
      {
        url: "/startup/apple-splash-2048-2732.png",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/startup/apple-splash-1170-2532.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
    ],
  },
  verification: {
    google: "google-site-verification-code",
  },
  category: "technology",
  classification: "Business Software",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "HR-01",
    "geo.placename": "Zagreb",
    "geo.position": "45.815011;15.981919",
    ICBM: "45.815011, 15.981919",
    "Content-Language": "hr,en,sl,sr,bs",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="hr" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://vercel.live" />
        <link rel="dns-prefetch" href="//api.formatdisc.hr" />
        <link rel="dns-prefetch" href="//cdn.formatdisc.hr" />

        <link rel="alternate" hrefLang="hr-HR" href="https://www.formatdisc.hr/" />
        <link rel="alternate" hrefLang="hr" href="https://www.formatdisc.hr/" />
        <link rel="alternate" hrefLang="sl" href="https://www.formatdisc.hr/sl" />
        <link rel="alternate" hrefLang="sr" href="https://www.formatdisc.hr/sr" />
        <link rel="alternate" hrefLang="bs" href="https://www.formatdisc.hr/bs" />
        <link rel="alternate" hrefLang="en-EU" href="https://www.formatdisc.hr/en" />
        <link rel="alternate" hrefLang="x-default" href="https://www.formatdisc.hr/" />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": "https://www.formatdisc.hr/#mladen-gertner",
                  name: "Mladen Gertner",
                  jobTitle: "AI Systems Architect",
                  description:
                    "Architect of agent kernels, motion-first UI systems, and audit-proof AI orchestration platforms.",
                  url: "https://www.formatdisc.hr",
                  image: "https://www.formatdisc.hr/mladen-gertner.jpg",
                  sameAs: [
                    "https://www.linkedin.com/in/mladengertner",
                    "https://github.com/mladengertner",
                    "https://x.com/djmladengertner",
                    "https://www.facebook.com/djmladengertner",
                    "https://ollama.com/Gertner",
                  ],
                  knowsAbout: [
                    "AI Orchestration",
                    "Agent Kernels",
                    "Audit Trails",
                    "Human-in-the-loop Systems",
                    "Motion-first Interfaces",
                    "Enterprise SaaS Architecture",
                    "Zero-downtime Deployment",
                  ],
                  worksFor: {
                    "@id": "https://www.formatdisc.hr/#organization",
                  },
                },
                {
                  "@type": "ProfessionalService",
                  "@id": "https://www.formatdisc.hr/#organization",
                  name: "FORMATDISC™",
                  legalName: "FORMATDISC, vl. Mladen Gertner",
                  description: "Production Ready AI Orchestration Hub - Enterprise SaaS u 48 sati",
                  url: "https://www.formatdisc.hr",
                  logo: {
                    "@type": "ImageObject",
                    url: "https://www.formatdisc.hr/logo.png",
                    width: 512,
                    height: 512,
                  },
                  telephone: "+385915421014",
                  email: "info@formatdisc.hr",
                  vatID: "HR18915075854",
                  founder: {
                    "@id": "https://www.formatdisc.hr/#mladen-gertner",
                  },
                  address: {
                    "@type": "PostalAddress",
                    addressLocality: "Zagreb",
                    postalCode: "10000",
                    addressCountry: "HR",
                  },
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: 45.815011,
                    longitude: 15.981919,
                  },
                  areaServed: [
                    { "@type": "Country", name: "Croatia" },
                    { "@type": "Country", name: "Slovenia" },
                    { "@type": "Country", name: "Serbia" },
                    { "@type": "Country", name: "Bosnia and Herzegovina" },
                    { "@type": "AdministrativeArea", name: "European Union" },
                  ],
                  serviceType: [
                    "Enterprise SaaS Development",
                    "AI Agent Orchestration",
                    "MVP Development",
                    "Technical Consulting",
                  ],
                  priceRange: "€2.999 - €14.999",
                  sameAs: ["https://www.linkedin.com/in/mladengertner", "https://github.com/mladengertner"],
                },
              ],
            }),
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <SkipLink />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
