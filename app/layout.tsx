import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import localFont from "next/font/local"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
})

const anticDidone = localFont({
  src: "../fonts/Antic Didone Font.ttf",
  variable: "--font-antic-didone",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Rendeza — Personalized Restaurant Reservations",
  description:
    "Luxury restaurant reservation service for busy professionals. We handle your recurring reservations at handpicked restaurants, ensuring you never miss quality time with loved ones.",
  generator: "v0.app",
  icons: {
    icon: "/Claude%20Favicon.ico",
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${anticDidone.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
