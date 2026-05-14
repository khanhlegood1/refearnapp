import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Analytics } from "@vercel/analytics/react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import QueryProvider from "@/provider/Query"
import { Toaster } from "@/components/ui/toaster"
import React from "react"
import { buildMetadata } from "@/util/BuildMetadata"
import Script from "next/script"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})
export const metadata: Metadata = buildMetadata({
  indexable: true,
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const UMAMI_ID = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {UMAMI_ID && (
          <Script
            async
            src="https://cloud.umami.is/script.js"
            data-website-id={UMAMI_ID}
            strategy="afterInteractive"
          />
        )}
        <QueryProvider>{children}</QueryProvider>
        <Toaster />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
