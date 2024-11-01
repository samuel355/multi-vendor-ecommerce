import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SiteHeader } from "@/components/layout/site-header" // Add this
import { cn } from "@/lib/utils"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider dynamic>
      <AuthProvider>
        <html lang="en" suppressHydrationWarning>
          <body className={cn(
            "min-h-screen bg-background antialiased",
            inter.className
          )}>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <div className="relative flex min-h-screen flex-col">
                <SiteHeader /> {/* Add the header here */}
                <main className="flex-1">{children}</main>
              </div>
            </ThemeProvider>
          </body>
        </html>
      </AuthProvider>
    </ClerkProvider>
  )
}