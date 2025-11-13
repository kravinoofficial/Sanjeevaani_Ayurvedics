import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Sanjeevani Ayurvedics - Hospital Management',
  description: 'Ayurvedic Hospital Management System - Ancient Wisdom, Modern Care',
  icons: {
    icon: '/logo1.png',
    apple: '/logo1.png',
  },
}

// Force dynamic rendering for all pages (this is an authenticated app)
export const dynamic = 'force-dynamic'
export const dynamicParams = true

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>{children}</body>
    </html>
  )
}
