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
  themeColor: "#070714",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://networkcalculatorsuite.com"),
  title: {
    default: "Network Calculator Suite | Enterprise Subnetting & Architecture",
    template: "%s | Network Calculator Suite",
  },
  description:
    "Flagship 3D interactive networking suite. Real-time IPv4/IPv6 subnetting, automated VLSM allocation, route aggregation, bit-level binary breakdown, and Cisco/Juniper ACL wildcard helpers with zero latency.",
  keywords: [
    "network calculator",
    "subnet calculator",
    "ipv4 subnetting",
    "ipv6 calculator",
    "vlsm calculator",
    "route summarization",
    "supernetting",
    "cidr calculator",
    "network architecture",
    "rfc 1918",
    "rfc 5952",
    "acl wildcard generator",
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
    title: "Network Calculator Suite | Enterprise Subnetting & Architecture",
    description:
      "Flagship 3D interactive networking suite. Real-time IPv4/IPv6 subnetting, automated VLSM allocation, route aggregation, and bit-level binary visualization.",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Network Calculator Suite 3D Topology Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Network Calculator Suite | Flagship 3D Subnetting Platform",
    description:
      "Real-time IPv4/IPv6 subnetting, automated VLSM allocation, route aggregation, and bit-level binary visualization with zero latency.",
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
  // Comprehensive JSON-LD structured data for search engine rich results
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://networkcalculatorsuite.com/#website",
        url: "https://networkcalculatorsuite.com",
        name: "Network Calculator Suite",
        description: "Enterprise Subnetting, IPv6, VLSM & Route Summarization Platform",
        inLanguage: "en-US",
      },
      {
        "@type": "SoftwareApplication",
        name: "Network Calculator Suite",
        applicationCategory: "DeveloperApplication, NetworkUtility",
        operatingSystem: "All (Web-based)",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        author: {
          "@type": "Person",
          name: "Md Walidur Rahman",
          jobTitle: "IT Expert & Network Engineer",
        },
        description:
          "Professional subnetting and network architecture suite providing IPv4 CIDR division, RFC 5952 IPv6 compression, VLSM planning, route aggregation, and binary visualization.",
      },
    ],
  };

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased bg-background text-foreground selection:bg-brand-purple/30 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}

