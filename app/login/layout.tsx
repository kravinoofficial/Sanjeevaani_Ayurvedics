import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login - Jeevadhara Ayurveda',
  description: 'Login to Jeevadhara Ayurveda Hospital Management System',
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
