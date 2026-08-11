import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cyclone.conychoi.dev"),
  title: "태풍 경로 · 과거 태풍 경로 지도 | Typhoon Atlas",
  description: "태풍 경로, 과거 태풍 경로, 태풍 과거 경로를 연도별 지도에서 확인하세요. 전 세계 태풍·허리케인·사이클론의 관측 경로와 현재 예보를 제공합니다.",
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  other: {
    "google-adsense-account": "ca-pub-3565526302288172",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "Typhoon Atlas",
    title: "태풍 경로 · 과거 태풍 경로 지도 | Typhoon Atlas",
    description: "태풍 경로와 과거 태풍 경로를 연도별 지도에서 확인하세요.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "태풍 경로 · 과거 태풍 경로 지도 | Typhoon Atlas",
    description: "태풍 경로와 과거 태풍 경로를 연도별 지도에서 확인하세요.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script
          async
          crossOrigin="anonymous"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3565526302288172"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://cyclone.conychoi.dev/#website",
              name: "Typhoon Atlas",
              alternateName: ["태풍 경로 지도", "과거 태풍 경로 지도", "태풍 과거 경로 지도"],
              url: "https://cyclone.conychoi.dev/",
              inLanguage: "ko-KR",
              description: "태풍 경로, 과거 태풍 경로, 태풍 과거 경로를 연도별로 탐색하는 전 세계 태풍 지도",
            }),
          }}
        />
        {children}
      </body>
    </html>
  );
}
