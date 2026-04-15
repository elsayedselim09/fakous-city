import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'فاقوس سيتي — كل خدمات مدينتك في مكان واحد',
  description: 'ابحث عن أطباء، صيدليات، محامين، ومحلات في فاقوس والمناطق المجاورة',
}

export const viewport: Viewport = {
  themeColor: '#0d9262',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-[var(--surface)] min-h-screen font-arabic antialiased">
        {children}
      </body>
    </html>
  )
}
