import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "PolicySattva — Legal Intelligence Platform",
  description:
    "AI-powered contract analysis. Know exactly what you're agreeing to. Uncover hidden risks, extract obligations, and navigate complex legal documents with intelligence.",
  keywords: ["legal AI", "contract analysis", "risk assessment", "document intelligence"],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,300;0,7..72,400;0,7..72,600;0,7..72,700;1,7..72,400;1,7..72,600&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
