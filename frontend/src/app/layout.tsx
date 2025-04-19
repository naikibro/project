import { Geist, Inter_Tight } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ThemeRegistry from "src/themes/ThemeRegistry";
import "../styles/globals.css";
import { Metadata } from "next";
import { defaultUrl, metadata as websiteMetadata } from "src/config/metadata";

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

export const metadata: Metadata = websiteMetadata;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.className} ${interTight.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta
          name="description"
          content={metadata.description?.toString() || ""}
        />
        <meta name="keywords" content={metadata.keywords?.toString() || ""} />
        <meta name="author" content={metadata.authors?.[0]?.name || ""} />
        <title>{metadata.title?.toString() || ""}</title>
        <link rel="icon" href="/favicon.ico" />

        {/* Open Graph Meta Tags */}
        <meta property="og:title" content={metadata.title?.toString() || ""} />
        <meta
          property="og:description"
          content={metadata.description?.toString() || ""}
        />
        <meta property="og:image" content={`${defaultUrl}/og-image.png`} />
        <meta property="og:url" content={defaultUrl} />
        <meta property="og:type" content="website" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metadata.title?.toString() || ""} />
        <meta
          name="twitter:description"
          content={metadata.description?.toString() || ""}
        />
        <meta name="twitter:image" content={`${defaultUrl}/og-image.png`} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Website",
              name: "Supmap",
              url: defaultUrl,
              description: metadata.description,
              author: { "@type": "Organization", name: "Supmap Team" },
              image: `${defaultUrl}/og-image.png`,
            }),
          }}
        />
      </head>
      <body className="bg-white text-black transition-colors min-h-screen">
        <ThemeRegistry>{children}</ThemeRegistry>
        <Toaster />
      </body>
    </html>
  );
}
