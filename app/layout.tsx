import { AcademyProvider } from "@/hooks/use-academy";
import { AuthProvider } from "@/hooks/use-auth";
import { CommunityProvider } from "@/hooks/use-community";
import { CompanyFeedProvider } from "@/hooks/use-company-feed";
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import type React from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EXL Trading Hub",
  description: "Conjunto completo de ferramentas para traders profissionais",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EXL Trading Hub",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "EXL Trading Hub",
    title: "EXL Trading Hub",
    description: "Conjunto completo de ferramentas para traders profissionais",
  },
  twitter: {
    card: "summary",
    title: "EXL Trading Hub",
    description: "Conjunto completo de ferramentas para traders profissionais",
  },
  generator: "v0.dev",
};

export const viewport: Viewport = {
  themeColor: "#BBF717",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" href="/icons/icon-192x192.png" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="EXL Trading" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#BBF717" />
        <meta name="msapplication-tap-highlight" content="no" />
        <Script src="/register-sw.js" strategy="lazyOnload" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <CommunityProvider>
            <CompanyFeedProvider>
              <AcademyProvider>{children}</AcademyProvider>
            </CompanyFeedProvider>
          </CommunityProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
