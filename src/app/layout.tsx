import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { siteConfig } from "@/config/site";
import { SwiftGlowingCursor } from "@/components/animations/swift-glowing-cursor";

const heading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  metadataBase: siteConfig.siteUrl ? new URL(siteConfig.siteUrl) : undefined,
  title: {
    default: `${siteConfig.brandName} — Full-Stack Developer`,
    template: `%s · ${siteConfig.brandName}`,
  },
  description: siteConfig.seoDescription,
  openGraph: {
    title: siteConfig.fullName,
    description: siteConfig.seoDescription,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.fullName,
    description: siteConfig.seoDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        name: siteConfig.fullName,
        alternateName: siteConfig.brandName,
        address: { "@type": "PostalAddress", addressCountry: "LK" },
      },
      {
        "@type": "WebSite",
        name: `${siteConfig.brandName} Portfolio`,
        ...(siteConfig.siteUrl ? { url: siteConfig.siteUrl } : {}),
      },
    ],
  };
  return (
    <html lang="en" className={`${heading.variable} ${body.variable}`}>
      <body>
        <SwiftGlowingCursor />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
      </body>
    </html>
  );
}
