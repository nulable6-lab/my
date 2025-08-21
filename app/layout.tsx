import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://captionpro.pages.dev"),
  title: "CaptionPro - Free YouTube Caption & Subtitle Downloader",
  description:
    "Download YouTube captions and subtitles in SRT, VTT, and TXT formats. Free, fast, and secure caption downloader with support for multiple languages. No registration required.",
  keywords: [
    "YouTube captions",
    "subtitle download",
    "SRT download",
    "VTT download",
    "YouTube subtitles",
    "caption extractor",
    "free caption downloader",
    "YouTube transcript",
    "video subtitles",
    "accessibility captions",
  ],
  authors: [{ name: "CaptionPro", url: "https://captionpro.pages.dev" }],
  creator: "CaptionPro",
  publisher: "CaptionPro",
  robots: "index, follow",
  alternates: {
    canonical: "https://captionpro.pages.dev",
  },
  openGraph: {
    title: "CaptionPro - Free YouTube Caption & Subtitle Downloader",
    description:
      "Download YouTube captions and subtitles in multiple formats. Free, fast, and secure with no registration required.",
    type: "website",
    locale: "en_US",
    url: "https://captionpro.pages.dev",
    siteName: "CaptionPro",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CaptionPro - YouTube Caption Downloader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CaptionPro - Free YouTube Caption Downloader",
    description: "Download YouTube captions and subtitles in multiple formats. Free, fast, and secure.",
    images: ["/og-image.png"],
  },
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#16a34a",
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
