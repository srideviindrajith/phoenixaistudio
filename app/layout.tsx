import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: 'PhoenixAI Studio',
  description:
    'Transform your ideas into intelligent solutions. We build cutting-edge AI-powered applications that drive innovation and business growth.',
  keywords: [
    'AI',
    'Artificial Intelligence',
    'Web Development',
    'Mobile Apps',
    'Machine Learning',
  ],
  authors: [{ name: 'PhoenixAI Studio' }],
  creator: 'PhoenixAI Studio',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/uploads/logo/logo.png',
  },

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://phoenixai.studio',
    siteName: 'PhoenixAI Studio',
    title: 'PhoenixAI Studio - Build the Future with AI',
    description:
      'Transform your ideas into intelligent solutions.',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'PhoenixAI Studio - Build the Future with AI',
    description:
      'Transform your ideas into intelligent solutions.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  )
}
