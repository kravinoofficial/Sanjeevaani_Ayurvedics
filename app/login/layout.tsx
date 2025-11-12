import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Sanjeevani Ayurvedics',
  description: 'Login to Sanjeevani Ayurvedics Hospital Management System',
  icons: {
    icon: '/logo1.png',
    apple: '/logo1.png',
  },
  themeColor: '#0d9488',
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
