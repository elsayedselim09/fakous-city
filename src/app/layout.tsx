import { Cairo } from 'next/font/google'

import './globals.css'

import type { Metadata, Viewport } from 'next'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | مدينة فاقوس',
    default: 'فاقوس سيتي — كل خدمات مدينتك في مكان واحد',
  },
  description: 'ابحث عن أطباء، صيدليات، محامين، ومحلات في فاقوس والمناطق المجاورة.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'فاقوس سيتي',
    description: 'كل خدمات مدينتك في مكان واحد',
    locale: 'ar_EG',
    type: 'website',
    siteName: 'فاقوس سيتي',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'فاقوس سيتي',
    description: 'كل خدمات مدينتك في مكان واحد',
  },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0d9262',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className="bg-[var(--surface)] min-h-screen font-arabic antialiased">
        {children}
      </body>
    </html>
  )
}
