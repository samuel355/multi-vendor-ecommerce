import { Navbar } from '@/components/shared/navbar'
import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'MultiVendor Marketplace',
  description: 'Your one-stop shop for multiple vendors',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="border-t">
          <div className="container mx-auto px-4 py-6 text-center">
            © 2024 MultiVendor Marketplace
          </div>
        </footer>
      </body>
    </html>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> api
