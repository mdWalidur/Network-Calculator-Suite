import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://networkcalculatorsuite.com"),
  title: {
    default: "Network Calculator Suite | Professional IP Subnetting & Engineering Tools",
    template: "%s | Network Calculator Suite",
  },
  description:
    "Professional, fast, client-side network engineering suite. Instant IPv4 subnetting, RFC 5952 IPv6 calculation, VLSM capacity planning, CIDR route summarization, and binary bit analysis.",
  keywords: [
    "subnet calculator",
    "network calculator",
    "ipv4 subnetting",
    "ipv6 calculator",
    "vlsm calculator",
    "cidr calculator",
    "route summarization",
    "supernetting",
    "cisco subnet calculator",
    "binary ip calculator",
    "rfc 1918",
    "rfc 5952",
  ],
  authors: [{ name: "Md Walidur Rahman" }],
  creator: "Md Walidur Rahman",
  publisher: "Network Calculator Suite",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://networkcalculatorsuite.com",
    siteName: "Network Calculator Suite",
    title: "Network Calculator Suite | Professional IP Subnetting & Engineering Tools",
    description:
      "Precise, client-side networking utilities for network engineers, IT professionals, and students. IPv4/IPv6, VLSM, CIDR summarization, and binary breakdown.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Network Calculator Suite Application",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Network Calculator Suite | Professional IP Subnetting & Engineering Tools",
    description:
      "Precise, client-side networking utilities for network engineers and IT professionals. Instant calculations with zero telemetry.",
    images: ["/logo.svg"],
  },
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
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.ico",
    apple: "/favicon-180.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://networkcalculatorsuite.com/#website",
        url: "https://networkcalculatorsuite.com",
        name: "Network Calculator Suite",
        description: "Professional IP Subnetting, VLSM Planning, and CIDR Engineering Suite",
        inLanguage: "en-US",
      },
      {
        "@type": "SoftwareApplication",
        name: "Network Calculator Suite",
        applicationCategory: "NetworkUtility, DeveloperApplication",
        operatingSystem: "All (Modern Web Browsers)",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        author: {
          "@type": "Person",
          name: "Md Walidur Rahman",
        },
        description:
          "High-precision, client-side IP subnet calculator providing IPv4 CIDR division, RFC 5952 IPv6 compression, VLSM multi-subnet planning, route aggregation, and binary bit visualization.",
      },
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-workspace-50 text-workspace-900 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}
