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
  title: "Rendeza — Quality time automated",
  description:
    "We handle the planning. You show up for the moments.",
  icons: {
    icon: "/Claude%20Favicon.ico",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "Rendeza — Quality time automated",
    description: "We handle the planning. You show up for the moments.",
    images: [
      {
        url: "/Rendeza Logo.png",
        width: 1200,
        height: 630,
        alt: "Rendeza Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rendeza — Quality time automated",
    description: "We handle the planning. You show up for the moments.",
    images: ["/Rendeza Logo.png"],
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
